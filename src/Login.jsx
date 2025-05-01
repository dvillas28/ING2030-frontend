import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // aquí iría el llamado al backend para buscar user 
    // si coincide con bdd asinar valor a setUser
    onLogin(true);
    navigate('/home')
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