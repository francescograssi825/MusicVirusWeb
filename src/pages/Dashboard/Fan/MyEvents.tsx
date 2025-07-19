import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Loader2, AlertCircle, Ticket } from "lucide-react";
import EventCard from "../../Events/EventCard";

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

interface FanEvent {
  eventId: string;
  username: string;
  email: string;
}

const MyEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate] = useState(new Date());

  // Recupera il token JWT dallo storage locale
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Carica gli eventi acquistati dall'utente
  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        
        if (!token) {
          throw new Error("Utente non autenticato");
        }

        // Recupera la lista degli eventi acquistati
        const fanEventsResponse = await fetch('http://localhost:8086/api/fan/events', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!fanEventsResponse.ok) {
          throw new Error(`Errore HTTP: ${fanEventsResponse.status}`);
        }

        const fanEventsData: { fanEvents: FanEvent[] } = await fanEventsResponse.json();
        
        // Recupera i dettagli di ogni evento
        const eventsData: Event[] = [];
        for (const fanEvent of fanEventsData.fanEvents) {
          const eventResponse = await fetch('http://localhost:8085/api/event/get-event', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: fanEvent.eventId })
          });

          if (!eventResponse.ok) {
            console.error(`Errore nel caricamento dell'evento ${fanEvent.eventId}`);
            continue;
          }

          const eventData: Event = await eventResponse.json();
          eventsData.push(eventData);
        }

        setEvents(eventsData);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento degli eventi');
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

const handleCommentSubmit = async (eventId: string, commentText: string) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error("Utente non autenticato");
    }

    const response = await fetch('http://localhost:8088/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eventId,
        text: commentText
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Errore nell'invio del commento");
    }

    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              comments: [
                ...(event.comments || []), 
                { 
                  id: Date.now().toString(), 
                  text: commentText,
                  timestamp: new Date().toISOString() 
                }
              ] 
            } 
          : event
      )
    );
  } catch (err) {
    console.error("Comment submission error:", err);
    throw err;
  }
};

  return (
    <div className="container mx-auto p-4 max-w-7xl min-h-[calc(100vh-6rem)]">
      <h1 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
        <Ticket className="w-8 h-8" />
        I Miei Biglietti
      </h1>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Eventi Acquistati ({events.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Visualizza tutti gli eventi a cui hai partecipato
              </p>
            </div>
            
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mr-3" />
                  <span className="text-gray-600">Caricamento eventi...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Errore nel caricamento
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Riprova
                    </button>
                  </div>
                </div>
              ) : events.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun evento acquistato
                    </h3>
                    <p className="text-gray-600">
                      Visita il catalogo per partecipare a nuovi eventi!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      showUserActions={false}
                      currentDate={currentDate}
                      onCommentSubmit={handleCommentSubmit}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyEvents;