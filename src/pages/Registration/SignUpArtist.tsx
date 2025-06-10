import React, { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Genre, getGenreIcon, getContrastingTextColor } from './common/Types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle, Music, Users, Radio } from 'lucide-react';
import { cn } from '../../lib/utils';
import RestApiUtilsArtist from './common/RestApiUtilsArtist';
import defaultAvatar from './common/default-avatar-profile.png';
import ModalRegistration from './modalRegistration';

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

const SignUpArtist: React.FC = () => {
  const navigate = useNavigate();

  // Campi base per l'artista
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Generi musicali
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Social Networks
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [loadingSocialNetworks, setLoadingSocialNetworks] = useState(true);
  const [selectedSocialNetworkProfiles, setSelectedSocialNetworkProfiles] = useState<{ [key: string]: string }>({});

  // Streaming Platforms
  const [streamingPlatforms, setStreamingPlatforms] = useState<StreamingPlatform[]>([]);
  const [loadingStreamingPlatforms, setLoadingStreamingPlatforms] = useState(true);
  const [selectedStreamingPlatformProfiles, setSelectedStreamingPlatformProfiles] = useState<{ [key: string]: string }>({});

  // Controllo disponibilità username
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Errori e stato submit
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Immagine del profilo
  const [profileImage, setProfileImage] = useState<string>(defaultAvatar);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Modal di registrazione completata
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Fetch di tutti i dati al montaggio
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch generi musicali
        const genresData = await RestApiUtilsArtist.getGenres();
        setGenres(genresData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Errore nel caricamento dei generi');
      } finally {
        setLoadingGenres(false);
      }

      try {
        // Fetch social networks
        const socialData = await RestApiUtilsArtist.getSocialNetworks();
        setSocialNetworks(socialData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Errore nel caricamento dei social network');
      } finally {
        setLoadingSocialNetworks(false);
      }

      try {
        // Fetch streaming platforms
        const platformsData = await RestApiUtilsArtist.getStreamingPlatforms();
        setStreamingPlatforms(platformsData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Errore nel caricamento delle piattaforme di streaming');
      } finally {
        setLoadingStreamingPlatforms(false);
      }
    };

    fetchData();
  }, []);

  // Controllo disponibilità username
  const checkUsername = async () => {
    if (!username.trim()) return;

    setCheckingUsername(true);
    setError('');

    try {
      const isAvailable = await RestApiUtilsArtist.checkUsernameAvailability(username);
      setUsernameAvailable(isAvailable);

      if (!isAvailable) {
        setError('Username non disponibile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore nel controllo username');
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

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

  // Toggle selezione genere
  const toggleGenre = (g: string) => {
    setSelectedGenres(sel =>
      sel.includes(g) ? sel.filter(x => x !== g) : [...sel, g]
    );
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

  // Validazione dei campi
  const validateForm = (): boolean => {
    if (!username || !bio || !email || !phone || !password) {
      setError('Tutti i campi sono obbligatori');
      return false;
    }

    if (usernameAvailable === false) {
      setError('Username non disponibile');
      return false;
    }

    if (usernameAvailable === null && username.trim()) {
      setError('Controlla la disponibilità dell\'username prima di procedere');
      return false;
    }

    return true;
  };

  // Invio registrazione
  const handleSignUp = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const personalData = {
        username,
        bio,
        email,
        phone,
        password
      };

      await RestApiUtilsArtist.completeArtistRegistration(
        personalData,
        selectedGenres,
        selectedSocialNetworkProfiles,
        selectedStreamingPlatformProfiles,
        imageFile
      );

      // Mostra il modal solo se la registrazione è andata a buon fine
      setShowRegistrationModal(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Errore durante la registrazione');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Registrazione Artista
            </CardTitle>
            <CardDescription className="text-lg">
              Condividi la tua musica con il mondo
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
            </div>

            {/* Username con controllo */}
            <div className="space-y-2">
              <Label htmlFor="username">Nome artista/band</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    setUsernameAvailable(null);
                  }}
                  onBlur={checkUsername}
                  placeholder="Scegli un nome artistico unico"
                  className={cn(
                    usernameAvailable === true && "border-green-500",
                    usernameAvailable === false && "border-red-500"
                  )}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {usernameAvailable === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {usernameAvailable === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {usernameAvailable === true && (
                <p className="text-sm text-green-600">Nome disponibile</p>
              )}
            </div>

            {/* Bio */}
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

            {/* Email e Telefono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="la-tua-email@esempio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Crea una password sicura"
              />
            </div>

            {/* Generi musicali */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Generi Musicali</Label>
              {loadingGenres ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Caricamento generi...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {genres.map(g => {
                    const isSelected = selectedGenres.includes(g.name);
                    return (
                      <div
                        key={g.name}
                        className={cn(
                          "cursor-pointer p-3 rounded-lg text-center transition-all duration-200 border-2 hover:scale-105",
                          isSelected
                            ? "border-black shadow-lg font-bold"
                            : "border-transparent hover:shadow-md"
                        )}
                        style={{
                          backgroundColor: g.colorHex,
                          color: getContrastingTextColor(g.colorHex),
                        }}
                        onClick={() => toggleGenre(g.name)}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-lg">{getGenreIcon(g.iconName)}</span>
                          <span className="text-xs font-medium">{g.displayName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
            </div>

            {/* Pulsanti */}
            <div className="space-y-4 pt-4">
              <Button
                onClick={handleSignUp}
                disabled={submitting}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  'Registrati come Artista'
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Già registrato?</p>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Accedi qui
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal di registrazione completata */}
      <ModalRegistration
        showModal={showRegistrationModal}
        setShowModal={setShowRegistrationModal}
      />
    </>
  );
};

export default SignUpArtist;