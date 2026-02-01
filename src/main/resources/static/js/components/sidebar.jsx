const Sidebar = ({ activeView, setActiveView, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'movements', label: 'Movimientos', icon: '💸' },
        { id: 'budgets', label: 'Presupuestos', icon: '📋' },
        { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
        { id: 'reports', label: 'Reportes', icon: '📈' },
        { id: 'settings', label: 'Configuración', icon: '⚙️' }
    ];

    const handleLogout = () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            if (onLogout) {
                onLogout();
            } else {
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    return (
        <div className="w-64 flex flex-col" style={{ background: '#0a0f1a', borderRight: '1px solid #334155' }}>
            <div className="p-6 select-none" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                <h1 className="text-2xl font-bold cursor-default text-white">💰 FinanzApp</h1>
                <p className="text-xs text-gray-400 mt-1">Gestión Financiera</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map(item => (
                    <SidebarButton
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeView === item.id}
                        onClick={() => setActiveView(item.id)}
                    />
                ))}
            </nav>

            <div className="p-4 border-t" style={{ borderColor: '#334155' }}>
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors w-full px-4 py-2 rounded-lg hover:bg-slate-800"
                >
                    <span>🚪</span>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    );
};

const SidebarButton = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg transition-all ${
            active
                ? 'bg-blue-600 text-white font-semibold shadow-lg'
                : 'hover:bg-slate-800 text-gray-300'
        }`}
    >
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
    </button>
);