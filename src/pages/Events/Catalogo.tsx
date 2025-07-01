import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { MapPin, Music, Loader2, AlertCircle } from "lucide-react";
import EventCard from "../Events/EventCard";
import CatalogoHeatmap from "./Heatmap";

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

interface Genre {
  name: string;
  displayName: string;
}

const Catalogo: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<"Tutti" | "Mappa">("Tutti");
  const [events, setEvents] = useState<Event[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [error, setError] = useState("");
  const [genreError, setGenreError] = useState("");

  // Carica gli eventi dal catalogo
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8085/api/event/get-catalog');
        
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        
        const data: EventsResponse = await response.json();
        // Filtra solo gli eventi approvati
        const approvedEvents = data.events.filter(event => event.eventState === 'APPROVED');
        setEvents(approvedEvents);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento degli eventi');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Carica i generi
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const response = await fetch('http://localhost:8080/api/registration/genres');
        
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data?.genres) {
          setGenres(data.genres);
        }
        setGenreError("");
      } catch (err) {
        setGenreError(err instanceof Error ? err.message : 'Errore nel caricamento dei generi');
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Filtra gli eventi in base ai generi selezionati
  const filteredEvents = events.filter(event => 
    selectedGenres.length === 0 || 
    event.genres.some(genre => selectedGenres.includes(genre))
  );

  const handleGenreChange = (genre: string, checked: boolean) => {
    setSelectedGenres((prev) => 
      checked 
        ? [...prev, genre]
        : prev.filter((x) => x !== genre)
    );
  };

  const handleToggleFavorite = (eventId: string) => {
    // Implementa la logica per i preferiti
    console.log('Toggle favorite for event:', eventId);
  };

  const handleDonate = (eventId: string) => {
    // Implementa la logica per donare
    console.log('Donate to event:', eventId);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl h-[calc(100vh-6rem)]">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Catalogo Eventi
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100%-3.5rem)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Card className="h-fit">
            <CardContent className="p-4">
              {/* Vista Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-gray-700">Vista</h3>
                <Select 
                  value={selectedFilter} 
                  onValueChange={(value: string) => setSelectedFilter(value as "Tutti" | "Mappa")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Tutti">Lista Eventi</SelectItem>
                    <SelectItem value="Mappa">Mappa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="mb-6" />

              {/* Statistiche */}
              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-sm text-blue-900 font-medium">
                    Eventi Totali: {events.length}
                  </div>
                  <div className="text-sm text-blue-700">
                    Filtrati: {filteredEvents.length}
                  </div>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Genre Filters */}
              <div>
                <h3 className="text-sm font-medium mb-4 text-gray-700 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Genere Musicale
                </h3>
                
                {loadingGenres ? (
                  <div className="flex items-center text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Caricamento...
                  </div>
                ) : genreError ? (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {genreError}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {genres.map((genre) => (
                      <div key={genre.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={genre.name}
                          checked={selectedGenres.includes(genre.name)}
                          onCheckedChange={(checked: boolean) => handleGenreChange(genre.name, checked)}
                        />
                        <label
                          htmlFor={genre.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {genre.displayName}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Filters */}
              {selectedGenres.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <button
                    onClick={() => setSelectedGenres([])}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Rimuovi filtri
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
       <main className="flex-1 min-h-0 overflow-hidden">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {selectedFilter === "Mappa" ? (
                <CatalogoHeatmap events={filteredEvents} />
              ) : (
                <div className="p-4 h-full flex flex-col">
                  {/* Header fisso */}
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Eventi Disponibili ({filteredEvents.length})
                    </h2>
                    {selectedGenres.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Filtrati per: {selectedGenres.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  {/* Contenitore scrollabile */}
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
                        <span className="text-gray-600">Caricamento eventi...</span>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center h-full">
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
                    ) : filteredEvents.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nessun evento trovato
                          </h3>
                          <p className="text-gray-600">
                            {selectedGenres.length > 0 
                              ? 'Prova a rimuovere alcuni filtri per vedere più eventi.'
                              : 'Non ci sono eventi disponibili al momento.'
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-4">
                        {filteredEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            showUserActions={true}
                            onToggleFavorite={handleToggleFavorite}
                            onDonate={handleDonate}
                            isFavorite={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Catalogo;