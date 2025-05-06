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
import addNotification from 'react-push-notification';


function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
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

  // elejir una entrada de transaccion random
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

  // procesamiento de la transaccion
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


        // crear alerta y notificacion en si se necesita

        // LOGICA DE ENVIO DE ALERTAS
        // Por ahora solamente tenemos alertas de cargos
        if (newTransaction.type === 'cargo') {

          // Alerta 1: revisar si se sobrepaso el presupuesto
          await checkBudgetUsage(newTransaction);

          // Alerta 2: estado de meta a fin de mes

          // Ejemplo de envio de alerta:
          // await sendAlert(`Se ha recibido una nueva transaccion - ${newTransaction.category}: ${newTransaction.description}`);
        }



        // Actualizar vistas pertinentes frente a una nueva transaccion. Aun quedan algunas pendientes...
        // Transaction  : Se actualiza OK
        // Alerts       : Se actualiza OK
        // Dashboard    : Los presupuestos se actualizan OK, pero la parte de Saldo aun no, revisar y arreglar
        // Goals        : No se actualiza ya que aun no se implementa. 
        window.dispatchEvent(new Event('transactionCreated'));
      }
    } catch (error) {
      // alert("Error al crear la transaccion");
      console.log(error);
    }
  };

  const calculateUsage = (spentAmount, limitAmount) => {
    if (!limitAmount || limitAmount === 0) return 0;
    const percentage = (spentAmount / limitAmount) * 100;
    return Math.min(percentage.toFixed(2), 100);
  };

  const checkBudgetUsage = async (transaction) => {
    const category = transaction.category;
    let text;
    try {

      // buscar si existe un presupuesto asociado a esta transaccion
      // por ahora, no se maneja el caso en que hayan dos presupuestos con la misma categoria
      const response = await axios.get(`${API_URL}/budgets/${user.id}/${category}`);

      // if yes: ver el estado del budget
      if (response.status === 200) {
        console.log("Presupuesto encontrado");

        const budget = response.data;
        console.log(budget)

        const usage = calculateUsage(budget.spentAmount, budget.limitAmount);
        console.log(`usage = ${usage}`);

        // mandar alertas dependiendo del usage
        if (usage > 99) {
          // envio de alerta!
          text = `Atencion! Has sobrepasado tu presupuesto: "${category}"`;
        }

        else if (usage > 85) {
          text = `Atencion! Estas muy cerca de sobrepasar tu presupuesto: "${category}"`;
        }

        else {
          text = `Se ha recibido una nueva transaccion - ${category}: ${transaction.description}`;
        }

      }

    } catch (error) {
      console.log(error);

      // si no existe: mandar alerta de transaccion no considerada en el presupuesto
      if (error.response?.status === 404) {
        console.log("No existe presupuesto asociado a esta transaccion");
        text = `Se ha recibido una nueva transaccion no categorizada - ${transaction.category}: ${transaction.description}`;
      }

    } finally {
      // envio de la alerta
      await sendAlert(text);

      // notificacion push
      addNotification({
        title: text,
        native: true,
      });

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

  const handleUser = () => {
    const userFromStorage = JSON.parse(localStorage.getItem('user'));
    setUser(userFromStorage);
    console.log(userFromStorage);
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <header>
        {/* Adornar el titulo una vez hayamos elejido un nombre */}
        {/* El link se puede hacer mas bonito creo */}
        {user ? (
          <h2><Link to='/home'>Nombre App</Link></h2>
        ) : (
          <h2>Nombre App</h2>
        )}
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
                <Link to="/" onClick={() => handleLogout()}>Cerrar sesión</Link>
              </li>
            </ul>
          </div>
        )}

      </header>
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Login onHandleUser={handleUser} />} />
          <Route path="/register" element={<Signin onHandleUser={handleUser} />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path='/transactions' element={<Transactions />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
