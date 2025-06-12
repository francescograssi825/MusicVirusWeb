import React, { useEffect, useState } from "react";
import { User2, Loader2 } from "lucide-react";

const ProfileImage: React.FC = () => {
  const [profileImgUrl, setProfileImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  //l'url cambia in base al tipo di utente, da sitemare
  useEffect(() => {
    fetch(`http://localhost:8081/api/fan/get-image`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("authToken") || ""}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Se abbiamo ricevuto un URL valido, lo salviamo; altrimenti rimaniamo null.
        if (data && data.url) {
          localStorage.setItem("profileImage", data.url);
          setProfileImgUrl(data.url);
        } else {
          setProfileImgUrl(null);
        }
      })
      .catch(error => {
        console.error("Errore nel recupero dell'immagine profilo:", error);
        setProfileImgUrl(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    // Mostra un indicatore di caricamento (icone animate, ad es. Loader2)
    return <Loader2 className="text-white w-8 h-8 animate-spin" />;
  }

  // Se non stiamo più caricando, mostriamo l'immagine se disponibile,
  // altrimenti il simbolo di default (User2)
  return profileImgUrl ? (
    <img
      src={profileImgUrl}
      alt="Profile"
      className="w-8 h-8 rounded-full object-cover"
    />
  ) : (
    <User2 className="text-white" />
  );
};

export default ProfileImage;
