// Dashboard Component - Diseño oscuro profesional con gráfico de categorías mejorado
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

        // Categories Chart - Agrupado por padre con subcategorías stackeadas
        const ctx2 = document.getElementById('categoriesChart');
        if (ctx2 && resumen.categorias && resumen.categorias.length > 0) {
            const chart2 = Chart.getChart(ctx2);
            if (chart2) chart2.destroy();

            // Agrupar por categorías padre
            const categoryMap = {};

            resumen.categorias.forEach(item => {
                // Buscar si la categoría tiene padre
                const cat = categorias.find(c => c.nombre === item.categoria);

                if (cat) {
                    let parentName = item.categoria;
                    let subcategoryName = null;

                    // Si tiene padre, obtener el nombre del padre
                    if (cat.categoriaPadreId) {
                        const parent = categorias.find(c => c.id === cat.categoriaPadreId);
                        if (parent) {
                            parentName = parent.nombre;
                            subcategoryName = item.categoria;
                        }
                    }

                    // Crear entrada para la categoría padre si no existe
                    if (!categoryMap[parentName]) {
                        categoryMap[parentName] = {
                            total: 0,
                            subcategories: {}
                        };
                    }

                    // Agregar el monto
                    categoryMap[parentName].total += item.total;

                    // Si es una subcategoría, agregar a subcategories
                    if (subcategoryName) {
                        categoryMap[parentName].subcategories[subcategoryName] = item.total;
                    } else {
                        // Si es la categoría padre directamente
                        categoryMap[parentName].subcategories[parentName] = item.total;
                    }
                }
            });

            // Preparar datos para el gráfico
            const parentLabels = Object.keys(categoryMap);

            // Obtener todas las subcategorías únicas
            const allSubcategories = new Set();
            Object.values(categoryMap).forEach(parent => {
                Object.keys(parent.subcategories).forEach(sub => {
                    allSubcategories.add(sub);
                });
            });

            // Colores para subcategorías (paleta de tonos)
            const colorPalettes = {
                base: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
                green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
                red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
                purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
                orange: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
                pink: ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8']
            };

            const paletteKeys = Object.keys(colorPalettes);

            // Crear datasets por subcategoría
            const datasets = [];
            let colorIndex = 0;
            let paletteIndex = 0;

            Array.from(allSubcategories).forEach((subcategory, index) => {
                const data = parentLabels.map(parent => {
                    return categoryMap[parent].subcategories[subcategory] || 0;
                });

                // Rotar entre paletas
                const currentPalette = colorPalettes[paletteKeys[paletteIndex % paletteKeys.length]];
                const color = currentPalette[colorIndex % currentPalette.length];

                datasets.push({
                    label: subcategory,
                    data: data,
                    backgroundColor: color,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#1e293b'
                });

                colorIndex++;
                if (colorIndex >= currentPalette.length) {
                    colorIndex = 0;
                    paletteIndex++;
                }
            });

            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: parentLabels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                color: '#cbd5e1',
                                boxWidth: 12,
                                padding: 8,
                                font: {
                                    size: 10
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                // Filtrar para mostrar solo subcategorías con valor > 0
                                filter: function(tooltipItem) {
                                    return tooltipItem.parsed.y > 0;
                                },
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS'
                                    }).format(context.parsed.y);
                                    return label;
                                },
                                // Título del tooltip muestra la categoría padre
                                title: function(tooltipItems) {
                                    return tooltipItems[0].label;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            ticks: {
                                color: '#cbd5e1'
                            },
                            grid: {
                                color: '#334155'
                            }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: {
                                color: '#cbd5e1',
                                callback: function(value) {
                                    return new Intl.NumberFormat('es-AR', {
                                        style: 'currency',
                                        currency: 'ARS',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(value);
                                }
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