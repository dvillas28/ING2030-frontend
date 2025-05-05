import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './api';

function Dashboard({ user }) {
    const [dailySpend, setDailySpend] = useState(0);
    const [dailySpendPerHour, setDailySpendPerHour] = useState(0);


    const [spentPercentage, setSpentPercentage] = useState(0);


    const [savingGoal, setSavingGoal] = useState(null);
    const [budget, setBudget] = useState(0);

    // obtener datos del backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // obtener gasto diario
                const dailyResponse = await axios.get(`http://localhost:3000/transactions/daily/${user.id}`);
                setDailySpend(dailyResponse.data.total);

                calculateDailySpendPerHour(dailyResponse.data.total, dailyResponse.data.startOfDay);
                const percent = (user.spent / (user.spent + user.balance)) * 100;
                setSpentPercentage(percent);
            } catch (error) {
                console.error('Error al obtener el gasto diario:', error);
            }

        };

        fetchData();
    }, [user.id]);

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
                            <span className="label">Total hoy</span>
                            <span className="amount">${dailySpend}</span>
                        </div>
                        <div className="per-hour">
                            <span className="label">Tasa por hora</span>
                            <span className="value">${(dailySpendPerHour * 1).toFixed(0)} /h</span>
                        </div>
                        <div className="projection">
                            <span className="label">Proyección semanal</span>
                            <span className="value">${(dailySpend * 7).toFixed(0)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="card card-balance">
                <h4>Saldo</h4>
                <div className="balance-details">
                    <div className="info-row">
                        <span className="value">${user.balance}</span>

                    <div className="info-row">
                        <span className="label">Gastado</span>
                        <span className="value">${user.spent}</span>
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${spentPercentage}%` }}
                        />
                    </div>
                    <div className="progress-info">
                        <span>{spentPercentage.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
            <div className="card">
                <h4>Meta de Ahorro</h4>
                {savingGoal ? (
                    <span className="goal">
                        <strong> ${savingGoal} </strong>
                    </span>
                ) : (
                    <p className="no-goal">Aún no tienes una meta de ahorro.</p>
                )}
            </div>
        </div >
        </div >
    );
}
export default Dashboard;
