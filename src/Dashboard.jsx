import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './api';

function Dashboard({ user }) {
    const [dailySpend, setDailySpend] = useState(0);
    const [dailySpendPerHour, setDailySpendPerHour] = useState(0);

    const [budget, setBudget] = useState(0);

    // obtener datos del backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // obtener gasto diario
                const dailyResponse = await axios.get(`${API_URL}/dashboard/daily/${user.id}`);
                setDailySpend(dailyResponse.data.total);
                console.log('Respuesta de gasto diario:', dailyResponse.data);
                calculateDailySpendPerHour(dailyResponse.data.total, dailyResponse.data.startOfDay);
            } catch (error) {
                console.error('Error al obtener el gasto diario:', error);
            }
            // obtener presupuesto
            try {
                const budgetResponse = await axios.get(`${API_URL}/dashboard/budget/${user.id}`);
                setBudget(budgetResponse.data);
            } catch (error) {
                console.error('Error al obtener el presupuesto:', error);
            }
        };

        fetchData();
    }, [user.id]);

    const budgetUsagePercentage = budget ? Math.min((budget.spentAmount / budget.limitAmount) * 100, 100) : 0;

    // tasa de gasto
    const calculateDailySpendPerHour = (spend, startTimestamp) => {
        const now = new Date();
        const startOfDayUTC = new Date(startTimestamp);

        // Convertir UTC a hora local
        const startOfDayLocal = new Date(
            startOfDayUTC.getUTCFullYear(),
            startOfDayUTC.getUTCMonth(),
            startOfDayUTC.getUTCDate(),
            0, 0, 0, 0
        );

        const hoursDifference = (now - startOfDayLocal) / (1000 * 60 * 60);
        const hourlySpend = hoursDifference > 0 ? (spend / hoursDifference).toFixed(2) : 0;

        console.log("Horas transcurridas:", hoursDifference);
        console.log("Tasa por hora:", hourlySpend);

        setDailySpendPerHour(hourlySpend);
    };

    return (
        <div className="dashboard">
            <div className="card daily-spend">
                <h4>Gasto del día</h4>
                {dailySpend === 0 ? (
                    <p>Aún no has realizado ningún gasto hoy.</p>
                ) : (
                    <div className="spend-details">
                        <div className="main-amount">
                            <span className="label">Total hoy:</span>
                            <span className="amount">${dailySpend}</span>
                        </div>
                        <div className="per-hour">
                            <span className="label">Tasa por hora:</span>
                            <span className="value">${(dailySpendPerHour * 1).toFixed(0)} /h</span>
                        </div>
                        <div className="projection">
                            <span className="label">Proyección semanal:</span>
                            <span className="value">${(dailySpend * 7).toFixed(0)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <h4>Presupuesto</h4>
                {budget == 0 ? (
                    <p>Aún no has establecido un presupuesto.</p>
                ) : (
                    <div>
                        <p>${budget.spentAmount} de ${budget.limitAmount} gastado</p>
                        <div style={{
                            backgroundColor: '#eee',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            height: '20px',
                            marginTop: '10px'
                        }}>
                            <div style={{
                                width: `${budgetUsagePercentage}%`,
                                backgroundColor: budgetUsagePercentage > 90 ? 'red' : '#4caf50',
                                height: '100%',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                        <p>{budgetUsagePercentage.toFixed(0)}% del presupuesto usado</p>
                    </div>
                )}
            </div>
            <div className="card">
                <h4>Meta de Ahorro</h4>
                <p className="message">Aún no has establecido una meta de ahorro.</p>
            </div>
        </div>
    );
}
export default Dashboard;
