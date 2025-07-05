// EventsCard.tsx

import React from "react";
import { useState } from "react";
import { Heart, Calendar, MapPin, Music, Trash2, Users } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

// Import AlertDialog components (assumendo una struttura simile a shadcn/ui)
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogTrigger
} from "../../../components/ui/alert-dialog";

export interface EventData {
    id: number;
    title: string;
    // Per gli eventi salvati
    artist?: string;
    date: string;
    location: string;
    price?: string;
    category?: string;
    // Per i tuoi eventi ("mine")
    status?: string;
    attendees?: number;
    //
    image: string;
}

export type CardVariant = "saved" | "mine" | "acceptance" | "catalog";

interface EventsCardProps {
    event: EventData;
    variant?: CardVariant;
    onDelete?: () => void;
    onBuy?: () => void;
    onEdit?: () => void;
    onView?: () => void;
}

const EventsCard: React.FC<EventsCardProps> = ({
    event,
    variant = "saved",
    onDelete,
    onBuy,
    onEdit,
    onView,
}) => {
    // Stati utili per la variante acceptance
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);



    // Funzione che simula la chiamata fetch per la cancellazione
    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        // Simula una chiamata fetch (sostituisci con la tua logica)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsDeleting(false);
        setDeleted(true);
        // Chiamata onDelete se fornita
        if (onDelete) onDelete();
    };

    return (
        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div
                className="aspect-video bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative"
                style={{
                    backgroundImage: `url(${event.image})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                <div className="text-white text-center">{/* Spazio per eventuali overlay */}</div>
                <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white hover:bg-white/20"
                >
                    <Heart className="h-4 w-4 fill-current" />
                </Button>
            </div>
            <CardHeader className="pb-4">
                {variant === "saved" ? (
                    <>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                            {event.category && (
                                <Badge>
                                    {event.category}
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="space-y-2">
                            <div className="flex items-center text-sm font-medium">
                                <Music className="mr-2 h-4 w-4" />
                                {event.artist}
                            </div>
                            <div className="flex items-center text-sm">
                                <Calendar className="mr-2 h-4 w-4" />
                                {event.date}
                            </div>
                            <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4" />
                                {event.location}
                            </div>
                        </CardDescription>
                    </>
                ) : variant === "mine" ? (
                    <>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            {event.status && (
                                <Badge variant={event.status === "pubblicato" ? "default" : "secondary"}>
                                    {event.status}
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="space-y-1">
                            <div className="flex items-center text-sm">
                                <Calendar className="mr-2 h-4 w-4" />
                                {event.date}
                            </div>
                            <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4" />
                                {event.location}
                            </div>
                            <div className="flex items-center text-sm">
                                <Users className="mr-2 h-4 w-4" />
                                {event.attendees} partecipanti
                            </div>
                        </CardDescription>
                    </>
                ) : variant === "acceptance" ? (
                    // Per la variante acceptance mostriamo le info come per "mine" e in basso il tasto "Elimina"
                    <>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            {event.status && (
                                <Badge variant={event.status === "pubblicato" ? "default" : "secondary"}>
                                    {event.status}
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="space-y-1">
                            <div className="flex items-center text-sm">
                                <Calendar className="mr-2 h-4 w-4" />
                                {event.date}
                            </div>
                            <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4" />
                                {event.location}
                            </div>
                            <div className="flex items-center text-sm">
                                <Users className="mr-2 h-4 w-4" />
                                {event.attendees} partecipanti
                            </div>
                        </CardDescription>
                    </>
                ) : variant === "catalog" ? (
                    // Variante catalog: mostra tutte le info (simili a "mine") senza alcun pulsante
                    <>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            {event.status && (
                                <Badge variant={event.status === "pubblicato" ? "default" : "secondary"}>
                                    {event.status}
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="space-y-1">
                            <div className="flex items-center text-sm">
                                <Calendar className="mr-2 h-4 w-4" />
                                {event.date}
                            </div>
                            <div className="flex items-center text-sm">
                                <MapPin className="mr-2 h-4 w-4" />
                                {event.location}
                            </div>
                            <div className="flex items-center text-sm">
                                <Users className="mr-2 h-4 w-4" />
                                {event.attendees} partecipanti
                            </div>
                        </CardDescription>
                    </>
                ) : null}
            </CardHeader>
            <CardContent className="pt-0">
                {variant === "saved" ? (
                    // Contenuto per la visualizzazione degli eventi salvati
                    <div className="flex items-center justify-between">
                        {event.price && (
                            <div className="text-lg font-bold text-green-600">{event.price}</div>
                        )}
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={onDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={onBuy}>
                                Acquista
                            </Button>
                        </div>
                    </div>
                ) : variant === "mine" ? (
                    // Contenuto per "mine" (i tuoi eventi)
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                            Modifica
                        </Button>
                        <Button variant="outline" size="sm" onClick={onView} className="flex-1">
                            Visualizza
                        </Button>
                    </div>
                ) : variant === "acceptance" ? (
                    // Variante acceptance: mostra il pulsante "Elimina" che apre una conferma via modal
                    <div className="flex items-center justify-end">
                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                     className="bg-red-500 text-white hover:bg-red-600"
                                    size="sm"
                                    disabled={deleted || isDeleting}
                                >
                                    {deleted ? "Cancellato" : "Elimina"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white shadow-lg"> {/* Sfondo bianco e ombra per evidenziare il dialog */}
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Sei sicuro di voler eliminare questo evento?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                                        Annulla
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async () => {
                                            await handleConfirmDelete();
                                            setIsDialogOpen(false);
                                        }}
                                    >
                                        {isDeleting ? "Eliminazione in corso..." : "Conferma"}
                                    </AlertDialogAction>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                ) : variant === "catalog" ? (
                    // Variante catalog: nessun bottone, solo informazioni
                    <></>
                ) : null}
            </CardContent>
        </Card>
    );
};

export default EventsCard;