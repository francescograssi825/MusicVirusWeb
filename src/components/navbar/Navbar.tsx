import React, { useState } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./NavigationMenu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { cn } from "../../lib/utils"
import styles from "./Navbar.module.css"
import { useNavigate} from "react-router-dom"

// Array per le categorie di eventi (Primo dropdown)
const eventCategories: { title: string; href: string; description: string }[] = [
  {
    title: "Concerti Live",
    href: "/events/live",
    description: "Trova concerti dal vivo di band indipendenti.",
  },
  {
    title: "Festival Indie",
    href: "/events/festival",
    description: "Scopri festival underground e indipendenti.",
  },
  {
    title: "Open Mic",
    href: "/events/openmic",
    description: "Partecipa agli open mic e serate emergenti.",
  },
]

// Array per le sezioni relative agli artisti (Secondo dropdown)
const artistSections: { title: string; href: string; description: string }[] = [
  {
    title: "Artisti Emergenti",
    href: "/artists/emerging",
    description: "Scopri talenti in ascesa nel panorama indipendente.",
  },
  {
    title: "Nuove Uscite",
    href: "/artists/new-releases",
    description: "Le ultime novità e uscite dei tuoi artisti preferiti.",
  },
  {
    title: "Interviste",
    href: "/artists/interviews",
    description: "Approfondimenti e interviste esclusive.",
  },
]

const userTypeOptions = [
  {
    type: 'fan',
    title: 'Fan',
    description: 'Discover and support your favorite artists',
    route: '/fan/signup',
    icon: '🎵'
  },
  {
    type: 'artist',
    title: 'Artist',
    description: 'Share your music and connect with fans',
    route: '/artist/signup',
    icon: '🎤'
  },
  {
    type: 'merchant',
    title: 'Merchant',
    description: 'Sell merchandise and music products',
    route: '/merchant/signup',
    icon: '🛍️'
  }
];

export default function Navbar() {
  const navigate = useNavigate();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handleUserTypeSelect = (route: string) => {
    setIsSignInModalOpen(false);
    navigate(route);
  };

  return (
    <>
      <div className={`${styles.navbar} flex items-center justify-between p-4 border-b`}>
        {/* Logo: cliccando sul logo si torna alla home */}
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-xl font-bold">MusicVirus</h1>
        </div>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList>
            {/* Dropdown: Esplora Eventi */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Esplora Eventi</NavigationMenuTrigger>
              <NavigationMenuContent className={styles.dropdown}>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[0.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500 to-blue-700 p-6 no-underline outline-none focus:shadow-md"
                        href="/events/featured"
                      >
                        <img
                          src="https://www.24.com/wp-content/uploads/2022/03/01-2.jpg" 
                          alt="Evento in evidenza"
                          className="w-24 h-24 mb-4 rounded-full"
                        />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Evento in Evidenza
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Scopri l'evento musicale più in vista della settimana.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  {eventCategories.map((item) => (
                    <ListItem key={item.title} title={item.title} href={item.href}>
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Dropdown: Artisti */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Artisti</NavigationMenuTrigger>
              <NavigationMenuContent className={styles.dropdown}>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {artistSections.map((item) => (
                    <ListItem key={item.title} title={item.title} href={item.href}>
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side buttons */}
        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => setIsSignInModalOpen(true)}
          >
            Sign In
          </button>
          <button
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
        </div>
      </div>

      {/* Sign In Modal */}
      <Dialog open={isSignInModalOpen} onOpenChange={setIsSignInModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Choose Your Account Type</DialogTitle>
            <DialogDescription>
              Select the type of account you want to create to get started with MusicVirus.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {userTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleUserTypeSelect(option.route)}
                className="flex items-center p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left"
              >
                <div className="text-2xl mr-4">{option.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </div>
                <div className="ml-2">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => (
  <li>
    <NavigationMenuLink asChild>
      <a
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </a>
    </NavigationMenuLink>
  </li>
));
ListItem.displayName = "ListItem";
