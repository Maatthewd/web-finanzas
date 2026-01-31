// NotificationsCenter Component
const NotificationsCenter = ({ notificaciones, onUpdate }) => {
    const [filter, setFilter] = useState('all');

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notificaciones/${id}/leer`);
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notificaciones/leer-todas');
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notificaciones/${id}`);
            onUpdate();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notificaciones.filter(n => !n.leida)
        : notificaciones;

    const getNotificationIcon = (tipo) => {
        const icons = {
            'VENCIMIENTO_PROXIMO': '⏰',
            'VENCIMIENTO_HOY': '🔔',
            'VENCIMIENTO_PASADO': '❗',
            'PRESUPUESTO_ALERTA': '⚠️',
            'PRESUPUESTO_SUPERADO': '🚨'
        };
        return icons[tipo] || '📌';
    };

    const getNotificationColor = (tipo) => {
        const colors = {
            'VENCIMIENTO_PROXIMO': 'bg-blue-50 border-blue-200',
            'VENCIMIENTO_HOY': 'bg-orange-50 border-orange-200',
            'VENCIMIENTO_PASADO': 'bg-red-50 border-red-200',
            'PRESUPUESTO_ALERTA': 'bg-yellow-50 border-yellow-200',
            'PRESUPUESTO_SUPERADO': 'bg-red-50 border-red-200'
        };
        return colors[tipo] || 'bg-gray-50 border-gray-200';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
                {notificaciones.some(n => !n.leida) && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
                    >
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'all' ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Todas ({notificaciones.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'unread' ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    No leídas ({notificaciones.filter(n => !n.leida).length})
                </button>
            </div>

            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                        <Icons.Notifications className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'unread' ? 'Todas han sido leídas' : 'No tienes notificaciones aún'}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`border-l-4 rounded-lg p-4 ${getNotificationColor(notif.tipo)} ${
                                !notif.leida ? 'shadow-md' : 'opacity-75'
                            } card-hover`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    <span className="text-2xl">{getNotificationIcon(notif.tipo)}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-semibold text-gray-900">{notif.titulo}</h4>
                                            {!notif.leida && (
                                                <span className="w-2 h-2 bg-blue-600 rounded-full notification-badge"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">{notif.mensaje}</p>
                                        <p className="text-xs text-gray-500 mt-2">{formatDate(notif.fechaCreacion)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-1 ml-4">
                                    {!notif.leida && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                                        >
                                            Marcar leída
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notif.id)}
                                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Reports Component
const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        tipo: '',
        pagado: '',
        categoriaId: '',
        inicio: '',
        fin: ''
    });

    const handleExport = async (format) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.tipo) params.append('tipo', filters.tipo);
            if (filters.pagado) params.append('pagado', filters.pagado);
            if (filters.categoriaId) params.append('categoriaId', filters.categoriaId);
            if (filters.inicio) params.append('inicio', filters.inicio);
            if (filters.fin) params.append('fin', filters.fin);

            const url = `${API_BASE_URL}/export/${format}?${params.toString()}`;
            const token = localStorage.getItem('token');

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al exportar');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `movimientos_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (error) {
            alert('Error al exportar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Exportación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            value={filters.tipo}
                            onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">Todos</option>
                            <option value="INGRESO">Ingresos</option>
                            <option value="EGRESO">Egresos</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            value={filters.pagado}
                            onChange={(e) => setFilters({...filters, pagado: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">Todos</option>
                            <option value="true">Pagados</option>
                            <option value="false">Pendientes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                        <input
                            type="date"
                            value={filters.inicio}
                            onChange={(e) => setFilters({...filters, inicio: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                        <input
                            type="date"
                            value={filters.fin}
                            onChange={(e) => setFilters({...filters, fin: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        <Icons.Reports />
                        <span>{loading ? 'Exportando...' : 'Exportar a Excel'}</span>
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        <Icons.Reports />
                        <span>{loading ? 'Exportando...' : 'Exportar a PDF'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
                <h3 className="text-xl font-bold mb-2">💡 Consejo</h3>
                <p className="text-sky-100">
                    Los reportes incluyen todos tus movimientos filtrados con totales, subtotales y balance general.
                </p>
            </div>
        </div>
    );
};