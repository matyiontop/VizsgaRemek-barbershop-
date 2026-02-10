import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
// Később itt importálod majd a saját komponenseidet, pl:
import Login from './pages/Login';
import Home from './pages/home';
import Register from './pages/Register';
import Admin from './pages/admin';
import Naptar from './pages/naptar';
import Profile from './pages/Profile';
// import Booking from './pages/Booking';
import Footer from './footer';
import './head-foot.css';

function Menu() {
  // Betöltéskor megnézzük, van-e mentett felhasználó a localStorage-ban
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Németh fodrászat</h1>
        <nav>
          <Link to="/">Főoldal</Link>
          
          {!user && <Link to="/login">Bejelentkezés</Link>}
          {!user && <Link to="/register">Regisztráció</Link>}
          
          {/* Csak Adminnak (A) */}
          {user && user.jogosultsag === 'A' && <Link to="/admin">Admin</Link>}
          
          {/* Csak bejelentkezett felhasználónak */}
          {user && <Link to="/booking">Időpontfoglalás</Link>}
          {user && <Link to="/profile">Profilom</Link>}
          
          {user && <Link to="/" onClick={handleLogout}>Kijelentkezés</Link>}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking" element={<Naptar />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>


      
      <Footer />
    </div>
  );
}

export default Menu;