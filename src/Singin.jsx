// src/Register.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        // aquí iría el llamado al backend para obtener user y asinar true a onLogin
        try {
            const response = await axios.post('https://ing2030-backend.onrender.com/users/register',
                {
                    username: nickname,
                    email: email,
                    password: password
                },
            );

            if (response.status === 201) {
                const data = response.data;
                const message = data.message;
                const user = data.newUser;

                console.log(message);
                onLogin(user);
                navigate('/home')

            }
        } catch (error) {
            if (error.response?.status === 409) {
                alert('Email ya esta en uso');
            }

            else if (error.response?.status === 500) {
                alert('Error en el servidor');
            }
        }

    };

    return (
        <>
            <div className="page-wrapper">
                <div className="container">
                    <h1>Crear cuenta</h1>
                    <p className="subtitle">Regístrate para comenzar</p>
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Apodo</label>
                            <input
                                type="name"
                                value={nickname}
                                placeholder="Ingresa tu apodo"
                                onChange={(e) => setNickname(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                placeholder="Ingresa tu email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                placeholder="Crea una contraseña"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="button" type="submit">Registrarse</button>
                        <p className="prompt">
                            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
                        </p>
                    </form>
                </div>
            </div>

        </>


    );
}

export default Signin;
