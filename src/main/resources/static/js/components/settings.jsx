// Settings Component - Panel de configuración con tabs
const Settings = ({ workspaces, categorias, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('workspaces');
    const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [workspaceForm, setWorkspaceForm] = useState({
        nombre: '',
        descripcion: '',
        color: '#0ea5e9',
        icono: '🏠',
        activo: true
    });

    const [categoryForm, setCategoryForm] = useState({
        nombre: '',
        tipo: 'EGRESO',
        categoriaPadreId: '',
        icono: '📋',
        color: '#64748b',
        orden: 0
    });

    const [expandedCategories, setExpandedCategories] = useState({});

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Workspace handlers
    const handleWorkspaceSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/workspaces/${editingItem.id}`, workspaceForm);
            } else {
                await api.post('/workspaces', workspaceForm);
            }
            setShowWorkspaceModal(false);
            setEditingItem(null);
            resetWorkspaceForm();
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleEditWorkspace = (ws) => {
        setEditingItem(ws);
        setWorkspaceForm({
            nombre: ws.nombre,
            descripcion: ws.descripcion || '',
            color: ws.color,
            icono: ws.icono,
            activo: ws.activo
        });
        setShowWorkspaceModal(true);
    };

    const handleDeleteWorkspace = async (id) => {
        if (confirm('¿Estás seguro de eliminar este workspace?')) {
            try {
                await api.delete(`/workspaces/${id}`);
                onUpdate();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };

    const handleSetPrincipal = async (id) => {
        try {
            await api.patch(`/workspaces/${id}/principal`);
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const resetWorkspaceForm = () => {
        setWorkspaceForm({
            nombre: '',
            descripcion: '',
            color: '#0ea5e9',
            icono: '🏠',
            activo: true
        });
    };

    // Category handlers
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...categoryForm,
                categoriaPadreId: categoryForm.categoriaPadreId ? parseInt(categoryForm.categoriaPadreId) : null
            };

            if (editingItem) {
                await api.put(`/categorias/${editingItem.id}`, payload);
            } else {
                await api.post('/categorias', payload);
            }
            setShowCategoryModal(false);
            setEditingItem(null);
            resetCategoryForm();
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleEditCategory = (cat) => {
        setEditingItem(cat);
        setCategoryForm({
            nombre: cat.nombre,
            tipo: cat.tipo,
            categoriaPadreId: cat.categoriaPadreId?.toString() || '',
            icono: cat.icono || '📋',
            color: cat.color || '#64748b',
            orden: cat.orden || 0
        });
        setShowCategoryModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await api.delete(`/categorias/${id}`);
                onUpdate();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    };

    const resetCategoryForm = () => {
        setCategoryForm({
            nombre: '',
            tipo: 'EGRESO',
            categoriaPadreId: '',
            icono: '📋',
            color: '#64748b',
            orden: 0
        });
    };

    const toggleCategory = (id) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Obtener categorías padre
    const parentCategories = categorias.filter(c => !c.categoriaPadreId);

    // Obtener subcategorías de un padre
    const getSubcategories = (parentId) => {
        return categorias.filter(c => c.categoriaPadreId === parentId);
    };

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: '👤' },
        { id: 'workspaces', label: 'Workspaces', icon: '💼' },
        { id: 'categories', label: 'Categorías', icon: '🏷️' },
        { id: 'preferences', label: 'Preferencias', icon: '⚙️' }
    ];

    const emojiOptions = ['🏠', '💼', '🏢', '🏭', '🏪', '🏦', '💰', '💳', '📊', '📈', '🎯', '🚀'];
    const colorOptions = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-200">
                    <div className="flex space-x-8 px-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-sky-600 text-sky-600 font-medium'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={user.nombre}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Workspaces Tab */}
                    {activeTab === 'workspaces' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Mis Workspaces</h3>
                                <button
                                    onClick={() => {
                                        setEditingItem(null);
                                        resetWorkspaceForm();
                                        setShowWorkspaceModal(true);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                                >
                                    <Icons.Plus />
                                    <span>Nuevo Workspace</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspaces.map(ws => (
                                    <div
                                        key={ws.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        style={{ borderLeftWidth: '4px', borderLeftColor: ws.color }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-3xl">{ws.icono}</span>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{ws.nombre}</h4>
                                                    {ws.descripcion && (
                                                        <p className="text-sm text-gray-500 mt-1">{ws.descripcion}</p>
                                                    )}
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        {ws.esPrincipal && (
                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                                Principal
                                                            </span>
                                                        )}
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            ws.activo
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {ws.activo ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 mt-4">
                                            <button
                                                onClick={() => handleEditWorkspace(ws)}
                                                className="flex-1 text-sm px-3 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100"
                                            >
                                                Editar
                                            </button>
                                            {!ws.esPrincipal && (
                                                <>
                                                    <button
                                                        onClick={() => handleSetPrincipal(ws.id)}
                                                        className="flex-1 text-sm px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
                                                    >
                                                        Hacer Principal
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteWorkspace(ws.id)}
                                                        className="flex-1 text-sm px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Mis Categorías</h3>
                                <button
                                    onClick={() => {
                                        setEditingItem(null);
                                        resetCategoryForm();
                                        setShowCategoryModal(true);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                                >
                                    <Icons.Plus />
                                    <span>Nueva Categoría</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {parentCategories.map(parent => {
                                    const subcats = getSubcategories(parent.id);
                                    const isExpanded = expandedCategories[parent.id];

                                    return (
                                        <div key={parent.id} className="border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    {subcats.length > 0 && (
                                                        <button
                                                            onClick={() => toggleCategory(parent.id)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            {isExpanded ? '▼' : '▶'}
                                                        </button>
                                                    )}
                                                    <span className="text-2xl">{parent.icono}</span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-semibold text-gray-900">{parent.nombre}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                parent.tipo === 'INGRESO'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : parent.tipo === 'EGRESO'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {parent.tipo}
                                                            </span>
                                                            {subcats.length > 0 && (
                                                                <span className="text-xs text-gray-500">
                                                                    ({subcats.length} subcategorías)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditCategory(parent)}
                                                        className="text-sm px-3 py-1 text-sky-600 hover:bg-sky-50 rounded"
                                                    >
                                                        Editar
                                                    </button>
                                                    {!parent.esPredeterminada && (
                                                        <button
                                                            onClick={() => handleDeleteCategory(parent.id)}
                                                            className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {isExpanded && subcats.length > 0 && (
                                                <div className="border-t border-gray-200">
                                                    {subcats.map(sub => (
                                                        <div key={sub.id} className="flex items-center justify-between p-3 pl-12 hover:bg-gray-50">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-xl">{sub.icono}</span>
                                                                <span className="text-gray-700">{sub.nombre}</span>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleEditCategory(sub)}
                                                                    className="text-sm px-3 py-1 text-sky-600 hover:bg-sky-50 rounded"
                                                                >
                                                                    Editar
                                                                </button>
                                                                {!sub.esPredeterminada && (
                                                                    <button
                                                                        onClick={() => handleDeleteCategory(sub.id)}
                                                                        className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Preferencias</h3>
                            <p className="text-gray-600">Próximamente: Configuraciones adicionales...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Workspace Modal */}
            {showWorkspaceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingItem ? 'Editar Workspace' : 'Nuevo Workspace'}
                        </h3>
                        <form onSubmit={handleWorkspaceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={workspaceForm.nombre}
                                    onChange={(e) => setWorkspaceForm({...workspaceForm, nombre: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    placeholder="Ej: Personal, Trabajo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    value={workspaceForm.descripcion}
                                    onChange={(e) => setWorkspaceForm({...workspaceForm, descripcion: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    rows="2"
                                    placeholder="Descripción opcional"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {emojiOptions.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setWorkspaceForm({...workspaceForm, icono: emoji})}
                                            className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                                                workspaceForm.icono === emoji
                                                    ? 'border-sky-500 bg-sky-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                <div className="grid grid-cols-8 gap-2">
                                    {colorOptions.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setWorkspaceForm({...workspaceForm, color})}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                                workspaceForm.color === color
                                                    ? 'border-gray-900 scale-110'
                                                    : 'border-gray-200'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="workspaceActivo"
                                    checked={workspaceForm.activo}
                                    onChange={(e) => setWorkspaceForm({...workspaceForm, activo: e.target.checked})}
                                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                />
                                <label htmlFor="workspaceActivo" className="ml-2 block text-sm text-gray-900">
                                    Workspace activo
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
                                >
                                    {editingItem ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowWorkspaceModal(false);
                                        setEditingItem(null);
                                        resetWorkspaceForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingItem ? 'Editar Categoría' : 'Nueva Categoría'}
                        </h3>
                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryForm.nombre}
                                    onChange={(e) => setCategoryForm({...categoryForm, nombre: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                <select
                                    value={categoryForm.tipo}
                                    onChange={(e) => setCategoryForm({...categoryForm, tipo: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="INGRESO">Ingreso</option>
                                    <option value="EGRESO">Egreso</option>
                                    <option value="AMBOS">Ambos</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Padre (opcional)</label>
                                <select
                                    value={categoryForm.categoriaPadreId}
                                    onChange={(e) => setCategoryForm({...categoryForm, categoriaPadreId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="">Sin padre (categoría principal)</option>
                                    {parentCategories.filter(c => !editingItem || c.id !== editingItem.id).map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icono} {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
                                >
                                    {editingItem ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        setEditingItem(null);
                                        resetCategoryForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
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