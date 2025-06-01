import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function Unauthorized() {
  return (
    <div className="container mx-auto p-8 flex items-center justify-center min-h-[60vh]">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-destructive">403</CardTitle>
          <CardDescription className="text-xl">Accesso negato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Non hai i permessi per accedere a questa pagina.</p>
          <Button asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}