import React, { useState, useEffect } from 'react';

interface ModalCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  currentCommission: number;
  onSave: (newCommission: number) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

const ModalCommission: React.FC<ModalCommissionProps> = ({
  isOpen,
  onClose,
  currentCommission,
  onSave,
  isSubmitting,
  error
}) => {
  const [commissionValue, setCommissionValue] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {

      setCommissionValue(String(Math.round(currentCommission * 100)));
      setValidationError(null);
    }
  }, [isOpen, currentCommission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione
    const value = parseInt(commissionValue);
    if (isNaN(value)) {
      setValidationError('Inserire un numero valido');
      return;
    }
    
    if (value < 0 || value > 100) {
      setValidationError('La commissione deve essere tra 0 e 100');
      return;
    }
    

    await onSave(value / 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Modifica Commissione</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="commission" className="block text-sm font-medium text-gray-700 mb-1">
              Percentuale di Commissione (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              id="commission"
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
              placeholder="Es. 20 per 20%"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(validationError || error) && (
              <p className="mt-1 text-sm text-red-600">{validationError || error}</p>
            )}
          </div>
          
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvataggio in corso..." : "Salva Modifiche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCommission;