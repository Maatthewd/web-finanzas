// WorkspaceSelector Component
const WorkspaceSelector = ({ workspaces, currentWorkspace, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <span className="text-2xl">{currentWorkspace?.icono || '📊'}</span>
                <span className="font-medium text-gray-700">{currentWorkspace?.nombre || 'Todos'}</span>
                <Icons.ChevronDown />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
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
                                <span className="text-2xl">📊</span>
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
                                    <span className="text-2xl">{ws.icono}</span>
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