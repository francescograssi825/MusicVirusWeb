import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="container mx-auto p-8 flex items-center justify-center min-h-[60vh]">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-destructive">404</CardTitle>
          <CardDescription className="text-xl">Pagina non trovata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>La pagina che stai cercando non esiste.</p>
          <Button asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}