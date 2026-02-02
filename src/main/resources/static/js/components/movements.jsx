// MovementsList Component - Con filtros por mes, categoría padre y buscador
const MovementsList = ({ movimientos, categorias, workspaces, onUpdate, currentWorkspace }) => {
    const [showModal, setShowModal] = useState(false);
    const [editingMovement, setEditingMovement] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const currentDate = new Date();
    const [filters, setFilters] = useState({
        tipo: '',
        pagado: '',
        categoriaId: '',
        mes: '', // Vacío = "Todos"
        anio: '' // Vacío = "Todos"
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

    // Obtener categorías padre
    const parentCategories = categorias.filter(c => !c.categoriaPadreId);

    // Función para obtener todas las subcategorías de una categoría padre
    const getAllSubcategoriesIds = (parentId) => {
        const subcats = categorias.filter(c => c.categoriaPadreId === parentId);
        return [parentId, ...subcats.map(c => c.id)];
    };

    // Filtrar movimientos por filtros (NO por búsqueda) para calcular totales
    const filteredByFilters = movimientos.filter(mov => {
        // Filtro por tipo
        if (filters.tipo && mov.tipo !== filters.tipo) return false;

        // Filtro por estado pagado
        if (filters.pagado !== '' && mov.pagado.toString() !== filters.pagado) return false;

        // Filtro por categoría (incluye padre e hijas)
        if (filters.categoriaId) {
            const allowedCategoryIds = getAllSubcategoriesIds(parseInt(filters.categoriaId));
            if (!allowedCategoryIds.includes(mov.categoriaId)) return false;
        }

        // Filtro por mes y año (solo si están seleccionados)
        if (filters.mes !== '' || filters.anio !== '') {
            const movDate = new Date(mov.fecha);
            const movMes = movDate.getMonth() + 1;
            const movAnio = movDate.getFullYear();

            // Si se selecciona mes, filtrar por mes (si no está vacío)
            if (filters.mes !== '' && movMes !== parseInt(filters.mes)) return false;

            // Si se selecciona año, filtrar por año (si no está vacío)
            if (filters.anio !== '' && movAnio !== parseInt(filters.anio)) return false;
        }

        return true;
    });

    // Filtrar movimientos por búsqueda Y filtros para la tabla
    const filteredMovements = filteredByFilters.filter(mov => {
        // Filtro por búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesDescription = mov.descripcion.toLowerCase().includes(searchLower);
            const matchesCategory = mov.categoriaNombre.toLowerCase().includes(searchLower);
            const matchesWorkspace = mov.workspaceNombre?.toLowerCase().includes(searchLower);

            if (!matchesDescription && !matchesCategory && !matchesWorkspace) {
                return false;
            }
        }

        return true;
    });

    // Calcular totales SOLO con filtros (sin búsqueda)
    const totales = filteredByFilters.reduce((acc, mov) => {
        if (mov.pagado) {
            if (mov.tipo === 'INGRESO') {
                acc.ingresos += mov.monto;
            } else {
                acc.egresos += mov.monto;
            }
        }
        return acc;
    }, { ingresos: 0, egresos: 0 });

    totales.balance = totales.ingresos - totales.egresos;

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Generar texto de período según filtros
    const getPeriodoTexto = () => {
        if (filters.mes !== '' && filters.anio !== '') {
            const mesIndex = parseInt(filters.mes) - 1;
            return `de ${meses[mesIndex] || 'Mes'} ${filters.anio}`;
        } else if (filters.mes !== '' && filters.anio === '') {
            const mesIndex = parseInt(filters.mes) - 1;
            return `de ${meses[mesIndex] || 'Mes'} (Todos los años)`;
        } else if (filters.mes === '' && filters.anio !== '') {
            return `del año ${filters.anio}`;
        } else {
            return '(Todos)';
        }
    };

    const periodoTexto = getPeriodoTexto();

    // Obtener el año más antiguo de los movimientos, o el año actual - 10 por defecto
    const anioMasAntiguo = movimientos.length > 0
        ? Math.min(...movimientos.map(m => new Date(m.fecha).getFullYear()))
        : currentDate.getFullYear() - 10;

    const anioActual = currentDate.getFullYear();
    const cantidadAnios = anioActual - anioMasAntiguo + 1;
    const anios = Array.from({ length: cantidadAnios }, (_, i) => anioMasAntiguo + i);

    return (
        <div className="space-y-6">
            {/* Header con Totales del Mes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-dark rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Ingresos {periodoTexto}</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">
                                {formatCurrency(totales.ingresos)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card-dark rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Egresos {periodoTexto}</p>
                            <p className="text-2xl font-bold text-red-400 mt-1">
                                {formatCurrency(totales.egresos)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card-dark rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Balance {periodoTexto}</p>
                            <p className={`text-2xl font-bold mt-1 ${totales.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                {formatCurrency(totales.balance)}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            totales.balance >= 0 ? 'bg-blue-500 bg-opacity-20' : 'bg-orange-500 bg-opacity-20'
                        }`}>
                            <svg className={`w-6 h-6 ${totales.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header con botón */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Movimientos</h2>
                <button
                    onClick={() => {
                        setEditingMovement(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Icons.Plus />
                    <span>Nuevo Movimiento</span>
                </button>
            </div>

            {/* Buscador */}
            <div className="card-dark rounded-xl p-4">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por descripción, categoría o workspace..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="card-dark rounded-xl p-6 space-y-4">
                {/* Filtro de Mes y Año */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mes</label>
                        <select
                            value={filters.mes}
                            onChange={(e) => setFilters({...filters, mes: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos los meses</option>
                            {meses.map((mes, index) => (
                                <option key={index} value={index + 1}>{mes}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Año</label>
                        <select
                            value={filters.anio}
                            onChange={(e) => setFilters({...filters, anio: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos los años</option>
                            {anios.map(anio => (
                                <option key={anio} value={anio}>{anio}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Otros filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={filters.tipo}
                        onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="INGRESO">Ingresos</option>
                        <option value="EGRESO">Egresos</option>
                    </select>

                    <select
                        value={filters.pagado}
                        onChange={(e) => setFilters({...filters, pagado: e.target.value})}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todos los estados</option>
                        <option value="true">Pagados</option>
                        <option value="false">Pendientes</option>
                    </select>

                    <select
                        value={filters.categoriaId}
                        onChange={(e) => setFilters({...filters, categoriaId: e.target.value})}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todas las categorías</option>
                        {parentCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icono} {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Movements List */}
            <div className="card-dark rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Workspace
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredMovements.map((mov) => (
                                <tr key={mov.id} className="hover:bg-slate-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-100">{mov.descripcion}</div>
                                        <div className="text-sm text-gray-400">{mov.categoriaNombre}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-300">{mov.workspaceNombre}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            mov.tipo === 'INGRESO'
                                                ? 'bg-green-900 bg-opacity-40 text-green-300'
                                                : 'bg-red-900 bg-opacity-40 text-red-300'
                                        }`}>
                                            {mov.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-semibold ${
                                            mov.tipo === 'INGRESO' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {formatCurrency(mov.monto)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300">{formatDate(mov.fecha)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => togglePaid(mov)}
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                                                mov.pagado
                                                    ? 'bg-green-900 bg-opacity-40 text-green-300 hover:bg-opacity-60'
                                                    : 'bg-yellow-900 bg-opacity-40 text-yellow-300 hover:bg-opacity-60'
                                            }`}
                                        >
                                            {mov.pagado ? 'Pagado' : 'Pendiente'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleEdit(mov)}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(mov.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredMovements.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">
                                {searchTerm
                                    ? `No se encontraron movimientos que coincidan con "${searchTerm}"`
                                    : 'No hay movimientos para el período seleccionado'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="modal-dark rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-100 mb-4">
                            {editingMovement ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Workspace *
                                </label>
                                <select
                                    required
                                    value={formData.workspaceId}
                                    onChange={(e) => setFormData({...formData, workspaceId: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
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
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Descripción *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({...formData, tipo: e.target.value, categoriaId: ''})}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="INGRESO">Ingreso</option>
                                        <option value="EGRESO">Egreso</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Monto *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.monto}
                                        onChange={(e) => setFormData({...formData, monto: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
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
                                <DateInput
                                    label="Fecha"
                                    required
                                    value={formData.fecha}
                                    onChange={(value) => setFormData({...formData, fecha: value})}
                                />

                                <DateInput
                                    label="Vencimiento"
                                    value={formData.fechaVencimiento}
                                    onChange={(value) => setFormData({...formData, fechaVencimiento: value})}
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="pagado"
                                    checked={formData.pagado}
                                    onChange={(e) => setFormData({...formData, pagado: e.target.checked})}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-700"
                                />
                                <label htmlFor="pagado" className="ml-2 block text-sm text-gray-200">
                                    Marcar como pagado
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                                    className="flex-1 px-4 py-2 bg-slate-600 text-gray-200 rounded-lg hover:bg-slate-500 transition-colors font-medium"
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