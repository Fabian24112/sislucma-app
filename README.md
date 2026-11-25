# SISLUCMA - Sistema de Control de Almacén e Inventario
**Centro de Salud San Luis de Lucma**

Sistema web completo desarrollado con **Node.js, Express, HTML5, CSS3 moderno y Vanilla JavaScript**, con almacenamiento de base de datos persistente en JSON (sin necesidad de instalar motores externos como MySQL o PostgreSQL).

---

## 🚀 Cómo abrir y ejecutar en Visual Studio Code

### Paso 1: Abrir la carpeta en VS Code
1. Abre **Visual Studio Code**.
2. Ve a **Archivo (File) > Abrir carpeta (Open Folder...)**.
3. Selecciona la carpeta:
   `C:\Users\Fabian\.gemini\antigravity\scratch\sislucma-app`

### Paso 2: Abrir la Terminal Integrada
- En VS Code, presiona `Ctrl + \`` (o ve a **Terminal > Nueva Terminal**).

### Paso 3: Ejecutar la aplicación
Ejecuta el siguiente comando en la terminal:
```bash
node server.js
```
O también:
```bash
npm start
```

### Paso 4: Abrir en tu navegador web
Abre tu navegador (Chrome, Edge, etc.) e ingresa a:
👉 **http://localhost:3000**

---

## 🗄️ ¿Necesitas Base de Datos?
**No necesitas instalar programas adicionales como MySQL, SQL Server o PostgreSQL.** 
El sistema ya cuenta con su **Base de Datos persistente integrada** ubicada en:
`data/database.json`

Cada vez que agregues un producto, registres una entrada o salida, edites un proveedor o crees una categoría, los cambios se guardan automáticamente en dicho archivo en tiempo real.

---

## 📋 Vistas y Funcionalidades Incluidas (Idénticas a tus capturas)
1. **Login de Acceso**:
   - Logo SISLUCMA con cruz médica y caja de almacén.
   - Campos de Usuario, Contraseña y botón de Ingreso.
2. **Dashboard**:
   - Tarjetas de estadísticas: Productos registrados, disponibles, stock bajo y agotados.
   - Gráfico de dona (Estado de inventario) con porcentajes.
   - Gráfico de barras de progreso por categoría (Insumos médicos, Limpieza, Oficina, Otros).
   - Lista rápida de alertas de inventario y tabla de últimos movimientos.
3. **Inventario**:
   - Resumen total, activos, inactivos y categorías.
   - Filtros por nombre/código, categoría y estado.
   - Tabla completa con botón de historial de movimientos y vista previa.
4. **Productos**:
   - Modal de **Nuevo Producto** con autogeneración de código.
   - Modal de **Editar Producto** con bloqueo de edición de código.
   - Modal de **Detalle del Producto** (con stock mínimo/máximo e información del proveedor).
5. **Proveedores**:
   - Catálogo con RUC, contacto, teléfono, correo y estado.
   - Modales de **Nuevo Proveedor**, **Editar Proveedor** y **Detalle del Proveedor** (con dirección, referencia, distrito y provincia).
6. **Entradas**:
   - Listado de entradas con número de comprobante, fecha, tipo de documento y total de productos.
   - Formulario para registrar ingresos por categorías (Material de escritorio, Limpieza, Mobiliario, Otros bienes), N° de guía, productos pendientes y botón "Guardar ingreso".
   - Modal de detalle con visor de comprobante en PDF.
7. **Salidas**:
   - Listado de salidas por área/servicio (Limpieza, Emergencia, Farmacia, etc.).
   - Modal para registrar nueva salida por consumo o merma con selector de productos y cantidades.
   - Modal de detalle con comprobante de requerimiento asociado.
8. **Movimientos (Kardex)**:
   - Registro cronológico de todas las entradas y salidas con cantidades en verde (+) y rojo (-), stock antes y stock después.
9. **Alertas de Stock**:
   - Clasificación por: Stock Crítico, Stock Bajo, Próximos a vencer y Vencidos.
   - Modal de detalle de la alerta con últimos movimientos del producto.
10. **Gestión de Usuarios**:
    - Tabla de usuarios con roles (Administrador, Almacenero, Usuario), DNI y estado.
    - Modal de edición de roles y áreas asignadas.
11. **Configuración**:
    - Sub-pestañas: **Categoría**, **Unidades de medida**, **Áreas / Servicios**, **Ubicaciones internas**, **Parámetros de stock**, y **Datos del centro**.
    - Modales para agregar y editar categorías.
    - Datos institucionales del Centro de Salud San Luis de Lucma (código RENIPRESS, dirección, teléfono y director).
12. **Modales de Notificación**:
    - Diálogos emergentes con ícono celeste de check idénticos a los del diseño original.
