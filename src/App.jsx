import './App.css';
import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null);


  return (
    <>
      <header>
        <h2>Nombre App</h2>
        <button className="hamburger-btn">&#9776;</button>
      </header>
      <main className="main-container">
        {user ? (
          <Dashboard user={user} />
        ) : (
          <Login onLogin={setUser} />
        )}
      </main>
    </>
  )
}

export default App
