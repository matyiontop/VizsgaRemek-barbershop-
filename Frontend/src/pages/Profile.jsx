import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchAppointments();
    }, [navigate]);

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/idopontok/user/${user.felhasznalo_id}`);
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error("Hiba az időpontok betöltésekor:", error);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Biztosan le szeretné mondani az időpontot?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/idopontok/cancel/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchAppointments(); // Lista frissítése
            } else {
                alert("Hiba: " + result.error);
            }
        } catch (error) {
            console.error("Hálózati hiba:", error);
            alert("Nem sikerült csatlakozni a szerverhez.");
        }
    };

    return (
        <div className="bej-reg_doboz" style={{ maxWidth: '800px' }}>
            <h2>Profilom - Foglalásaim</h2>
            <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '20px' }}>
                Figyelem: Időpontot lemondani csak a kezdés előtt legalább 24 órával lehetséges.
            </p>

            {appointments.length === 0 ? (
                <p>Jelenleg nincs aktív foglalásod.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Dátum</th>
                            <th style={{ padding: '10px' }}>Idő</th>
                            <th style={{ padding: '10px' }}>Szolgáltatás</th>
                            <th style={{ padding: '10px' }}>Fodrász</th>
                            <th style={{ padding: '10px' }}>Művelet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(app => (
                            <tr key={app.idopont_id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{app.idopont_datuma}</td>
                                <td style={{ padding: '10px' }}>{app.kezdesi_ido}</td>
                                <td style={{ padding: '10px' }}>{app.szolgaltatas_nev} ({app.ar} Ft)</td>
                                <td style={{ padding: '10px' }}>{app.fodrasz_nev}</td>
                                <td style={{ padding: '10px' }}>
                                    <button 
                                        onClick={() => handleCancel(app.idopont_id)}
                                        style={{ 
                                            backgroundColor: '#d9534f', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '5px 10px', 
                                            borderRadius: '4px', 
                                            cursor: 'pointer' 
                                        }}
                                    >
                                        Lemondás
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Profile;