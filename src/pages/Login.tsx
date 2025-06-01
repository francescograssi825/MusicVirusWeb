import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [username, setUsername] = useState("")
  const navigate = useNavigate()

  const handleLogin = () => {
    if (username.trim()) {
      // Simula login (salva utente)
      localStorage.setItem('user', username)
      navigate('/dashboard') // Vai alla dashboard dopo login
    }
  }

  return (
    <div className="container mx-auto p-8 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Inserisci il tuo username</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleLogin} className="w-full">
            Accedi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}