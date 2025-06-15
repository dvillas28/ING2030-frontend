import { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import API_URL from './api';
import axios from 'axios';

Chart.register(...registerables);

function TransactionsChart() {
    const [transactions, setTransac] = useState([]);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const getTransaction = async () => {
        try {
            const response = await axios.get(`${API_URL}/transactions/history/${user.id}`);
            if (response.status === 200) {
                setTransac(response.data);
            }
        } catch (error) {
            if (error.response?.status === 500) {
                console.log("Error en el servidor");
            }
        }
    };

    useEffect(() => {
        getTransaction();
    }, [user.id]);

    useEffect(() => {
        const refreshTransactions = () => {
            getTransaction();
        };
        window.addEventListener('transactionCreated', refreshTransactions);
        return () => {
            window.removeEventListener('transactionCreated', refreshTransactions);
        };
    }, []);

    // Filtrar y agrupar solo "cargos"
    const totalsByCategory = transactions.reduce((acc, t) => {
        if (!t.category || t.type !== 'cargo') return acc;
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
    }, {});

    const labels = Object.keys(totalsByCategory);
    const dataValues = Object.values(totalsByCategory);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        if (labels.length === 0) return;

        const ctx = chartRef.current.getContext('2d');

        chartInstance.current = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: [
                        '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#333',
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                return `$${value.toLocaleString('es-CL')}`;
                            }
                        }
                    }
                }
            }
        });
    }, [labels.join(','), dataValues.join(',')]);

    return (
        <div className="chart-container" style={{ maxWidth: '500px', margin: '40px auto' }}>
            <h2 style={{ textAlign: 'center' }}>Distribución de Gastos</h2>
            <canvas ref={chartRef} />
        </div>
    );
}

export default TransactionsChart;
