import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { type Genre, getGenreIcon, getContrastingTextColor } from '../../Registration/common/Types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Loader2, Upload, X, Music, MapPin, Image, Mic, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

const invokeUrl = 'http://localhost:808';

interface ArtistData {
  username: string;
  id: string;
  email: string;
}

interface ArtistDto {
  id: string;
  artistName: string;
  email: string;
}

interface MerchantDto {
  id: string;
  merchantName: string;
  merchantAddress: string;
  merchantDescription: string;
  merchantOffers: string;
  email: string;
}

interface ListMerchantInfoDto {
  merchantInfoDto: MerchantDto[];
}

interface EventDto {
  name: string;
  description: string;
  artist: ArtistDto;
  genres: string[];
  merchant: MerchantDto;
  amount: string;
  eventDate: string;
  endFundraisingDate: string;
  pictures: string[];
  sample: string[];
  creator: string;
}

// Funzione per formattare le date nel formato YYYY-MM-DDTHH:mm
const formatLocalDateTime = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Calcola la data minima per l'evento (2 settimane da oggi)
const calculateMinEventDate = (): string => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 14);
  return formatLocalDateTime(minDate);
};

// Calcola la data di fine raccolta fondi (1 settimana prima dell'evento)
const calculateEndFundraisingDate = (eventDate: string): string => {
  if (!eventDate) return '';

  const date = new Date(eventDate);
  date.setDate(date.getDate() - 7);
  return formatLocalDateTime(date);
};

