import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
// Később itt importálod majd a saját komponenseidet, pl:
import Login from './pages/login';
import Home from './pages/home';
import Register from './pages/Register';
import Admin from './pages/admin';
// import Booking from './pages/Booking';
import Footer from './footer';
import './head-foot.css';

function Menu() {
  const [user, setUser] = useState(null);

  return (
    <div className="app-container">
      <header>
        <h1>Németh fodrászat</h1>
        <nav>
          {/* Ideiglenes menü a teszteléshez */}
          <Link to="/">Főoldal</Link>
          {!user && <Link to="/login">Bejelentkezés</Link>}
          {!user && <Link to="/register">Regisztráció</Link>}
          {user && <Link to="/admin">Admin</Link>}
          <Link to="/booking">Időpontfoglalás</Link>
          {user && <Link to="/" onClick={() => setUser(null)}>Kijelentkezés</Link>}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<h1>Itt lesz az Időpontfoglalás</h1>} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>


      
      <Footer />
    </div>
  );
}

export default Menu;