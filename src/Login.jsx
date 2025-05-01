import { useState } from 'react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría el llamado al backend
      };
    
      return (
        <div className="login-page-wrapper">
          <div className="login-container">
            <h1>Bienvenido</h1>
            <p className="login-subtitle">Inicia sesión para continuar</p>
            <form className="login-form" onSubmit={handleSubmit}>
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
            <button className="login-button" type="submit">Ingresar</button>
        </form>
        </div>
        </div>
    );
}

export default Login;