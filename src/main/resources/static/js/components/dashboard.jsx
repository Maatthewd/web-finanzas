// Dashboard Component - Diseño oscuro profesional con filtro de mes
const Dashboard = ({ data, onRefresh, currentWorkspace }) => {
    const { resumen, movimientos, categorias, presupuestos } = data;

    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    useEffect(() => {
        if (resumen && resumen.categorias && resumen.categorias.length > 0) {
            createCharts();
        }
    }, [resumen]);

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
                        data: [resumen.ingresos || 0, resumen.egresos || 0],
                        backgroundColor: ['#10b981', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#cbd5e1'
                            }
                        }
                    }
                }
            });
        }

        // Categories Chart
        const ctx2 = document.getElementById('categoriesChart');
        if (ctx2 && resumen.categorias && resumen.categorias.length > 0) {
            const chart2 = Chart.getChart(ctx2);
            if (chart2) chart2.destroy();

            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: resumen.categorias.map(c => c.categoria),
                    datasets: [{
                        label: 'Monto',
                        data: resumen.categorias.map(c => c.total),
                        backgroundColor: '#3b82f6',
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
                            beginAtZero: true,
                            ticks: {
                                color: '#cbd5e1'
                            },
                            grid: {
                                color: '#334155'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#cbd5e1'
                            },
                            grid: {
                                color: '#334155'
                            }
                        }
                    }
                }
            });
        }
    };

    const movimientosList = Array.isArray(movimientos) ? movimientos : [];
    const presupuestosList = Array.isArray(presupuestos) ? presupuestos : [];

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="space-y-6">
            {/* Workspace Info */}
            {currentWorkspace && (
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl shadow-lg p-6 text-white border border-slate-700">
                    <div className="flex items-center space-x-4">
                        <span className="text-4xl">{currentWorkspace.icono}</span>
                        <div>
                            <h2 className="text-2xl font-bold">{currentWorkspace.nombre}</h2>
                            {currentWorkspace.descripcion && (
                                <p className="text-blue-200 mt-1">{currentWorkspace.descripcion}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card rounded-xl p-6 text-white card-dark">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Ingresos</p>
                            <p className="text-2xl font-bold mt-1 text-green-400">{formatCurrency(resumen.ingresos || 0)}</p>
                        </div>
                        <div className="bg-green-500 bg-opacity-20 rounded-full p-3">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card rounded-xl p-6 text-white card-dark">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Egresos</p>
                            <p className="text-2xl font-bold mt-1 text-red-400">{formatCurrency(resumen.egresos || 0)}</p>
                        </div>
                        <div className="bg-red-500 bg-opacity-20 rounded-full p-3">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card rounded-xl p-6 text-white card-dark">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Balance</p>
                            <p className={`text-2xl font-bold mt-1 ${(resumen.balance || 0) >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                {formatCurrency(resumen.balance || 0)}
                            </p>
                        </div>
                        <div className={`rounded-full p-3 ${(resumen.balance || 0) >= 0 ? 'bg-blue-500 bg-opacity-20' : 'bg-orange-500 bg-opacity-20'}`}>
                            <svg className={`w-6 h-6 ${(resumen.balance || 0) >= 0 ? 'text-blue-400' : 'text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card rounded-xl p-6 text-white card-dark">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Deudas</p>
                            <p className="text-2xl font-bold mt-1 text-orange-400">{formatCurrency(resumen.deudas || 0)}</p>
                        </div>
                        <div className="bg-orange-500 bg-opacity-20 rounded-full p-3">
                            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-dark rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Ingresos vs Egresos</h3>
                    <canvas id="incomeExpenseChart"></canvas>
                </div>

                <div className="card-dark rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Por Categoría</h3>
                    <canvas id="categoriesChart"></canvas>
                </div>
            </div>

            {/* Recent Movements */}
            <div className="card-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-200">Movimientos Recientes</h3>
                    <button
                        onClick={onRefresh}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                    >
                        Actualizar
                    </button>
                </div>
                <div className="space-y-3">
                    {movimientosList.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>No hay movimientos registrados</p>
                        </div>
                    ) : (
                        movimientosList.slice(0, 5).map((mov) => (
                            <div key={mov.id} className="flex items-center justify-between p-4 hover:bg-slate-700 rounded-lg transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        mov.tipo === 'INGRESO' ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
                                    }`}>
                                        {mov.tipo === 'INGRESO' ? (
                                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-200">{mov.descripcion}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <p className="text-sm text-gray-400">{formatDate(mov.fecha)}</p>
                                            {mov.workspaceNombre && (
                                                <>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-xs text-gray-500">{mov.workspaceNombre}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${
                                        mov.tipo === 'INGRESO' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {mov.tipo === 'INGRESO' ? '+' : '-'} {formatCurrency(mov.monto)}
                                    </p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        mov.pagado ? 'bg-green-900 bg-opacity-40 text-green-300' : 'bg-yellow-900 bg-opacity-40 text-yellow-300'
                                    }`}>
                                        {mov.pagado ? 'Pagado' : 'Pendiente'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Budgets Summary */}
            {presupuestosList.length > 0 && (
                <div className="card-dark rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">Presupuestos del Mes</h3>
                    <div className="space-y-4">
                        {presupuestosList.map((presupuesto) => {
                            const porcentaje = presupuesto.porcentajeUtilizado || 0;
                            const isOver = porcentaje > 100;
                            const isWarning = porcentaje >= (presupuesto.alertaPorcentaje || 80);

                            return (
                                <div key={presupuesto.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-300">
                                            {presupuesto.nombre}
                                        </span>
                                        <span className={`text-sm font-semibold ${
                                            isOver ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-gray-300'
                                        }`}>
                                            {porcentaje.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${
                                                isOver ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
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