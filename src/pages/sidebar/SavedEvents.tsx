import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Music, Heart } from "lucide-react";
import EventsCard, { type EventData } from "./Events/EventsCard"; // assicurati che il percorso sia corretto

export default function SavedEvents() {
  // Dati mock per gli eventi salvati
  //usare fetch per scaricarli dal db
  const savedEvents: EventData[] = [
    {
      id: 1,
      title: "Coldplay World Tour",
      artist: "Coldplay",
      date: "20 Luglio 2025",
      location: "San Siro, Milano",
      price: "€89.00",
      category: "Rock/Pop",
      image: "https://picsum.photos/300/200"
    },
    {
      id: 2,
      title: "Techno Underground",
      artist: "Various Artists",
      date: "25 Luglio 2025",
      location: "Warehouse, Berlino",
      price: "€45.00",
      category: "Electronic",
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      title: "Jazz Festival",
      artist: "Miles Davis Tribute",
      date: "30 Luglio 2025",
      location: "Blue Note, New York",
      price: "€65.00",
      category: "Jazz",
      image: "/api/placeholder/300/200"
    },
    {
      id: 4,
      title: "Indie Rock Night",
      artist: "Arctic Monkeys",
      date: "5 Agosto 2025",
      location: "Forum, Los Angeles",
      price: "€75.00",
      category: "Indie Rock",
      image: "/api/placeholder/300/200"
    },
    {
      id: 5,
      title: "Classical Evening",
      artist: "Vienna Philharmonic",
      date: "10 Agosto 2025",
      location: "Teatro alla Scala, Milano",
      price: "€120.00",
      category: "Classical",
      image: "/api/placeholder/300/200"
    },
    {
      id: 6,
      title: "Hip Hop Fest",
      artist: "Kendrick Lamar",
      date: "15 Agosto 2025",
      location: "Madison Square Garden, NYC",
      price: "€95.00",
      category: "Hip Hop",
      image: "/api/placeholder/300/200"
    }
  ];

  return (
    <div className="space-y-6" style={{ padding: "10px" }}>
      <div className="flex justify-between items-center">
        <div
         
          className="p-6 rounded-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold tracking-tight text-white">Eventi Salvati</h1>
          <p className="text-white">
            I tuoi eventi preferiti salvati per dopo
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedEvents.map((event) => (
          <EventsCard key={event.id} event={event} variant="saved" />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suggerimenti</CardTitle>
          <CardDescription>
            Altri eventi che potrebbero interessarti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Festival Elettronico</h4>
                <p className="text-sm text-muted-foreground">Roma - 12 Settembre 2025</p>
              </div>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Concerto di Pianoforte</h4>
                <p className="text-sm text-muted-foreground">Firenze - 18 Settembre 2025</p>
              </div>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
