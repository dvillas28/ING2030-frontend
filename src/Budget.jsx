import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './api';


function Budget({ user }) {

    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({ name: '', limitAmount: '', period: '', category: '' });
    const [spentPercentage, setSpentPercentage] = useState(0);


    useEffect(() => {
        const fetchBudgetsData = async () => {
            try {
                // obtener presupuestos
                const budgetRes = await axios.get(`${API_URL}/budgets/${user.id}`);
                setBudgets(budgetRes.data);
                console.log(budgets);
            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    console.log(user.budget)
                    alert(`Error: ${err.response.data.message}`);
                } else {
                    alert('Error desconocido al crear presupuesto');
                }
                console.error('Error al crear presupuesto:', err);
            }
        };

        fetchBudgetsData();
    }, [user.id]);

    //  crear presupuesto
    const handleCreateBudget = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/budgets`, {
                userId: user.id,
                name: newBudget.name,
                limitAmount: Number(newBudget.limitAmount),
                category: newBudget.category,
                period: newBudget.period
            });
            setBudgets([...budgets, res.data]);
            setNewBudget({ name: '', limitAmount: '' });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                console.log(user.budget)
                alert(`${err.response.data.message}`);
            } else {
                alert('Error desconocido al crear presupuesto');
            }
            console.error('Error al crear presupuesto:', err);
        }
    };

    const calculateUsage = (spentAmount, limitAmount) => {
        if (!limitAmount || limitAmount === 0) return 0;
        const percentage = (spentAmount / limitAmount) * 100;
        return Math.min(percentage.toFixed(2), 100);
    };

    return (
        <div className="budget-container">
            <div className='create-budget'>
                <h4>Crear presupuesto</h4>
                <form onSubmit={handleCreateBudget} className="budget-form">
                    <select
                        value={newBudget.category}
                        onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                        className="budget-input"
                        required
                    >
                        <option value="">Selecciona una categoría</option>
                        <option value="Comida">Comida</option>
                        <option value="Transporte">Transporte</option>
                        <option value="Entretenimiento">Entretenimiento</option>
                        <option value="Suscripcion">Suscripción</option>
                    </select>
                    <select
                        value={newBudget.period}
                        onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                        className="budget-input"
                        required
                    >
                        <option value="">Selecciona un periodo</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensual">Mensual</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Límite de gasto"
                        value={newBudget.limitAmount}
                        onChange={(e) => setNewBudget({ ...newBudget, limitAmount: e.target.value })}
                        className="budget-input"
                        required
                    />
                    <button type="submit" className="submit-btn">Crear presupuesto</button>
                </form>
            </div>
            <div className="budget-list">
                {budgets.map((b) => {
                    const usage = calculateUsage(b.spentAmount, b.limitAmount);
                    return (
                        <div key={b.id} className="card">
                            <p>Categoría: {b.category}</p>
                            <p>Limite: ${b.limitAmount}</p>
                            <p>Gastado: ${b.spentAmount}</p>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${usage}%`,
                                        backgroundColor: usage > 85 ? 'orange' : '#4caf50'
                                    }}
                                ></div>
                                <div className="progress-info">
                                    <span>{usage.toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

    )
}

export default Budget;