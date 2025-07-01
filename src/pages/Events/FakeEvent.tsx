import React from 'react';
import EventCard from './EventCard'; // Assicurati che il path sia corretto

const FakeEvent: React.FC = () => {
  // Evento fake per testare le funzionalità
  const fakeEvent = {
    id: "fake-event-1",
    name: "Concerto Rock Estivo",
    description: "Un incredibile concerto rock all'aperto con artisti internazionali. Una serata indimenticabile sotto le stelle con la migliore musica rock contemporanea.",
    artist: {
      id: "fake-artist-1",
      artistName: "The Thunder Band",
      email: "thunder@band.com"
    },
    genres: ["ROCK", "ALTERNATIVE", "INDIE"],
    merchant: {
      id: "fake-merchant-1",
      merchantName: "Arena Live Club",
      merchantAddress: "Via Roma 123, Milano",
      merchantDescription: "Il miglior locale per concerti live di Milano",
      merchantOffers: "Sconto del 20% su drink durante il concerto",
      email: "info@arenalive.com"
    },
    amount: 500000, // €5000.00
    creationDate: "2025-01-15T10:00:00.000+00:00",
    eventDate: "2025-08-15T20:00:00.000+00:00",
    endFundraisingDate: "2025-07-15T23:59:59.000+00:00",
    pictures: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", // Concerto rock
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80", // Band sul palco
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80"  // Folla concerto
    ],
    sample: [
      "https://cdn.pixabay.com/audio/2024/01/20/audio_bb461c7ea3.mp3",                    // Rock sample 1
      "https://sample-videos.com/zip/10/mp3/mp3-sample-short.mp3",       // Rock sample 2
      "https://www.soundjay.com/misc/sounds-958.mp3"                     // Rock sample 3
    ],
    eventState: "APPROVED",
    creatorToken: null,
    creator: null
  };

  // Secondo evento fake con stato diverso
  const fakeEvent2 = {
    id: "fake-event-2",
    name: "Jazz Night Intimo",
    description: "Una serata jazz intima in un ambiente raccolto. Musica dal vivo con i migliori musicisti jazz della città.",
    artist: {
      id: "fake-artist-2",
      artistName: "Maria Jazz Quartet",
      email: "maria@jazz.com"
    },
    genres: ["JAZZ", "BLUES"],
    merchant: {
      id: "fake-merchant-2",
      merchantName: "Blue Note Café",
      merchantAddress: "Via del Jazz 45, Roma",
      merchantDescription: "Caffè storico dedicato al jazz",
      merchantOffers: null,
      email: "info@bluenote.com"
    },
    amount: 200000, // €2000.00
    creationDate: "2025-01-10T15:30:00.000+00:00",
    eventDate: "2025-07-20T21:30:00.000+00:00",
    endFundraisingDate: "2025-06-20T23:59:59.000+00:00",
    pictures: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", // Jazz club
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80"  // Piano jazz
    ],
    sample: [
      "https://file-examples.com/storage/fefb3ef2a0b4e8e6f15e444/2017/11/file_example_MP3_700KB.mp3", // Jazz sample 1
      "https://sample-videos.com/zip/10/mp3/mp3-sample-short.mp3"                                        // Jazz sample 2
    ],
    eventState: "PENDING_APPROVAL_BY_MERCHANT",
    creatorToken: null,
    creator: null
  };

  // Evento senza immagini e audio per testare i fallback
  const fakeEvent3 = {
    id: "fake-event-3",
    name: "Evento Senza Media",
    description: "Evento per testare come appare la card senza immagini e sample audio.",
    artist: {
      id: "fake-artist-3",
      artistName: "Minimal Artist",
      email: "minimal@artist.com"
    },
    genres: ["ACOUSTIC"],
    merchant: {
      id: "fake-merchant-3",
      merchantName: "Simple Venue",
      merchantAddress: "Via Semplice 1, Napoli",
      merchantDescription: "Venue minimalista",
      merchantOffers: "",
      email: "info@simple.com"
    },
    amount: 100000, // €1000.00
    creationDate: "2025-01-01T12:00:00.000+00:00",
    eventDate: "2025-09-01T19:00:00.000+00:00",
    endFundraisingDate: "2025-08-01T23:59:59.000+00:00",
    pictures: [], // Nessuna immagine
    sample: [],   // Nessun sample
    eventState: "REJECTED",
    creatorToken: null,
    creator: null
  };

  const handleFakeAction = (eventId: string) => {
    console.log(`Azione eseguita per evento: ${eventId}`);
    alert(`Azione eseguita per evento: ${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Eventi Fake
          </h1>
          <p className="text-gray-600">
            Questa pagina mostra eventi fake per testare le funzionalità di carosello immagini e audio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Evento 1: Con immagini e audio - Approvato */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Evento Approvato (Con Media)</h3>
            <EventCard
              event={fakeEvent}
              showUserActions={true}
              onToggleFavorite={handleFakeAction}
              onDonate={handleFakeAction}
              isFavorite={false}
            />
          </div>

          {/* Evento 2: Con media - In attesa */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Evento In Attesa (Con Media)</h3>
            <EventCard
              event={fakeEvent2}
              showMerchantActions={true}
              onAccept={handleFakeAction}
              onReject={handleFakeAction}
            />
          </div>

          {/* Evento 3: Senza media - Rifiutato */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Evento Rifiutato (Senza Media)</h3>
            <EventCard
              event={fakeEvent3}
              showMerchantActions={false}
              showUserActions={false}
            />
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default FakeEvent;