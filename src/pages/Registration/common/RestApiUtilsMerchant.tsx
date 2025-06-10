import { type Genre } from './Types';

const BASE_URL =  'http://localhost:8080';

interface SocialNetwork {
  platformName: string;
  colorHex: string;
  iconName: string;
  profileUrl: string | null;
  name: string | null;
}

interface MerchantBusinessData {
  businessName: string;
  description: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  website?: string;
}

class RestApiUtilsMerchant {
  

  /**
   * Ottiene tutti i generi musicali disponibili
   */
  static async getGenres(): Promise<Genre[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/genres`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nel caricamento dei generi:', error);
      throw new Error('Impossibile caricare i generi musicali');
    }
  }

  /**
   * Ottiene tutti i social network disponibili
   */
  static async getSocialNetworks(): Promise<SocialNetwork[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/social-networks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nel caricamento dei social network:', error);
      throw new Error('Impossibile caricare i social network');
    }
  }

  /**
   * Controlla la disponibilità del nome business
   */
  static async checkBusinessNameAvailability(businessName: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/merchants/check-business-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Errore nel controllo disponibilità nome business:', error);
      throw new Error('Impossibile verificare la disponibilità del nome business');
    }
  }

  /**
   * Carica un'immagine sul server
   */
  private static async uploadImage(imageFile: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Errore nel caricamento immagine:', error);
      throw new Error('Impossibile caricare l\'immagine');
    }
  }

  /**
   * Completa la registrazione del merchant
   */
  static async completeMerchantRegistration(
    businessData: MerchantBusinessData,
    selectedGenres: string[],
    socialNetworkProfiles: { [key: string]: string },
    imageFile: File | null
  ): Promise<void> {
    try {
      let imageUrl = null;

      // Carica l'immagine se presente
      if (imageFile) {
        imageUrl = await this.uploadImage(imageFile);
      }

      // Prepara i dati per la registrazione
      const registrationData = {
        businessData: {
          ...businessData,
          profileImageUrl: imageUrl,
        },
        genres: selectedGenres,
        socialNetworks: Object.entries(socialNetworkProfiles)
          .filter(([_, url]) => url.trim() !== '')
          .map(([platform, url]) => ({
            platform,
            profileUrl: url,
          })),
      };

      const response = await fetch(`${BASE_URL}/api/merchants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Registrazione merchant completata:', data);
    } catch (error) {
      console.error('Errore nella registrazione merchant:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Errore durante la registrazione del merchant'
      );
    }
  }

  /**
   * Verifica se un indirizzo email è già registrato
   */
  static async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/api/merchants/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Errore nel controllo disponibilità email:', error);
      throw new Error('Impossibile verificare la disponibilità dell\'email');
    }
  }

  /**
   * Ottiene le città disponibili (per autocomplete)
   */
  static async getCities(query: string): Promise<string[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/cities/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.cities;
    } catch (error) {
      console.error('Errore nella ricerca città:', error);
      return [];
    }
  }

  /**
   * Valida un indirizzo usando un servizio di geocoding
   */
  static async validateAddress(address: string, city: string): Promise<{ valid: boolean; coordinates?: { lat: number; lng: number } }> {
    try {
      const response = await fetch(`${BASE_URL}/api/geocoding/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, city }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nella validazione indirizzo:', error);
      return { valid: false };
    }
  }

  /**
   * Ottiene informazioni su un merchant tramite ID
   */
  static async getMerchantById(merchantId: string): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/api/merchants/${merchantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nel caricamento merchant:', error);
      throw new Error('Impossibile caricare i dati del merchant');
    }
  }

  /**
   * Aggiorna i dati di un merchant
   */
  static async updateMerchant(
    merchantId: string, 
    updateData: Partial<MerchantBusinessData>,
    newImageFile?: File | null
  ): Promise<void> {
    try {
      let imageUrl = null;

      // Carica nuova immagine se presente
      if (newImageFile) {
        imageUrl = await this.uploadImage(newImageFile);
      }

      const response = await fetch(`${BASE_URL}/api/merchants/${merchantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          ...(imageUrl && { profileImageUrl: imageUrl }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Merchant aggiornato:', data);
    } catch (error) {
      console.error('Errore nell\'aggiornamento merchant:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Errore durante l\'aggiornamento del merchant'
      );
    }
  }
}

export default RestApiUtilsMerchant;