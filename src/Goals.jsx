import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './api';

function Goals({ user }) {
    const [savingGoal, setSavingGoal] = useState(null);
    const [newTargetAmount, setNewTargetAmount] = useState(0);

    // obtener datos del backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // obtener meta actual
                const savingGoal = await axios.get(`${API_URL}/savinggoals/${user.id}`);
                setSavingGoal(savingGoal.data[0]);
                setNewTargetAmount(savingGoal.data[0]?.targetAmount || 0); // Inicializar con el valor actual
                console.log('Respuesta de meta mensual:', savingGoal.data[0]);
            } catch (error) {
                console.error('Error al obtener meta mensual:', error);
            }
        };

        fetchData();
    }, [user.id]);

    // actualizar meta
    const updateTargetAmount = async () => {
        try {
            const response = await axios.patch(`${API_URL}/savinggoals/${user.id}`, {
                targetAmount: newTargetAmount,
            });
            setSavingGoal({ ...savingGoal, targetAmount: newTargetAmount }); // Actualizar visualmente
            console.log('Meta actualizada:', response.data);
        } catch (error) {
            console.error('Error al actualizar meta:', error);
        }
    };

    // Incrementar o decrementar en pasos de 5000
    const incrementAmount = () => {
        setNewTargetAmount((prev) => prev + 5000);
    };

    const decrementAmount = () => {
        setNewTargetAmount((prev) => Math.max(0, prev - 5000));
    };

    return (
        <div className="dashboard">
            <div className="card">
                <h4>Meta de Ahorro</h4>
                <div className="goal-display">
                    {savingGoal ? (
                        <span className="goal">
                            <button className="change-btn" onClick={decrementAmount}> - </button>
                            <strong> ${newTargetAmount} </strong>
                            <button className="change-btn" onClick={incrementAmount}> + </button>
                        </span>
                    ) : (
                        <p className="no-goal">Aún no tienes una meta de ahorro.<strong>¡Define una!</strong></p>
                    )}
                </div>
                <div className="update-goal">
                    <button className="submit-btn" onClick={updateTargetAmount}>Actualizar Meta</button>
                </div>
            </div>
        </div>
    );

}
export default Goals;
