import EventCard from '../../Events/EventCard';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Music, Calendar } from 'lucide-react';

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

const EventMerchant: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

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
        setEvents(data.events);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento degli eventi');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Funzione per filtrare gli eventi in base allo stato
  const getFilteredEvents = () => {
    if (selectedFilter === 'ALL') {
      return events;
    }
    return events.filter(event => event.eventState === selectedFilter);
  };

  // Funzione per contare gli eventi per stato
  const getEventCountByState = (state: string) => {
    if (state === 'ALL') return events.length;
    return events.filter(event => event.eventState === state).length;
  };

  // Statistiche degli eventi
  const stats = {
    total: events.length,
    pending: events.filter(e => e.eventState === 'PENDING_APPROVAL_BY_MERCHANT').length,
    approved: events.filter(e => e.eventState === 'APPROVED').length,
    rejected: events.filter(e => e.eventState === 'REJECTED').length
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Music className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              I Miei Eventi
            </h1>
          </div>
          <p className="text-gray-600">
            Visualizza tutti i tuoi eventi musicali e il loro stato
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Totale Eventi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">In Attesa</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Approvati</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Rifiutati</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <div className="flex space-x-1">
            {[
              { key: 'ALL', label: 'Tutti', count: stats.total },
              { key: 'PENDING_APPROVAL_BY_MERCHANT', label: 'In Attesa', count: stats.pending },
              { key: 'APPROVED', label: 'Approvati', count: stats.approved },
              { key: 'REJECTED', label: 'Rifiutati', count: stats.rejected }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedFilter === filter.key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

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
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedFilter === 'ALL' 
                      ? 'Nessun evento trovato' 
                      : `Nessun evento ${selectedFilter.toLowerCase().replace('_', ' ')}`
                    }
                  </h3>
                  <p className="text-gray-600">
                    {selectedFilter === 'ALL' 
                      ? 'Non hai ancora creato nessun evento.' 
                      : 'Non ci sono eventi con questo stato al momento.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedFilter === 'ALL' 
                      ? 'Tutti gli Eventi' 
                      : `Eventi ${selectedFilter.toLowerCase().replace('_', ' ')}`
                    } ({filteredEvents.length})
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      showMerchantActions={false}
                      showUserActions={false} 
                      currentDate={new Date()} 
                      onCommentSubmit={function (eventId: string, comment: string): void {
                        throw new Error('Function not implemented.');
                      } }                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventMerchant;