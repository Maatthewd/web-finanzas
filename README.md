# 💰 API de Gestión de Finanzas Personales

Sistema completo de gestión financiera personal desarrollado con Spring Boot, que permite a los usuarios llevar un control detallado de sus ingresos, egresos y obtener resúmenes financieros.

## 🚀 Características

### Autenticación y Seguridad
- ✅ Registro de usuarios con validación
- ✅ Login con JWT (JSON Web Tokens)
- ✅ Encriptación de contraseñas con BCrypt
- ✅ Protección de endpoints con Spring Security
- ✅ Tokens con expiración configurable

### Gestión de Movimientos
- ✅ Crear, editar y eliminar movimientos (ingresos/egresos)
- ✅ Categorización de movimientos
- ✅ Marcar movimientos como pagados o pendientes
- ✅ Fecha de vencimiento para movimientos
- ✅ Filtrado avanzado por múltiples criterios
- ✅ Paginación de resultados

### Categorías
- ✅ Categorías predefinidas al iniciar
- ✅ Crear categorías personalizadas
- ✅ Tipos: INGRESO, EGRESO, AMBOS

### Resúmenes Financieros
- ✅ Total de ingresos y egresos
- ✅ Balance general
- ✅ Deudas pendientes
- ✅ Resumen por categorías
- ✅ **Resúmenes por día**
- ✅ **Resúmenes por mes**
- ✅ **Resúmenes por año**
- ✅ Resúmenes por rango de fechas personalizado

### Documentación
- ✅ Swagger UI integrado
- ✅ OpenAPI 3.0 Specification

## 🛠️ Tecnologías Utilizadas

- **Java 21**
- **Spring Boot 4.0.2**
- **Spring Security** - Seguridad y autenticación
- **Spring Data JPA** - Persistencia de datos
- **PostgreSQL** - Base de datos
- **JWT (jjwt 0.12.3)** - Tokens de autenticación
- **Lombok** - Reducción de boilerplate
- **Swagger/OpenAPI** - Documentación de API
- **Maven** - Gestión de dependencias

## 📋 Requisitos Previos

- JDK 21 o superior
- PostgreSQL 12 o superior
- Maven 3.9 o superior
- IntelliJ IDEA (recomendado)

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone [url-del-repositorio]
cd finanzas
```

### 2. Configurar la base de datos

Crear una base de datos en PostgreSQL:

```sql
CREATE DATABASE finanzas_db;
```

### 3. Configurar application.properties

El archivo ya está configurado, pero puedes personalizarlo según tus necesidades:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/finanzas_db
spring.datasource.username=postgres
spring.datasource.password=tu_password

# JWT
jwt.secret=tu-secreto-super-seguro-cambiar-en-produccion
jwt.expiration=86400000
```

### 4. Instalar dependencias y compilar

```bash
./mvnw clean install
```

### 5. Ejecutar la aplicación

```bash
./mvnw spring-boot:run
```

La aplicación estará disponible en: `http://localhost:8080`

## 📚 Documentación de la API

### Swagger UI

Una vez que la aplicación esté corriendo, accede a:

```
http://localhost:8080/swagger-ui.html
```

### Endpoints Principales

#### 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |

**Ejemplo de Registro:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "rol": "ROLE_USER"
}
```

#### 📁 Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categorias` | Listar todas las categorías |
| POST | `/api/categorias` | Crear nueva categoría |
| GET | `/api/categorias/{id}` | Obtener categoría por ID |
| PUT | `/api/categorias/{id}` | Actualizar categoría |
| DELETE | `/api/categorias/{id}` | Eliminar categoría |

**Categorías Predefinidas:**
- **Ingresos:** Salario, Freelance, Inversiones, Bonos, Ventas, Otros Ingresos
- **Egresos:** Alquiler, Servicios, Alimentación, Transporte, Salud, Educación, Entretenimiento, Ropa, Tecnología, Impuestos, Ahorro, Otros Gastos
- **Ambos:** Préstamos, Transferencias

#### 💸 Movimientos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/movimientos` | Listar movimientos (paginado) |
| POST | `/api/movimientos` | Crear nuevo movimiento |
| GET | `/api/movimientos/{id}` | Obtener movimiento por ID |
| PUT | `/api/movimientos/{id}` | Actualizar movimiento |
| DELETE | `/api/movimientos/{id}` | Eliminar movimiento |
| PATCH | `/api/movimientos/{id}/pagar` | Marcar como pagado |
| PATCH | `/api/movimientos/{id}/pendiente` | Marcar como pendiente |
| GET | `/api/movimientos/filtrar` | Filtrar movimientos |

**Ejemplo de Crear Movimiento:**
```json
{
  "descripcion": "Pago de alquiler Enero",
  "tipo": "EGRESO",
  "monto": 50000.00,
  "fecha": "2024-01-30",
  "fechaVencimiento": "2024-02-05",
  "pagado": false,
  "categoriaId": 1
}
```

