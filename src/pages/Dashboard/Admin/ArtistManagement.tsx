import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Loader2, User, Mail, Phone, Globe, Music, Filter, ChevronDown, X, Shield } from 'lucide-react';

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

// State enum mapping
const STATE_LABELS = {
  'ACTIVE': 'Attivo',
  'PENDING_APPROVAL': 'In Attesa',
  'REJECTED': 'Rifiutato',
  'BLOCKED': 'Bloccato',
  'DELETED': 'Eliminato'
};

const STATE_COLORS = {
  'ACTIVE': 'bg-green-100 text-green-800 border-green-300',
  'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'REJECTED': 'bg-red-100 text-red-800 border-red-300',
  'BLOCKED': 'bg-orange-100 text-orange-800 border-orange-300',
  'DELETED': 'bg-gray-100 text-gray-800 border-gray-300'
};

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

// Filter Dropdown Component
const StateFilter: React.FC<{
  selectedStates: string[];
  onStateChange: (states: string[]) => void;
}> = ({ selectedStates, onStateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const allStates = Object.keys(STATE_LABELS);

  const toggleState = (state: string) => {
    if (selectedStates.includes(state)) {
      onStateChange(selectedStates.filter(s => s !== state));
    } else {
      onStateChange([...selectedStates, state]);
    }
  };

  const clearAll = () => {
    onStateChange([]);
  };

  const selectAll = () => {
    onStateChange(allStates);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white opacity-100 min-w-48 justify-between"
      >
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          {selectedStates.length === 0 
            ? 'Tutti gli stati'
            : selectedStates.length === 1
            ? STATE_LABELS[selectedStates[0] as keyof typeof STATE_LABELS]
            : `${selectedStates.length} stati selezionati`
          }
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 opacity-100">
          <div className="p-2 border-b border-gray-100">
            <div className="flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-xs"
              >
                Seleziona tutto
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs"
              >
                Deseleziona tutto
              </Button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {allStates.map(state => (
              <div
                key={state}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleState(state)}
              >
                <input
                  type="checkbox"
                  checked={selectedStates.includes(state)}
                  onChange={() => toggleState(state)}
                  className="mr-3"
                />
                <Badge 
                  variant="outline" 
                  className={`${STATE_COLORS[state as keyof typeof STATE_COLORS]} text-xs`}
                >
                  {STATE_LABELS[state as keyof typeof STATE_LABELS]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Artist Card Component
const ArtistCard: React.FC<{
  artist: Artist;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBlock: (id: string) => void;
  isProcessing: boolean;
}> = ({ artist, onApprove, onReject, onBlock, isProcessing }) => {
  const renderActionButtons = () => {
    const baseButtonClass = "flex-1 opacity-100";
    const processingElement = (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Elaborazione...
      </>
    );

    switch (artist.state) {
      case 'PENDING_APPROVAL':
        return (
          <>
            <Button
              onClick={() => onApprove(artist.id)}
              disabled={isProcessing}
              className={`${baseButtonClass} bg-green-600 hover:bg-green-700 text-white`}
            >
              {isProcessing ? processingElement : 'Approva'}
            </Button>
            <Button
              onClick={() => onReject(artist.id)}
              disabled={isProcessing}
              variant="destructive"
              className={`${baseButtonClass} bg-red-600 hover:bg-red-700 text-white`}
            >
              {isProcessing ? processingElement : 'Rifiuta'}
            </Button>
          </>
        );
      
      case 'ACTIVE':
        return (
          <Button
            onClick={() => onBlock(artist.id)}
            disabled={isProcessing}
            className={`${baseButtonClass} bg-orange-600 hover:bg-orange-700 text-white`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Blocca
              </>
            )}
          </Button>
        );
      
      case 'BLOCKED':
        return (
          <Button
            onClick={() => onApprove(artist.id)}
            disabled={isProcessing}
            className={`${baseButtonClass} bg-green-600 hover:bg-green-700 text-white`}
          >
            {isProcessing ? processingElement : 'Sblocca'}
          </Button>
        );
      
      case 'REJECTED':
        return (
          <Button
            onClick={() => onApprove(artist.id)}
            disabled={isProcessing}
            className={`${baseButtonClass} bg-green-600 hover:bg-green-700 text-white`}
          >
            {isProcessing ? processingElement : 'Riabilita'}
          </Button>
        );
      
      default:
        return (
          <div className="text-center text-gray-500 py-2">
            Nessuna azione disponibile
          </div>
        );
    }
  };

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
            <Badge 
              variant="outline" 
              className={`mt-1 ${STATE_COLORS[artist.state as keyof typeof STATE_COLORS]}`}
            >
              {STATE_LABELS[artist.state as keyof typeof STATE_LABELS] || artist.state}
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
            {renderActionButtons()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
const ArtistManagement: React.FC = () => {
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
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

  // Apply filters
  useEffect(() => {
    if (selectedStates.length === 0) {
      setFilteredArtists(allArtists);
    } else {
      setFilteredArtists(allArtists.filter(artist => selectedStates.includes(artist.state)));
    }
  }, [allArtists, selectedStates]);

  // Fetch all artists
  const fetchArtists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || '';
      
      const response = await fetch('http://localhost:8082/api/admin/getArtists', {
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
      setAllArtists(data.artists);
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

  // Handle approve/unblock/reactivate artist
  const handleApprove = async (artistId: string) => {
    setProcessingIds(prev => new Set(prev).add(artistId));
    
    try {
      const token = localStorage.getItem('authToken') || '';
      const artist = allArtists.find(a => a.id === artistId);
      
      if (!artist) {
        throw new Error('Artista non trovato');
      }

      const response = await fetch('http://localhost:8082/api/admin/acceptArtist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artistUsername: artist.username,
          artistId: artistId,
          state: "ACTIVE"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Update artist state in the list
      setAllArtists(prev => prev.map(a => 
        a.id === artistId ? { ...a, state: 'ACTIVE' } : a
      ));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setAlertModal({
        isOpen: true,
        title: 'Errore Operazione',
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
      const token = localStorage.getItem('authToken') || '';
      const artist = allArtists.find(a => a.id === artistId);
      
      if (!artist) {
        throw new Error('Artista non trovato');
      }

      const response = await fetch('http://localhost:8082/api/admin/acceptArtist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artistUsername: artist.username,
          artistId: artistId,
          state: "REJECTED"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Update artist state in the list
      setAllArtists(prev => prev.map(a => 
        a.id === artistId ? { ...a, state: 'REJECTED' } : a
      ));

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

  // Handle block artist
  const handleBlock = async (artistId: string) => {
    setProcessingIds(prev => new Set(prev).add(artistId));
    
    try {
      const token = localStorage.getItem('authToken') || '';
      const artist = allArtists.find(a => a.id === artistId);
      
      if (!artist) {
        throw new Error('Artista non trovato');
      }

      const response = await fetch('http://localhost:8082/api/admin/acceptArtist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artistUsername: artist.username,
          artistId: artistId,
          state: "BLOCKED"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Update artist state in the list
      setAllArtists(prev => prev.map(a => 
        a.id === artistId ? { ...a, state: 'BLOCKED' } : a
      ));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setAlertModal({
        isOpen: true,
        title: 'Errore Blocco',
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
    fetchArtists();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 opacity-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md opacity-100">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Caricamento artisti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 opacity-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione Artisti</h1>
          <p className="text-gray-600">Gestisci tutti gli artisti del sistema</p>
        </div>

        {error && !alertModal.isOpen && (
          <Alert className="mb-6 bg-red-50 border-red-200 opacity-100">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <StateFilter
            selectedStates={selectedStates}
            onStateChange={setSelectedStates}
          />
          
          <div className="flex items-center gap-4">
            {selectedStates.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStates([])}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Rimuovi filtri
              </Button>
            )}
            <Button 
              onClick={fetchArtists}
              variant="outline"
              className="bg-white opacity-100"
            >
              Ricarica Lista
            </Button>
          </div>
        </div>

        {filteredArtists.length === 0 ? (
          <Card className="text-center py-12 bg-white opacity-100">
            <CardContent>
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedStates.length > 0 ? 'Nessun artista trovato' : 'Nessun artista presente'}
              </h3>
              <p className="text-gray-500">
                {selectedStates.length > 0 
                  ? 'Non ci sono artisti che corrispondono ai filtri selezionati.'
                  : 'Non ci sono artisti registrati nel sistema al momento.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {filteredArtists.length} {filteredArtists.length === 1 ? 'artista' : 'artisti'}
                {selectedStates.length > 0 && ` (filtrati da ${allArtists.length} totali)`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onBlock={handleBlock}
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