import React, { useState } from 'react';

interface DonateModalProps {
  eventId: string;
  onClose: () => void;
  onConfirm: (amount: number, visibility: boolean) => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ eventId, onClose, onConfirm }) => {
  const [amount, setAmount] = useState<string>('');
  const [visibility, setVisibility] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedAmount = amount.replace(',', '.');
    const amountValue = parseFloat(sanitizedAmount);
    
    // Validazione
    if (isNaN(amountValue)) {
      setError('Inserisci un importo valido');
      return;
    }
    
    if (amountValue <= 0) {
      setError('L\'importo deve essere maggiore di zero');
      return;
    }
    
    onConfirm(amountValue, visibility);
  };

  // Formatta l'input al blur per mostrare due decimali
  const handleBlur = () => {
    if (amount === '') return;
    
    const sanitizedAmount = amount.replace(',', '.');
    const amountValue = parseFloat(sanitizedAmount);
    
    if (!isNaN(amountValue)) {
      // Formatta con 2 decimali
      setAmount(amountValue.toFixed(2));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Fai una donazione</h3>
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
                Importo (€)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Inserisci l'importo (es. 25.00 o 100,00 o 5)
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visibility"
                  checked={visibility}
                  onChange={(e) => setVisibility(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="visibility" className="ml-2 block text-sm text-gray-700">
                  Rendi pubblica la mia donazione
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Procedi al pagamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;