const { useState, useEffect } = React;

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [error, setError] = useState(null);

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
        validateAndLoadData();
    }, []);

    // Efecto para recargar datos cuando cambia el workspace
    // IMPORTANTE: También se ejecuta cuando currentWorkspace es null (todos)
    useEffect(() => {
        if (isAuthenticated) {
            loadAllData();
        }
    }, [currentWorkspace]);

    const validateAndLoadData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.log('No hay token - mostrando login');
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            console.log('Token encontrado - validando...');

            try {
                const testResponse = await api.get('/workspaces');
                console.log('Token válido - cargando datos');
                setIsAuthenticated(true);
                await loadAllData();
            } catch (validationError) {
                console.error('Token inválido:', validationError);
                handleLogout();
            }
        } catch (error) {
            console.error('Error en validación inicial:', error);
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        console.log('Cerrando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setData({
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
        setCurrentWorkspace(null);
        setError(null);
    };

    const loadAllData = async () => {
        try {
            setError(null);

            // Primero cargar workspaces
            const workspaces = await api.get('/workspaces').catch(err => {
                console.error('Error cargando workspaces:', err);
                throw err;
            });

            // Construir el parámetro de workspace
            // Si currentWorkspace es null, NO agregamos el parámetro (mostrará todos)
            const workspaceParam = currentWorkspace ? `?workspaceId=${currentWorkspace.id}` : '';

            // Cargar datos en paralelo con manejo individual de errores
            const [
                resumen,
                movimientos,
                categorias,
                presupuestos,
                notificaciones
            ] = await Promise.allSettled([
                api.get(`/dashboard/resumen${workspaceParam}`),
                api.get(`/movimientos${workspaceParam}`),
                api.get('/categorias'),
                api.get('/presupuestos'),
                api.get('/notificaciones')
            ]).then(results => results.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error(`Error en carga ${index}:`, result.reason);
                    switch(index) {
                        case 0: return { ingresos: 0, egresos: 0, balance: 0, deudas: 0, categorias: [] };
                        case 1: return { content: [] };
                        default: return [];
                    }
                }
            }));

            // Manejar la respuesta de movimientos
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
            setError('Error al cargar los datos. Por favor, intenta nuevamente.');

            if (error.message && (error.message.includes('401') || error.message.includes('Sesión expirada'))) {
                handleLogout();
            }
        }
    };

    const renderView = () => {
        if (!data) {
            return (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Cargando datos...</p>
                </div>
            );
        }

        const props = {
            data,
            currentWorkspace,
            onRefresh: loadAllData,
            onUpdate: loadAllData
        };

        try {
            switch (activeView) {
                case 'dashboard':
                    return <Dashboard {...props} />;
                case 'movements':
                    return <MovementsList
                        movimientos={data.movimientos || []}
                        categorias={data.categorias || []}
                        workspaces={data.workspaces || []}
                        currentWorkspace={currentWorkspace}
                        onUpdate={loadAllData}
                    />;
                case 'budgets':
                    return <BudgetsList
                        presupuestos={data.presupuestos || []}
                        categorias={data.categorias || []}
                        onUpdate={loadAllData}
                    />;
                case 'notifications':
                    return <NotificationsCenter
                        notificaciones={data.notificaciones || []}
                        onUpdate={loadAllData}
                    />;
                case 'reports':
                    return <Reports />;
                case 'settings':
                    return <Settings
                        workspaces={data.workspaces || []}
                        categorias={data.categorias || []}
                        onUpdate={loadAllData}
                    />;
                default:
                    return <Dashboard {...props} />;
            }
        } catch (error) {
            console.error('Error renderizando vista:', error);
            return (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p>Error al mostrar esta sección. Por favor, intenta recargar la página.</p>
                </div>
            );
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
            setLoading(true);
            loadAllData().finally(() => setLoading(false));
        }} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                activeView={activeView}
                setActiveView={setActiveView}
                onLogout={handleLogout}
            />

            <div className="flex-1 p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <div className="flex items-center justify-between">
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-700 hover:text-red-900"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {data.workspaces && data.workspaces.length > 0 && (
                    <WorkspaceSelector
                        workspaces={data.workspaces}
                        currentWorkspace={currentWorkspace}
                        onSelect={(ws) => {
                            // ws puede ser null si se selecciona "Todos"
                            setCurrentWorkspace(ws);
                        }}
                    />
                )}

                {renderView()}
            </div>
        </div>
    );
};

// Agregar manejo de errores global
window.addEventListener('unhandledrejection', function(event) {
    console.error('Error no manejado (Promise):', event.reason);
    event.preventDefault();
});

window.addEventListener('error', function(event) {
    console.error('Error en ejecución:', event.error);
});

ReactDOM.createRoot(document.getElementById("root")).render(<App />);