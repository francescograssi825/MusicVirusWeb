import { Outlet } from "react-router-dom"
import Navbar from "@/components/navbar/Navbar"

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}