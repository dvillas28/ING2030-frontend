import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './api';

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchNotifications = async () => {
        try {
            // ruta get alertas
            const response = await axios.get(`${API_URL}/alerts/${user.id}`);

            if (response.status === 200) {
                setAlerts(response.data);
                console.log(response.data);
            }

        } catch (err) {
            // setError('Hubo un error al cargar las notificaciones');
            console.log(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user.id]);

    // escuchar el evento transactionCreated para actualizar nuevas alertas
    useEffect(() => {
        const refreshNotifications = () => {
            fetchNotifications();
        };

        window.addEventListener('transactionCreated', refreshNotifications);
        return () => {
            window.removeEventListener('transactionCreated', refreshNotifications);
        };
    }, []);

    const markAsRead = async (alertId) => {
        console.log('marcar como leida');
        try {
            // 
            const response = await axios.patch(`${API_URL}/alerts/${alertId}`,
                {
                    isRead: true
                }
            );

            if (response.status === 200) {
                setAlerts(prevAlerts =>
                    prevAlerts.map(alert =>
                        alert.id === alertId ? { ...alert, isRead: true } : alert
                    )
                );
            }

        } catch (error) {
            console.log(error);
        }

    };

    return (
        <div className="alert-notifications">
            <h1 className="alert-header">Buzón de Notificaciones</h1>
            {alerts.length === 0 ? (
                <p>No hay notificaciones</p>
            ) : (
                <ul className="alert-list">
                    {alerts.map((alert) => (
                        <li
                            key={alert.id}
                            onClick={() => !alert.isRead && markAsRead(alert.id)}
                            style={{ cursor: !alert.isRead ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                        >
                            {!alert.isRead && (
                                <span style={{ marginRight: '8px' }}>📩</span>
                            )}
                            {alert.message}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Alerts;