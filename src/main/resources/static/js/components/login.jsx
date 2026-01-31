// Login Component
        const LoginForm = ({ onLoginSuccess }) => {
            const [isLogin, setIsLogin] = useState(true);
            const [formData, setFormData] = useState({
                email: '',
                password: '',
                nombre: ''
            });
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');

            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');

                try {
                    const endpoint = isLogin ? '/auth/login' : '/auth/register';
                    const payload = isLogin
                        ? { email: formData.email, password: formData.password }
                        : formData;

                    const data = await api.post(endpoint, payload);

                    if (data && data.token) {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify({
                            id: data.id,
                            nombre: data.nombre,
                            email: data.email
                        }));
                        onLoginSuccess();
                    }
                } catch (err) {
                    setError(err.message || 'Error en la autenticación');
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div className="bg-white rounded-2xl shadow-2xl p-8">
                            <div>
                                <h2 className="text-center text-4xl font-extrabold text-gray-900 mb-2">
                                    💰 FinanzApp
                                </h2>
                                <p className="text-center text-sm text-gray-600">
                                    {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
                                </p>
                            </div>

                            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="rounded-md bg-red-50 p-4">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {!isLogin && (
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                                Nombre completo
                                            </label>
                                            <input
                                                id="nombre"
                                                name="nombre"
                                                type="text"
                                                required={!isLogin}
                                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Juan Pérez"
                                                value={formData.nombre}
                                                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="tu@email.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Contraseña
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError('');
                                        }}
                                        className="text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            );
        };