import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Alerts({ user }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // ruta get alertas
            } catch (err) {
                setError('Hubo un error al cargar las notificaciones');
            }
        };

        fetchNotifications();
    }, [user.id]);

    return(
        <>
        <h1>Buzón de Notificaciones</h1>
        <div className="alert-container">
            
            {notifications.length === 0 ? (
                <p>No hay notificaciones</p>
            ) : (
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={index}>{notification.message}</li> 
                    ))}
                </ul>
            )}
        </div>
        </>
        
    )
}

export default Alerts;