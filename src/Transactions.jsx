import { useState, useEffect } from 'react';
import API_URL from './api';
import axios from 'axios';

function Transactions() {

    const [transactions, setTransac] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState(''); // NUEVO
    const user = JSON.parse(localStorage.getItem('user'));

    const getTransaction = async () => {
        try {
            const response = await axios.get(`${API_URL}/transactions/history/${user.id}`);
            if (response.status === 200) {
                setTransac(response.data);
            }
        } catch (error) {
            if (error.response?.status === 500) {
                console.log("Error en el servidor");
            }
        }
    };

    useEffect(() => {
        getTransaction();
    }, [user.id]);

    useEffect(() => {
        const refreshTransactions = () => {
            getTransaction();
        };
        window.addEventListener('transactionCreated', refreshTransactions);
        return () => {
            window.removeEventListener('transactionCreated', refreshTransactions);
        };
    }, []);

    const filteredTransactions = categoryFilter
        ? transactions.filter(t => t.category === categoryFilter)
        : transactions;

    // Obtenemos las categorías únicas
    const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))];

    return (
        <div className="transactions-container">
            <h2>Historial de Transacciones</h2>

            <div className="filter-container">
                <label htmlFor="category-filter">Filtrar por Categoría:</label>
                <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="category-filter"
                >
                    <option value="">Todas</option>
                    {uniqueCategories.map((cat, i) => (
                        <option key={i} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {filteredTransactions.length > 0 ? (
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((transaction, index) => (
                            <tr key={index}>
                                <td>{new Date(transaction.date).toLocaleDateString('es-CL')}</td>
                                <td>{transaction.description || 'Sin descripción'}</td>
                                <td>{transaction.category || 'Sin categoría'}</td>
                                <td>
                                    {transaction.amount != null
                                        ? `$${Number(transaction.amount).toLocaleString('es-CL')}`
                                        : 'Sin monto'}
                                </td>
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
