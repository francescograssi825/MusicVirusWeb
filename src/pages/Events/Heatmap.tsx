import React, { useEffect, useState, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import getUserLocation from "./CurrentLocation";
import ModalContent from "./ModalContent";

interface ProjectLocation {
  title: string;
  lat: number;
  lng: number;
  imageURL: string;
  description: string;
  goal: number;
  currentAmount: number;
  artistName: string;
  genre: string;
  position: string;
}

const Heatmap: React.FC = () => {
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
  const [locations, setLocations] = useState<ProjectLocation[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectLocation | null>(null);

  const cards = [
    { title: "Progetto A", imageUrl: "https://mdbootstrap.com/img/new/standard/city/041.webp", description: "Descrizione progetto A.", goal: 1000, currentAmount: 200, position: "Tuturano", genre: "Rock", artistName: "Bob4" },
    { title: "Progetto B", imageUrl: "https://mdbootstrap.com/img/new/standard/city/042.webp", description: "Descrizione progetto B.", goal: 500, currentAmount: 300, position: "Brindisi", genre: "Jazz", artistName: "Bob3" },
    { title: "Progetto C", imageUrl: "https://mdbootstrap.com/img/new/standard/city/041.webp", description: "Descrizione progetto C.", goal: 1000, currentAmount: 200, position: "Lecce", genre: "Pop", artistName: "Bob2" },
    { title: "Progetto D", imageUrl: "https://mdbootstrap.com/img/new/standard/city/042.webp", description: "Descrizione progetto D.", goal: 900, currentAmount: 700, position: "Gallipoli", genre: "Rock", artistName: "Bob1" },
  ];

  // Get user location
  useEffect(() => {
    getUserLocation((location) => {
      if (location && typeof location.latitude === "number" && typeof location.longitude === "number") {
        setCenter({ lat: location.latitude, lng: location.longitude });
      } else {
        // Default to Lecce, Italy
        setCenter({ lat: 40.3515, lng: 18.1750 });
      }
    });
  }, []);

  // Load Google Maps API and geocode locations
  useEffect(() => {
    if (!center) return;

    const loader = new Loader({
      apiKey: apikeu,
      version: "weekly",
      libraries: ["places", "marker"],
    });

    loader.load().then(async (google) => {
      try {
        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(document.getElementById("map") as HTMLElement, {
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
        const newLocations: ProjectLocation[] = [];

        for (const card of cards) {
          try {
            const response = await geocoder.geocode({ address: `${card.position}, Italy` });
            if (response.results.length > 0) {
              const { lat, lng } = response.results[0].geometry.location;
              newLocations.push({ 
                title: card.title, 
                lat: lat(), 
                lng: lng(), 
                imageURL: card.imageUrl, 
                description: card.description,
                goal: card.goal,
                currentAmount: card.currentAmount,
                artistName: card.artistName,
                genre: card.genre,
                position: card.position
              });
            }
          } catch (geocodeError) {
            console.warn(`Geocoding failed for ${card.position}:`, geocodeError);
          }
        }

        setLocations(newLocations);
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
  }, [center]);

  // Create markers
  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    locations.forEach((loc) => {
      const marker = new google.maps.Marker({
        map: mapRef.current!,
        position: { lat: loc.lat, lng: loc.lng },
        title: loc.title,
        animation: google.maps.Animation.DROP,
      });

      marker.addListener("click", () => {
        setSelectedProject(loc);
        setModalOpen(true);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (locations.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
      mapRef.current.fitBounds(bounds);
    }
  }, [locations]);

  return (
    <div className="w-full h-full relative" style={{opacity: 0.9}}>
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
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Ricarica
            </Button>
          </CardContent>
        </Card>
      )}

      <div id="map" style={containerStyle} className="rounded-lg overflow-hidden" />

      {/* Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedProject?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {selectedProject?.position}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="py-4">
              <ModalContent 
                title={selectedProject.title}
                imageUrl={selectedProject.imageURL}
                description={selectedProject.description}
                goal={selectedProject.goal}
                currentAmount={selectedProject.currentAmount}
                position={selectedProject.position}
                artistName={selectedProject.artistName}
                genre={selectedProject.genre}
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Chiudi
            </Button>
            <Button>
              Dona Ora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Heatmap;
