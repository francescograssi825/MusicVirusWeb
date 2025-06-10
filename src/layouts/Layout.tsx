import { Outlet, useLocation } from "react-router-dom"
import Navbar from "../components/navbar/Navbar"
import { AppSidebar } from "../components/sidebar/AppSidebar"
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from "../components/ui/sidebar"
import { Separator } from "../components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb"
import styles from "./Layout.module.css"

export default function Layout() {
  // Simuliamo lo stato di login dell'utente
  const isUserLoggedIn = true; // Cambia a false per nascondere la sidebar
  const location = useLocation()

  // Mappa delle rotte per i nomi delle pagine
  const pageNames: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/': 'Home',
    '/events': 'Catalogo Eventi',
    '/my-events': 'I Miei Eventi',
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
    'settings': 'Impostazioni',
  }



  // Ottieni il nome della pagina corrente
  const getCurrentPageName = () => {
    return pageNames[location.pathname] || 'Dashboard'
  }

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
  )
}