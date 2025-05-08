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
  const [excelPointer, setExcelPointer] = useState(0);
  const [savingGoal, setSavingGoal] = useState(null);
  const [loss, setLoss] = useState(null);


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

  // Elejir entrada de manera random
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

  // Elejir entrada de forma secuencial
  const chooseNextEntry = () => {
    if (excel.length > 0) {
      const entry = excel[excelPointer];
      console.log('Entrada seleccionada:', entry);
      createTransaction(entry);
      setExcelPointer((prevValue) => (prevValue + 1) % excel.length);
    } else {
      alert("El excel no contiene datos o no ha sido cargado");
    }
  };

  // Tomar transacciones cada 10 segundos
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (user && excel.length > 0) {
  //       chooseNextEntry();
  //     }
  //   }, 5000); // 5 segundos
  //   return () => clearInterval(intervalId);
  // }, [user, excel.length]);

  // procesamiento de la transaccion
  const createTransaction = async (entry) => {

    try {
      const response = await axios.post(`${API_URL}/transactions/${user.id}`,
        {
          entry,
        },
      );

      if (response.status === 201) {
        console.log("Transacción creada exitosamente");
        const newTransaction = response.data.newTransaction;


        // crear alerta y notificacion en si se necesita

        // LOGICA DE ENVIO DE ALERTAS
        if (newTransaction.type === 'cargo') {

          // Alerta 1: revisar si se sobrepaso el presupuesto
          await checkBudgetUsage(newTransaction);

          // Alerta 2: estado de meta a fin de mes
          await checkSavingGoal(user);

          // Ejemplo de envio de alerta:
          // await sendAlert(`Se ha recibido una nueva transaccion - ${newTransaction.category}: ${newTransaction.description}`);
        }

        else if (newTransaction.type === 'deposito') {
          let msg = `Se ha recibido un nuevo deposito - ${newTransaction.category}: ${newTransaction.description}`
          await sendAlert(msg);

          // notificacion push
          addNotification({
            title: msg,
            native: true,
          });
        }



        // Actualizar vistas pertinentes frente a una nueva transaccion. Aun quedan algunas pendientes...
        // Transaction  : Se actualiza OK
        // Alerts       : Se actualiza OK
        // Dashboard    : Los presupuestos se actualizan OK, pero la parte de Saldo aun no, revisar y arreglar
        // Goals        : No se actualiza ya que aun no se implementa. 

        // Actualizar los datos del usuario
        const userResponse = await axios.get(`${API_URL}/users/${user.id}`);
        const updatedUser = userResponse.data;
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Actualizar localStorage

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
          text = `¡Atención! Has sobrepasado tu presupuesto: "${category}"`;
        }

        else if (usage > 85) {
          text = `¡Atención! Estás muy cerca de sobrepasar tu presupuesto: "${category}"`;
        }

        else {
          text = `Se ha recibido una nueva transacción - ${category}: ${transaction.description}`;
        }

      }

    } catch (error) {
      console.log(error);

      // si no existe: mandar alerta de transaccion no considerada en el presupuesto
      if (error.response?.status === 404) {
        console.log("No existe presupuesto asociado a esta transacción");
        text = `Se ha recibido una nueva transacción no categorizada - ${transaction.category}: ${transaction.description}`;
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

  const checkSavingGoal = async (user) => {
    let text;
    try {
      // obtener meta actual
      const savingGoal = await axios.get(`${API_URL}/savinggoals/${user.id}`);
      setSavingGoal(savingGoal.data[0]?.targetAmount || 0);
    } catch (error) {
      console.error('Error al obtener meta mensual:', error);
    }
    try {
      const remainingBalance = user.balance - user.spent;
      console.log(remainingBalance, savingGoal);
      // Condición 1: Si el balance restante es mayor o igual a la meta de ahorro
      if (remainingBalance >= savingGoal) {
        text = `¡Vamos! Vas bien para tu meta de ahorro.`;

        // Condición 2: Si es el último día del mes y se cumplió la meta de ahorro
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        if (today.getDate() === lastDayOfMonth) {
          text = '¡Felicidades! Cumpliste tu meta de ahorro';
        }
      }
      // Condición 3: Si el balance restante es menor que la meta de ahorro
      else {
        const loss = savingGoal - remainingBalance;
        setLoss(loss); // Actualiza el estado
        text = `¡Lo lamento! Te pasaste ${loss} de tu meta de ahorro.`;
      }

      // Enviar alerta
      await sendAlert(text);

      // Notificación push
      addNotification({
        title: text,
        native: true,
      });
    } catch (error) {
      console.log("Error al verificar la meta de ahorro:", error);
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
        {/* Adornar el titulo una vez hayamos elegido un nombre */}
        {/* El link se puede hacer mas bonito creo */}
        {user ? (
          <h2><Link to='/home'> 💸 </Link></h2>
        ) : (
          <h2> 💸 </h2>
        )}
        <button className="test-button" onClick={chooseNextEntry}>Actualizar Movimientos</button>
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
