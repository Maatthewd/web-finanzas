// DateInput Component - Input de fecha personalizado con formato dd/mm/yyyy
const DateInput = ({ value, onChange, required = false, label, className = "" }) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value) {
            // Convertir de YYYY-MM-DD a dd/mm/yyyy para mostrar
            const [year, month, day] = value.split('-');
            setDisplayValue(`${day}/${month}/${year}`);
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e) => {
        let input = e.target.value.replace(/\D/g, ''); // Solo números

        // Formatear mientras escribe: dd/mm/yyyy
        if (input.length >= 2) {
            input = input.slice(0, 2) + '/' + input.slice(2);
        }
        if (input.length >= 5) {
            input = input.slice(0, 5) + '/' + input.slice(5, 9);
        }

        setDisplayValue(input);

        // Validar y convertir a formato ISO (YYYY-MM-DD)
        if (input.length === 10) {
            const [day, month, year] = input.split('/');

            // Validación básica
            const dayNum = parseInt(day);
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);

            if (dayNum >= 1 && dayNum <= 31 &&
                monthNum >= 1 && monthNum <= 12 &&
                yearNum >= 1900 && yearNum <= 2100) {

                const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                onChange(isoDate);
            }
        } else if (input.length < 10) {
            // Si está incompleto, limpiar el valor
            onChange('');
        }
    };

    const handleBlur = () => {
        // Al salir del campo, validar formato completo
        if (displayValue.length > 0 && displayValue.length !== 10) {
            alert('Formato de fecha inválido. Use dd/mm/yyyy');
            setDisplayValue('');
            onChange('');
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {label} {required && '*'}
                </label>
            )}
            <input
                type="text"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="dd/mm/yyyy"
                maxLength="10"
                required={required}
                className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${className}`}
            />
        </div>
    );
};