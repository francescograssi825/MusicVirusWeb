import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Loader2, User, Mail, Phone, Globe, Music } from 'lucide-react';

// Types
interface SocialNetwork {
  network: string;
  profileUrl: string;
}

interface StreamingPlatform {
  platform: string;
  profileUrl: string;
  platformName: string;
}

interface Artist {
  username: string;
  id: string;
  socialNetworks: SocialNetwork[];
  streamingPlatforms: StreamingPlatform[];
  genres: string[];
  bio: string;
  email: string;
  phone: string;
  password: string | null;
  role: string;
  state: string;
  profileImageUrl: string;
}

interface ListArtistDto {
  artists: Artist[];
}

// Alert Modal Component
const AlertModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, title, message }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white opacity-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="bg-red-600 hover:bg-red-700">
            Chiudi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Artist Card Component
const ArtistCard: React.FC<{
  artist: Artist;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
}> = ({ artist, onApprove, onReject, isProcessing }) => {
  return (
    <Card className="w-full bg-white opacity-100 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-gray-50 opacity-100">
        <div className="flex items-center space-x-4">
          <img
            src={artist.profileImageUrl}
            alt={artist.username}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="flex-1">
            <CardTitle className="text-xl text-gray-900">{artist.username}</CardTitle>
            <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-300">
              {artist.state.replace('_', ' ').toLowerCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 bg-white opacity-100">
        <div className="space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{artist.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{artist.phone}</span>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Bio</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md opacity-100">
              {artist.bio}
            </p>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Generi</h4>
            <div className="flex flex-wrap gap-2">
              {artist.genres.map((genre, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  <Music className="h-3 w-3 mr-1" />
                  {genre.toLowerCase()}
                </Badge>
              ))}
            </div>
          </div>

          {/* Social Networks */}
          {artist.socialNetworks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Social Networks</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {artist.socialNetworks.map((social, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md opacity-100">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{social.network}</span>
                    <a 
                      href={social.profileUrl.startsWith('http') ? social.profileUrl : `https://${social.profileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 truncate"
                    >
                      {social.profileUrl}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Streaming Platforms */}
          {artist.streamingPlatforms.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Piattaforme Streaming</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {artist.streamingPlatforms.map((platform, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md opacity-100">
                    <Music className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{platform.platformName}</span>
                    <a 
                      href={platform.profileUrl.startsWith('http') ? platform.profileUrl : `https://${platform.profileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 truncate"
                    >
                      {platform.profileUrl}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              onClick={() => onApprove(artist.id)}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white opacity-100"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Elaborazione...
                </>
              ) : (
                'Approva'
              )}
            </Button>
            <Button
              onClick={() => onReject(artist.id)}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1 opacity-100"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Elaborazione...
                </>
              ) : (
                'Rifiuta'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
const ArtistManagement: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Fetch pending artists
  const fetchPendingArtists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || '';
      
      const response = await fetch('http://localhost:8082/api/admin/getPendingArtist', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ListArtistDto = await response.json();
      setArtists(data.artists);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il caricamento degli artisti';
      setError(errorMessage);
      setAlertModal({
        isOpen: true,
        title: 'Errore di Caricamento',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle approve artist
  const handleApprove = async (artistId: string) => {
    setProcessingIds(prev => new Set(prev).add(artistId));
    
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        // Remove artist from list on success
        setArtists(prev => prev.filter(artist => artist.id !== artistId));
      } else {
        throw new Error('Errore durante l\'approvazione dell\'artista');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setAlertModal({
        isOpen: true,
        title: 'Errore Approvazione',
        message: errorMessage
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(artistId);
        return newSet;
      });
    }
  };

  // Handle reject artist
  const handleReject = async (artistId: string) => {
    setProcessingIds(prev => new Set(prev).add(artistId));
    
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        // Remove artist from list on success
        setArtists(prev => prev.filter(artist => artist.id !== artistId));
      } else {
        throw new Error('Errore durante il rifiuto dell\'artista');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setAlertModal({
        isOpen: true,
        title: 'Errore Rifiuto',
        message: errorMessage
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(artistId);
        return newSet;
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPendingArtists();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 opacity-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md opacity-100">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Caricamento artisti in attesa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 opacity-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione Artisti</h1>
          <p className="text-gray-600">Approva o rifiuta gli artisti in attesa di approvazione</p>
        </div>

        {error && !alertModal.isOpen && (
          <Alert className="mb-6 bg-red-50 border-red-200 opacity-100">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {artists.length === 0 ? (
          <Card className="text-center py-12 bg-white opacity-100">
            <CardContent>
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun artista in attesa
              </h3>
              <p className="text-gray-500">
                Non ci sono artisti in attesa di approvazione al momento.
              </p>
              <Button 
                onClick={fetchPendingArtists}
                className="mt-4 bg-blue-600 hover:bg-blue-700 opacity-100"
              >
                Ricarica
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {artists.length} artisti in attesa di approvazione
              </p>
              <Button 
                onClick={fetchPendingArtists}
                variant="outline"
                className="bg-white opacity-100"
              >
                Ricarica Lista
              </Button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {artists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={processingIds.has(artist.id)}
                />
              ))}
            </div>
          </div>
        )}

        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
          title={alertModal.title}
          message={alertModal.message}
        />
      </div>
    </div>
  );
};

export default ArtistManagement;