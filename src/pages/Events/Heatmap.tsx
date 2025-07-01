/// <reference types="google.maps" />

import React, { useEffect, useState, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { Card, CardContent } from "../../components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import getUserLocation from "./CurrentLocation";
import EventCard from "./EventCard"; // Assicurati che il path sia corretto

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

interface EventLocation {
  event: Event;
  lat: number;
  lng: number;
}

interface CatalogoHeatmapProps {
  events: Event[];
}

const CatalogoHeatmap: React.FC<CatalogoHeatmapProps> = ({ events }) => {
  // Responsive design
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 767);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: isMobile ? "50vh" : "100%",
    minHeight: "400px",
  };

  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [eventLocations, setEventLocations] = useState<EventLocation[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Get user location
  useEffect(() => {
    getUserLocation((location) => {
      if (location && typeof location.latitude === "number" && typeof location.longitude === "number") {
        setCenter({ lat: location.latitude, lng: location.longitude });
      } else {
        // Default to Lecce, Italy (centro della Puglia)
        setCenter({ lat: 40.3515, lng: 18.1750 });
      }
    });
  }, []);

  // Load Google Maps API and geocode event locations
  useEffect(() => {
    if (!center || events.length === 0) return;

    const loader = new Loader({
      apiKey: "AIzaSyBz237WilseCi9Ghn-rENeDSUQtZGVut-s",
      version: "weekly",
      libraries: ["places", "marker"],
    });

    loader.load().then(async (google: typeof window.google) => {
      try {
        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(document.getElementById("catalog-map") as HTMLElement, {
            center,
            zoom: 10,
            mapId: "4504f8b37365c3d0",
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });
        }

        const geocoder = new google.maps.Geocoder();
        const newEventLocations: EventLocation[] = [];

        for (const event of events) {
          try {
            // Usa l'indirizzo del merchant per geocodificare
            const address = `${event.merchant.merchantAddress}, Italy`;
            const response = await geocoder.geocode({ address });
            
            if (response.results.length > 0) {
              const { lat, lng } = response.results[0].geometry.location;
              newEventLocations.push({ 
                event,
                lat: lat(), 
                lng: lng()
              });
            }
          } catch (geocodeError) {
            console.warn(`Geocoding failed for ${event.merchant.merchantAddress}:`, geocodeError);
          }
        }

        setEventLocations(newEventLocations);
        setIsLoading(false);
      } catch (mapError) {
        console.error("Error loading map:", mapError);
        setError("Errore nel caricamento della mappa");
        setIsLoading(false);
      }
    }).catch((loadError) => {
      console.error("Error loading Google Maps API:", loadError);
      setError("Errore nel caricamento dell'API Google Maps");
      setIsLoading(false);
    });
  }, [center, events]);

  // Create markers
  useEffect(() => {
    if (!mapRef.current || eventLocations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    eventLocations.forEach((eventLocation) => {
      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position: { lat: eventLocation.lat, lng: eventLocation.lng },
        title: eventLocation.event.name,
        animation: google.maps.Animation.DROP,
        
       icon: {
  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
      <path fill="#FF0000" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
    </svg>
  `),
  scaledSize: new google.maps.Size(40, 40),
  anchor: new google.maps.Point(20, 20)
}});

      marker.addListener("click", () => {
        setSelectedEvent(eventLocation.event);
        setModalOpen(true);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (eventLocations.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      eventLocations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
      mapRef.current.fitBounds(bounds);
    } else if (eventLocations.length === 1) {
      mapRef.current.setCenter({ lat: eventLocations[0].lat, lng: eventLocations[0].lng });
      mapRef.current.setZoom(14);
    }
  }, [eventLocations]);

  const handleToggleFavorite = (eventId: string) => {
    console.log('Toggle favorite for event:', eventId);
    // Chiudi il modal dopo l'azione
    setModalOpen(false);
  };

  const handleDonate = (eventId: string) => {
    console.log('Donate to event:', eventId);
    // Chiudi il modal dopo l'azione
    setModalOpen(false);
  };

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <Card className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">Caricamento mappa...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <CardContent className="flex flex-col items-center space-y-4 text-center">
            <MapPin className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-600">Errore nella mappa</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
            <button 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Ricarica
            </button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && events.length === 0 && (
        <Card className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <CardContent className="flex flex-col items-center space-y-4 text-center">
            <MapPin className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-600">Nessun evento da visualizzare</p>
              <p className="text-sm text-gray-500">Modifica i filtri per vedere gli eventi sulla mappa</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div id="catalog-map" style={containerStyle} className="rounded-lg overflow-hidden" />

      {/* Modal Dialog EventCard */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen} >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none shadow-none">
          {selectedEvent && (
            <div >
              <EventCard
                event={selectedEvent}
                showUserActions={true}
                onToggleFavorite={handleToggleFavorite}
                onDonate={handleDonate}
                isFavorite={false} // Puoi gestire questo stato come preferisci
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogoHeatmap;