import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function Dashboard() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Area di controllo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Questa è la tua dashboard personale.</p>
          <Button asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}