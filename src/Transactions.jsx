import { useState, useEffect } from 'react';
import API_URL from './api';
import axios from 'axios';
import TransactionsChart from './Chart';

function Transactions() {

    const [transactions, setTransac] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState(''); // NUEVO
    const [newCategoryKeyword, setNewCategoryKeyword] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryNames, setNewCategoryNames] = useState({});
    const user = JSON.parse(localStorage.getItem('user'));
    const [categorias, setCategorias] = useState(() => {
        const local = localStorage.getItem('categorias');
        return local ? JSON.parse(local) : [];
    });

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

    // Función para añadir keyword a la categoría
    const addKeywordToCategory = async (transaction) => {
        const category = newCategoryNames[transaction.id];

        if (!category) return alert("Debes añadir una categoría");

        const lowerKeyword = transaction.description.trim().split(' ')[0].toLowerCase();
        const updatedCategorias = [...categorias];
        const match = updatedCategorias.find(c => c.categoria === category);
        if (match) {
            if (!match.keywords.includes(lowerKeyword)) {
                match.keywords.push(lowerKeyword);
            }
        } else {
            updatedCategorias.push({ categoria: category, keywords: [lowerKeyword] });
        }

        setCategorias(updatedCategorias);
        localStorage.setItem('categorias', JSON.stringify(updatedCategorias));

        try {
            await axios.put(`${API_URL}/transactions/${transaction.id}`, {
                category: category
            });
            console.log('Categoría actualizada en la BDD');
        } catch (error) {
            console.error('Error actualizando en la BDD:', error);
        }
        setNewCategoryNames((prev) => ({ ...prev, [transaction.id]: '' }));

        window.dispatchEvent(new Event('categoriasActualizadas'));
        window.dispatchEvent(new Event('transactionUpdated'));
    };

    useEffect(() => {
        const refreshTransactions = () => {
            getTransaction();
        };

        window.addEventListener('transactionUpdated', refreshTransactions);
        return () => window.removeEventListener('transactionUpdated', refreshTransactions);
    }, []);

    useEffect(() => {
        const actualizarCategorias = () => {
            const newCats = JSON.parse(localStorage.getItem('categorias') || '[]');
            setCategorias(newCats);
        };

        window.addEventListener('categoriasActualizadas', actualizarCategorias);
        return () => window.removeEventListener('categoriasActualizadas', actualizarCategorias);
    }, []);
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
                                <td>
                                    {transaction.category && transaction.category !== 'Otros' ? (
                                        transaction.category
                                    ) : (
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Nueva categoría"
                                                value={newCategoryNames[transaction.id] || ''}
                                                onChange={(e) =>
                                                    setNewCategoryNames({ ...newCategoryNames, [transaction.id]: e.target.value })
                                                }
                                                style={{ width: '100px', marginRight: '5px' }}
                                            />
                                            <button onClick={() => addKeywordToCategory(transaction)}>Guardar</button>
                                        </div>
                                    )}
                                </td>
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
