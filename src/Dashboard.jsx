import { useState } from 'react';

function Dashboard({ user }) {
    const [dailyGoal, setDailyGoal] = useState(null);
    const [dailySpend, setDailySpend] = useState(0);
    const [weeklyGoal, setWeeklyGoal] = useState(null);
    const [weeklySpend, setWeeklySpend] = useState(0);

    return (
        <div className="dashboard">
            <div className="card">
                <h4>Gasto del día</h4>
                {dailySpend === 0 ? (
                    <p>Aún no has realizado ningún gasto hoy.</p>
                ) : (
                    <p>Has gastado {dailySpend} hoy.</p>
                )}
            </div>
            <div className="card">
                <h4>Tasa de gasto actual</h4>
                {dailyGoal ? (
                    <p>Tu tasa de gasto es {dailySpend}%</p>
                ) : (
                    <p>Aún no has establecido una meta diaria.</p>
                )}
            </div>
            <div className="card">
                <h4>Progreso Semanal</h4>
                {weeklyGoal ? (
                    <div>
                        <p>Has gastado {weeklySpend} de {weeklyGoal} esta semana.</p>
                    </div>
                ) : (
                    <p className="message">Aún no has establecido una meta semanal.</p>
                )}
            </div>
        </div>
    );
}
export default Dashboard;
