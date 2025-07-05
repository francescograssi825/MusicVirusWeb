// InfoModal.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface InfoModalProps {
  event: {
    id: string;
    name: string;
    description: string;
    artist: {
      artistName: string;
      email: string;
    };
    merchant: {
      merchantName: string;
      merchantAddress: string;
      merchantDescription: string;
      merchantOffers: string;
    };
    eventDate: string;
    endFundraisingDate: string;
  };
  onClose: () => void;
}

interface Contributor {
  username: string;
  amount: number;
}

const InfoModal: React.FC<InfoModalProps> = ({ event, onClose }) => {
  const [topContributors, setTopContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fetch top contributors
  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:8086/api/payments/user-payments/${event.id}`
        );
        
        if (!response.ok) {
          throw new Error("Errore nel caricamento dei contributori");
        }
        
        const data = await response.json();

        // Convert object to array and sort by amount
        const contributors = Object.entries(data)
          .map(([username, amount]) => ({
            username,
            amount: Number(amount)
          }))
          .sort((a, b) => b.amount - a.amount);

        setTopContributors(contributors);
      } catch (error) {
        console.error("Failed to fetch top contributors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopContributors();
  }, [event.id]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Open Google Maps in new tab
  const openGoogleMaps = () => {
    const address = encodeURIComponent(`${event.merchant.merchantAddress}, Italy`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  // Prevenire la propagazione del click all'elemento sottostante
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Creiamo un portal per il modal
  if (!isMounted) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{event.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Artist Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3">Artista</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{event.artist.artistName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{event.artist.email}</p>
                  </div>
                </div>
              </div>

              {/* Merchant Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3">Esercente</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{event.merchant.merchantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Indirizzo</p>
                    <button
                      onClick={openGoogleMaps}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {event.merchant.merchantAddress}
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Offerta</p>
                    <p className="font-medium">{event.merchant.merchantOffers}</p>
                  </div>
                  {event.merchant.merchantDescription && (
                    <div>
                      <p className="text-sm text-gray-600">Descrizione</p>
                      <p className="font-medium">{event.merchant.merchantDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Data evento</p>
                <p className="font-medium">{formatDate(event.eventDate)}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Fine raccolta fondi</p>
                <p className="font-medium">{formatDate(event.endFundraisingDate)}</p>
              </div>
            </div>

            {/* Event Description */}
            {event.description && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-700 mb-2">Descrizione evento</h3>
                <p className="text-gray-700">{event.description}</p>
              </div>
            )}

            {/* Top Contributors */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-700 mb-3">Top Contributori</h3>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : topContributors.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 text-gray-500 font-medium">
                    <div>Utente</div>
                    <div className="text-right">Importo</div>
                  </div>

                  <div className="space-y-2">
                    {topContributors.map((contributor, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 p-3 bg-gray-50 rounded-lg transition-all hover:bg-gray-100"
                      >
                        <div className="font-medium text-gray-800 truncate">
                          {contributor.username}
                        </div>
                        <div className="text-right text-gray-800">
                          €{contributor.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-md text-center">
                  <p className="text-yellow-700">
                    Non ci sono ancora contributi per questo evento
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InfoModal;