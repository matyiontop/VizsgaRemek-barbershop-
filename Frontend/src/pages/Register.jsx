import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function Register() {
    const [nev, setNev] = useState('');
    const [email, setEmail] = useState('');
    const [jelszo, setJelszo] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log("Regisztráció gomb megnyomva. Adatok:", { nev, email, jelszo });
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/ugyfelek/regisztracio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nev, email, jelszo }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Sikeres regisztráció!');
                navigate('/login'); // Átirányítás a bejelentkezéshez
            } else {
                setError(data.error || 'Hiba történt a regisztráció során.');
            }
        } catch (err) {
            console.error(err);
            setError('Nem sikerült csatlakozni a szerverhez.');
        }
    };

    return (
        <div className="bej-reg_doboz">
            <h2>Regisztráció</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister} className="bej-reg_szoveg">
                <label>Név:</label>
                <input type="text" value={nev} onChange={(e) => setNev(e.target.value)} required />
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Jelszó:</label>
                <input type="password" value={jelszo} onChange={(e) => setJelszo(e.target.value)} required />
                <button type="submit" className="bej-reg_gomb">Regisztráció</button>
            </form>
        </div>
    );
}