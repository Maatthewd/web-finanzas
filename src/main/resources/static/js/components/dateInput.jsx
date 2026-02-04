// DateInput Component - Input de fecha con calendario nativo
const DateInput = ({ value, onChange, required = false, label, className = "" }) => {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {label} {required && '*'}
                </label>
            )}
            <input
                type="date"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 ${className}`}
            />
        </div>
    );
};