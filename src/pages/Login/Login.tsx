import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2 } from "lucide-react";
import ForgotPasswordModal from './ForgotPasswordModal';
import { useAuth } from '../../components/auth/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const Login: React.FC = () => {
  const invokeUrl = 'http://localhost:8080';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { login: authLogin } = useAuth();

  const userTypeOptions = [
    {
      type: 'fan',
      title: 'Fan',
      description: 'Discover and support your favorite artists',
      route: '/fan/signup',
      icon: '🎵'
    },
    {
      type: 'artist',
      title: 'Artist',
      description: 'Share your music and connect with fans',
      route: '/artist/signup',
      icon: '🎤'
    },
    {
      type: 'merchant',
      title: 'Merchant',
      description: 'Sell merchandise and music products',
      route: '/merchant/signup',
      icon: '🛍️'
    }
  ];
  
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handleUserTypeSelect = (route: string) => {
    setIsSignInModalOpen(false);
    navigate(route);
  };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!username || !password) {
    setError('Inserire username e password');
    return;
  }

  setLoadingLogin(true);
  setError(''); // Clear previous errors

  const userDto = {
    username: username.trim(),
    password: password,
  };

  try {
    const response = await fetch(`${invokeUrl}/api/login/auth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDto),
    });

    // Handle non-2xx responses
    if (!response.ok) {
      try {
        const errorData = await response.json();
        // Use the server's error message if available, otherwise use a default based on status
        const errorMessage = errorData?.message || getDefaultErrorMessage(response.status);
        setError(errorMessage);
      } catch (parseError) {
        // If we can't parse the error response, use a generic message
        setError(getDefaultErrorMessage(response.status));
      }
      setLoadingLogin(false);
      return;
    }

    // Handle successful response
    const data = await response.json();
    const { jwt, role } = data;

    if (jwt) {
      authLogin({ username, role }, jwt);
      setLoadingLogin(false);
      navigate('/');
      window.location.reload();
      
    } else {
      setLoadingLogin(false);
      setError('Autenticazione fallita: token non ricevuto');
    }
  } catch (error) {
    setLoadingLogin(false);
    // Network error or other fetch-related error
    console.error('Login error:', error);
    setError('Errore di connessione. Verifica la tua connessione internet e riprova.');
  }
};

// Helper function to provide default error messages based on HTTP status codes
const getDefaultErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Dati di login non validi';
    case 401:
      return 'Credenziali non valide';
    case 403:
      return 'Accesso negato';
    case 500:
      return 'Errore del server. Riprova più tardi.';
    case 503:
      return 'Servizio temporaneamente non disponibile';
    default:
      return `Errore del server (${status}). Riprova più tardi.`;
  }
};

  return (
    <>
      <section className="min-h-screen flex">
        {/* Sezione sinistra - Background Image */}
        <div 
          className="hidden md:flex md:w-1/2 relative"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.pexels.com/photos/14870728/pexels-photo-14870728.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Sezione destra - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                RockIn to your account!
              </h1>
              <p className="text-muted-foreground mt-2">
                Benvenuto! Accedi al tuo account per continuare
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Messaggio di error */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Campo Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-lg font-semibold">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Inserisci username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 text-base"
                  disabled={loadingLogin}
                />
              </div>

              {/* Campo Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digita la tua password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base"
                  disabled={loadingLogin}
                />
              </div>

              {/* Link per Password Dimenticata */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setShowForgotModal(true)}
                >
                  Hai dimenticato la tua password?
                </button>
              </div>

              {/* Bottone Login */}
              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={loadingLogin}
              >
                {loadingLogin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  'Login'
                )}
              </Button>

              {/* Link per Registrazione */}
              <div className="text-center">
                <span className="text-muted-foreground">Non hai un account? </span>
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setIsSignInModalOpen(true)}
                >
                  Registrati!
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modals */}
        <ForgotPasswordModal 
          show={showForgotModal} 
          onClose={() => setShowForgotModal(false)} 
        />
      </section>

      {/* Modal per la scelta del tipo di account */}
      <Dialog open={isSignInModalOpen} onOpenChange={setIsSignInModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Choose Your Account Type</DialogTitle>
            <DialogDescription>
              Select the type of account you want to create to get started with MusicVirus.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {userTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleUserTypeSelect(option.route)}
                className="flex items-center p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left"
              >
                <div className="text-2xl mr-4">{option.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </div>
                <div className="ml-2">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Login;
