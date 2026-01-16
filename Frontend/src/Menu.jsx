import { Routes, Route, Link } from 'react-router-dom';
// Később itt importálod majd a saját komponenseidet, pl:
// import Login from './pages/Login';
import Home from './pages/home';
import Register from './pages/Register';
// import Booking from './pages/Booking';

function Menu() {
  return (
    <div>
      <nav>
        {/* Ideiglenes menü a teszteléshez */}
        <Link to="/">Főoldal</Link> | 
        <Link to="/login">Bejelentkezés</Link> | 
        <Link to="/register">Regisztráció</Link> | 
        <Link to="/booking">Időpontfoglalás</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<h1>Itt lesz a Login oldal</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<h1>Itt lesz az Időpontfoglalás</h1>} />
      </Routes>
    </div>
  );
}

export default Menu;