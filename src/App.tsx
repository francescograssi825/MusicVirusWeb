import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/layouts/Layout"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Dashboard from "@/pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import Unauthorized from "./pages/Unauthorized"
import Empty from "./pages/Empty"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>

           <Route path="/login" element={<Login />} />
           <Route path="/unauthorized" element={<Unauthorized />} />
           <Route path="/empty" element={<Empty />} />

          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} />


            {/* Route per Fan */}
            {/*
          <Route 
            path="fan/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['fan']}>
                <FanDashboard />
              </ProtectedRoute>
            } 
          />
          */}
          
          {/* Route per Artist */}
          {/*
          <Route 
            path="artist/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['artist']}>
                <ArtistDashboard />
              </ProtectedRoute>
            } 
          />
          */}
          
          {/* Route per Admin */}
          {/*
          <Route 
            path="admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          */}
          
          {/* Route che accettano più ruoli */}
          {/*
          <Route 
            path="shared/area" 
            element={
              <ProtectedRoute allowedRoles={['artist', 'admin']}>
                <div>Area condivisa artisti e admin</div>
              </ProtectedRoute>
            } 
          />
          */}
          
          <Route path="*" element={<NotFound />} />
          
        </Route>
      </Routes>
    </Router>
  )
}

export default App