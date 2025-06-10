interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

type LocationCallback = (location: LocationCoordinates | null) => void;

const getUserLocation = (callback: LocationCallback): void => {
  if (!navigator.geolocation) {
    console.warn("Geolocation non supportata dal browser");
    callback(null);
    return;
  }

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000, // 10 secondi
    maximumAge: 300000, // 5 minuti
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      callback({ latitude, longitude });
    },
    (error) => {
      console.warn("Errore nel recupero della posizione:", error.message);
      
      // Gestione specifica degli errori
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.warn("L'utente ha negato la richiesta di geolocalizzazione");
          break;
        case error.POSITION_UNAVAILABLE:
          console.warn("Informazioni sulla posizione non disponibili");
          break;
        case error.TIMEOUT:
          console.warn("Timeout nella richiesta di geolocalizzazione");
          break;
        default:
          console.warn("Errore sconosciuto nella geolocalizzazione");
          break;
      }
      
      callback(null);
    },
    options
  );
};

export default getUserLocation;