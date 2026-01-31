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

