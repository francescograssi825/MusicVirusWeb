import EventsCard from "./Events/EventsCard"

export default function MyEvents() {
  const events = [
    {
      id: 1,
      title: "Rock Festival 2025",
      date: "15 Giugno 2025",
      location: "Milano",
      attendees: 1200,
      status: "pubblicato",
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      title: "Jazz Night",
      date: "22 Giugno 2025",
      location: "Roma",
      attendees: 150,
      status: "bozza",
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      title: "Electronic Beats",
      date: "30 Giugno 2025",
      location: "Napoli",
      attendees: 800,
      status: "pubblicato",
      image: "/api/placeholder/300/200"
    },
    {
      id: 4,
      title: "Indie Showcase",
      date: "5 Luglio 2025",
      location: "Firenze",
      attendees: 300,
      status: "bozza",
      image: "/api/placeholder/300/200"
    }
  ]

  return (
    <div className="space-y-6" style={{ padding: "10px" }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div
         
          className="p-6 rounded-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold tracking-tight text-white">I Miei Eventi</h1>
          <p className="text-white">
            Gestisci e monitora tutti i tuoi eventi musicali
          </p>
        </div>
      </div>

      {/* Grid degli eventi */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventsCard key={event.id} event={event} variant="mine" />
        ))}
      </div>
    </div>
  );
}