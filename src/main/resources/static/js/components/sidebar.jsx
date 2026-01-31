const Sidebar = ({ setActiveView }) => (
    <div className="w-64 sidebar-dark text-white flex flex-col">
        <div className="p-6 gradient-bg">
            <h1 className="text-2xl font-bold">💰 FinanzApp</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <SidebarButton label="Dashboard" onClick={() => setActiveView('dashboard')} />
            <SidebarButton label="Movimientos" onClick={() => setActiveView('movements')} />
            <SidebarButton label="Presupuestos" onClick={() => setActiveView('budgets')} />
            <SidebarButton label="Notificaciones" onClick={() => setActiveView('notifications')} />
            <SidebarButton label="Reportes" onClick={() => setActiveView('reports')} />
            <SidebarButton label="Configuración" onClick={() => setActiveView('settings')} />
        </nav>

        <div className="p-4 border-t border-slate-700">
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-red-400">
                Cerrar sesión
            </button>
        </div>
    </div>
);

const SidebarButton = ({ label, onClick }) => (
    <button onClick={onClick} className="block w-full text-left px-4 py-2 rounded hover:bg-slate-700 transition">
        {label}
    </button>
);
