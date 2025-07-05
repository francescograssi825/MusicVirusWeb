import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2 } from 'lucide-react';

interface AudioCarouselProps {
  samples: string[];
  currentAudioIndex: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSelectAudio: (index: number) => void;
}

const AudioCarousel: React.FC<AudioCarouselProps> = ({
  samples,
  currentAudioIndex,
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
  onSelectAudio
}) => {
  return (
    <div className="mb-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Volume2 className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">
              Sample Audio {currentAudioIndex + 1} di {samples.length}
            </span>
          </div>
          {samples.length > 1 && (
            <div className="flex space-x-1">
              <button
                onClick={onPrev}
                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNext}
                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            <div className="text-sm text-blue-800 font-medium">
              {samples[currentAudioIndex].split('/').pop()?.split('.')[0] || `Audio ${currentAudioIndex + 1}`}
            </div>
            <div className="text-xs text-blue-600">
              {isPlaying ? 'In riproduzione...' : 'Clicca per ascoltare'}
            </div>
          </div>
        </div>

        {samples.length > 1 && (
          <div className="flex justify-center mt-3 space-x-1">
            {samples.map((_, index) => (
              <button
                key={index}
                onClick={() => onSelectAudio(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentAudioIndex ? 'bg-blue-600' : 'bg-blue-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioCarousel;