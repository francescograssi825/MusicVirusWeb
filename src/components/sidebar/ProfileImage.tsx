import React, { useEffect, useState } from "react";
import { User2, Loader2 } from "lucide-react";

const ProfileImage: React.FC = () => {
  const [profileImgUrl, setProfileImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const const_url =`http://localhost:808`

  //l'url cambia in base al tipo di utente, da sitemare
  useEffect(() => {

    let url;
    if(localStorage.getItem('role')==='ARTIST'){
      url = const_url+`2/api/artist/get-image`;
    }else {
      url = const_url+`1/api/fan/get-image`
    }
    console.log(url)
    fetch(url, {
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
        // Se URL valido, si salva; altrimenti rimaniamo null.
        if (data && data.url && data.url!=='src/assets/registraz/default-avatar-profile.png') {
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
