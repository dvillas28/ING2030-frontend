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
                const budgetRes = await axios.get(`https://ing2030-backend.onrender.com/dashboard/budget/${user.id}`);
                setBudget(budgetRes.data);
                setLimitAmount(budgetRes.data.limitAmount);

                // obtener gastos para grafico del mes
                const today = new Date();
                const month = today.getMonth() + 1;
                const year = today.getFullYear();

                const expensesRes = await axios.get(`https://ing2030-backend.onrender.com/budget/${user.id}`, {
                    params: { month, year }
                });
                setExpensesData(expensesRes.data);
                console.log('Gastos recibidos:', expensesRes.data);
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
            const BudgetRes = await axios.post(`https://ing2030-backend.onrender.com/budget`, {
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
        if (expensesData.length === 0) {
            return {
                labels: ['No hay datos'],
                datasets: [
                    {
                        label: 'Gastos diarios',
                        data: [0],
                        fill: false,
                        backgroundColor: 'rgba(99, 255, 195, 0.6)',
                        borderColor: 'rgb(90, 172, 141)',
                        tension: 0.2
                    }
                ]
            };
        }

        const labels = expensesData.map(tx => new Date(tx.date).toLocaleDateString('es-CL'));
        const data = expensesData.map(tx => tx.total);

        console.log('Datos generados para el gráfico:', { labels, data });

        return {
            labels,
            datasets: [
                {
                    label: 'Gastos diarios',
                    data,
                    fill: false,
                    backgroundColor: 'rgba(99, 255, 195, 0.6)',
                    borderColor: 'rgb(90, 172, 141)',
                    tension: 0.2
                }
            ]
        };
    };


    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 2000,
                    callback: function (value) {
                        return `$${value}`;
                    }
                },
                grid: {
                    drawBorder: true,
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 0
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Gasto: $${context.parsed.y}`
                }
            }
        }
    };


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
                    {expensesData.length > 0 ? (
                        <Line data={generateChartData()} options={chartOptions} />

                    ) : (
                        <p>No hay movimientos este mes.</p>
                    )}

                </div>
            </div>
        </div>
    )
}

export default Budget;