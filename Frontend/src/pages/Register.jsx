import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, useToaster } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import '../index.css';

export default function Register() {
    const [nev, setNev] = useState('');
    const [email, setEmail] = useState('');
    const [jelszo, setJelszo] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const toaster = useToaster();

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log("Regisztráció gomb megnyomva. Adatok:", { nev, email, jelszo });
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/ugyfelek/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nev, email, jelszo }),
            });

            const data = await response.json();

            if (response.ok) {
                toaster.push(
                    <Message type="success" header="Siker">Sikeres regisztráció! Jelentkezz be.</Message>,
                    { placement: 'topCenter', duration: 3000 }
                );
                navigate('/login'); // Átirányítás a bejelentkezéshez
            } else {
                toaster.push(
                    <Message type="error" header="Hiba">{data.error || 'Hiba történt a regisztráció során.'}</Message>,
                    { placement: 'topCenter', duration: 4000 }
                );
            }
        } catch (err) {
            console.error(err);
            toaster.push(
                <Message type="error" header="Hiba">Nem sikerült csatlakozni a szerverhez.</Message>,
                { placement: 'topCenter', duration: 4000 }
            );
        }
    };

    return (
        <div className="bej-reg_doboz">
            <h2>Regisztráció</h2>
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