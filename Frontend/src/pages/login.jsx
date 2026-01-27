import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [jelszo, setJelszo] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Bejelentkezés gomb megnyomva. Adatok:", { email });
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/ugyfelek/bejelentkezes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, jelszo }),
            });

            const data = await response.json();

            if (response.ok) {
                // Felhasználói adatok mentése a böngészőbe
                localStorage.setItem('user', JSON.stringify(data));
                setUser(data);
                alert('Sikeres bejelentkezés!');
                navigate('/'); // Átirányítás a főoldalra
            } else {
                setError(data.error || 'Hibás email vagy jelszó!');
            }
        } catch (err) {
            console.error(err);
            setError('Nem sikerült csatlakozni a szerverhez.');
        }
    };

    return (
        <div className="bej-reg_doboz">
            <h2>Bejelentkezés</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin} className="bej-reg_szoveg">
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Jelszó:</label>
                <input type="password" value={jelszo} onChange={(e) => setJelszo(e.target.value)} required />
                <button type="submit" className="bej-reg_gomb">Bejelentkezés</button>
            </form>
        </div>
    );
}