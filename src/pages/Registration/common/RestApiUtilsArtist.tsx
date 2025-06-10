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
      
      const response = await fetch(`${invokeUrl}/api/upload`, { 
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

      // Prepara il DTO per l'artista
      const artistDto = {
        username: personalData.username.trim(),
        bio: personalData.bio,
        email: personalData.email.trim(),
        phone: personalData.phone.trim(),
        password: personalData.password,
        genres: selectedGenres,
        socialNetworks: Object.entries(selectedSocialNetworkProfiles).map(([network, url]) => ({
          network,
          profileUrl: url
        })),
        streamingPlatforms: Object.entries(selectedStreamingPlatformProfiles).map(([platform, url]) => ({
          platform,
          profileUrl: url
        })),
        profileImageUrl: imageUrl,
      };

      // Invia registrazione
      const response = await fetch(`${invokeUrl}/api/registration/artist/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artistDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante la registrazione');
      }

      // Registrazione completata con successo
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Errore durante la registrazione');
    }
  }
}

export default RestApiUtilsArtist;