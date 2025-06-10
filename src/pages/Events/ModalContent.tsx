import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Separator } from "../../components/ui/separator";
import { MapPin, Music, User, Target, TrendingUp } from "lucide-react";

interface ModalContentProps {
  title: string;
  imageUrl: string;
  description: string;
  goal: number;
  currentAmount: number;
  position: string;
  artistName: string;
  genre: string;
}

const ModalContent: React.FC<ModalContentProps> = ({
  title,
  imageUrl,
  description,
  goal,
  currentAmount,
  position,
  artistName,
  genre,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const progressPercentage = getProgressPercentage(currentAmount, goal);
  const remainingAmount = Math.max(goal - currentAmount, 0);

  return (
    <div className="space-y-6" style={{opacity: 0.9}}>
      {/* Project Image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-64 object-cover rounded-lg shadow-sm"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            <Music className="w-3 h-3 mr-1" />
            {genre}
          </Badge>
        </div>
      </div>

      {/* Project Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            <span className="font-medium">{artistName}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{position}</span>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>

      <Separator />

      {/* Funding Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Progresso Finanziamento
              </h4>
              <Badge variant={progressPercentage >= 100 ? "default" : "secondary"}>
                {Math.round(progressPercentage)}%
              </Badge>
            </div>

            <Progress value={progressPercentage} className="h-3" />

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {formatCurrency(currentAmount)}
                </div>
                <div className="text-gray-500">Raccolti</div>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-blue-600">
                  {formatCurrency(goal)}
                </div>
                <div className="text-gray-500">Obiettivo</div>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-orange-600">
                  {formatCurrency(remainingAmount)}
                </div>
                <div className="text-gray-500">Mancanti</div>
              </div>
            </div>

            {progressPercentage >= 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-green-800 font-medium">🎉 Obiettivo Raggiunto!</div>
                <div className="text-green-600 text-sm">
                  Questo progetto ha raggiunto il suo obiettivo di finanziamento
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-900 mb-2">Dettagli Progetto</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Genere:</span>
            <div className="font-medium">{genre}</div>
          </div>
          <div>
            <span className="text-gray-500">Località:</span>
            <div className="font-medium">{position}</div>
          </div>
          <div>
            <span className="text-gray-500">Artista:</span>
            <div className="font-medium">{artistName}</div>
          </div>
          <div>
            <span className="text-gray-500">Stato:</span>
            <div className="font-medium">
              {progressPercentage >= 100 ? "Completato" : "In corso"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalContent;