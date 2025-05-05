import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Signin from './Singin';
import Transactions from './Transactions';
import Goals from './Goals';
import Budget from './Budget';
import Alerts from './Alerts';
import { Link } from 'react-router-dom';
// import handle from 'mqtt/lib/handlers/index';


function App() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Router>
      <header>
        <h2>Nombre App</h2>
        {user && (
          <div>
            <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
              ☰
            </button>
            <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
              <li><Link to='/home'>Inicio</Link></li>
              <li><Link to='/transactions'>Transacciones</Link></li>
              <li><Link to='/goals'>Metas financieras</Link></li>
              <li><Link to='/budget'>Mis presupuestos</Link></li>
              <li><Link to='/alerts'>Alertas</Link></li>
              <li>Mi Banco</li>
              <li>Mi perfil</li>
              <li>
                <Link to="/" onClick={() => setUser(null)}>Cerrar sesión</Link>
              </li>
            </ul>
            </div>
        )}

      </header>
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Signin onLogin={setUser} />} />
          <Route path="/home" element={<Dashboard user={user} />} />
          <Route path='/transactions' element={<Transactions user={user} />} />
          <Route path="/goals" element={<Goals user={user} />} />
          <Route path="/budget" element={<Budget user={user} />} />
          <Route path="/alerts" element={<Alerts user={user} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