const NewEvent: React.FC = () => {
  const navigate = useNavigate();

  // Campi evento
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [eventDate, setEventDate] = useState('');
  const [minEventDate] = useState(calculateMinEventDate());

  // Dati artista
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [loadingArtist, setLoadingArtist] = useState(true);
  const [artistError, setArtistError] = useState('');

  // Merchant
  const [merchants, setMerchants] = useState<MerchantDto[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);

  // Generi
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Immagini e sample
  const [pictures, setPictures] = useState<File[]>([]);
  const [samples, setSamples] = useState<File[]>([]);
  const [pictureUrls, setPictureUrls] = useState<string[]>([]);
  const [sampleUrls, setSampleUrls] = useState<string[]>([]);

  // Errori e loading
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Stati collassabili
  const [isLocalOpen, setIsLocalOpen] = useState(false);
  const [isGenresOpen, setIsGenresOpen] = useState(false);

  // Calcola la data di fine raccolta fondi
  const endFundraisingDate = calculateEndFundraisingDate(eventDate);
  //modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Fetch generi al montaggio
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`${invokeUrl}0/api/registration/genres`);
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

  // Fetch merchant al montaggio
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await fetch(`${invokeUrl}4/merchantApi/getInfo`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch merchants');
        }

        const data: ListMerchantInfoDto = await response.json();
        setMerchants(data.merchantInfoDto);
      } catch (error) {
        setError('Errore nel caricamento dei locali');
      } finally {
        setLoadingMerchants(false);
      }
    };

    fetchMerchants();
  }, []);

  // Fetch dati artista al montaggio
  const fetchArtistData = async () => {
    setLoadingArtist(true);
    setArtistError('');

    try {
      const response = await fetch(`${invokeUrl}2/api/artist/getData`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Errore nel caricamento dei dati artista');
      }

      const data = await response.json();

      // Estrai solo i campi necessari
      const artistInfo: ArtistData = {
        username: data.username,
        id: data.id,
        email: data.email
      };

      setArtistData(artistInfo);
    } catch (error: any) {
      console.error('Errore nel caricamento artista:', error);
      setArtistError(`Errore nel caricamento dei dati artista: ${error.message || 'Riprova più tardi'}`);
    } finally {
      setLoadingArtist(false);
    }
  };

  useEffect(() => {
    fetchArtistData();
  }, []);

  // Gestione selezione immagini
  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setPictures(prev => [...prev, ...files]);

      // Genera URL di preview
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setPictureUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Gestione selezione sample audio
  const handleSampleSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSamples(prev => [...prev, ...files]);

      // Genera URL per i sample
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        setSampleUrls(prev => [...prev, url]);
      });
    }
  };

  // Rimuovi immagine
  const removePicture = (index: number) => {
    setPictures(prev => prev.filter((_, i) => i !== index));
    setPictureUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Rimuovi sample
  const removeSample = (index: number) => {
    setSamples(prev => prev.filter((_, i) => i !== index));
    setSampleUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle selezione genere
  const toggleGenre = (genreName: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreName)
        ? prev.filter(g => g !== genreName)
        : [...prev, genreName]
    );
  };

  // Validazione form
  const validateForm = (): boolean => {
    const requiredFields = [
      eventName, description, eventDate
    ];

    // Verifica che i dati dell'artista siano presenti
    if (!artistData) {
      setError('Dati artista non disponibili');
      return false;
    }

    if (requiredFields.some(field => !field.trim())) {
      setError('Tutti i campi obbligatori devono essere compilati');
      return false;
    }

    if (amount <= 0) {
      setError('L\'importo deve essere maggiore di zero');
      return false;
    }

    if (selectedGenres.length === 0) {
      setError('Seleziona almeno un genere musicale');
      return false;
    }

    if (!selectedMerchantId) {
      setError('Seleziona un locale per l\'evento');
      return false;
    }

    const eventDateObj = new Date(eventDate);
    const today = new Date();

    if (eventDateObj <= today) {
      setError('La data dell\'evento deve essere futura');
      return false;
    }

    // Verifica che la data sia almeno 2 settimane nel futuro
    const minDate = new Date(minEventDate);
    if (eventDateObj < minDate) {
      setError('La data dell\'evento deve essere almeno 2 settimane da oggi');
      return false;
    }

    return true;
  };

  // Upload files
  const uploadFiles = async (files: File[], type: 'images' | 'audio', eventName: string): Promise<string[]> => {
    if (files.length === 0) {
      return [];
    }

    try {
      const formData = new FormData();

      // Aggiungi tutti i file al FormData
      files.forEach(file => {
        formData.append('files', file);
      });

      // Aggiungi il nome dell'evento
      formData.append('eventName', eventName);

      // Determina l'endpoint corretto
      const endpoint = type === 'images' ? '/api/upload/images' : '/api/upload/audio';

      console.log(`Caricamento ${files.length} file di tipo ${type} per l'evento: ${eventName}`);

      const response = await fetch(`${invokeUrl}5/event/files${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Errore HTTP ${response.status} durante l'upload di ${type}`);
      }

      const data = await response.json();

      // Estrai gli URL dalla risposta
      const urls = type === 'images' ? data.imageUrls : data.audioUrls;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw new Error(`Nessun URL ricevuto per ${type}`);
      }

      console.log(`Upload ${type} completato con successo:`, urls);
      return urls;

    } catch (error: any) {
      console.error(`Errore upload ${type}:`, error);
      throw new Error(`Errore durante l'upload di ${type}: ${error.message}`);
    }
  };

  // Creazione evento
  const handleCreateEvent = async () => {
    setError('');

    if (!validateForm() || !artistData) {
      return;
    }

    // Verifica che ci sia almeno un nome per l'evento per l'upload
    if (!eventName.trim()) {
      setError('Il nome dell\'evento è obbligatorio per l\'upload dei file');
      return;
    }

    setSubmitting(true);

    try {
      // FASE 1: Upload dei file
      console.log('Upload dei file...');

      let uploadedPictures: string[] = [];
      let uploadedSamples: string[] = [];

      // Upload immagini se presenti
      if (pictures.length > 0) {
        try {
          console.log(`Caricamento ${pictures.length} immagini...`);
          uploadedPictures = await uploadFiles(pictures, 'images', eventName.trim());
          console.log(`Immagini caricate con successo: ${uploadedPictures.length}`);
        } catch (error: any) {
          throw new Error(`Errore upload immagini: ${error.message}`);
        }
      }

      // Upload sample audio se presenti
      if (samples.length > 0) {
        try {
          console.log(`Caricamento ${samples.length} sample audio...`);
          uploadedSamples = await uploadFiles(samples, 'audio', eventName.trim());
          console.log(`Sample audio caricati con successo: ${uploadedSamples.length}`);
        } catch (error: any) {
          throw new Error(`Errore upload sample: ${error.message}`);
        }
      }

      console.log('Tutti i file caricati con successo!');

      // FASE 2: Creazione evento con gli URL dei file caricati
      console.log('Creazione evento...');

      const selectedMerchant = merchants.find(m => m.id === selectedMerchantId);

      if (!selectedMerchant) {
        throw new Error('Locale selezionato non valido');
      }

      const eventDto: EventDto = {
        name: eventName.trim(),
        description: description.trim(),
        artist: {
          id: artistData.id,
          artistName: artistData.username,
          email: artistData.email
        },
        genres: selectedGenres,
        merchant: {
          id: selectedMerchant.id,
          merchantName: selectedMerchant.merchantName,
          merchantAddress: selectedMerchant.merchantAddress,
          merchantDescription: selectedMerchant.merchantDescription,
          merchantOffers: selectedMerchant.merchantOffers,
          email: selectedMerchant.email
        },
        amount: amount.toString(),
        eventDate: eventDate,
        endFundraisingDate: endFundraisingDate,
        pictures: uploadedPictures,
        sample: uploadedSamples,
        creator: localStorage.getItem('authToken') || ''
      };

      // Invio al backend
      const response = await fetch(`${invokeUrl}5/api/event/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(eventDto)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Errore nella creazione dell\'evento');
      }

      // Successo
      //console.log('Evento creato con successo!');

      setSubmitting(false);
      setIsSuccessModalOpen(true);

    } catch (error: any) {
      console.error('Errore durante la creazione dell\'evento:', error);

      // Messaggio di errore più dettagliato
      let errorMessage = 'Errore nella creazione dell\'evento';

      if (error.message.includes('upload')) {
        errorMessage = `Errore durante l'upload dei file: ${error.message}`;
      } else if (error.message.includes('Errore nella creazione')) {
        errorMessage = `Errore durante il salvataggio dell'evento: ${error.message}`;
      } else {
        errorMessage = `Errore imprevisto: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Crea Nuovo Evento
            </CardTitle>
            <CardDescription className="text-lg">
              Organizza il tuo evento musicale e avvia la raccolta fondi
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Informazioni Evento */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Music className="h-5 w-5 text-purple-600" />
                <h3 className="text-xl font-semibold">Informazioni Evento</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Nome Evento *</Label>
                  <Input
                    id="eventName"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Nome del tuo evento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Importo Target (€) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi il tuo evento musicale..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Data Evento *</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    min={minEventDate}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Seleziona una data almeno 2 settimane da oggi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Fine Raccolta Fondi *</Label>
                  <Input
                    value={endFundraisingDate || "Seleziona prima la data evento"}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calcolata automaticamente (1 settimana prima dell'evento)
                  </p>
                </div>
              </div>
            </div>

            {/* Informazioni Artista */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Mic className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Informazioni Artista</h3>
              </div>

              {loadingArtist ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Caricamento dati artista...</span>
                </div>
              ) : artistError ? (
                <div className="space-y-3">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{artistError}</AlertDescription>
                  </Alert>
                  <Button
                    variant="outline"
                    onClick={fetchArtistData}
                    className="w-full"
                  >
                    <Loader2 className="h-4 w-4 mr-2" />
                    Riprova a caricare i dati
                  </Button>
                </div>
              ) : artistData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Artista *</Label>
                      <Input
                        value={artistData.username}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email Artista *</Label>
                      <Input
                        value={artistData.email}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I dati dell'artista sono prelevati dal tuo profilo e non possono essere modificati
                  </p>
                </div>
              ) : null}
            </div>

            {/* Informazioni Merchant */}
            <div className="space-y-6">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setIsLocalOpen(!isLocalOpen)}
              >
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-xl font-semibold">Seleziona Locale</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-6 w-6"
                >
                  {isLocalOpen ?
                    <ChevronUp className="h-4 w-4" /> :
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </div>

              {isLocalOpen && (
                loadingMerchants ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Caricamento locali disponibili...</span>
                  </div>
                ) : merchants.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nessun locale disponibile al momento
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {merchants.map(merchant => (
                      <Card
                        key={merchant.id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 border-2",
                          selectedMerchantId === merchant.id
                            ? "border-purple-600 shadow-lg"
                            : "border-transparent hover:shadow-md"
                        )}
                        onClick={() => setSelectedMerchantId(merchant.id)}
                      >
                        <CardHeader>
                          <CardTitle>{merchant.merchantName}</CardTitle>
                          <CardDescription>{merchant.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-2">
                            <MapPin className="inline mr-2 h-4 w-4" />
                            {merchant.merchantAddress}
                          </p>
                          <p className="text-sm">
                            {merchant.merchantDescription}
                          </p>
                          {merchant.merchantOffers && (
                            <div className="mt-3 p-2 bg-green-50 rounded-md">
                              <p className="text-xs text-green-700">
                                <span className="font-medium">Offerte:</span> {merchant.merchantOffers}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Generi Musicali */}
            <div className="space-y-4">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setIsGenresOpen(!isGenresOpen)}
              >
                <Music className="h-5 w-5 text-purple-600" />
                <h3 className="text-xl font-semibold">Generi Musicali *</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-6 w-6"
                >
                  {isGenresOpen ?
                    <ChevronUp className="h-4 w-4" /> :
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </div>

              {isGenresOpen && (
                loadingGenres ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Caricamento generi...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {genres.map(genre => {
                      const isSelected = selectedGenres.includes(genre.name);
                      return (
                        <div
                          key={genre.name}
                          className={cn(
                            "cursor-pointer p-3 rounded-lg text-center transition-all duration-200 border-2 hover:scale-105",
                            isSelected
                              ? "border-black shadow-lg font-bold"
                              : "border-transparent hover:shadow-md"
                          )}
                          style={{
                            backgroundColor: genre.colorHex,
                            color: getContrastingTextColor(genre.colorHex),
                          }}
                          onClick={() => toggleGenre(genre.name)}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-lg">{getGenreIcon(genre.iconName)}</span>
                            <span className="text-xs font-medium">{genre.displayName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* Upload Immagini */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-orange-600" />
                <Label className="text-base font-medium">Immagini Evento</Label>
              </div>

              <div className="space-y-4">
                <input
                  type="file"
                  id="pictureInput"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelection}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('pictureInput')?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Carica Immagini
                </Button>

                {pictureUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pictureUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removePicture(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Sample Audio */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Music className="h-5 w-5 text-red-600" />
                <Label className="text-base font-medium">Sample Audio</Label>
              </div>

              <div className="space-y-4">
                <input
                  type="file"
                  id="sampleInput"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={handleSampleSelection}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('sampleInput')?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Carica Sample Audio
                </Button>

                {sampleUrls.length > 0 && (
                  <div className="space-y-2">
                    {samples.map((sample, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Music className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{sample.name}</span>
                          <audio controls className="h-8">
                            <source src={sampleUrls[index]} type={sample.type} />
                          </audio>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSample(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

{/* Modal */}
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
              <DialogContent className="sm:max-w-md bg-white" >
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-bold text-green-600">
                    Evento Creato!
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-center py-4">
                    <div className="flex justify-center mb-4">
                      <svg
                        className="w-16 h-16 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-800">
                      Il tuo evento è stato creato con successo!
                    </p>
                    <p className="mt-2 text-gray-600">
                      Ora puoi gestirlo dalla tua dashboard
                    </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    onClick={() => navigate('/events')}
                    className="bg-green-600 hover:bg-green-700 px-6"
                  >
                    Vai agli Eventi
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 px-6"
                  >
                    Dashboard
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {/* Pulsanti */}
            <div className="space-y-4 pt-6">
              <Button
                onClick={handleCreateEvent}
                disabled={submitting || !artistData || !selectedMerchantId}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creazione in corso...
                  </>
                ) : (
                  'Crea Evento'
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Annulla
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewEvent;