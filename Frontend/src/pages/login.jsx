import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, useToaster } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import '../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const navigate = useNavigate();
  const toaster = useToaster();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/ugyfelek/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jelszo })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        toaster.push(
            <Message type="success" header="Siker">Sikeres bejelentkezés!</Message>,
            { placement: 'topCenter', duration: 3000 }
        );
        setTimeout(() => {
            window.location.href = '/'; // Teljes újratöltés, hogy a Menü frissüljön
        }, 1000);
      } else {
        toaster.push(
            <Message type="error" header="Hiba">{data.error || 'Hiba történt a bejelentkezés során.'}</Message>,
            { placement: 'topCenter', duration: 4000 }
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      toaster.push(
          <Message type="error" header="Hiba">Nem sikerült csatlakozni a szerverhez.</Message>,
          { placement: 'topCenter', duration: 4000 }
      );
    }
  };

  return (
    <div className="bej-reg_doboz">
      <h2>Bejelentkezés</h2>
      <form onSubmit={handleLogin} className="bej-reg_szoveg">
        <label>Email cím:</label>
        <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
        />
        <label>Jelszó:</label>
        <input 
            type="password" 
            value={jelszo} 
            onChange={(e) => setJelszo(e.target.value)} 
            required 
        />
        <button type="submit" className="bej-reg_gomb">
            Bejelentkezés
        </button>
      </form>
    </div>
  );
}