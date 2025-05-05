import './App.css';
import { useState, useEffect } from 'react';
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
import PublicGoogleSheetsParser from 'public-google-sheets-parser';
import axios from 'axios';
import API_URL from './api';
// import addNotification from 'react-push-notification';


function App() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [excel, setExcel] = useState([]);

  // cargar el excel al cargar la página
  useEffect(() => {
    const loadExcel = async () => {
      try {
        // TODO: mover el id del sheet a una variable de entorno
        const parser = new PublicGoogleSheetsParser('1LHrW5rWxMevVtGhdjNU56j_tk_wCzszYP5w2Beg-q0s')
        const data = await parser.parse();
        setExcel(data);
        console.log(data);
      } catch (error) {
        console.log(error);
      }

    };

    loadExcel();

  }, []);

  // elejir entrada transaccion random
  // TODO: hacerlo secuencial con un contador_id
  const chooseRandomEntry = () => {
    if (excel.length > 0) {
      const randomIndex = Math.floor(Math.random() * excel.length);
      const entry = excel[randomIndex];
      console.log('Entrada seleccionada:', entry);
      createTransaction(entry);
    } else {
      alert("El excel no contiene datos o no ha sido cargado");
    }
  };

  const createTransaction = async (entry) => {

    try {
      const response = await axios.post(`${API_URL}/transactions/${user.id}`,
        {
          entry,
        },
      );

      if (response.status === 201) {
        console.log("Transaccion creada exitosamente");
        const newTransaction = response.data.newTransaction;

        // TODO: procesar la transaccion

        // crear alerta y notificacion en si se necesita

        // LOGICA DE ENVIO DE ALERTAS
        // Alerta 1: revisar si se sobrepaso el presupuesto
        // Alerta 2: estado de meta a fin de mes

        // Ejemplo de envio de alerta:
        // await sendAlert(`Se ha recibido una nueva transaccion - ${newTransaction.category}: ${newTransaction.description}`);



        // Actualizar vistas pertinentes frente a una nueva transaccion. Aun quedan algunas pendientes...
        // Transaction  : Se actualiza OK
        // Alerts       : Se actualiza OK
        // Dashboard    : Los presupuestos se actualizan OK, pero la parte de Saldo aun no, revisar y arreglar
        // Goals        : No se actualiza ya que aun no se implementa. 
        window.dispatchEvent(new Event('transactionCreated'));

        /* 
          notificacion push de la transaccion
          descomentar si decidimos usar notificaciones push
        */

        // addNotification({

        //   title: `Se ha recibido una nueva transaccion - ${newTransaction.category}: ${newTransaction.description}`,
        //   native: true,

        // })


      }
    } catch (error) {
      // alert("Error al crear la transaccion");
      console.log(error);
    }
  };


  const sendAlert = async (message) => {
    console.log(message);

    // Crear la alerta
    try {
      const response = await axios.post(`${API_URL}/alerts/${user.id}`,
        {
          message: message,
          date: new Date(),
          type: "what",
          isRead: false,
        }
      )

      if (response.status === 201) {
        const data = response.data;
        console.log(data.message);
        const newAlert = data.newAlert;
      }

    } catch (error) {
      console.log(error);
    }
  };


  return (
    <Router>
      <header>
        {/* Adornar el titulo una vez hayamos elejido un nombre */}
        <h2><Link to='/home'>Nombre App</Link></h2>
        <button className="button" onClick={chooseRandomEntry}>Elegir Entrada Aleatoria</button>
        {/* <button className="button" onClick={buttonOnClick}>Push</button> */}
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
