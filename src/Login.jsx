import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // aquí iría el llamado al backend para buscar user 
    try {
      const response = await axios.post('http://localhost:3000/users/login',
        {
          email: email,
          password: password,
        },
      );

      // si coincide con bdd asinar valor a setUser
      if (response.status === 200) {
        const data = response.data;
        const message = data.message;
        const user = data.user;

        console.log(message);
        onLogin(user);
        navigate('/home');
      }
    } catch (error) {

      if (error.response?.status === 404) {
        alert('Usuario no encontrado');
      }

      else if (error.response?.status === 401) {
        alert('Contraseña incorrecta');
      }

      else if (error.response?.status === 404) {
        alert('Error en el servidor');
      }
    }

  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1>Bienvenido</h1>
        <p className="subtitle">Inicia sesión para continuar</p>
        <form className="form" onSubmit={handleSubmit}>
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
              placeholder="Ingresa tu contraseña"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="button" type="submit">Ingresar</button>
          <p className="prompt">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </form>

      </div>
    </div>
  );
}

export default Login;