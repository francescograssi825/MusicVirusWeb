import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { MapPin, Music, Target, User, Heart } from "lucide-react";

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

interface CatalogoCardsProps {
  cards: CardData[];
}

const CatalogoCards: React.FC<CatalogoCardsProps> = ({ cards }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Nessun progetto trovato</p>
          <p className="text-sm">Prova a modificare i filtri per vedere più risultati</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const progressPercentage = getProgressPercentage(card.currentAmount, card.goal);
        
        return (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="relative overflow-hidden">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  <Music className="w-3 h-3 mr-1" />
                  {card.genre}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-1">{card.title}</CardTitle>
              {card.artistName && (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  {card.artistName}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {card.position}
              </div>
            </CardHeader>

            <CardContent className="pb-3">
              <CardDescription className="line-clamp-2 mb-4">
                {card.description}
              </CardDescription>

              {/* Progress Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {formatCurrency(card.currentAmount)} raccolti
                  </span>
                  <span className="font-medium flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    {formatCurrency(card.goal)}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 gap-2">
              <Button variant="outline" className="flex-1">
                Dettagli
              </Button>
              <Button className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Dona
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default CatalogoCards;