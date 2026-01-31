// Dashboard Component - Completo con soporte para workspaces
const Dashboard = ({ data, onRefresh, currentWorkspace }) => {
    const { resumen, movimientos, categorias, presupuestos } = data;

    useEffect(() => {
        if (resumen && categorias.length > 0) {
            createCharts();
        }
    }, [resumen, categorias]);

    const createCharts = () => {
        // Income vs Expenses Chart
        const ctx1 = document.getElementById('incomeExpenseChart');
        if (ctx1) {
            const chart1 = Chart.getChart(ctx1);
            if (chart1) chart1.destroy();

            new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: ['Ingresos', 'Egresos'],
                    datasets: [{
                        data: [resumen.ingresos, resumen.egresos],
                        backgroundColor: ['#10b981', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Categories Chart
        const ctx2 = document.getElementById('categoriesChart');
        if (ctx2 && categorias.length > 0) {
            const chart2 = Chart.getChart(ctx2);
            if (chart2) chart2.destroy();

            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: categorias.map(c => c.categoria),
                    datasets: [{
                        label: 'Monto',
                        data: categorias.map(c => c.total),
                        backgroundColor: '#0ea5e9',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Workspace Info */}
            {currentWorkspace && (
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center space-x-4">
                        <span className="text-4xl">{currentWorkspace.icono}</span>
                        <div>
                            <h2 className="text-2xl font-bold">{currentWorkspace.nombre}</h2>
                            {currentWorkspace.descripcion && (
                                <p className="text-sky-100 mt-1">{currentWorkspace.descripcion}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Ingresos</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(resumen.ingresos)}</p>
                        </div>
                        <div className="bg-white bg-opacity-30 rounded-full p-3">
                            <Icons.TrendUp />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Egresos</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(resumen.egresos)}</p>
                        </div>
                        <div className="bg-white bg-opacity-30 rounded-full p-3">
                            <Icons.TrendDown />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Balance</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(resumen.balance)}</p>
                        </div>
                        <div className="bg-white bg-opacity-30 rounded-full p-3">
                            <Icons.Dashboard />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white card-hover">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Deudas</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(resumen.deudas)}</p>
                        </div>
                        <div className="bg-white bg-opacity-30 rounded-full p-3">
                            <Icons.Notifications />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos vs Egresos</h3>
                    <canvas id="incomeExpenseChart"></canvas>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Por Categoría</h3>
                    <canvas id="categoriesChart"></canvas>
                </div>
            </div>

            {/* Recent Movements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Movimientos Recientes</h3>
                    <button
                        onClick={onRefresh}
                        className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                    >
                        Ver todos
                    </button>
                </div>
                <div className="space-y-3">
                    {movimientos.slice(0, 5).map((mov) => (
                        <div key={mov.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    mov.tipo === 'INGRESO' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {mov.tipo === 'INGRESO' ? (
                                        <Icons.TrendUp className="text-green-600" />
                                    ) : (
                                        <Icons.TrendDown className="text-red-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{mov.descripcion}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <p className="text-sm text-gray-500">{formatDate(mov.fecha)}</p>
                                        {mov.workspaceNombre && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs text-gray-400">{mov.workspaceNombre}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold ${
                                    mov.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {mov.tipo === 'INGRESO' ? '+' : '-'} {formatCurrency(mov.monto)}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    mov.pagado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {mov.pagado ? 'Pagado' : 'Pendiente'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Budgets Summary */}
            {presupuestos.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Presupuestos del Mes</h3>
                    <div className="space-y-4">
                        {presupuestos.map((presupuesto) => {
                            const porcentaje = presupuesto.porcentajeUtilizado || 0;
                            const isOver = porcentaje > 100;
                            const isWarning = porcentaje >= (presupuesto.alertaPorcentaje || 80);

                            return (
                                <div key={presupuesto.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                            {presupuesto.nombre}
                                        </span>
                                        <span className={`text-sm font-semibold ${
                                            isOver ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-gray-600'
                                        }`}>
                                            {porcentaje.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${
                                                isOver ? 'bg-red-600' : isWarning ? 'bg-orange-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{formatCurrency(presupuesto.montoGastado)} gastado</span>
                                        <span>{formatCurrency(presupuesto.montoLimite)} límite</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};