import EventCard from '../../Events/EventCard';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, CheckCircle, X } from 'lucide-react';


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

interface EventsResponse {
  events: Event[];
}

interface AcceptanceModalProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventId: string, offer: string) => void;
}

const AcceptanceModal: React.FC<AcceptanceModalProps> = ({ eventId, eventName, isOpen, onClose, onSubmit }) => {
  const [offer, setOffer] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(eventId, offer);
    setLoading(false);
    setOffer('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Accetta Evento: {eventName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offerta per l'evento (opzionale)
            </label>
            <textarea
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              rows={3}
              placeholder="Inserisci la tua offerta per questo evento..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Accetta Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AcceptEvent: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [acceptanceModal, setAcceptanceModal] = useState<{
    isOpen: boolean;
    eventId: string;
    eventName: string;
  }>({ isOpen: false, eventId: '', eventName: '' });


  
useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8085/event/merchant/get-events', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data: EventsResponse = await response.json();
      
      // Filtra solo gli eventi in attesa di approvazione
      const pendingEvents = data.events.filter(
        event => event.eventState === 'PENDING_APPROVAL_BY_MERCHANT'
      );
      
      setEvents(pendingEvents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli eventi');
    } finally {
      setLoading(false);
    }
  };
  fetchEvents();
}, []);
  const handleAcceptEvent = (eventId: string, eventName: string) => {
    setAcceptanceModal({ isOpen: true, eventId, eventName });
  };

  const handleAcceptConfirm = async (eventId: string, offer: string) => {
    try {
      setActionLoading(eventId);
      
      const token = localStorage.getItem('authToken');
      const merchantId = 'id'; 
      
       const requestBody = JSON.stringify({
      eventId: eventId,
      merchantId: merchantId,
      merchantResponse: 'APPROVED', 
      merchantOffers: offer
    });
      
     
      const response = await fetch('http://localhost:8085/event/merchant/acceptance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: requestBody
      });
      
      if (!response.ok) {
        alert(`Errore nella richiesta: ${response.status}, ${response.json.toString}`)
        throw new Error(`Errore nell'accettazione: ${response.status}`);
      }
      
      // Rimuovi l'evento dalla lista
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setSuccessMessage('Evento accettato con successo!');
      
      // Nascondi il messaggio dopo 2 secondi
      setTimeout(() => setSuccessMessage(null), 2000);
    
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'accettazione dell\'evento');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      setActionLoading(eventId);
      
      const token = localStorage.getItem('authToken');
      const merchantId = 'id';
      
     

    const requestBody = JSON.stringify({
      eventId: eventId,
      merchantId: merchantId,
      merchantResponse: 'REJECTED', 
      merchantOffers: ''
    });
      
       
      const response = await fetch('http://localhost:8085/event/merchant/acceptance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: requestBody
      });
      
      if (!response.ok) {
        alert(`Errore nel rifiuto: ${response.status}, ${response.json.toString}`)
        throw new Error(`Errore nel rifiuto: ${response.status}`);
      }
      
      // Rimuovi l'evento dalla lista
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setSuccessMessage('Evento rifiutato con successo!');
      
      // Nascondi il messaggio dopo 3 secondi
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel rifiuto dell\'evento');
    } finally {
      setActionLoading(null);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestione Eventi
          </h1>
          <p className="text-gray-600">
            Accetta o rifiuta gli eventi proposti per il tuo locale
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
            <span className="text-gray-600">Caricamento eventi...</span>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nessun evento in attesa
                  </h3>
                  <p className="text-gray-600">
                    Non ci sono eventi che richiedono la tua approvazione al momento.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="relative">
                    {actionLoading === event.id && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    )}
                    <EventCard
                      event={event}
                      showMerchantActions={true}
                      onAccept={(eventId) => handleAcceptEvent(eventId, event.name)}
                      onReject={handleRejectEvent}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Acceptance Modal */}
        <AcceptanceModal
          eventId={acceptanceModal.eventId}
          eventName={acceptanceModal.eventName}
          isOpen={acceptanceModal.isOpen}
          onClose={() => setAcceptanceModal({ isOpen: false, eventId: '', eventName: '' })}
          onSubmit={handleAcceptConfirm}
        />
      </div>
    </div>
  );
};

export default AcceptEvent;