import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Link } from "react-router-dom"

export default function About() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Chi siamo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Questa è la pagina About di MusicVirusWeb.</p>
          <Button asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}