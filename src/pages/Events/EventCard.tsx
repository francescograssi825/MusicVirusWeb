import React, { useState } from 'react';
import { Calendar, MapPin, User, Clock, HandCoins } from 'lucide-react';
import DonateModal from './DonateModal';
import PaymentResultModal from './PaymentResultModal';
import DonationProgressBar from './DonationProgressBar';
import ImageCarousel from './ImageCarousel';
import AudioCarousel from './AudioCarousel';
import InfoModal from './InfoModal';

interface Artist {
  id: string;
  artistName: string;
  email: string;
}

interface Merchant {
  id: string;
  merchantName: string;
  merchantAddress: string;
  merchantDescription: string;
  merchantOffers: any;
  email: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  artist: Artist;
  genres: string[];
  merchant: Merchant;
  amount: number;
  creationDate: string | null;
  eventDate: string;
  endFundraisingDate: string;
  pictures: string[];
  sample: string[];
  eventState: string;
  creatorToken: string | null;
  creator: any;
}

interface EventCardProps {
  event: Event;
  showMerchantActions?: boolean;
  showUserActions?: boolean;
  onAccept?: (eventId: string) => void;
  onReject?: (eventId: string) => void;
  onToggleFavorite?: (eventId: string) => void;
  onDonate?: (eventId: string) => void;
  isFavorite?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  showMerchantActions = false,
  showUserActions = false,
  onAccept,
  onReject,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'error' | 'canceled';
    message: string;
  } | null>(null);
 const [refreshTrigger, setRefreshTrigger] = useState(0);
 
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const getStateColor = (state: string) => {
    switch (state) {
      case 'PENDING_APPROVAL_BY_MERCHANT':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateText = (state: string) => {
    switch (state) {
      case 'PENDING_APPROVAL_BY_MERCHANT':
        return 'In attesa di approvazione';
      case 'APPROVED':
        return 'Approvato';
      case 'REJECTED':
        return 'Rifiutato';
      default:
        return state;
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === event.pictures.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? event.pictures.length - 1 : prev - 1
    );
  };

  const nextAudio = () => {
    setCurrentAudioIndex((prev) =>
      prev === event.sample.length - 1 ? 0 : prev + 1
    );
    stopAudio();
  };

  const prevAudio = () => {
    setCurrentAudioIndex((prev) =>
      prev === 0 ? event.sample.length - 1 : prev - 1
    );
    stopAudio();
  };

  const playAudio = () => {
    if (currentAudio) {
      stopAudio();
    }

    const audio = new Audio(event.sample[currentAudioIndex]);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    });

    audio.play();
    setCurrentAudio(audio);
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const selectAudio = (index: number) => {
  setCurrentAudioIndex(index);
  stopAudio();
};

  const handleDonateClick = () => {
    setIsDonateModalOpen(true);
  };

   const handleInfoClick = () => {
    setIsInfoModalOpen(true);
  };

  const handleConfirmDonation = async (amount: number, visibility: boolean) => {
    setIsDonateModalOpen(false);

    try {
      const username = localStorage.getItem('username') || '';

      const paymentData = {
        username,
        visibility,
        eventId: event.id,
        amount: amount,
        currency: "EUR"
      };

      const response = await fetch('http://localhost:8086/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();
      console.log(result);

      if (result.approvalUrl) {
        const paymentId = result.paymentId;
        console.log("Current payment id", paymentId);

        // Apri finestra PayPal
        const paymentWindow = window.open(
          result.approvalUrl,
          'paypal_payment',
          'width=600,height=700'
        );

        // Controllo stato pagamento più frequente
        const checkPaymentStatus = setInterval(async () => {
          try {
            // Controlla lo stato del pagamento prima di verificare se la finestra è chiusa
            const statusResponse = await fetch(`http://localhost:8086/api/payments/id/${paymentId}`);
            const statusData = await statusResponse.json();

            // Se il pagamento è completato (con successo o fallito)
            if (statusResponse.ok && statusData.payment?.paypalPaymentId) {
              // CHIUDI LA FINESTRA PAYPAL
              if (paymentWindow && !paymentWindow.closed) {
                paymentWindow.close();
              }
              
              clearInterval(checkPaymentStatus);
              setPaymentResult({
                status: 'success',
                message: 'Il tuo pagamento è stato completato con successo!'
              });
              return;
            }

            // Se il pagamento è fallito/cancellato e la finestra è ancora aperta
            if (statusResponse.ok && statusData.payment && !statusData.payment.paypalPaymentId) {
              // Controlla se è stato esplicitamente cancellato
              if (statusData.payment.status === 'CANCELED' || statusData.payment.status === 'FAILED') {
                if (paymentWindow && !paymentWindow.closed) {
                  paymentWindow.close();
                }
                
                clearInterval(checkPaymentStatus);
                setPaymentResult({
                  status: 'canceled',
                  message: 'Il pagamento è stato annullato o è fallito'
                });
                return;
              }
            }

            // Se la finestra è stata chiusa dall'utente
            if (paymentWindow?.closed) {
              clearInterval(checkPaymentStatus);
              
              // Verifica finale dello stato
              const finalStatusResponse = await fetch(`http://localhost:8086/api/payments/id/${paymentId}`);
              const finalStatusData = await finalStatusResponse.json();

              if (finalStatusResponse.ok && finalStatusData.payment?.paypalPaymentId) {
                setPaymentResult({
                  status: 'success',
                  message: 'Il tuo pagamento è stato completato con successo!'
                });
              } else {
                setPaymentResult({
                  status: 'canceled',
                  message: 'Hai annullato il pagamento'
                });
              }
            }
             setRefreshTrigger(prev => prev + 1);
          } catch (error) {
            console.error('Errore durante il controllo dello stato:', error);
            // In caso di errore, continua il controllo
          }
        }, 1000); // Controllo ogni secondo 

        

      } else {
        throw new Error('URL di approvazione non disponibile');
      }
    } catch (error) {
      setPaymentResult({
        status: 'error',
        message: 'Errore durante la creazione del pagamento: ' + (error as Error).message
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.name}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStateColor(event.eventState)}`}>
            {getStateText(event.eventState)}
          </span>
        </div>
      </div>

      {/* Images Carousel */}
      {event.pictures && event.pictures.length > 0 && (
        <ImageCarousel
          pictures={event.pictures}
          currentImageIndex={currentImageIndex}
          onPrev={prevImage}
          onNext={nextImage}
          onSelectImage={setCurrentImageIndex}
        />
      )}

      {/* Audio Samples Carousel */}
      {event.sample && event.sample.length > 0 && (
        <AudioCarousel
          samples={event.sample}
          currentAudioIndex={currentAudioIndex}
          isPlaying={isPlaying}
          onPrev={prevAudio}
          onNext={nextAudio}
          onTogglePlay={toggleAudio}
          onSelectAudio={selectAudio}
        />
      )}

      {/* Description */}
      <p className="text-gray-600 mb-4">{event.description}</p>

      {/* Artist Info */}
      <div className="flex items-center mb-3">
        <User className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">
          Artista: <span className="font-medium">{event.artist.artistName}</span>
        </span>
      </div>

      {/* Merchant Info */}
      {!showUserActions  && (
      <div className="flex items-center mb-3">
        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">
          Locale: <span className="font-medium">{event.merchant.merchantName}</span> - {event.merchant.merchantAddress}
        </span>
      </div>
      )}

      {!showUserActions  && (
      <div className="flex items-center mb-3">
        <HandCoins className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">
          Offerta: <span className="font-medium">{event.merchant.merchantOffers}</span>
        </span>
      </div>
      )}

      {/* Event Date */}
      <div className="flex items-center mb-3">
        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">
          Data evento: <span className="font-medium">{formatDate(event.eventDate)}</span>
        </span>
      </div>


      {/* Fundraising End Date */}
      {!showUserActions  && (
      <div className="flex items-center mb-3">
        <Clock className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">
          Fine raccolta fondi: <span className="font-medium">{formatDate(event.endFundraisingDate)}</span>
        </span>
      </div>
      )}

      {/* Amount */}
      <DonationProgressBar 
        eventId={event.id}
        targetAmount={event.amount}
        refreshTrigger={refreshTrigger}
      />

      {/* Genres */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {event.genres.map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      {showMerchantActions && event.eventState === 'PENDING_APPROVAL_BY_MERCHANT' && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => onAccept?.(event.id)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Accetta
          </button>
          <button
            onClick={() => onReject?.(event.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Rifiuta
          </button>
        </div>
      )}

      {/* Donate button */}
      {showUserActions && event.eventState === 'APPROVED' && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleDonateClick}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Dona
          </button>
          <button
            onClick={handleInfoClick}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Informazioni
          </button>
        </div>
      )}

      {/* Donation Modal */}
      {isDonateModalOpen && (
        <DonateModal
          eventId={event.id}
          onClose={() => setIsDonateModalOpen(false)}
          onConfirm={handleConfirmDonation}
        />
      )}

      {/* Info Modal */}
      {isInfoModalOpen && (
        <InfoModal
          event={event}
          onClose={() => setIsInfoModalOpen(false)}
        />
      )}

      {/* Payment Result Modal */}
    {paymentResult && (
        <PaymentResultModal
          status={paymentResult.status}
          message={paymentResult.message}
          onClose={() => {
            setPaymentResult(null);
            // Triggera un aggiornamento quando si chiude il modal
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export default EventCard;