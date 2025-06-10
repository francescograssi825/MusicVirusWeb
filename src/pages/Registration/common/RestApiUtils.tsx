import type { Genre } from './Types';

const BASE_URL = 'http://localhost:8080';

// Tipi per le richieste e risposte
export interface FanRegistrationDto {
  name: string;
  surname: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  address: string;
  favouriteGenres: string[];
  profileImageUrl: string;
}

export interface GenresResponse {
  genres: Genre[];
}

export interface ImageUploadResponse {
  imageUrl: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Classe per gestire tutte le chiamate API
export class RestApiUtils {
  private static baseUrl = BASE_URL;

  // Metodo helper per gestire le risposte
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Errore HTTP: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Se non è JSON valido, usa il testo grezzo
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Risposta vuota dal server');
    }

    try {
      return JSON.parse(text);
    } catch {
      // Se non è JSON, restituisci il testo come stringa
      return text as T;
    }
  }

  // Recupera tutti i generi musicali disponibili
  static async getGenres(): Promise<Genre[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/registration/genres`);
      const data = await this.handleResponse<GenresResponse>(response);
      return data?.genres || [];
    } catch (error) {
      console.error('Errore nel caricamento dei generi:', error);
      throw new Error('Errore nel caricamento dei generi musicali');
    }
  }

  // Controlla la disponibilità di un username
  static async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/registration/usernameControl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });
      
      const result = await this.handleResponse<boolean>(response);
      return result === true;
    } catch (error) {
      console.error('Errore nel controllo username:', error);
      throw new Error('Errore nel controllo della disponibilità dell\'username');
    }
  }

  // Upload dell'immagine del profilo
  static async uploadProfileImage(imageFile: File, username: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('username', username.trim());
      
      const response = await fetch(`${this.baseUrl}/api/registration/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await this.handleResponse<ImageUploadResponse>(response);
      
      if (!data.imageUrl) {
        throw new Error('URL immagine non ricevuto dal server');
      }
      
      return data.imageUrl;
    } catch (error) {
      console.error('Errore upload immagine:', error);
      throw new Error(`Errore durante l'upload dell'immagine: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Registrazione di un nuovo fan
  static async registerFan(fanData: FanRegistrationDto): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/registration/fan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fanData),
      });
      
      await this.handleResponse(response);
    } catch (error) {
      console.error('Errore registrazione fan:', error);
      throw new Error(`Registrazione fallita: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  // Metodo helper per costruire il DTO di registrazione
  static buildFanRegistrationDto(
    name: string,
    surname: string,
    email: string,
    phone: string,
    username: string,
    password: string,
    address: string,
    selectedGenres: string[],
    profileImageUrl: string
  ): FanRegistrationDto {
    return {
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim(),
      password,
      address: address.trim(),
      favouriteGenres: selectedGenres,
      profileImageUrl,
    };
  }

  // Metodo per gestire l'intero processo di registrazione
  static async completeRegistration(
    personalData: {
      name: string;
      surname: string;
      email: string;
      phone: string;
      username: string;
      password: string;
      address: string;
    },
    selectedGenres: string[],
    imageFile: File | null
  ): Promise<void> {
    let imageUrl = 'src\\pages\\Registration\\common\\default-avatar-profile.png';

    // Upload dell'immagine se presente
    if (imageFile) {
      imageUrl = await this.uploadProfileImage(imageFile, personalData.username);
    }

    // Costruzione del DTO
    const fanDto = this.buildFanRegistrationDto(
      personalData.name,
      personalData.surname,
      personalData.email,
      personalData.phone,
      personalData.username,
      personalData.password,
      personalData.address,
      selectedGenres,
      imageUrl
    );

    // Registrazione
    await this.registerFan(fanDto);
  }
}

export default RestApiUtils;
