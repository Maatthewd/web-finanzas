// CategorySelector Component - Con soporte para categorías jerárquicas
const CategorySelector = ({ categories, value, onChange, tipo }) => {
    const [selectedParent, setSelectedParent] = useState('');

    // Filtrar categorías por tipo
    const filteredCategories = categories.filter(c =>
        c.tipo === tipo || c.tipo === 'AMBOS'
    );

    // Obtener solo categorías padre (sin categoriaPadreId)
    const parentCategories = filteredCategories.filter(c => !c.categoriaPadreId);

    // Obtener subcategorías del padre seleccionado
    const childCategories = selectedParent
        ? filteredCategories.filter(c => c.categoriaPadreId === parseInt(selectedParent))
        : [];

    // Efecto para establecer el padre cuando se carga una categoría seleccionada
    useEffect(() => {
        if (value) {
            const selected = categories.find(c => c.id === parseInt(value));
            if (selected && selected.categoriaPadreId) {
                setSelectedParent(selected.categoriaPadreId.toString());
            } else if (selected && !selected.categoriaPadreId) {
                setSelectedParent(selected.id.toString());
            }
        }
    }, [value, categories]);

    const handleParentChange = (e) => {
        const parentId = e.target.value;
        setSelectedParent(parentId);

        // Si la categoría padre no tiene hijos, seleccionarla directamente
        const hasChildren = filteredCategories.some(c =>
            c.categoriaPadreId === parseInt(parentId)
        );

        if (!hasChildren && parentId) {
            onChange(parseInt(parentId));
        } else {
            onChange(''); // Limpiar selección
        }
    };

    const handleChildChange = (e) => {
        onChange(parseInt(e.target.value));
    };

    return (
        <div className="space-y-3">
            {/* Selector de Categoría Padre */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría Principal *
                </label>
                <select
                    required
                    value={selectedParent}
                    onChange={handleParentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                    <option value="">Selecciona una categoría</option>
                    {parentCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selector de Subcategoría (si existen) */}
            {childCategories.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subcategoría *
                    </label>
                    <select
                        required
                        value={value || ''}
                        onChange={handleChildChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                        <option value="">Selecciona una subcategoría</option>
                        {childCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};