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

    useEffect(() => {
        fetchUsers();
    }, []);

    // Keresés logika
    const filteredUsers = users.filter(user => 
        user.nev.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <div className="bej-reg_doboz admin-container">
            <h2>Adminisztráció - Felhasználók kezelése</h2>
            
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
        </div>
    );
}

export default Admin;
