import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ user }) {
    const [dailySpend, setDailySpend] = useState(0);
    const [weeklyGoal, setWeeklyGoal] = useState(null);
    const [weeklySpend, setWeeklySpend] = useState(0);
    const [monthlyGoal, setMonthlyGoal] = useState(null);
    const [monthlySpend, setMonthlySpend] = useState(0);
    const [weeklyProgress, setWeeklyProgress] = useState(0);
    const [monthlyProgress, setMonthlyProgress] = useState(0);
    const [dailySpendPerHour, setDailySpendPerHour] = useState(0);

    // obtener datos del backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // obtener gasto diario
                const dailyResponse = await axios.get(`http://localhost:3000/daily/${user.id}`);
                setDailySpend(dailyResponse.data.total);

                // obtener metas
                const goalsResponse = await axios.get(`http://localhost:3000/goals/${user.id}`);
                
                if (goalsResponse.data.weekly) {
                    setWeeklyGoal(goalsResponse.data.weekly.limitAmount);
                    setWeeklyProgress(goalsResponse.data.weekly.progress);
                    setWeeklySpend(goalsResponse.data.weekly.spentAmount)
                }

                if (goalsResponse.data.monthly) {
                    setMonthlyGoal(goalsResponse.data.monthly.limitAmount);
                    setMonthlyProgress(goalsResponse.data.monthly.progress);
                    setMonthlySpend(goalsResponse.data.monthly.spentAmount)
                }

                calculateDailySpendPerHour(dailyResponse.data.startOfDay);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData(); 
    }, [[user.id]]);

    // porcentaje de gasto
    const calculateSpendPercentage = (spent, limit) => {
        return limit ? ((spent / limit) * 100).toFixed(2) : 0;
    };

    // tasa de gasto
    const calculateDailySpendPerHour = (timestamp) => {
        const now = new Date();
        const startOfDay = new Date(timestamp);

        // diferencia de horas
        const hoursDifference = (now - startOfDay) / (1000 * 60 * 60);

        const hourlySpend = hoursDifference > 0 ? (dailySpend / hoursDifference).toFixed(2) : 0;
        setDailySpendPerHour(hourlySpend);
    };

    return (
        <div className="dashboard">
            <div className="card">
                <h4>Gasto del día</h4>
                {dailySpend === 0 ? (
                    <p>Aún no has realizado ningún gasto hoy.</p>
                ) : (
                    <p>Has gastado {dailySpend} hoy.</p>
                )}
                <p>Estás gastando ${dailySpendPerHour} por hora.</p>
            </div>
            <div className="card">
                <h4>Progreso Semanal</h4>
                {weeklyGoal ? (
                    <div>
                        <p>Has gastado {weeklySpend} de {weeklyGoal} esta semana.</p>
                        <p>Progreso semanal: {weeklyProgress}%</p>
                    </div>
                ) : (
                    <p className="message">Aún no has establecido una meta semanal.</p>
                )}
            </div>
            <div className="card">
                <h4>Progreso Mensual</h4>
                {monthlyGoal ? (
                    <div>
                        <p>Has gastado {monthlySpend} de {monthlyGoal} esta semana.</p>
                        <p>Progreso semanal: {monthlyProgress}%</p>
                    </div>
                ) : (
                    <p className="message">Aún no has establecido una meta semanal.</p>
                )}
            </div>
        </div>
    );
}
export default Dashboard;
