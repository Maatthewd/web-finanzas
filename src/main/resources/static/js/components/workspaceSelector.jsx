// WorkspaceSelector Component
const WorkspaceSelector = ({ workspaces = [], currentWorkspace, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!workspaces || workspaces.length === 0) {
        return null;
    }

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: currentWorkspace?.color || '#0ea5e9' }}
                >
                    {currentWorkspace ? getInitials(currentWorkspace.nombre) : 'TD'}
                </div>
                <span className="font-medium text-gray-700">{currentWorkspace?.nombre || 'Todos'}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                        <div className="p-2">
                            <button
                                onClick={() => {
                                    onSelect(null);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    !currentWorkspace
                                        ? 'bg-sky-50 text-sky-700'
                                        : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-xs font-bold">
                                    TD
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium">Todos</p>
                                    <p className="text-xs text-gray-500">Ver todos los workspaces</p>
                                </div>
                            </button>

                            <div className="my-2 border-t border-gray-200"></div>

                            {workspaces.map(ws => (
                                <button
                                    key={ws.id}
                                    onClick={() => {
                                        onSelect(ws);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                        currentWorkspace?.id === ws.id
                                            ? 'bg-sky-50 text-sky-700'
                                            : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                    style={{
                                        borderLeft: currentWorkspace?.id === ws.id
                                            ? `4px solid ${ws.color}`
                                            : 'none'
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                        style={{ backgroundColor: ws.color }}
                                    >
                                        {getInitials(ws.nombre)}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">{ws.nombre}</p>
                                        {ws.descripcion && (
                                            <p className="text-xs text-gray-500">{ws.descripcion}</p>
                                        )}
                                    </div>
                                    {ws.esPrincipal && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                            Principal
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};