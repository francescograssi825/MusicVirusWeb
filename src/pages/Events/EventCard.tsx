import React, { useState } from 'react';
import { Calendar, MapPin, User, Clock, HandCoins } from 'lucide-react';
import DonateModal from './DonateModal';
import PaymentResultModal from './PaymentResultModal';
import DonationProgressBar from './DonationProgressBar';
import ImageCarousel from './ImageCarousel';
import AudioCarousel from './AudioCarousel';
import InfoModal from './InfoModal';
import CommentModal from './CommentsModal';
import ReportModal from './ReportModal';
import { Button } from "../../components/ui/button";
import OffertModal from './OffertModal';

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

interface Comment {
  id: string;
  text: string;
  timestamp: string;
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
  comments?: Comment[];
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
  currentDate: Date; // data corrente
  onCommentSubmit: (eventId: string, comment: string) => void;
}



const EventCard: React.FC<EventCardProps> = ({
  event,
  showMerchantActions = false,
  showUserActions = false,
  onAccept,
  onReject,
  currentDate,
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
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdateOfferDialogOpen, setIsUpdateOfferDialogOpen] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);


  const isEventEnded = () => {
    const eventDate = new Date(event.eventDate);
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    return eventDate < yesterday;
  };

  const isMerchant = () => {

    type UserType = "user" | "artist" | "merchant" | "admin";

    const storedUserType =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("role")
    : null;

    const currentUserType: UserType = storedUserType
      ? (storedUserType.toLowerCase() as UserType)
      : "user";

    if (currentUserType === "merchant"){
      return true;
    }
    return false;
  }


  // Gestiione invio del commento
const handleCommentSubmit = async (commentText: string) => {
  if (!commentText.trim()) {
    setCommentError("Il commento non può essere vuoto");
    return;
  }

  setIsSubmittingComment(true);
  setCommentError("");

  try {
    // Recupera il token di autenticazione
    const token = localStorage.getItem('authToken') || '';
    if (!token) {
      throw new Error('Utente non autenticato');
    }

    // Effettua la chiamata POST per inviare il commento
    const response = await fetch('http://localhost:8085/comment/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eventId: event.id,
        message: commentText,
        eventName: event.name
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Errore nell'invio del commento");
    }

   
    const newComment = await response.json();
    
   
    const updatedEvent = {
      ...event,
      comments: [...(event.comments || []), newComment]
    };
    
    

    setIsCommentDialogOpen(false);
  } catch (err) {
    setCommentError(err instanceof Error ? err.message : "Errore nell'invio del commento");
  } finally {
    setIsSubmittingComment(false);
  }
};
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


      {isMerchant() && !isEventEnded() &&(
        <div className="mt-4 pt-4 border-t border-gray-200">
         

          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsUpdateOfferDialogOpen(true)}
            >
              Modifica offerta
            </Button>
          
          </div>
        </div>
      )}
    

{/* {true && (    per i test*/ }
  {isEventEnded() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-2">Commenti e segnalazioni:</h4>
          {event.comments?.length ? (
            <div className="space-y-3">
              {event.comments.map(comment => (
                <div key={comment.id} className="text-sm bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-700">{comment.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(comment.timestamp).toLocaleString('it-IT')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nessun commento ancora</p>
          )}

          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsCommentDialogOpen(true)}
            >
              Aggiungi commento
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              onClick={() => setIsReportModalOpen(true)}
            >
              Segnala
            </Button>
          </div>
        </div>
      )}

      {/* Modali */}
      <CommentModal
        isOpen={isCommentDialogOpen}
        onClose={() => setIsCommentDialogOpen(false)}
        onSubmit={handleCommentSubmit}
        isSubmitting={isSubmittingComment}
        error={commentError}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        eventId={event.id}
        eventName={event.name}
      />

      <OffertModal
      isOpen={isUpdateOfferDialogOpen}
        onClose={() => setIsUpdateOfferDialogOpen(false)}
        eventId={event.id}
        eventName={event.name}
      />

    </div>
  );
};

export default EventCard;