**Filtros Disponibles:**
- `tipo` - INGRESO o EGRESO
- `pagado` - true/false
- `categoriaId` - ID de la categoría
- `inicio` - Fecha inicial (YYYY-MM-DD)
- `fin` - Fecha final (YYYY-MM-DD)

#### 📊 Resúmenes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/resumen/ingresos` | Total de ingresos pagados |
| GET | `/api/resumen/egresos` | Total de egresos pagados |
| GET | `/api/resumen/balance` | Balance general |
| GET | `/api/resumen/deudas` | Total de deudas pendientes |
| GET | `/api/resumen/categorias` | Totales por categoría |
| GET | `/api/resumen/rango` | Total por rango de fechas |

**Nuevos Endpoints - Resúmenes Temporales:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/resumen/dia` | Total por día específico |
| GET | `/api/resumen/dia/balance` | Balance de un día |
| GET | `/api/resumen/mes` | Total por mes |
| GET | `/api/resumen/mes/balance` | Balance del mes |
| GET | `/api/resumen/anio` | Total por año |
| GET | `/api/resumen/anio/balance` | Balance del año |

**Ejemplos:**

```bash
# Balance del mes actual
GET /api/resumen/mes/balance?anio=2024&mes=1

# Total de ingresos de un día
GET /api/resumen/dia?tipo=INGRESO&fecha=2024-01-30

# Balance del año
GET /api/resumen/anio/balance?anio=2024
```

## 🔑 Autenticación

Todos los endpoints (excepto `/api/auth/**` y `/swagger-ui/**`) requieren autenticación.

### Cómo autenticarse:

1. **Registrarse o hacer login** para obtener el token JWT
2. **Incluir el token** en cada request subsiguiente:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### En Swagger:

1. Haz clic en el botón **"Authorize"** (candado)
2. Ingresa el token (sin "Bearer ")
3. Haz clic en **"Authorize"**
4. Ahora puedes probar todos los endpoints

## 🏗️ Arquitectura del Proyecto

```
com.matech.finanzas/
├── config/              # Configuraciones (OpenAPI, etc.)
├── controller/          # Controladores REST
├── dto/                 # Data Transfer Objects
├── entity/              # Entidades JPA
├── exception/           # Manejo de excepciones
├── mapper/              # Conversión Entity ↔ DTO
├── projection/          # Proyecciones para queries
├── repository/          # Repositorios JPA
├── security/            # Configuración de seguridad y JWT
└── service/             # Lógica de negocio
```

## 🔒 Seguridad

### Características de Seguridad Implementadas:

- **Contraseñas encriptadas** con BCrypt
- **JWT con expiración** configurable
- **Autenticación stateless** (sin sesiones)
- **Filtros de seguridad** en cada request
- **Validación de tokens** en cada endpoint protegido
- **Aislamiento de datos** por usuario (cada usuario solo ve sus datos)

### Roles:

- **ROLE_USER**: Usuario estándar (default al registrarse)
- **ROLE_ADMIN**: Administrador (se puede asignar manualmente en BD)

## 📊 Modelo de Datos

### Usuario
```java
- id: Long
- nombre: String
- email: String (único)
- password: String (encriptado)
- rol: Rol
- activo: boolean
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

### Categoria
```java
- id: Long
- nombre: String
- tipo: TipoCategoria (INGRESO, EGRESO, AMBOS)
```

### Movimiento
```java
- id: Long
- descripcion: String
- tipo: TipoMovimiento (INGRESO, EGRESO)
- monto: BigDecimal
- fecha: LocalDate
- fechaVencimiento: LocalDate
- pagado: boolean
- categoria: Categoria (ManyToOne)
- usuario: Usuario (ManyToOne)
```

## 🧪 Testing

### Ejecutar todos los tests:

```bash
./mvnw test
```

### Tests Recomendados:

1. **Autenticación**
   - Registro de usuario
   - Login con credenciales correctas/incorrectas
   - Acceso con/sin token

2. **Movimientos**
   - Crear movimiento
   - Actualizar movimiento
   - Filtrar movimientos
   - Verificar aislamiento de datos por usuario

3. **Resúmenes**
   - Calcular totales correctamente
   - Resúmenes por día/mes/año

## 📦 Deployment

### Variables de Entorno en Producción:

```bash
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
JWT_SECRET=un-secreto-muy-seguro-y-largo-para-produccion
```

### Docker (Opcional):

```dockerfile
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY target/finanzas-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia Apache 2.0.

## 👤 Autor

**Matech**

## 🐛 Reportar Bugs

Si encuentras algún bug, por favor abre un issue en el repositorio.

## ✨ Próximas Características

- [ ] Exportar datos a Excel/PDF
- [ ] Gráficos y estadísticas visuales
- [ ] Presupuestos mensuales
- [ ] Notificaciones de vencimientos
- [ ] Multi-moneda
- [ ] Categorías compartidas entre usuarios
- [ ] Dashboard con resumen general

---

Desarrollado con ❤️ usando Spring Boot
