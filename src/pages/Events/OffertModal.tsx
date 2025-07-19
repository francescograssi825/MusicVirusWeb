import React, { useState } from 'react';



interface OffertModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

const OffertModal: React.FC<OffertModalProps> = ({ 
  isOpen, 
  onClose,
  eventId,
}) => {

  const [message, setMessage] = useState<string>('');

  const [isLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken') || '';
      if (!token) {
        throw new Error('Utente non autenticato');
      }

      const reportData = {
        message,
        eventId: eventId,
      };

      const response = await fetch('http://localhost:8085/event/merchant/update-offert', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Errore nell'aggiornamento dell'offerta");
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Modifica offerta</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
         
            
          <div className="mb-4">
           
            <textarea
              id="offertMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Inserisci la nuova offerta"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Invio in corso..." : "Invia modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OffertModal;