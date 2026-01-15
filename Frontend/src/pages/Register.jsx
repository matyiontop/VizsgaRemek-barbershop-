import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        nev: '',
        email: '',
        jelszo: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // Adatok küldése a Backendnek
            const response = await fetch('http://localhost:3000/api/ugyfelek/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Sikeres regisztráció!');
                navigate('/login'); // Sikeres regisztráció után átirányítás a bejelentkezésre
            } else {
                setError(data.error || 'Hiba történt a regisztráció során');
            }
        } catch (err) {
            setError('Nem sikerült csatlakozni a szerverhez.');
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2>Regisztráció</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>Név:</label>
                <input type="text" name="nev" value={formData.nev} onChange={handleChange} required />
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                <label>Jelszó:</label>
                <input type="password" name="jelszo" value={formData.jelszo} onChange={handleChange} required />
                <button type="submit" style={{ marginTop: '10px' }}>Regisztráció</button>
            </form>
        </div>
    );
}

export default Register;