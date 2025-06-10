import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ModalRegistrationProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

export default function ModalRegistration({ showModal, setShowModal }: ModalRegistrationProps) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    setShowModal(false);
    navigate('/');
  };

  const handleBack = () => {
    setShowModal(false);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Grazie per esserti registrato!
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Premi conferma per inviare le informazioni. A breve verrai ricontattato!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          <Button variant="outline" onClick={handleBack}>
            Indietro
          </Button>
          <Button onClick={handleConfirm} className="w-full sm:w-auto">
            Conferma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}