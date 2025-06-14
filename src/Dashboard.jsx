import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './api';
import { recommendProducts } from './recommender';

function Dashboard() {
    const [dailySpend, setDailySpend] = useState(0);
    const [dailySpendPerHour, setDailySpendPerHour] = useState(0);
    const [spentPercentage, setSpentPercentage] = useState(0);
    const [savingGoal, setSavingGoal] = useState(null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [recommendations, setRecommendations] = useState([]);

    const fetchData = async () => {
        try {
            // obtener gasto diario
            const dailyResponse = await axios.get(`${API_URL}/transactions/daily/${user.id}`);
            setDailySpend(dailyResponse.data.total);
            calculateDailySpendPerHour(dailyResponse.data.total, dailyResponse.data.startOfDay);

            // barra saldo
            const percent = (user.spent / (user.balance)) * 100;
            setSpentPercentage(percent);

            // Transacciones
            const txRes = await axios.get(`${API_URL}/transactions/history/${user.id}`);
            const transactions = txRes.data || [];
            console.log('transacciones:',transactions);

             // Obtener datos actualizados del usuario
            const userResponse = await axios.get(`${API_URL}/users/${user.id}`);
            const updatedUser = userResponse.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('Usuario actualizado: ', updatedUser);
            const recs = recommendProducts(user, transactions);
            setRecommendations(recs);
            
        } catch (error) {
            console.error('Error al obtener el gasto diario:', error);
        }
        try {
            // obtener meta actual
            const savingGoal = await axios.get(`${API_URL}/savinggoals/${user.id}`);
            setSavingGoal(savingGoal.data[0]?.targetAmount || 0);
        } catch (error) {
            console.error('Error al obtener meta mensual:', error);
        }

    };
    // obtener datos del backend
    useEffect(() => {
        fetchData();
    }, [user.id]);

    // escuchar evento transactionCreated para actualizar el dashboard
    useEffect(() => {
        window.addEventListener('transactionCreated', fetchData);
        return () => {
            window.removeEventListener('transactionCreated', fetchData);
        };
    }, []);

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
                <div className="balance-details">
                    <div className="info-row">
                        <h4>Saldo Actual</h4>
                        <span className="value">${user.balance}</span>
                        <div className="info-row">
                            <h4>Gastado</h4>
                            <span className="value">${user.spent}</span>
                        </div>
                        {spentPercentage > 0 && spentPercentage < 100 ? (
                        <div>
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
                        ) : (
                            <div>
                                <p>Has gastado más de lo que tienes.</p>
                            </div>
                        )}
                       
                    </div>
                </div>
            </div >
            <div className='card'>
                <h4>Meta de Ahorro</h4>
                {savingGoal ? (
                    <span className="goal">
                        <strong> ${savingGoal} </strong>
                    </span>
                ) : (
                    <p className="no-goal">Aún no tienes una meta de ahorro.</p>
                )}
            </div>
            <div className='card'>
    <h4>Recomendación de Productos del Banco</h4>
    {recommendations.length === 0 ? (
        <p>No hay recomendaciones por ahora.</p>
    ) : (
        <div className="recommendations-grid">
            {recommendations.map((rec, i) => (
                <div className="recommendation-card" key={i}>
                    <h5>{rec.title}</h5>
                    <p>{rec.description}</p>
                    {rec.link && (
                        <a href={rec.link} target="_blank" rel="noopener noreferrer">Ver más</a>
                    )}
                </div>
            ))}
        </div>
    )}
</div>
        </div >

    );
}
export default Dashboard;
