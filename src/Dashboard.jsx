function Dashboard() {
    return(
        <div className="dashboard">
            <h3>Bienvenido, {user.name}</h3>
            <div className="card">
                <h4>Gasto del día</h4>
            </div>
            <div className="card">
                <h4>Progreso Semanal</h4>
            </div>
    </div>
    );
}

export default Dashboard;
