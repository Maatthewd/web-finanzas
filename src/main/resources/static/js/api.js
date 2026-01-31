// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Utility Functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return '-';
    }
};

// API Helper
const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            // Si es 401, el token es inválido
            if (response.status === 401) {
                console.warn('Token inválido o expirado');
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Si no estamos en la página de login, recargar
                if (window.location.pathname !== '/login') {
                    window.location.reload();
                }
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }

            // Otros errores HTTP
            if (!response.ok) {
                let errorMessage = 'Error en la solicitud';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Si no puede parsear el error, usar mensaje genérico
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            // No content (204)
            if (response.status === 204) {
                return null;
            }

            // Parsear respuesta JSON
            try {
                return await response.json();
            } catch (e) {
                console.error('Error parseando JSON:', e);
                return null;
            }
        } catch (error) {
            console.error('API Error:', error);

            // Re-lanzar el error para que el componente lo maneje
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        });
    },

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};