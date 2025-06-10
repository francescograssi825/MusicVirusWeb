import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
//import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
//import { Badge } from "@/components/ui/badge";
import { MapPin, Music, Target, DollarSign, Bold } from "lucide-react";
import Heatmap from "./Heatmap";
import CatalogoCards from "./CatalogoCards";

interface CardData {
  title: string;
  imageUrl: string;
  description: string;
  goal: number;
  currentAmount: number;
  position: string;
  genre: string;
  artistName?: string;
}

interface Genre {
  name: string;
  displayName: string;
}

const invokeUrl = "http://localhost:8080";

const Catalogo: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<"Tutti" | "Mappa">("Tutti");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${invokeUrl}/api/registration/genres`)
      .then((res) => res.json())
      .then((data) => data?.genres && setGenres(data.genres))
      .catch(() => setError("Errore nel caricamento dei generi"))
      .finally(() => setLoadingGenres(false));
  }, []);

  const cards: CardData[] = [
    { title: "Progetto A", imageUrl: "https://mdbootstrap.com/img/new/standard/city/041.webp", description: "Descrizione progetto A.", goal: 1000, currentAmount: 200, position: "Tuturano", genre: "Rock", artistName: "Bob4" },
    { title: "Progetto B", imageUrl: "https://mdbootstrap.com/img/new/standard/city/042.webp", description: "Descrizione progetto B.", goal: 500, currentAmount: 300, position: "Brindisi", genre: "Jazz", artistName: "Bob3" },
    { title: "Progetto C", imageUrl: "https://mdbootstrap.com/img/new/standard/city/041.webp", description: "Descrizione progetto C.", goal: 1000, currentAmount: 200, position: "Lecce", genre: "Pop", artistName: "Bob2" },
    { title: "Progetto D", imageUrl: "https://mdbootstrap.com/img/new/standard/city/042.webp", description: "Descrizione progetto D.", goal: 900, currentAmount: 700, position: "Gallipoli", genre: "Rock", artistName: "Bob1" },
  ];

  const filteredCards = cards.filter((c) => selectedGenres.length === 0 || selectedGenres.includes(c.genre));

  const handleGenreChange = (genre: string, checked: boolean) => {
    setSelectedGenres((prev) => 
      checked 
        ? [...prev, genre]
        : prev.filter((x) => x !== genre)
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
    <h1
      style={{
        fontSize: "1.875rem",
        fontWeight: "bold",
        marginBottom: "1.5rem",
        color: "white",
        opacity: 1
      }}
    >
      Catalogo Eventi
    </h1>
      <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">
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
                  <SelectContent>
                    <SelectItem value="Tutti">Semplice</SelectItem>
                    <SelectItem value="Mappa">Mappa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="mb-6" />

              {/* Genre Filters */}
              <div>
                <h3 className="text-sm font-medium mb-4 text-gray-700 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Genere Musicale
                </h3>
                
                {loadingGenres ? (
                  <div className="text-sm text-gray-500">Caricamento...</div>
                ) : error ? (
                  <div className="text-sm text-red-500">{error}</div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {genres.map((genre) => (
                      <div key={genre.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={genre.name}
                          checked={selectedGenres.includes(genre.name)}
                          onCheckedChange={(checked: boolean) => handleGenreChange(genre.name, checked as boolean)}
                        />
                        <label
                          htmlFor={genre.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {genre.displayName}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-0">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {selectedFilter === "Mappa" ? (
                <Heatmap />
              ) : (
                <div className="p-4 h-full overflow-auto">
                  <CatalogoCards cards={filteredCards} />
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