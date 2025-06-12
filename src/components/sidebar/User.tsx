import React from "react";
import {
  Calendar,
  Music,
  Settings,
  User,
  Home,
  Heart,
  Ticket,
  Users,
} from "lucide-react";

export type UserType = "user" | "artist" | "merchant" | "admin";

// Recupera il tipo di utente dal localStorage se disponibile
const storedUserType =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("role")
    : null;

// Converte in minuscolo il valore preso dal localStorage (in caso esista) oppure utilizza "user" di default
export const currentUserType: UserType = storedUserType
  ? (storedUserType.toLowerCase() as UserType)
  : "user";


// Interfaccia per un menu item
export interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType; 
}

// Array dei menu items per la navigazione principale
let mainItems: MenuItem[] = [];
// Array dei menu items per le impostazioni (account)
let settingsItems: MenuItem[] = [];

if (currentUserType === "user") {
  mainItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Catalogo Eventi", url: "/events", icon: Calendar },
    { title: "I Miei Eventi", url: "/my-events", icon: Ticket },
    { title: "Eventi Salvati", url: "/saved-events", icon: Heart },
    { title: "Artisti Seguiti", url: "/followed-artists", icon: Music },
    { title: "Community", url: "/community", icon: Users },
  ];
 
} else if (currentUserType === "artist") {
  mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "I Miei Eventi", url: "/my-events", icon: Calendar },
    { title: "Biglietti", url: "/tickets", icon: Ticket },
    { title: "I Miei Fan", url: "/my-fans", icon: Users },
    { title: "Nuove Uscite", url: "/new-releases", icon: Music },
  ];
 
} else if (currentUserType === "merchant") {
  mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "I Miei Eventi", url: "/my-events", icon: Calendar },
    { title: "Biglietti", url: "/tickets", icon: Ticket },
    { title: "Vendite", url: "/sales", icon: Heart },
    { title: "Report", url: "/reports", icon: Users },
  ];
 
} else if (currentUserType === "admin") {
  mainItems = [
    { title: "Dashboard admin", url: "/dashboard", icon: Home },
    { title: "Gestione Eventi", url: "/event-management", icon: Calendar },
    { title: "Gestione Artisti", url: "/artist-management", icon: Users },
    { title: "Report", url: "/reports", icon: Ticket },
    { title: "Impostazioni", url: "/settings", icon: Settings },
  ];
  
}
 settingsItems = [
    { title: "Profilo", url: "/profile", icon: User },
    { title: "Impostazioni", url: "/settings", icon: Settings },
  ];

export { mainItems, settingsItems };
