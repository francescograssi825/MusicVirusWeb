import React, { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle, MapPin, Store, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import RestApiUtilsMerchant from './common/RestApiUtilsMerchant';
import defaultAvatar from './common/default-avatar-profile.png';
import ModalRegistration from './modalRegistration';
import { getContrastingTextColor } from './common/Types';

declare global {
    interface Window {
        google: any;
    }
}

interface SocialNetwork {
    platformName: string;
    colorHex: string;
    iconName: string;
    profileUrl: string | null;
    name: string | null;
}

const SignUpMerchant: React.FC = () => {
    const navigate = useNavigate();

    // Campi base per il merchant
    const [username, setUsername] = useState('');
    const [surname, setSurname] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState({
        street: '',
        city: '',
        fullAddress: '',
        lat: 0,
        lng: 0
    });
    const [website, setWebsite] = useState('');

    // Social Networks
    const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
    const [loadingSocialNetworks, setLoadingSocialNetworks] = useState(true);
    const [selectedSocialNetworkProfiles, setSelectedSocialNetworkProfiles] = useState<{ [key: string]: string }>({});

    // Controllo disponibilità nome business
    const [checkingBusinessName, setCheckingUsername] = useState(false);
    const [businessNameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

    // Errori e stato submit
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Immagine del profilo/locale
    const [profileImage, setProfileImage] = useState<string>(defaultAvatar);
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Modal di registrazione completata
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

    useEffect(() => {
        const loadGoogleMaps = () => {
            if (!window.google) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBz237WilseCi9Ghn-rENeDSUQtZGVut-s&libraries=places`;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);

                script.onload = () => {
                    console.log('Google Maps API loaded');
                };
            }
        };

        loadGoogleMaps();
    }, []);


    //autocompletamento di google
    const initAutocomplete = () => {
        if (window.google && window.google.maps) {
            const input = document.getElementById('autocomplete-address') as HTMLInputElement;
            const autocomplete = new window.google.maps.places.Autocomplete(input, {
                types: ['address'],
                componentRestrictions: { country: 'it' }
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.address_components) return;

                let streetNumber = '';
                let route = '';
                let city = '';
                let fullAddress = place.formatted_address || '';

                place.address_components.forEach((component: { types: any; long_name: string; }) => {
                    const types = component.types;
                    if (types.includes('street_number')) {
                        streetNumber = component.long_name;
                    } else if (types.includes('route')) {
                        route = component.long_name;
                    } else if (types.includes('locality') || types.includes('administrative_area_level_3')) {
                        city = component.long_name;
                    } else if (types.includes('administrative_area_level_2')) {
                        // Se non abbiamo trovato la città, usiamo il livello 2
                        if (!city) city = component.long_name;
                    }
                });

                setAddress({
                    street: `${route} ${streetNumber}`.trim(),
                    city,
                    fullAddress,
                    lat: place.geometry?.location?.lat() || 0,
                    lng: place.geometry?.location?.lng() || 0
                });
            });
        }
    };

    useEffect(() => {
        const checkAPI = setInterval(() => {
            if (window.google) {
                clearInterval(checkAPI);
                initAutocomplete();
            }
        }, 100);

        return () => clearInterval(checkAPI);
    }, []);



    // Fetch di tutti i dati al montaggio
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch social networks
                const socialData = await RestApiUtilsMerchant.getSocialNetworks();
                setSocialNetworks(socialData);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Errore nel caricamento dei social network');
            } finally {
                setLoadingSocialNetworks(false);
            }
        };

        fetchData();
    }, []);

    // Controllo disponibilità nome business
    const checkUsername = async () => {
        if (!username.trim()) return;

        setCheckingUsername(true);
        setError('');

        try {
            const isAvailable = await RestApiUtilsMerchant.checkBusinessNameAvailability(username);
            setUsernameAvailable(isAvailable);

            if (!isAvailable) {
                setError('Nome business non disponibile');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Errore nel controllo nome business');
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

    // Validazione dei campi
    const validateForm = (): boolean => {
        if (!username || !businessName || !description || !email || !phone || !password || !address.fullAddress) {
            setError('Tutti i campi obbligatori devono essere compilati');
            return false;
        }

        if (businessNameAvailable === false) {
            setError('Nome business non disponibile');
            return false;
        }

        if (businessNameAvailable === null && businessName.trim()) {
            setError('Controlla la disponibilità del nome business prima di procedere');
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

        // Verifica che l'indirizzo sia completo
        if (!address.fullAddress || !address.city) {
            setError('Per favore, seleziona un indirizzo valido dalla lista');
            return;
        }
        setSubmitting(true);

        try {
            // Combina indirizzo e città
            const fullAddress = address.fullAddress + ', ' + address.lat.toFixed(6) +', ' +address.lng.toFixed(6);

            // Prepara i dati per la registrazione
            const registrationData = {
                username,
                merchantSurname: surname,
                merchantName: businessName,
                merchantDescription: description,
                merchantEmail: email,
                merchantPhone: phone,
                password,
                merchantAddress: fullAddress,
                website,
                socialNetworks: Object.entries(selectedSocialNetworkProfiles)
                    .filter(([_, url]) => url.trim() !== '')
                    .map(([platform, url]) => ({
                        platform,
                        profileUrl: url,
                    })),
            };

            await RestApiUtilsMerchant.completeMerchantRegistration(
                registrationData,
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

    const getIcon = (iconName: string): JSX.Element => {
        const iconMap: { [key: string]: JSX.Element } = {
            FaStore: <Store className="w-4 h-4" />,
            FaGlobe: <Globe className="w-4 h-4" />,
            FaMapPin: <MapPin className="w-4 h-4" />,
        };
        return iconMap[iconName] || <Store className="w-4 h-4" />;
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-4xl shadow-xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Registrazione Esercente
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Porta la musica dal vivo nel tuo spazio
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Immagine del locale */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative group">
                                <img
                                    src={profileImage}
                                    alt="Locale"
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
                            <p className="text-sm text-muted-foreground">Clicca per aggiungere foto del locale</p>
                        </div>

                        {/* Username e Cognome */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Nome *</Label>
                                <Input
                                    id="businessName"
                                    value={businessName}
                                    onChange={e => {
                                        setBusinessName(e.target.value);
                                        setUsernameAvailable(null);
                                    }}
                                    
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

                        {/* Nome business con controllo */}
                        <div className="space-y-2">
                            <Label htmlFor="username">Nome del locale *</Label>
                            <div className="relative">
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={e => {
                                        setUsername(e.target.value);
                                        setUsernameAvailable(null);

                                    }}
                                    onBlur={checkUsername}

                                    placeholder="Nome del tuo locale"
                                    className={cn(
                                        businessNameAvailable === true && "border-green-500",
                                        businessNameAvailable === false && "border-red-500"
                                    )}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {checkingBusinessName && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                    {businessNameAvailable === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    {businessNameAvailable === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                                </div>
                            </div>
                            {businessNameAvailable === true && (
                                <p className="text-sm text-green-600">Nome disponibile</p>
                            )}
                        </div>

                        {/* Descrizione */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Descrizione del locale *</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Descrivi il tuo locale, l'atmosfera, i servizi offerti..."
                            />
                        </div>

                        {/* Email e Telefono */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="email@locale.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefono *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+39 123 456 7890"
                                />
                            </div>
                        </div>

                        {/* Indirizzo e Città */}
                        <div className="space-y-2">
                            <Label htmlFor="autocomplete-address">Indirizzo completo *</Label>
                            <Input
                                id="autocomplete-address"
                                value={address.fullAddress}
                                onChange={(e) => setAddress({
                                    ...address,
                                    fullAddress: e.target.value
                                })}
                                placeholder="Inserisci l'indirizzo completo (via, città, CAP)"
                                onFocus={initAutocomplete}
                            />
                          
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label htmlFor="website">Sito web</Label>
                            <Input
                                id="website"
                                type="url"
                                value={website}
                                onChange={e => setWebsite(e.target.value)}
                                placeholder="https://www.tuolocale.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Crea una password sicura"
                            />
                        </div>

                        {/* Social Networks */}
                        <div className="space-y-4">
                            <Label className="text-base font-medium">Social Networks</Label>
                            <p className="text-sm text-muted-foreground">Aggiungi i tuoi profili social (opzionale)</p>
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

                        {/* Pulsanti */}
                        <div className="space-y-4 pt-4">
                            <Button
                                onClick={handleSignUp}
                                disabled={submitting}
                                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Registrazione in corso...
                                    </>
                                ) : (
                                    'Registrati come Esercente'
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

export default SignUpMerchant;