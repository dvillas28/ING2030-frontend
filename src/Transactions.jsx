import PublicGoogleSheetsParser from 'public-google-sheets-parser';
import { useState, useEffect } from 'react';
import API_URL from './api';
import axios from 'axios';

function Transactions({ user }) {

    const [transactions, setTransac] = useState([]);
    const [excel, setExcel] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);

    useEffect(() => {
        const loadExcel = async () => {
            try {
                const parser = new PublicGoogleSheetsParser('1LHrW5rWxMevVtGhdjNU56j_tk_wCzszYP5w2Beg-q0s')
                const data = await parser.parse();
                setExcel(data);
                // console.log(data);
            } catch (error) {
                console.log(error);
            }

        };

        loadExcel();

    }, []);



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

    const chooseRandomEntry = () => {
        if (excel.length > 0) {
            const randomIndex = Math.floor(Math.random() * excel.length);
            const entry = excel[randomIndex];
            console.log('Entrada seleccionada:', entry);
            setSelectedEntry(entry);
            createTransaction(entry);
        } else {
            alert("El excel no contiene datos o no ha sido cargado");
        }
    }

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
                setTransac((prev) => [...prev, newTransaction]);
            }
        } catch (error) {

            // alert("Error al crear la transaccion");
            console.log(error);
        }
    };

    return (
        <div className="transactions-container">
            <h2>Historial de Transacciones</h2>
            {/* <button className="button" onClick={chooseRandomEntry}>Elegir Entrada Aleatoria</button> */}
            {/* {selectedEntry && (
                <div className="selected-entry">
                    <h3>Entrada Seleccionada</h3>
                    <pre>{JSON.stringify(selectedEntry, null, 2)}</pre>
                </div>
            )} */}
            <button className="button" onClick={chooseRandomEntry}>Elegir Entrada Aleatoria</button>
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