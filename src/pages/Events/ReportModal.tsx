import React, { useState, useEffect } from 'react';
interface ListReportObjectDTO {
  reportObjects: ReportOption[];
}

interface ReportOption {
  name: string;
  description: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose,
  eventId,
  eventName
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch report options when modal opens
useEffect(() => {
  if (!isOpen) return;
  
  const fetchReportOptions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8085/api/report/get-all-report-objects');
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle opzioni di segnalazione');
      }
      const data: ListReportObjectDTO = await response.json();
      setReportOptions(data.reportObjects); // Estrai l'array dalla proprietà
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  fetchReportOptions();
}, [isOpen]);

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
        object: selectedOption,
        message,
        idEvent: eventId,
        eventName
      };

      const response = await fetch('http://localhost:8085/api/report/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Errore nell'invio della segnalazione");
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
          <h3 className="text-lg font-semibold">Invia Segnalazione</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo della segnalazione
            </label>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleziona un motivo</option>
                {reportOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.description}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="reportMessage" className="block text-sm font-medium text-gray-700 mb-1">
              Dettagli aggiuntivi (opzionale)
            </label>
            <textarea
              id="reportMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Aggiungi ulteriori dettagli..."
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
              {isSubmitting ? "Invio in corso..." : "Invia segnalazione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;