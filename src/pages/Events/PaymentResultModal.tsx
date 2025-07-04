import React from 'react';

interface PaymentResultModalProps {
  status: 'success' | 'error' | 'canceled';
  message: string;
  onClose: () => void;
}

const PaymentResultModal: React.FC<PaymentResultModalProps> = ({ status, message, onClose }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'success':
        return {
          icon: '✅',
          title: 'Pagamento completato!',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: '❌',
          title: 'Errore nel pagamento',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      case 'canceled':
        return {
          icon: '⚠️',
          title: 'Pagamento annullato',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      default:
        return {
          icon: '',
          title: '',
          bgColor: '',
          textColor: ''
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden ${statusInfo.bgColor}`}>
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">{statusInfo.icon}</div>
          <h3 className={`text-xl font-semibold mb-2 ${statusInfo.textColor}`}>
            {statusInfo.title}
          </h3>
          <p className="text-gray-700 mb-6">{message}</p>
          <button
            onClick={onClose}
            className={`px-4 py-2 font-medium rounded-md ${
              status === 'success' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : status === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultModal;