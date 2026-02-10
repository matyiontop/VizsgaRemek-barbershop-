import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
    const navigate = useNavigate();

    // Biztonsági ellenőrzés: Ha nem admin, irányítsuk át!
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/'); // Ha nincs bejelentkezve
            return;
        }
        const user = JSON.parse(userStr);
        if (user.jogosultsag !== 'A') {
            navigate('/'); // Ha be van jelentkezve, de nem Admin
        }
    }, [navigate]);

    // Valós adatok tárolása
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]); // Időpontok tárolása
    const [activeTab, setActiveTab] = useState('users'); // Melyik fül aktív: 'users' vagy 'appointments'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    // Adatok betöltése a backendről
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/ugyfelek');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Hiba a felhasználók betöltésekor:", error);
        }
    };

    // Időpontok betöltése
    const fetchAppointments = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/idopontok');
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error("Hiba az időpontok betöltésekor:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Keresés logika
    const filteredUsers = users.filter(user => 
        user.nev.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Keresés logika az időpontokhoz (Ügyfél neve, Dátum vagy Időpont alapján)
    const filteredAppointments = appointments.filter(app => 
        app.ugyfel_nev.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.idopont_datuma.includes(searchTerm) ||
        app.kezdesi_ido.includes(searchTerm)
    );

    // Felhasználó kiválasztása
    const handleSelectUser = (user) => {
        // Másolatot készítünk és hozzáadunk egy üres jelszó mezőt a szerkesztéshez
        setSelectedUser({ ...user, newPassword: '' });
    };

    // Módosítások mentése
    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/ugyfelek/${selectedUser.felhasznalo_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nev: selectedUser.nev,
                    email: selectedUser.email,
                    szerep: selectedUser.szerep,
                    engedely: selectedUser.engedely,
                    jelszo: selectedUser.newPassword // Csak akkor küldjük, ha van értéke
                })
            });

            if (response.ok) {
                alert('Sikeres mentés!');
                setSelectedUser(null);
                fetchUsers(); // Lista frissítése
            } else {
                alert('Hiba a mentés során!');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Felhasználó törlése
    const handleDelete = async () => {
        if (window.confirm('Biztosan törölni szeretné ezt a felhasználót?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/ugyfelek/${selectedUser.felhasznalo_id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Felhasználó törölve!');
                    setSelectedUser(null);
                    fetchUsers();
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Időpont törlése
    const handleDeleteAppointment = async (id) => {
        if (window.confirm('Biztosan törölni szeretné ezt az időpontot?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/idopontok/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Időpont törölve!');
                    fetchAppointments(); // Lista frissítése
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Ha az időpontok fülre váltunk, töltsük be az adatokat
    useEffect(() => {
        if (activeTab === 'appointments') {
            fetchAppointments();
        }
    }, [activeTab]);

    return (
        <div className="bej-reg_doboz admin-container">
            <h2>Adminisztráció</h2>
            
            {/* Menü gombok (Fülek) */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    className="bej-reg_gomb" 
                    onClick={() => { setActiveTab('users'); setSearchTerm(''); }} 
                    style={{ opacity: activeTab === 'users' ? 1 : 0.6 }}
                >
                    Felhasználók kezelése
                </button>
                <button 
                    className="bej-reg_gomb" 
                    onClick={() => { setActiveTab('appointments'); setSearchTerm(''); }} 
                    style={{ opacity: activeTab === 'appointments' ? 1 : 0.6 }}
                >
                    Időpontok kezelése
                </button>
            </div>
            
            {activeTab === 'users' ? (
                <div className="admin-content">
                    {/* Bal oldal: Kereső és Lista */}
                    <div className="admin-column">
                        <input 
                            type="text" 
                            placeholder="Keresés név alapján..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-search-input"
                        />
                        
                        <div className="admin-user-list-container">
                            <ul className="admin-user-list">
                                {filteredUsers.map(user => (
                                    <li 
                                        key={user.felhasznalo_id} 
                                        onClick={() => handleSelectUser(user)}
                                        className={`admin-user-list-item ${selectedUser?.felhasznalo_id === user.felhasznalo_id ? 'selected' : ''}`}
                                    >
                                        {user.nev} {user.engedely === 0 ? '(Letiltva)' : ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Jobb oldal: Szerkesztés */}
                    <div className="admin-column">
                        {selectedUser ? (
                            <div className="bej-reg_szoveg admin-edit-form">
                                <h3>Szerkesztés</h3>
                                <label>Név:</label>
                                <input type="text" value={selectedUser.nev} onChange={(e) => setSelectedUser({...selectedUser, nev: e.target.value})} />
                                
                                <label>Email:</label>
                                <input type="email" value={selectedUser.email} onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})} />
                                
                                <label>Jelszó módosítása (opcionális):</label>
                                <input type="password" placeholder="Új jelszó..." value={selectedUser.newPassword} onChange={(e) => setSelectedUser({...selectedUser, newPassword: e.target.value})} />
                                
                                <div className="admin-checkbox-container">
                                    <label className="admin-checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUser.engedely === 0} 
                                            onChange={(e) => {
                                                // Ha bepipáljuk -> 0 (Letiltva), ha kivesszük -> 1 (Engedélyezve)
                                                setSelectedUser({...selectedUser, engedely: e.target.checked ? 0 : 1})
                                            }} 
                                        />
                                        Felhasználó letiltása
                                    </label>
                                </div>

                                <div className="admin-buttons">
                                    <button className="bej-reg_gomb" onClick={handleSave}>Mentés</button>
                                    <button className="bej-reg_gomb admin-delete-button" onClick={handleDelete}>Törlés</button>
                                </div>
                            </div>
                        ) : (
                            <p>Válassz ki egy felhasználót a listából a szerkesztéshez.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="admin-content" style={{ display: 'block' }}>
                    <input 
                        type="text" 
                        placeholder="Keresés időpontra vagy ügyfélre..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                        style={{ marginBottom: '15px', width: '100%', maxWidth: '400px' }}
                    />

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Dátum</th>
                                <th style={{ padding: '10px' }}>Idő</th>
                                <th style={{ padding: '10px' }}>Ügyfél</th>
                                <th style={{ padding: '10px' }}>Fodrász</th>
                                <th style={{ padding: '10px' }}>Szolgáltatás</th>
                                <th style={{ padding: '10px' }}>Művelet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map(app => (
                                <tr key={app.idopont_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{app.idopont_datuma}</td>
                                    <td style={{ padding: '10px' }}>{app.kezdesi_ido}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{app.ugyfel_nev}</td>
                                    <td style={{ padding: '10px' }}>{app.fodrasz_nev}</td>
                                    <td style={{ padding: '10px' }}>{app.szolgaltatas_nev}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button 
                                            onClick={() => handleDeleteAppointment(app.idopont_id)} 
                                            style={{ color: 'white', backgroundColor: '#d9534f', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Törlés
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredAppointments.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Nincs megjeleníthető foglalás.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Admin;