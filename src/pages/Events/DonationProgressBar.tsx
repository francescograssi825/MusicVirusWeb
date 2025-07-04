import React, { useState, useEffect } from 'react';
import { DollarSign, Loader } from 'lucide-react';

interface DonationProgressBarProps {
  eventId: string;
  targetAmount: number;
  refreshTrigger: number;
}

const DonationProgressBar: React.FC<DonationProgressBarProps> = ({ 
  eventId, 
  targetAmount,
  refreshTrigger
}) => {
  const [totalRaised, setTotalRaised] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalDonations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8086/api/payments/event-total', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTotalRaised(data.total.totalAmount);
    } catch (err) {
      console.error('Error fetching total donations:', err);
      setError('Impossibile caricare i dati delle donazioni');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalDonations();
  }, [eventId, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <Loader className="w-5 h-5 text-gray-500 animate-spin" />
        <span className="text-sm text-gray-500 mt-2">Caricamento donazioni...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm py-2">
        {error}
      </div>
    );
  }

  const progressPercentage = totalRaised !== null ? 
    Math.min(100, (totalRaised / (targetAmount / 100)) * 100) : 0;
  
  const remainingAmount = totalRaised !== null ? 
    Math.max(0, (targetAmount / 100) - totalRaised) : 0;

  // Determina il colore in base alla percentuale raggiunta
  let progressColor = 'bg-red-500';
  if (progressPercentage >= 25 && progressPercentage < 75) {
    progressColor = 'bg-orange-500';
  } else if (progressPercentage >= 75 && progressPercentage < 100) {
    progressColor = 'bg-blue-500';
  } else if (progressPercentage >= 100) {
    progressColor = 'bg-green-500';
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>
          Raccolti: €{totalRaised !== null ? totalRaised.toFixed(2) : '0.00'}
        </span>
        <span>
          Obiettivo: €{(targetAmount / 100).toFixed(2)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
        <div 
          className={`h-2.5 rounded-full ${progressColor}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-gray-500">
        {progressPercentage >= 100 ? (
          <span className="text-green-600 font-medium">
            Obiettivo raggiunto! +€{(totalRaised! - (targetAmount / 100)).toFixed(2)}
          </span>
        ) : (
          <span>
            Mancano €{remainingAmount.toFixed(2)} al raggiungimento
          </span>
        )}
      </div>
    </div>
  );
};

export default DonationProgressBar;