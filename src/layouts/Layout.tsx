import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import styles from "./Layout.module.css";
import { useEffect, useState } from "react";

export default function Layout() {
  const location = useLocation();
  
  // Leggi lo stato di login dal local storage all'iniziale e ad ogni cambio di pagina
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  useEffect(() => {
    setIsUserLoggedIn(localStorage.getItem("loggedIn") === "true");
  }, [location]);

  // Mappa delle rotte per i nomi delle pagine
  const pageNames: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/': 'Home',
    '/events': 'Catalogo Eventi',
    '/artist/my-events': 'I Miei Eventi',
    '/saved-events': 'Eventi Salvati',
    '/tickets': 'Biglietti',
    '/followed-artists': 'Artisti Seguiti',
    '/community': 'Community',
    '/profile': 'Profilo',
    '/settings': 'Impostazioni',
    '/my-fans': 'I Miei Fan',
    '/new-releases': 'Nuove Uscite',
    '/sales': 'Vendite',
    '/reports': 'Report',
    '/event-management': 'Gestione Eventi',
    '/user-management': 'Gestione Utenti',
    'merchant-management':'Gestione Esercenti',
    '/new-event' : 'Crea Evento',
    'event-request': 'Richieste',
    'settings': 'Impostazioni',
  };

  // Ottieni il nome della pagina corrente
  const getCurrentPageName = () => {
    return pageNames[location.pathname] || 'Dashboard';
  };

  return (
    <div className={`${styles.body}`}>
      <div className="min-h-screen parallax">
        {isUserLoggedIn ? (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              {/* Header con trigger della sidebar */}
              <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-white border-b border-gray-200">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                {/* Breadcrumb dinamico */}
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">
                        MusicVirus
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{getCurrentPageName()}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </header>

              {/* Contenuto principale */}
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <main className="flex-1">
                  <Outlet />
                </main>
              </div>
            </SidebarInset>
          </SidebarProvider>
        ) : (
          <>
            <Navbar />
            <main>
              <Outlet />
            </main>
          </>
        )}
      </div>
    </div>
  );
}
