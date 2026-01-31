// MovementsList Component - Con soporte para workspaces y categorías jerárquicas
const MovementsList = ({ movimientos, categorias, workspaces, onUpdate, currentWorkspace }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingMovement, setEditingMovement] = useState(null);
    const [filters, setFilters] = useState({
        tipo: '',
        pagado: '',
        categoriaId: ''
    });

    const [formData, setFormData] = useState({
        descripcion: '',
        tipo: 'EGRESO',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        fechaVencimiento: '',
        pagado: false,
        categoriaId: '',
        workspaceId: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                monto: parseFloat(formData.monto),
                categoriaId: parseInt(formData.categoriaId),
                workspaceId: parseInt(formData.workspaceId)
            };

            if (editingMovement) {
                await api.put(`/movimientos/${editingMovement.id}`, payload);
            } else {
                await api.post('/movimientos', payload);
            }
            setShowModal(false);
            setEditingMovement(null);
            resetForm();
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            descripcion: '',
            tipo: 'EGRESO',
            monto: '',
            fecha: new Date().toISOString().split('T')[0],
            fechaVencimiento: '',
            pagado: false,
            categoriaId: '',
            workspaceId: currentWorkspace?.id || ''
        });
    };

    const handleEdit = (mov) => {
        setEditingMovement(mov);
        setFormData({
            descripcion: mov.descripcion,
            tipo: mov.tipo,
            monto: mov.monto.toString(),
            fecha: mov.fecha,
            fechaVencimiento: mov.fechaVencimiento || '',
            pagado: mov.pagado,
            categoriaId: mov.categoriaId.toString(),
            workspaceId: mov.workspaceId.toString()
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este movimiento?')) {
            try {
                await api.delete(`/movimientos/${id}`);
                onUpdate();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };

    const togglePaid = async (mov) => {
        try {
            const endpoint = mov.pagado ? `/movimientos/${mov.id}/pendiente` : `/movimientos/${mov.id}/pagar`;
            await api.patch(endpoint);
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const filteredMovements = movimientos.filter(mov => {
        if (filters.tipo && mov.tipo !== filters.tipo) return false;
        if (filters.pagado !== '' && mov.pagado.toString() !== filters.pagado) return false;
        if (filters.categoriaId && mov.categoriaId.toString() !== filters.categoriaId) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Movimientos</h2>
                <button
                    onClick={() => {
                        setEditingMovement(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                    <Icons.Plus />
                    <span>Nuevo Movimiento</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={filters.tipo}
                        onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="INGRESO">Ingresos</option>
                        <option value="EGRESO">Egresos</option>
                    </select>

                    <select
                        value={filters.pagado}
                        onChange={(e) => setFilters({...filters, pagado: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                        <option value="">Todos los estados</option>
                        <option value="true">Pagados</option>
                        <option value="false">Pendientes</option>
                    </select>

                    <select
                        value={filters.categoriaId}
                        onChange={(e) => setFilters({...filters, categoriaId: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icono} {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Movements List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Workspace
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMovements.map((mov) => (
                                <tr key={mov.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{mov.descripcion}</div>
                                        <div className="text-sm text-gray-500">{mov.categoriaNombre}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{mov.workspaceNombre}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            mov.tipo === 'INGRESO'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {mov.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-semibold ${
                                            mov.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {formatCurrency(mov.monto)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(mov.fecha)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => togglePaid(mov)}
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                                                mov.pagado
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                            }`}
                                        >
                                            {mov.pagado ? 'Pagado' : 'Pendiente'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleEdit(mov)}
                                            className="text-sky-600 hover:text-sky-900"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(mov.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingMovement ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Workspace *
                                </label>
                                <select
                                    required
                                    value={formData.workspaceId}
                                    onChange={(e) => setFormData({...formData, workspaceId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                >
                                    <option value="">Selecciona workspace</option>
                                    {workspaces.map(ws => (
                                        <option key={ws.id} value={ws.id}>
                                            {ws.icono} {ws.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({...formData, tipo: e.target.value, categoriaId: ''})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="INGRESO">Ingreso</option>
                                        <option value="EGRESO">Egreso</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monto *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.monto}
                                        onChange={(e) => setFormData({...formData, monto: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>

                            <CategorySelector
                                categories={categorias}
                                value={formData.categoriaId}
                                onChange={(id) => setFormData({...formData, categoriaId: id})}
                                tipo={formData.tipo}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vencimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fechaVencimiento}
                                        onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="pagado"
                                    checked={formData.pagado}
                                    onChange={(e) => setFormData({...formData, pagado: e.target.checked})}
                                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                />
                                <label htmlFor="pagado" className="ml-2 block text-sm text-gray-900">
                                    Marcar como pagado
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
                                >
                                    {editingMovement ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingMovement(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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