import { useNavigate } from 'react-router-dom';

function Login({ setUser })
{
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ideiglenes: szerver kapcsolat nélkül egyből továbbít
        alert('Sikeres bejelentkezés!');
        if (setUser) setUser(true);
        navigate('/');
    };

    return (
        <div className="bej-reg_doboz">
            <h2>Bejelentkezés</h2>
            <form onSubmit={handleSubmit} className="bej-reg_szoveg">
                <label>Email:</label>
                <input type="email" name="email" required />
                <label>Jelszó:</label>
                <input type="password" name="jelszo" required />
                <button type="submit" className="bej-reg_gomb">Bejelentkezés</button>
            </form>
        </div>
    );
}

export default Login;