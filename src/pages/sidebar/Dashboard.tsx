import { Calendar, Music, Users, Ticket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

export default function Dashboard() {
  return (
    <div className="space-y-6" style={{padding: "10px"}}>
      <div style={{opacity:0.9, backgroundColor:"black", display: "inline-block"}} className="p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight text-white" >Dashboard</h1>
        <p className="text-white">
          Benvenuto nella tua dashboard degli eventi musicali
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventi Creati
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 dal mese scorso
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Biglietti Venduti
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +18% dal mese scorso
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Artisti Seguiti
            </CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +5 questa settimana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Follower
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +12% dal mese scorso
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Prossimi Eventi</CardTitle>
            <CardDescription>
              I tuoi eventi in programma per le prossime settimane
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Rock Festival 2025</h4>
                <p className="text-sm text-muted-foreground">15 Giugno 2025 - Milano</p>
                <p className="text-sm">500 biglietti disponibili</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Jazz Night</h4>
                <p className="text-sm text-muted-foreground">22 Giugno 2025 - Roma</p>
                <p className="text-sm">200 biglietti disponibili</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">Electronic Beats</h4>
                <p className="text-sm text-muted-foreground">30 Giugno 2025 - Napoli</p>
                <p className="text-sm">300 biglietti disponibili</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Attività Recente</CardTitle>
            <CardDescription>
              Le tue ultime azioni sulla piattaforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-sm">Evento "Rock Festival" pubblicato</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <p className="text-sm">50 nuovi biglietti venduti</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <p className="text-sm">Nuovo artista seguito: The Weeknd</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <p className="text-sm">Profilo aggiornato</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}