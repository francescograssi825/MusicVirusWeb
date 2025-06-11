import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Genre, getGenreIcon, getContrastingTextColor } from './common/Types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import defaultAvatar from './common/default-avatar-profile.png';
import ModalRegistration from './modalRegistration';

const invokeUrl = 'http://localhost:8080';

const SignUpFan: React.FC = () => {
  const navigate = useNavigate();

  // campi base
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  // generi
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // controllo username
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // errori / loading submit
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Immagine del profilo
  const [profileImage, setProfileImage] = useState<string>(defaultAvatar);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Modal di registrazione completata
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // fetch generi al montaggio
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`${invokeUrl}/api/registration/genres`);
        const data = await res.json();
        if (data?.genres) {
          setGenres(data.genres);
        }
      } catch (error) {
        setError('Errore nel caricamento dei generi');
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Controllo disponibilità username
  const checkUsername = async () => {
    if (!username.trim()) return;

    setCheckingUsername(true);
    setError('');

    try {
      const res = await fetch(`${invokeUrl}/api/registration/usernameControl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const avail = await res.json();
      setUsernameAvailable(avail === true);

      if (!avail) {
        setError('Username non disponibile');
      }
    } catch (error) {
      setError('Errore nel controllo username');
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

  // Validazione dei campi
  const validateForm = (): boolean => {
    if (!name || !surname || !email || !phone || !username || !password || !address) {
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

    let imageUrl = 'src/assets/registraz/default-avatar-profile.png'; // URL di default

    try {
      // Se l'utente ha selezionato un'immagine, caricala al backend
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('username', username.trim());

        try {
          const uploadRes = await fetch(`${invokeUrl}/api/registration/api/upload`, {
            method: 'POST',
            body: formData
          });

          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            throw new Error(`Errore HTTP ${uploadRes.status}: ${errorText}`);
          }

          const uploadData = await uploadRes.json();
          
          if (uploadData.imageUrl) {
            imageUrl = uploadData.imageUrl;
            console.log('Upload completato. URL immagine:', imageUrl);
          } else {
            throw new Error('URL immagine non ricevuto dal server');
          }
        } catch (uploadError: any) {
          console.error('Errore durante upload:', uploadError);
          setError(`Errore upload immagine: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }
      }

      // Preparazione dati per la registrazione
      const fanDto = {
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        username: username.trim(),
        password,
        address: address.trim(),
        favouriteGenres: selectedGenres,
        profileImageUrl: imageUrl, 
      };

      console.log('Dati da inviare:', fanDto);
      console.log('URL immagine finale:', fanDto.profileImageUrl);

      // Invio registrazione
      const registrationRes = await fetch(`${invokeUrl}/api/registration/fan/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fanDto),
      });

      const registrationData = await registrationRes.json();

      if (!registrationRes.ok) {
        throw new Error(registrationData.message || 'Errore sconosciuto');
      }

      // Mostra il modal solo se la registrazione è andata a buon fine
      setShowRegistrationModal(true);

    } catch (error: any) {
      console.error('Errore durante registrazione:', error);
      setError(`Registrazione fallita: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Registrazione Fan
            </CardTitle>
            <CardDescription className="text-lg">
              Unisciti alla nostra community musicale
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

            {/* Nome e Cognome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Il tuo nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Cognome</Label>
                <Input
                  id="surname"
                  value={surname}
                  onChange={e => setSurname(e.target.value)}
                  placeholder="Il tuo cognome"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Telefono */}
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

            {/* Username con controllo */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    setUsernameAvailable(null);
                  }}
                  onBlur={checkUsername}
                  placeholder="Scegli un username unico"
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
                <p className="text-sm text-green-600">Username disponibile</p>
              )}
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

            {/* Indirizzo */}
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Via, città, CAP"
              />
            </div>

            {/* Generi preferiti */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Generi Musicali Preferiti</Label>
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

            {/* Pulsanti */}
            <div className="space-y-4 pt-4">
              <Button
                onClick={handleSignUp}
                disabled={submitting}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  'Registrati'
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Già registrato?</p>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
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

export default SignUpFan;