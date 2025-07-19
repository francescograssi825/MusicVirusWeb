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
import MyEvents from "./pages/Dashboard/Fan/MyEvents"
import EventManagement from "./pages/sidebar/EventManagement"
import ArtistManagement from "./pages/Dashboard/Admin/ArtistManagement"
import NewEvent from "./pages/Dashboard/Artist/NewEvent"
import MerchantManagement from "./pages/Dashboard/Admin/MerchantManagement"
import AcceptEvent from "./pages/Dashboard/Merchant/AcceptEvent"
import EventArtist from "./pages/Dashboard/Artist/EventArtist"
import FakeEvent from "./pages/Events/FakeEvent"
import EarningsArtist from "./pages/Dashboard/Artist/EarningsArtist"
import UpdateArtistProfile from "./pages/Dashboard/Artist/ArtistProfile"
import AdminEarningsDashboard from "./pages/Dashboard/Admin/EarningAdmin"
import Reports from "./pages/Dashboard/Admin/Reports"
import EventAdmin from "./pages/Dashboard/Admin/EventAdmin"
import EventMerchant from "./pages/Dashboard/Merchant/EventMerchant"

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
          <Route path="/fake-events" element={<FakeEvent />} />



         
          
          


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

          <Route path="/my-events" element={< MyEvents/>} />

          {/*Merchant*/}
          
           <Route path="/event-request" element={< AcceptEvent/>} />
            <Route path="/merchant/my-events" element={<EventMerchant />} />
          
          {/* Route per Artist */}

          <Route path="/new-event" element={<NewEvent />}/>
          <Route path="/artist/my-events" element={<EventArtist />} />
          <Route path="/artist/earnings" element={<EarningsArtist />} />
          <Route path="/artist/profile" element={<UpdateArtistProfile />} />
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
          

         
          <Route path= "/event-management" element={<EventAdmin />} />
        <Route path= "/artist-management" element={<ArtistManagement />} /> 
          <Route path="/merchant-management" element={<MerchantManagement/>} />{/* Admin */}
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

          <Route path="/admin-dashboard" element={<AdminEarningsDashboard />} />
           <Route path="/reports" element={<Reports />} />
          
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