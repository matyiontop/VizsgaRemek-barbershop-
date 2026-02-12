import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Message, useToaster } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

function Profile() {
    const [appointments, setAppointments] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    
    const navigate = useNavigate();
    const toaster = useToaster();
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

    // Modal megnyitása
    const initiateCancel = (id) => {
        setSelectedId(id);
        setOpenModal(true);
    };

    // Tényleges törlés
    const confirmCancel = async () => {
        setOpenModal(false);
        try {
            const response = await fetch(`http://localhost:3000/api/idopontok/cancel/${selectedId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (response.ok) {
                toaster.push(
                    <Message type="success" header="Siker">{result.message}</Message>,
                    { placement: 'topCenter', duration: 3000 }
                );
                fetchAppointments(); // Lista frissítése
            } else {
                toaster.push(
                    <Message type="error" header="Hiba">{result.error}</Message>,
                    { placement: 'topCenter', duration: 4000 }
                );
            }
        } catch (error) {
            console.error("Hálózati hiba:", error);
            toaster.push(
                <Message type="error" header="Hiba">Nem sikerült csatlakozni a szerverhez.</Message>,
                { placement: 'topCenter', duration: 4000 }
            );
        }
    };

    // Segédfüggvény: Lemondható-e az időpont (több mint 24 óra van hátra)
    const isCancellable = (dateStr, timeStr) => {
        const appDate = new Date(`${dateStr}T${timeStr}`);
        const now = new Date();
        const diffInHours = (appDate - now) / (1000 * 60 * 60);
        return diffInHours >= 24;
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
                        {appointments.map(app => {
                            const cancellable = isCancellable(app.idopont_datuma, app.kezdesi_ido);
                            return (
                                <tr key={app.idopont_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{app.idopont_datuma}</td>
                                    <td style={{ padding: '10px' }}>{app.kezdesi_ido}</td>
                                    <td style={{ padding: '10px' }}>{app.szolgaltatas_nev} ({app.ar} Ft)</td>
                                    <td style={{ padding: '10px' }}>{app.fodrasz_nev}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button 
                                            onClick={() => cancellable && initiateCancel(app.idopont_id)}
                                            disabled={!cancellable}
                                            style={{ 
                                                backgroundColor: cancellable ? '#d9534f' : '#ccc', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '5px 10px', 
                                                borderRadius: '4px', 
                                                cursor: cancellable ? 'pointer' : 'not-allowed' 
                                            }}
                                        >
                                            Lemondás
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* Megerősítő Modal */}
            <Modal open={openModal} onClose={() => setOpenModal(false)} size="xs">
                <Modal.Header><Modal.Title>Megerősítés</Modal.Title></Modal.Header>
                <Modal.Body>Biztosan le szeretné mondani ezt az időpontot?</Modal.Body>
                <Modal.Footer>
                    <Button onClick={confirmCancel} appearance="primary" color="red">Igen, lemondom</Button>
                    <Button onClick={() => setOpenModal(false)} appearance="subtle">Mégse</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Profile;