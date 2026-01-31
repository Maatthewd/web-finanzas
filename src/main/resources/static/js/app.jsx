const { useState, useEffect } = React;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [currentWorkspace, setCurrentWorkspace] = useState(null);

    const [data, setData] = useState({
        resumen: {
            ingresos: 0,
            egresos: 0,
            balance: 0,
            deudas: 0,
            categorias: []
        },
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
        } else {
            setLoading(false);
        }
    }, []);

    // Efecto para recargar datos cuando cambia el workspace
    useEffect(() => {
        if (isAuthenticated && currentWorkspace !== null) {
            loadAllData();
        }
    }, [currentWorkspace]);

    const loadAllData = async () => {
        try {
            setLoading(true);

            // Primero cargar workspaces
            const workspaces = await api.get('/workspaces').catch(() => []);

            // Si no hay workspace seleccionado, seleccionar el principal o el primero
            let workspace = currentWorkspace;
            if (!workspace && workspaces && workspaces.length > 0) {
                workspace = workspaces.find(w => w.esPrincipal) || workspaces[0];
                setCurrentWorkspace(workspace);
            }

            const workspaceParam = workspace ? `?workspaceId=${workspace.id}` : '';

            const [
                resumen,
                movimientos,
                categorias,
                presupuestos,
                notificaciones
            ] = await Promise.all([
                api.get(`/dashboard/resumen${workspaceParam}`).catch(() => ({
                    ingresos: 0,
                    egresos: 0,
                    balance: 0,
                    deudas: 0,
                    categorias: []
                })),
                api.get(`/movimientos${workspaceParam}`).catch(() => ({ content: [] })),
                api.get('/categorias').catch(() => []),
                api.get('/presupuestos').catch(() => []),
                api.get('/notificaciones').catch(() => [])
            ]);

            // Manejar la respuesta de movimientos (puede ser paginada o no)
            let movimientosList = [];
            if (movimientos) {
                if (Array.isArray(movimientos)) {
                    movimientosList = movimientos;
                } else if (movimientos.content && Array.isArray(movimientos.content)) {
                    movimientosList = movimientos.content;
                }
            }

            setData({
                resumen: resumen || { ingresos: 0, egresos: 0, balance: 0, deudas: 0, categorias: [] },
                movimientos: movimientosList,
                categorias: categorias || [],
                presupuestos: presupuestos || [],
                notificaciones: notificaciones || [],
                workspaces: workspaces || []
            });
        } catch (error) {
            console.error('Error al cargar datos:', error);
            // No mostramos alert aquí para no molestar al usuario
        } finally {
            setLoading(false);
        }
    };

    const renderView = () => {
        const props = {
            data,
            currentWorkspace,
            onRefresh: loadAllData,
            onUpdate: loadAllData
        };

        switch (activeView) {
            case 'dashboard':
                return <Dashboard {...props} />;
            case 'movements':
                return <MovementsList
                    movimientos={data.movimientos}
                    categorias={data.categorias}
                    workspaces={data.workspaces}
                    currentWorkspace={currentWorkspace}
                    onUpdate={loadAllData}
                />;
            case 'budgets':
                return <BudgetsList
                    presupuestos={data.presupuestos}
                    categorias={data.categorias}
                    onUpdate={loadAllData}
                />;
            case 'notifications':
                return <NotificationsCenter
                    notificaciones={data.notificaciones}
                    onUpdate={loadAllData}
                />;
            case 'reports':
                return <Reports />;
            case 'settings':
                return <Settings
                    workspaces={data.workspaces}
                    categorias={data.categorias}
                    onUpdate={loadAllData}
                />;
            default:
                return <Dashboard {...props} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginForm onLoginSuccess={() => {
            setIsAuthenticated(true);
            loadAllData();
        }} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
            />

            <div className="flex-1 p-8 space-y-6">
                <WorkspaceSelector
                    workspaces={data.workspaces}
                    currentWorkspace={currentWorkspace}
                    onSelect={(ws) => {
                        setCurrentWorkspace(ws);
                    }}
                />
                {renderView()}
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);