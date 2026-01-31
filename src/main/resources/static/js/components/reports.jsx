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