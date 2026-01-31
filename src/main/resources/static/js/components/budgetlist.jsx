// BudgetsList Component - Gestión de presupuestos
const BudgetsList = ({ presupuestos, categorias, onUpdate, currentWorkspace }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        montoLimite: '',
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        categoriaId: '',
        alertaPorcentaje: 80,
        activo: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                montoLimite: parseFloat(formData.montoLimite),
                categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : null
            };

            if (editingBudget) {
                await api.put(`/presupuestos/${editingBudget.id}`, payload);
            } else {
                await api.post('/presupuestos', payload);
            }
            setShowModal(false);
            setEditingBudget(null);
            resetForm();
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            montoLimite: '',
            mes: new Date().getMonth() + 1,
            anio: new Date().getFullYear(),
            categoriaId: '',
            alertaPorcentaje: 80,
            activo: true
        });
    };

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        setFormData({
            nombre: budget.nombre,
            montoLimite: budget.montoLimite.toString(),
            mes: budget.mes,
            anio: budget.anio,
            categoriaId: budget.categoriaId?.toString() || '',
            alertaPorcentaje: budget.alertaPorcentaje,
            activo: budget.activo
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este presupuesto?')) {
            try {
                await api.delete(`/presupuestos/${id}`);
                onUpdate();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Presupuestos</h2>
                <button
                    onClick={() => {
                        setEditingBudget(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                >
                    <Icons.Plus />
                    <span>Nuevo Presupuesto</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {presupuestos.map((presupuesto) => {
                    const porcentaje = presupuesto.porcentajeUtilizado || 0;
                    const isOver = porcentaje > 100;
                    const isWarning = porcentaje >= (presupuesto.alertaPorcentaje || 80);

                    return (
                        <div key={presupuesto.id} className="bg-white rounded-xl shadow-lg p-6 card-hover">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{presupuesto.nombre}</h3>
                                    <p className="text-sm text-gray-500">{meses[presupuesto.mes - 1]} {presupuesto.anio}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    presupuesto.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {presupuesto.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-600">Progreso</span>
                                        <span className={`text-sm font-bold ${
                                            isOver ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-gray-900'
                                        }`}>
                                            {porcentaje.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${
                                                isOver ? 'bg-red-600' : isWarning ? 'bg-orange-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Gastado:</span>
                                        <span className="font-semibold">{formatCurrency(presupuesto.montoGastado)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Límite:</span>
                                        <span className="font-semibold">{formatCurrency(presupuesto.montoLimite)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Disponible:</span>
                                        <span className={`font-semibold ${
                                            (presupuesto.montoDisponible || 0) < 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {formatCurrency(presupuesto.montoDisponible)}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(presupuesto)}
                                        className="flex-1 px-3 py-2 text-sm bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(presupuesto.id)}
                                        className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {presupuestos.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <Icons.Budget className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay presupuestos</h3>
                        <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo presupuesto.</p>
                    </div>
                )}
            </div>

            {/* Modal simplificado - similar estructura al de Movimientos */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Límite *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.montoLimite}
                                    onChange={(e) => setFormData({...formData, montoLimite: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mes *</label>
                                    <select
                                        value={formData.mes}
                                        onChange={(e) => setFormData({...formData, mes: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    >
                                        {meses.map((mes, index) => (
                                            <option key={index} value={index + 1}>{mes}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.anio}
                                        onChange={(e) => setFormData({...formData, anio: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="submit" className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                                    {editingBudget ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingBudget(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};