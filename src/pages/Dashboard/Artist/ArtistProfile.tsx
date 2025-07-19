import React, { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle, Music, Users, Radio } from 'lucide-react';
import { cn } from '../../../lib/utils';
import defaultAvatar from '../../Registration/common/default-avatar-profile.png';
import { getContrastingTextColor } from '../../Registration/common/Types';
import { platform } from 'os';

interface SocialNetwork {
  platformName: string;
  colorHex: string;
  iconName: string;
  profileUrl: string | null;
  name: string | null;
}

interface StreamingPlatform {
  platform: string;
  profileUrl: string | null;
  name: string;
  iconName: string;
  colorHex: string;
}

const getIcon = (iconName: string): JSX.Element => {
  const iconMap: { [key: string]: JSX.Element } = {
    FaMusic: <Music className="w-4 h-4" />,
    FaUsers: <Users className="w-4 h-4" />,
    FaRadio: <Radio className="w-4 h-4" />,
  };
  return iconMap[iconName] || <Music className="w-4 h-4" />;
};

const UpdateArtist: React.FC = () => {
  const navigate = useNavigate();

  // Campi per l'artista
  const [bio, setBio] = useState('');

  // Social Networks
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [loadingSocialNetworks, setLoadingSocialNetworks] = useState(true);
  const [selectedSocialNetworkProfiles, setSelectedSocialNetworkProfiles] = useState<{ [key: string]: string }>({});

  // Streaming Platforms
  const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([]);
  const [loadingStreamingPlatforms, setLoadingStreamingPlatforms] = useState(true);
  const [selectedStreamingPlatformProfiles, setSelectedStreamingPlatformProfiles] = useState<{ [key: string]: string }>({});

  // Errori e stato submit
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingSection, setUpdatingSection] = useState('');

  // Immagine del profilo
  const [profileImage, setProfileImage] = useState<string>(defaultAvatar);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loadingArtistData, setLoadingArtistData] = useState(true);
  const [token, setToken] = useState<string>('');

  // Fetch dati iniziali
  useEffect(() => {
    const fetchData = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        setError('Token non trovato, effettua il login');
        setLoadingArtistData(false);
        return;
      }
      
      setToken(storedToken);
      
      try {
        // Fetch bio
        const bioResponse = await RestApiUtilsArtist.getBio(storedToken);
        setBio(bioResponse.bio || '');
        
        // Fetch immagine
        const imageResponse = await RestApiUtilsArtist.getImage(storedToken);
        setProfileImage(imageResponse.url || defaultAvatar);
        
        // Fetch social networks
        const socialResponse = await RestApiUtilsArtist.getSocial(storedToken);
        const socialProfiles: { [key: string]: string } = {};
        socialResponse.socialNetworks.forEach((sn: any) => {
          socialProfiles[sn.network] = sn.profileUrl || '';
        });
        setSelectedSocialNetworkProfiles(socialProfiles);
        
        // Fetch streaming platforms
        const platformResponse = await RestApiUtilsArtist.getPlatform(storedToken);
        const platformProfiles: { [key: string]: string } = {};
        platformResponse.streamingPlatforms.forEach((sp: any) => {
          platformProfiles[sp.platform] = sp.profileUrl || '';
        });
        setSelectedStreamingPlatformProfiles(platformProfiles);
        
        // Fetch social networks list
        const socials = await RestApiUtilsArtist.getSocialNetworks();
        setSocialNetworks(socials);
        setLoadingSocialNetworks(false);
        
        // Fetch streaming platforms list
        const platforms = await RestApiUtilsArtist.getStreamingPlatforms();
        setStreamingPlatforms(platforms);
        setLoadingStreamingPlatforms(false);
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Errore nel caricamento dei dati');
      } finally {
        setLoadingArtistData(false);
      }
    };

    fetchData();
  }, []);

  // Selezione dell'immagine
  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Toggle per i social network
  const toggleSocialNetwork = (sn: string) => {
    setSelectedSocialNetworkProfiles(prev => {
      const newState = { ...prev };
      if (newState[sn] !== undefined) {
        delete newState[sn];
      } else {
        newState[sn] = "";
      }
      return newState;
    });
  };

  // Toggle per le piattaforme di streaming
  const toggleStreamingPlatform = (sp: string) => {
    setSelectedStreamingPlatformProfiles(prev => {
      const newState = { ...prev };
      if (newState[sp] !== undefined) {
        delete newState[sp];
      } else {
        newState[sp] = "";
      }
      return newState;
    });
  };

  // Aggiorna bio
  const updateBio = async () => {
    if (!token) return;
    
    setUpdatingSection('bio');
    setError('');
    setSuccess('');
    
    try {
      await RestApiUtilsArtist.updateBio(token, bio);
      setSuccess('Biografia aggiornata con successo!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante l\'aggiornamento della bio');
    } finally {
      setUpdatingSection('');
    }
  };

  // Aggiorna immagine
  const updateImage = async () => {
    if (!token || !imageFile) return;
    
    setUpdatingSection('image');
    setError('');
    setSuccess('');
    
    try {
      // Prima carica l'immagine
      const imageUrl = await RestApiUtilsArtist.uploadProfileImage(imageFile, 'current');
      // Poi aggiorna l'URL nel profilo
      await RestApiUtilsArtist.updatePicture(token, imageUrl);
      setProfileImage(imageUrl);
      setSuccess('Immagine profilo aggiornata con successo!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante l\'aggiornamento dell\'immagine');
    } finally {
      setUpdatingSection('');
    }
  };

  // Aggiorna social networks
  const updateSocialNetworks = async () => {
    if (!token) return;
    
    setUpdatingSection('social');
    setError('');
    setSuccess('');
    
    try {
      const socialNetworksToUpdate = Object.entries(selectedSocialNetworkProfiles)
        .map(([network, profileUrl]) => ({ network, profileUrl }));
      
      await RestApiUtilsArtist.updateSocialNetworks(token, socialNetworksToUpdate);
      setSuccess('Social networks aggiornati con successo!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante l\'aggiornamento dei social networks');
    } finally {
      setUpdatingSection('');
    }
  };

  // Aggiorna streaming platforms
  const updateStreamingPlatforms = async () => {
    if (!token) return;
    
    setUpdatingSection('platforms');
    setError('');
    setSuccess('');
    
    try {
      const platformsToUpdate = Object.entries(selectedStreamingPlatformProfiles)
        .map(([platform, profileUrl]) => ({ platform, profileUrl }));
      
      await RestApiUtilsArtist.updateStreamingPlatforms(token, platformsToUpdate);
      setSuccess('Piattaforme streaming aggiornate con successo!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante l\'aggiornamento delle piattaforme streaming');
    } finally {
      setUpdatingSection('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Aggiorna Profilo Artista
          </CardTitle>
          <CardDescription className="text-lg">
            Modifica le tue informazioni
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Immagine del profilo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <img
                src={profileImage}
                alt="Profilo"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => document.getElementById('profileImageInput')?.click()}
              />
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => document.getElementById('profileImageInput')?.click()}>
                <Upload className="text-white w-6 h-6" />
              </div>
            </div>
            <input
              type="file"
              id="profileImageInput"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelection}
            />
            <p className="text-sm text-muted-foreground">Clicca per cambiare foto</p>
            
            <Button 
              onClick={updateImage}
              disabled={!imageFile || updatingSection === 'image'}
              className="mt-2"
            >
              {updatingSection === 'image' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aggiornamento in corso...
                </>
              ) : 'Salva Immagine'}
            </Button>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Racconta la tua storia musicale..."
              />
            </div>
            
            <Button 
              onClick={updateBio}
              disabled={updatingSection === 'bio'}
            >
              {updatingSection === 'bio' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aggiornamento in corso...
                </>
              ) : 'Salva Biografia'}
            </Button>
          </div>

          {/* Social Networks */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Social Networks</Label>
            {loadingSocialNetworks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Caricamento social network...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialNetworks.map(sn => (
                  <div key={sn.platformName} className="space-y-2">
                    <div
                      className={cn(
                        "cursor-pointer p-3 rounded-lg text-center transition-all duration-200 border-2 hover:scale-105",
                        selectedSocialNetworkProfiles[sn.platformName] !== undefined
                          ? "border-black shadow-lg font-bold"
                          : "border-transparent hover:shadow-md"
                      )}
                      style={{
                        backgroundColor: sn.colorHex,
                        color: getContrastingTextColor(sn.colorHex),
                      }}
                      onClick={() => toggleSocialNetwork(sn.platformName)}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {getIcon(sn.iconName)}
                        <span className="text-sm font-medium">{sn.platformName}</span>
                      </div>
                    </div>
                    {selectedSocialNetworkProfiles[sn.platformName] !== undefined && (
                      <Input
                        placeholder={`URL di ${sn.platformName}`}
                        value={selectedSocialNetworkProfiles[sn.platformName]}
                        onChange={e =>
                          setSelectedSocialNetworkProfiles(prev => ({
                            ...prev,
                            [sn.platformName]: e.target.value
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              onClick={updateSocialNetworks}
              disabled={updatingSection === 'social'}
            >
              {updatingSection === 'social' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aggiornamento in corso...
                </>
              ) : 'Salva Social Networks'}
            </Button>
          </div>

          {/* Streaming Platforms */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Piattaforme di Streaming</Label>
            {loadingStreamingPlatforms ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Caricamento piattaforme...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {streamingPlatforms.map(sp => (
                  <div key={sp.platform} className="space-y-2">
                    <div
                      className={cn(
                        "cursor-pointer p-3 rounded-lg text-center transition-all duration-200 border-2 hover:scale-105",
                        selectedStreamingPlatformProfiles[sp.platform] !== undefined
                          ? "border-black shadow-lg font-bold"
                          : "border-transparent hover:shadow-md"
                      )}
                      style={{
                        backgroundColor: sp.colorHex,
                        color: getContrastingTextColor(sp.colorHex),
                      }}
                      onClick={() => toggleStreamingPlatform(sp.platform)}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {getIcon(sp.iconName)}
                        <span className="text-sm font-medium">{sp.name}</span>
                      </div>
                    </div>
                    {selectedStreamingPlatformProfiles[sp.platform] !== undefined && (
                      <Input
                        placeholder={`URL di ${sp.name}`}
                        value={selectedStreamingPlatformProfiles[sp.platform]}
                        onChange={e =>
                          setSelectedStreamingPlatformProfiles(prev => ({
                            ...prev,
                            [sp.platform]: e.target.value
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              onClick={updateStreamingPlatforms}
              disabled={updatingSection === 'platforms'}
            >
              {updatingSection === 'platforms' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aggiornamento in corso...
                </>
              ) : 'Salva Piattaforme Streaming'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const invokeUrl = 'http://localhost:808';

interface SocialNetwork {
  platformName: string;
  colorHex: string;
  iconName: string;
  profileUrl: string | null;
  name: string | null;
}

interface StreamingPlatform {
  platform: string;
  profileUrl: string | null;
  name: string;
  iconName: string;
  colorHex: string;
}

interface BioResponse {
  bio: string;
}

interface ImageResponse {
  url: string;
}

interface SocialResponse {
  socialNetworks: { network: string; profileUrl: string }[];
}

interface PlatformResponse {
  streamingPlatforms: { platform: string; profileUrl: string }[];
}

class RestApiUtilsArtist {
  // Ottieni bio
  static async getBio(token: string): Promise<BioResponse> {
    const response = await fetch(`${invokeUrl}2/api/artist/get-bio`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Errore nel caricamento della bio');
    }

    return response.json();
  }

  // Ottieni immagine
  static async getImage(token: string): Promise<ImageResponse> {
    const response = await fetch(`${invokeUrl}2/api/artist/get-image`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Errore nel caricamento dell\'immagine');
    }

    return response.json();
  }

  // Ottieni social networks
  static async getSocial(token: string): Promise<SocialResponse> {
    const response = await fetch(`${invokeUrl}2/api/artist/get-social`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Errore nel caricamento dei social networks');
    }

    return response.json();
  }

  // Ottieni streaming platforms
  static async getPlatform(token: string): Promise<PlatformResponse> {
    const response = await fetch(`${invokeUrl}2/api/artist/get-platform`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Errore nel caricamento delle piattaforme streaming');
    }

    return response.json();
  }

  // Fetch social networks list
  static async getSocialNetworks(): Promise<SocialNetwork[]> {
    try {
      const response = await fetch(`${invokeUrl}0/api/registration/social`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data?.socials || [];
    } catch (error) {
      throw new Error('Errore nel caricamento dei social network');
    }
  }

  // Fetch streaming platforms list
  static async getStreamingPlatforms(): Promise<StreamingPlatform[]> {
    try {
      const response = await fetch(`${invokeUrl}0/api/registration/platforms`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data?.platform || [];
    } catch (error) {
      throw new Error('Errore nel caricamento delle piattaforme di streaming');
    }
  }

  // Upload immagine profilo
  static async uploadProfileImage(imageFile: File, username: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('username', username.trim());
      
      const response = await fetch(`${invokeUrl}0/api/registration/api/upload`, { 
        method: 'POST', 
        body: formData 
      });
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text.trim()) {
        throw new Error('Risposta vuota dal server');
      }
      
      const data = JSON.parse(text);
      return data.imageUrl;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Errore durante l\'upload dell\'immagine');
    }
  }

  // Aggiorna bio
  static async updateBio(token: string, bio: string): Promise<void> {
    const response = await fetch(`${invokeUrl}2/api/artist/put-bio`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bio })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Errore durante l\'aggiornamento della bio');
    }
  }

  // Aggiorna immagine
  static async updatePicture(token: string, url: string): Promise<void> {
    const response = await fetch(`${invokeUrl}2/api/artist/put-picture`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Errore durante l\'aggiornamento dell\'immagine');
    }
  }

  // Aggiorna social networks
  static async updateSocialNetworks(token: string, socialNetworks: { network: string; profileUrl: string }[]): Promise<void> {
    const response = await fetch(`${invokeUrl}2/api/artist/put-social`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ socialNetworks })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Errore durante l\'aggiornamento dei social networks');
    }
  }

  // Aggiorna streaming platforms
  static async updateStreamingPlatforms(token: string, streamingPlatforms: { platform: string; profileUrl: string }[]): Promise<void> {
  
    const response = await fetch(`${invokeUrl}2/api/artist/put-platform`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ streamingPlatforms })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Errore durante l\'aggiornamento delle piattaforme streaming');
    }
  }
}

export default UpdateArtist;