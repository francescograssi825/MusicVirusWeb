// ImageCarousel.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  pictures: string[];
  currentImageIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectImage: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  pictures,
  currentImageIndex,
  onPrev,
  onNext,
  onSelectImage
}) => {
  return (
    <div className="mb-4">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
        <img
          src={pictures[currentImageIndex]}
          alt={`Event image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=';
          }}
        />

        {pictures.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {pictures.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onSelectImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;