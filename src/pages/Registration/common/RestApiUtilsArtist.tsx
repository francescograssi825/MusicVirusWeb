const invokeUrl = 'http://localhost:8080';

interface Genre {
  name: string;
  displayName: string;
  colorHex: string;
  iconName: string;
}

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

interface ArtistRegistrationData {
  username: string;
  bio: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

interface ArtistProfileResponse {
  id: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
  profileImageUrl: string;
  genres: string[];
  socialNetworks: { network: string; profileUrl: string }[];
  streamingPlatforms: { platform: string; profileUrl: string }[];
}

class RestApiUtilsArtist {
  
  // Fetch generi musicali
  static async getGenres(): Promise<Genre[]> {
    try {
      const response = await fetch(`${invokeUrl}/api/registration/genres`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data?.genres || [];
    } catch (error) {
      throw new Error('Errore nel caricamento dei generi musicali');
    }
  }

  // Fetch social networks
  static async getSocialNetworks(): Promise<SocialNetwork[]> {
    try {
      const response = await fetch(`${invokeUrl}/api/registration/social`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data?.socials || [];
    } catch (error) {
      throw new Error('Errore nel caricamento dei social network');
    }
  }

  // Fetch streaming platforms
  static async getStreamingPlatforms(): Promise<StreamingPlatform[]> {
    try {
      const response = await fetch(`${invokeUrl}/api/registration/platforms`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data?.platform || [];
    } catch (error) {
      throw new Error('Errore nel caricamento delle piattaforme di streaming');
    }
  }

  // Controllo disponibilità username
  static async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await fetch(`${invokeUrl}/api/registration/usernameControl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const isAvailable = await response.json();
      return isAvailable === true;
    } catch (error) {
      throw new Error('Errore nel controllo della disponibilità dell\'username');
    }
  }

  // Upload immagine profilo
  static async uploadProfileImage(imageFile: File, username: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('username', username.trim());
      
      // CORREZIONE: URL corretto per l'upload
      const response = await fetch(`${invokeUrl}/api/registration/api/upload`, { 
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

  static async getArtistProfile(artistId: string): Promise<ArtistProfileResponse> {
  try {
    const response = await fetch(`${invokeUrl}/api/artist/${artistId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error('Errore nel caricamento del profilo artista');
  }
}

// Aggiorna il profilo dell'artista
static async updateArtistProfile(
  artistId: string,
  updateData: {
    bio?: string;
    genres?: string[];
    socialNetworks?: { [key: string]: string };
    streamingPlatforms?: { [key: string]: string };
  },
  imageFile: File | null
): Promise<void> {
  try {
    // Upload nuova immagine se presente
    let imageUrl = '';
    if (imageFile) {
      imageUrl = await this.uploadProfileImage(imageFile, artistId);
    }

    // Prepara i dati per l'aggiornamento
    const updatePayload = {
      ...updateData,
      ...(imageUrl && { profileImageUrl: imageUrl }),
      socialNetworks: updateData.socialNetworks 
        ? Object.entries(updateData.socialNetworks).map(([network, url]) => ({
            network,
            profileUrl: url
          }))
        : [],
      streamingPlatforms: updateData.streamingPlatforms 
        ? Object.entries(updateData.streamingPlatforms).map(([platform, url]) => ({
            platform,
            profileUrl: url
          }))
        : []
    };

    // Invia richiesta di aggiornamento
    const response = await fetch(`${invokeUrl}/api/artist/${artistId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Errore durante l\'aggiornamento');
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Errore durante l\'aggiornamento');
  }
}

static async getArtistData(token: string): Promise<any> {
  const response = await fetch(`${invokeUrl}/api/artist/getData`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Errore nel caricamento dei dati artista');
  }

  return response.json();
}

// Per aggiornare l'artista
static async updateArtist(
  artistId: number,
  personalData: any,
  selectedGenres: string[],
  socialProfiles: { [key: string]: string },
  platformProfiles: { [key: string]: string },
  imageFile: File | null,
  token: string
): Promise<void> {
  
  const formData = new FormData();
  
  // Aggiungi i dati testuali
  formData.append('data', JSON.stringify({
    ...personalData,
    genres: selectedGenres,
    socialNetworks: socialProfiles,
    streamingPlatforms: platformProfiles
  }));
  
  // Aggiungi l'immagine se presente
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`${invokeUrl}/api/artist/update/${artistId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Errore durante l\'aggiornamento');
  }
}
  // Registrazione artista completa
  static async completeArtistRegistration(
    personalData: ArtistRegistrationData,
    selectedGenres: string[],
    selectedSocialNetworkProfiles: { [key: string]: string },
    selectedStreamingPlatformProfiles: { [key: string]: string },
    imageFile: File | null
  ): Promise<void> {
    try {
      // Upload immagine se presente
      let imageUrl = 'src/assets/registraz/default-avatar-profile.png';
      if (imageFile) {
        imageUrl = await this.uploadProfileImage(imageFile, personalData.username);
      }

     
      const artistDto = {
        username: personalData.username.trim(),
        bio: personalData.bio,
        email: personalData.email.trim(),
        phone: personalData.phone.trim(),
        password: personalData.password,
        
        genres: selectedGenres, 
        
        socialNetworks: Object.entries(selectedSocialNetworkProfiles).map(([network, url]) => ({
          network: network, 
          profileUrl: url  
        })),
        
        streamingPlatforms: Object.entries(selectedStreamingPlatformProfiles).map(([platform, url]) => ({
          platform: platform, 
          profileUrl: url     
        })),
        profileImageUrl: imageUrl, 
      };

      console.log('Invio dati al backend:', JSON.stringify(artistDto, null, 2));

      // Invia registrazione
      const response = await fetch(`${invokeUrl}/api/registration/artist/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(artistDto),
      });

      if (!response.ok) {
        let errorMessage = 'Errore durante la registrazione';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          
          errorMessage = `Errore HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Verifica che la risposta sia valida
      const responseData = await response.json();
      console.log('Risposta dal backend:', responseData);

      // Registrazione completata con successo
    } catch (error) {
      console.error('Errore nella registrazione:', error);
      throw new Error(error instanceof Error ? error.message : 'Errore durante la registrazione');
    }
  }




  
}

export default RestApiUtilsArtist;