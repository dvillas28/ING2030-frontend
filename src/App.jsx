import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Signin from './Singin';


function App() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Router>
      <header>
        <h2>Nombre App</h2>
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li>Inicio</li>
        <li>Metas financieras</li>
        <li>Progreso</li>
        <li>Alertas y consejos</li>
        <li>Mi Banco</li>
        <li>Mi perfil</li>
        <li>Cerrar sesión</li>
      </ul>

      </header>
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Signin onLogin={setUser} />} />
          <Route path="/home" element={<Dashboard user={user} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
