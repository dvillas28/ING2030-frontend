import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


function Budget({ user }) {

    const [budget, setBudget] = useState(null);
    const [limitAmount, setLimitAmount] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [expensesData, setExpensesData] = useState([]);

    useEffect(() => {
        const fetchBudgetData = async () => {
            try {
                // obtener presupuesto
                const budgetRes = await axios.get(`http://localhost:3000/dashboard/budget/${user.id}`);
                setBudget(budgetRes.data);
                setLimitAmount(budgetRes.data.limitAmount);

                // obtener gastos para grafico
                //const expensesRes = await axios.get(`http://localhost:3000/budget/expenses/${user.id}`);
                //setExpensesData(expensesRes.data);
            } catch (err) {
                console.error('Error obteniendo datos:', err);
            }
        };

        fetchBudgetData();
    }, [user.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // actualizar / subir presupuesto
            const BudgetRes = await axios.post(`http://localhost:3000/budget`, {
                userId: user.id,
                period: "monthly",
                limitAmount
            });
            setBudget(BudgetRes.data);

        } catch (err) {
            console.error('Error al guardar presupuesto:', err);
        }
    };

    const generateChartData = () => {
        // generar grafico de gastos
    }

    return (
        <div className="budget-container">
            <div className="budget-section">
                <h2>Progreso Financiero</h2>
                {budget ? (
                    <p className="current-budget">Presupuesto actual: <strong>${budget.limitAmount}</strong></p>
                ) : (
                    <p className="no-budget">Aún no tienes un presupuesto. <strong>¡Ingresa uno!</strong></p>
                )}
                <form onSubmit={handleSubmit} className="budget-form">
                    <label htmlFor="budget-input">Añadir / Actualizar presupuesto:</label>
                    <input
                        id="budget-input"
                        type="number"
                        value={limitAmount}
                        onChange={(e) => setLimitAmount(e.target.value)}
                        required
                        className="budget-input"
                        placeholder="Ej: 500000"
                    />
                    <button type="submit" className="submit-btn">Guardar</button>
                </form>
                <div className="chart-section">
                    {/* Aquí irá el gráfico */}
                    <div className="chart-placeholder">[ Gráfico de gastos mensuales ]</div>
                </div>
            </div>
        </div>
    )
}

export default Budget;