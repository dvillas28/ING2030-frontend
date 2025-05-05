import { useState, useEffect } from 'react';
import API_URL from './api';
import axios from 'axios';

function Transactions({ user }) {

    const [transactions, setTransac] = useState([]);

    useEffect(() => {
        const getTransaction = async (e) => {
            try {
                const response = await axios.get(`${API_URL}/transactions/history/${user.id}`);

                if (response.status === 200) {
                    const data = response.data;
                    // console.log(data);
                    setTransac(data);

                }
            } catch (error) {
                if (error.response?.status === 500) {
                    console.log("Error en el servidor");
                }
            }
        }

        getTransaction();

    }, [user.id]);


    return (
        <div className="transactions-container">
            <h2>Historial de Transacciones</h2>
            {/* <button className="button" onClick={chooseRandomEntry}>Elegir Entrada Aleatoria</button> */}
            {transactions.length > 0 ? (
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr key={index}>
                                <td>{new Date(transaction.date).toLocaleDateString('es-CL')}</td>
                                <td>{transaction.description}</td>
                                <td>${transaction.amount.toLocaleString('es-CL')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay transacciones disponibles.</p>
            )}
        </div>
    );
}

export default Transactions;