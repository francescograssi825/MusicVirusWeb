const BASE_URL = 'http://localhost:8080';

interface SocialNetwork {
  platformName: string;
  colorHex: string;
  iconName: string;
  profileUrl: string | null;
  name: string | null;
}

interface MerchantRegistrationData {
  username: string;
  merchantSurname: string;
  merchantName: string;
  merchantDescription: string;
  merchantEmail: string;
  merchantPhone: string;
  password: string;
  merchantAddress: string;
  website?: string;
  socialNetworks: Array<{
    platform: string;
    profileUrl: string;
  }>;
  imageUrl?: string;
}

interface MerchantBusinessData {
  username?: string;
  merchantSurname?: string;
  merchantName?: string;
  merchantDescription?: string;
  merchantEmail?: string;
  merchantPhone?: string;
  merchantAddress?: string;
  website?: string;
  socialNetworks?: Array<{
    platform: string;
    profileUrl: string;
  }>;
  profileImageUrl?: string;
  // Add other fields as needed
}

class RestApiUtilsMerchant {
  /**
   * Gestisce le risposte fetch, lanciando errori per risposte non OK e analizzando JSON.
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  /**
   * Ottiene tutti i social network disponibili
   */
  static async getSocialNetworks(): Promise<SocialNetwork[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/registration/social`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await this.handleResponse<{ socials: SocialNetwork[] }>(response);
      return data.socials;
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
      const response = await fetch(`${BASE_URL}/api/registration/usernameControl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: businessName.trim() }),
      });
      
      const result = await this.handleResponse<boolean>(response);
      return result;
    } catch (error) {
      console.error('Errore nel controllo username:', error);
      throw new Error('Errore nel controllo della disponibilità dell\'username');
    }
  }

  /**
   * Carica un'immagine sul server
   * FIXED: Corretti endpoint e parametri
   */
  private static async uploadImage(imageFile: File, username: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile); // Cambiato da 'image' a 'file'
      formData.append('username', username); // Aggiunto parametro username richiesto

      // FIXED: Corretti l'endpoint (rimosso 'api' duplicato)
      const response = await fetch(`${BASE_URL}/api/registration/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await this.handleResponse<{ imageUrl: string }>(response);
      return data.imageUrl;
    } catch (error) {
      console.error('Errore nel caricamento immagine:', error);
      throw new Error('Impossibile caricare l\'immagine');
    }
  }

  /**
   * Completa la registrazione del merchant
   * FIXED: Passa username per upload immagine
   */
  static async completeMerchantRegistration(
    registrationData: MerchantRegistrationData,
    imageFile: File | null
  ): Promise<void> {
    try {
      // Carica l'immagine se presente
      if (imageFile) {
        // FIXED: Passa username per l'upload
        registrationData.imageUrl = await this.uploadImage(imageFile, registrationData.username);
      }

      // Invia i dati di registrazione
      const response = await fetch(`${BASE_URL}/api/registration/merchant/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      await this.handleResponse(response);
      console.log('Registrazione merchant completata');
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

      const data = await this.handleResponse<{ available: boolean }>(response);
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

      const data = await this.handleResponse<{ cities: string[] }>(response);
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

      return await this.handleResponse(response);
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

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Errore nel caricamento merchant:', error);
      throw new Error('Impossibile caricare i dati del merchant');
    }
  }

  /**
   * Aggiorna i dati di un merchant
   * FIXED: Pass username for image upload
   */
  static async updateMerchant(
    merchantId: string, 
    updateData: Partial<MerchantBusinessData>,
    newImageFile?: File | null,
    username?: string
  ): Promise<void> {
    try {
      let imageUrl = null;

      // Carica nuova immagine se presente
      if (newImageFile && username) {
        // FIXED: Passa username per l'upload
        imageUrl = await this.uploadImage(newImageFile, username);
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

      await this.handleResponse(response);
      console.log('Merchant aggiornato con successo');
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