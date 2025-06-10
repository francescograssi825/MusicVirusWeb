import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
  const invokeUrl = 'http://localhost:8080';

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Nuovi state per resend
  const [canResend, setCanResend] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Al passo 2, avvia countdown
  useEffect(() => {
    if (step === 2) {
      setCanResend(false);
      setSecondsLeft(10);
      const interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleRecovery = async () => {
    setRecoveryError('');
    setRecoveryLoading(true);
    try {
      const res = await fetch(`${invokeUrl}/api/login/passwordRecovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecoveryError(data.message || 'Errore nel recupero password');
      } else {
        setStep(2);
      }
    } catch {
      setRecoveryError('Errore di rete, riprova');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleReset = async () => {
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);
    try {
      const res = await fetch(`${invokeUrl}/api/login/passwordReset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.message || 'Errore nel reset della password');
      } else {
        setResetSuccess('Password modificata con successo.');
      }
    } catch {
      setResetError('Errore di rete, riprova');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResend = () => {
    handleRecovery();
    setCanResend(false);
    setSecondsLeft(10);
  };

  const closeAndReset = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setRecoveryError('');
    setResetError('');
    setResetSuccess('');
    onClose();
  };

  const getTitle = () => {
    if (step === 1) return 'Recupero Password';
    if (resetSuccess) return 'Successo';
    return 'Reimposta Password';
  };

  return (
    <Dialog open={show} onOpenChange={(open: any) => !open && closeAndReset()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Inserisci la tua email per ricevere il codice di recupero"
              : resetSuccess
              ? "La tua password è stata aggiornata con successo"
              : "Inserisci il codice ricevuto e la nuova password"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Inserisci la tua email"
                  value={email}
                  onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEmail(e.target.value)}
                  disabled={recoveryLoading}
                />
              </div>
              {recoveryError && (
                <Alert variant="destructive">
                  <AlertDescription>{recoveryError}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {resetSuccess ? (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{resetSuccess}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="emailRead">Email selezionata</Label>
                    <Input
                      id="emailRead"
                      type="email"
                      value={email}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Codice OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Inserisci codice OTP"
                      value={otp}
                      onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setOtp(e.target.value)}
                      disabled={resetLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nuova Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Nuova password"
                        value={newPassword}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setNewPassword(e.target.value)}
                        disabled={resetLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Conferma Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Conferma password"
                        value={confirmPassword}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setConfirmPassword(e.target.value)}
                        disabled={resetLoading}
                      />
                    </div>
                  </div>

                  {resetError && (
                    <Alert variant="destructive">
                      <AlertDescription>{resetError}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Button
                      variant="link"
                      disabled={!canResend}
                      onClick={handleResend}
                      className="p-0 h-auto text-sm"
                    >
                      {canResend
                        ? 'Reinvia codice'
                        : `Reinvia codice (${secondsLeft}s)`}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={closeAndReset}
            disabled={recoveryLoading || resetLoading}
          >
            Chiudi
          </Button>

          {step === 1 && (
            <Button
              onClick={handleRecovery}
              disabled={recoveryLoading || !email}
            >
              {recoveryLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Caricamento...
                </>
              ) : (
                'Recupera'
              )}
            </Button>
          )}

          {step === 2 && !resetSuccess && (
            <Button
              onClick={handleReset}
              disabled={
                resetLoading ||
                !otp ||
                !newPassword ||
                newPassword !== confirmPassword
              }
            >
              {resetLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Caricamento...
                </>
              ) : (
                'Reimposta'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;