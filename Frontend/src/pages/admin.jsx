import React, { useState } from 'react';

function Admin() {
    // Ideiglenes adatok a demonstrációhoz (később API-ból jönne)
    const [users, setUsers] = useState([
        { id: 1, name: 'Kiss János', banned: false },
        { id: 2, name: 'Nagy Éva', banned: true },
        { id: 3, name: 'Kovács Péter', banned: false },
        { id: 4, name: 'Tóth Anna', banned: false },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    // Keresés logika
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Felhasználó kiválasztása
    const handleSelectUser = (user) => {
        setSelectedUser({ ...user });
    };

    // Módosítások mentése
    const handleSave = () => {
        setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
        alert('Sikeres mentés!');
        setSelectedUser(null);
    };

    // Felhasználó törlése
    const handleDelete = () => {
        if (window.confirm('Biztosan törölni szeretné ezt a felhasználót?')) {
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setSelectedUser(null);
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
                                    key={user.id} 
                                    onClick={() => handleSelectUser(user)}
                                    className={`admin-user-list-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                >
                                    {user.name} {user.banned ? '(Letiltva)' : ''}
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
                            <input type="text" value={selectedUser.name} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} />
                            
                            <div className="admin-checkbox-container">
                                <label className="admin-checkbox-label">
                                    <input type="checkbox" checked={selectedUser.banned} onChange={(e) => setSelectedUser({...selectedUser, banned: e.target.checked})} />
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
