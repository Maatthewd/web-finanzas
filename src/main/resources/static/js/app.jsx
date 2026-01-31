const { useState, useEffect } = React;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [currentWorkspace, setCurrentWorkspace] = useState(null);

    const [data, setData] = useState({
        resumen: {},
        movimientos: [],
        categorias: [],
        presupuestos: [],
        notificaciones: [],
        workspaces: []
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            loadAllData();
        }
        setLoading(false);
    }, []);

    const loadAllData = async () => {
        const [
            resumen,
            movimientos,
            categorias,
            presupuestos,
            notificaciones,
            workspaces
        ] = await Promise.all([
            api.get('/dashboard/resumen'),
            api.get('/movimientos'),
            api.get('/categorias'),
            api.get('/presupuestos'),
            api.get('/notificaciones'),
            api.get('/workspaces')
        ]);

        setData({ resumen, movimientos, categorias, presupuestos, notificaciones, workspaces });

        const principal = workspaces.find(w => w.esPrincipal);
        setCurrentWorkspace(principal || null);
    };

    const movimientosFiltrados = currentWorkspace
        ? data.movimientos.filter(m => m.workspaceId === currentWorkspace.id)
        : data.movimientos;

    const presupuestosFiltrados = currentWorkspace
        ? data.presupuestos.filter(p => p.workspaceId === currentWorkspace.id)
        : data.presupuestos;

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard data={{ ...data, movimientos: movimientosFiltrados }} onRefresh={loadAllData} />;
            case 'movements':
                return <MovementsList movimientos={movimientosFiltrados} categorias={data.categorias} workspaces={data.workspaces} currentWorkspace={currentWorkspace} onUpdate={loadAllData} />;
            case 'budgets':
                return <BudgetsList presupuestos={presupuestosFiltrados} categorias={data.categorias} onUpdate={loadAllData} />;
            case 'notifications':
                return <NotificationsCenter notificaciones={data.notificaciones} onUpdate={loadAllData} />;
            case 'reports':
                return <Reports />;
            case 'settings':
                return <Settings workspaces={data.workspaces} categorias={data.categorias} onUpdate={loadAllData} />;
            default:
                return <Dashboard data={data} onRefresh={loadAllData} />;
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    if (!isAuthenticated) {
        return <LoginForm onLoginSuccess={() => { setIsAuthenticated(true); loadAllData(); }} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar setActiveView={setActiveView} />

            <div className="flex-1 p-8 space-y-6">
                <WorkspaceSelector
                    workspaces={data.workspaces}
                    currentWorkspace={currentWorkspace}
                    onSelect={setCurrentWorkspace}
                />
                {renderView()}
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
