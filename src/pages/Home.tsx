import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Home - MusicVirusWeb</CardTitle>
          <CardDescription>Benvenuto nella homepage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Questa è la pagina principale della tua applicazione.</p>
          <div className="flex gap-4">
            <Button asChild>
              <Link to="/about">Vai ad About</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}