import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./layouts/Layout"
import Home from "./pages/Home"
import About from "./pages/About"
import Dashboard from "./pages/sidebar/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFound from "./pages/NotFound"
import Login from "./pages/Login/Login"
import Unauthorized from "./pages/Unauthorized"
import Empty from "./pages/Empty"
import SignUpMerchant from "./pages/Registration/SignUpMerchant"
import SignUpArtist from "./pages/Registration/SignUpArtist"
import SignUpFan from "./pages/Registration/SignUp"
import { AuthProvider } from "./components/auth/AuthContext"
import Catalogo from "./pages/Events/Catalogo"
import MyEvents from "./pages/sidebar/MyEvents"
import SavedEvents from "./pages/sidebar/SavedEvents"
import EventManagement from "./pages/sidebar/EventManagement"
import ArtistManagement from "./pages/Dashboard/Admin/ArtistManagement"

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>

           <Route path="/login" element={<Login />} />
           <Route path="/unauthorized" element={<Unauthorized />} />
           <Route path="/empty" element={<Empty />} />

          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/fan/signup" element={<SignUpFan />} />
          <Route path="/artist/signup" element={<SignUpArtist />} />
          <Route path="/merchant/signup" element={<SignUpMerchant />} />
          <Route path="/events" element={<Catalogo />} />



          {/*Rotte dashboard*/ }
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/saved-events" element={<SavedEvents />} />


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
          

         
          <Route path= "/event-management" element={<EventManagement />} />
        <Route path= "/artist-management" element={<ArtistManagement />} /> {/* Admin */}
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
      </AuthProvider>
    </Router>
  )
}

export default App