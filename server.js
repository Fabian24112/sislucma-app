// server.js - Servidor API y estático para SISLUCMA
const express = require('express');
const cors = require('cors');
const path = require('path');
const { readDb, writeDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper para obtener fecha actual formateada
function getNowFormatted() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ================= PRODUCTOS =================
app.get('/api/productos', (req, res) => {
  const db = readDb();
  let items = db.productos || [];
  const { q, categoria, estado } = req.query;

  if (q) {
    const search = q.toLowerCase();
    items = items.filter(p => 
      p.nombre.toLowerCase().includes(search) || 
      p.codigo.toLowerCase().includes(search) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(search))
    );
  }
  if (categoria && categoria !== 'Todos') {
    items = items.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
  }
  if (estado && estado !== 'Todos') {
    items = items.filter(p => p.estado.toLowerCase() === estado.toLowerCase());
  }

  res.json(items);
});

app.post('/api/productos', (req, res) => {
  const db = readDb();
  const nextId = db.productos.length > 0 ? Math.max(...db.productos.map(p => p.id)) + 1 : 1;
  const codigo = req.body.codigo || `PRD-${String(nextId).padStart(3, '0')}`;

  const newProd = {
    id: nextId,
    codigo: codigo,
    nombre: req.body.nombre || '',
    categoria: req.body.categoria || '',
    descripcion: req.body.descripcion || '',
    unidad: req.body.unidad || 'Unidad',
    presentacion: req.body.presentacion || 'Caja x 1',
    proveedor: req.body.proveedor || '',
    stock_minimo: Number(req.body.stock_minimo) || 10,
    stock_maximo: Number(req.body.stock_maximo) || 100,
    stock_actual: Number(req.body.stock_actual) || 0,
    ubicacion: req.body.ubicacion || 'Almacén 1',
    area_servicio: req.body.area_servicio || 'Almacén',
    estado: req.body.estado || 'Activo',
    fecha_vencimiento: req.body.fecha_vencimiento || ''
  };

  db.productos.push(newProd);
  writeDb(db);
  res.status(201).json(newProd);
});

app.put('/api/productos/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const idx = db.productos.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  db.productos[idx] = {
    ...db.productos[idx],
    nombre: req.body.nombre ?? db.productos[idx].nombre,
    categoria: req.body.categoria ?? db.productos[idx].categoria,
    descripcion: req.body.descripcion ?? db.productos[idx].descripcion,
    unidad: req.body.unidad ?? db.productos[idx].unidad,
    presentacion: req.body.presentacion ?? db.productos[idx].presentacion,
    proveedor: req.body.proveedor ?? db.productos[idx].proveedor,
    stock_minimo: req.body.stock_minimo !== undefined ? Number(req.body.stock_minimo) : db.productos[idx].stock_minimo,
    stock_maximo: req.body.stock_maximo !== undefined ? Number(req.body.stock_maximo) : db.productos[idx].stock_maximo,
    stock_actual: req.body.stock_actual !== undefined ? Number(req.body.stock_actual) : db.productos[idx].stock_actual,
    ubicacion: req.body.ubicacion ?? db.productos[idx].ubicacion,
    area_servicio: req.body.area_servicio ?? db.productos[idx].area_servicio,
    estado: req.body.estado ?? db.productos[idx].estado,
    fecha_vencimiento: req.body.fecha_vencimiento ?? db.productos[idx].fecha_vencimiento
  };

  writeDb(db);
  res.json(db.productos[idx]);
});

app.delete('/api/productos/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.productos = db.productos.filter(p => p.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// ================= PROVEEDORES =================
app.get('/api/proveedores', (req, res) => {
  const db = readDb();
  let items = db.proveedores || [];
  const { q, estado } = req.query;

  if (q) {
    const search = q.toLowerCase();
    items = items.filter(p => 
      p.nombre.toLowerCase().includes(search) || 
      p.ruc.includes(search) ||
      (p.contacto && p.contacto.toLowerCase().includes(search))
    );
  }
  if (estado && estado !== 'Todos') {
    items = items.filter(p => p.estado.toLowerCase() === estado.toLowerCase());
  }

  res.json(items);
});

app.post('/api/proveedores', (req, res) => {
  const db = readDb();
  const nextId = db.proveedores.length > 0 ? Math.max(...db.proveedores.map(p => p.id)) + 1 : 1;

  const newProv = {
    id: nextId,
    nombre: req.body.nombre || '',
    ruc: req.body.ruc || '',
    contacto: req.body.contacto || '',
    cargo: req.body.cargo || 'Representante',
    telefono: req.body.telefono || '',
    email: req.body.email || '',
    direccion: req.body.direccion || '',
    referencia: req.body.referencia || '',
    distrito: req.body.distrito || 'Lima',
    provincia: req.body.provincia || 'Lima',
    departamento: req.body.departamento || 'Lima',
    estado: req.body.estado || 'Activo'
  };

  db.proveedores.push(newProv);
  writeDb(db);
  res.status(201).json(newProv);
});

app.put('/api/proveedores/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const idx = db.proveedores.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Proveedor no encontrado' });

  db.proveedores[idx] = { ...db.proveedores[idx], ...req.body, id };
  writeDb(db);
  res.json(db.proveedores[idx]);
});

app.delete('/api/proveedores/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.proveedores = db.proveedores.filter(p => p.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// ================= ENTRADAS =================
app.get('/api/entradas', (req, res) => {
  const db = readDb();
  res.json(db.entradas || []);
});

app.post('/api/entradas', (req, res) => {
  const db = readDb();
  const nextId = db.entradas.length > 0 ? Math.max(...db.entradas.map(e => e.id)) + 1 : 1;
  const numEntrada = `ENT-${String(nextId).padStart(3, '0')}`;
  const now = getNowFormatted();

  const newEntrada = {
    id: nextId,
    numero: numEntrada,
    fecha: now,
    proveedor: req.body.proveedor || 'Proveedor General',
    tipo_documento: req.body.tipo_documento || 'Factura',
    numero_documento: req.body.numero_documento || `FAC-${nextId}`,
    total_productos: (req.body.items || []).reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0),
    registrado_por: req.body.registrado_por || 'Luis Salazar',
    observacion: req.body.observacion || 'Ingreso de material a almacén',
    documento_pdf: `${req.body.numero_documento || numEntrada}.pdf`,
    items: req.body.items || []
  };

  db.entradas.unshift(newEntrada);

  // Actualizar stock de productos e insertar en movimientos
  (newEntrada.items || []).forEach(it => {
    const prod = db.productos.find(p => p.nombre.toLowerCase() === it.producto.toLowerCase() || p.codigo === it.producto);
    const stockAntes = prod ? prod.stock_actual : 0;
    const stockDespues = stockAntes + Number(it.cantidad || 0);

    if (prod) {
      prod.stock_actual = stockDespues;
    }

    db.movimientos.unshift({
      id: db.movimientos.length > 0 ? Math.max(...db.movimientos.map(m => m.id)) + 1 : 1,
      fecha_hora: now,
      tipo: 'Entrada',
      producto: it.producto,
      cantidad: Number(it.cantidad || 0),
      area_proveedor: newEntrada.proveedor,
      registrado_por: newEntrada.registrado_por,
      numero_documento: newEntrada.numero_documento,
      ubicacion: it.ubicacion || (prod ? prod.ubicacion : 'Almacén 1'),
      stock_antes: stockAntes,
      stock_despues: stockDespues,
      observacion: newEntrada.observacion,
      documento_pdf: newEntrada.documento_pdf
    });
  });

  writeDb(db);
  res.status(201).json(newEntrada);
});

// ================= SALIDAS =================
app.get('/api/salidas', (req, res) => {
  const db = readDb();
  res.json(db.salidas || []);
});

app.post('/api/salidas', (req, res) => {
  const db = readDb();
  const nextId = db.salidas.length > 0 ? Math.max(...db.salidas.map(s => s.id)) + 1 : 1;
  const numSalida = `SAL-${String(nextId).padStart(3, '0')}`;
  const now = getNowFormatted();

  const newSalida = {
    id: nextId,
    numero: numSalida,
    fecha: req.body.fecha || now,
    area_servicio: req.body.area_servicio || 'Limpieza',
    tipo_salida: req.body.tipo_salida || 'Consumo',
    numero_documento: req.body.numero_documento || `REQ-${nextId}`,
    registrado_por: req.body.registrado_por || 'Miguel Mantari',
    observacion: req.body.observacion || 'Salida de insumos para atención del centro de salud',
    documento_pdf: `${req.body.numero_documento || numSalida}.pdf`,
    items: req.body.items || []
  };

  db.salidas.unshift(newSalida);

  // Descontar stock e insertar en movimientos
  (newSalida.items || []).forEach(it => {
    const prod = db.productos.find(p => p.nombre.toLowerCase() === it.producto.toLowerCase() || p.codigo === it.producto);
    const stockAntes = prod ? prod.stock_actual : 0;
    const stockDespues = Math.max(0, stockAntes - Number(it.cantidad || 0));

    if (prod) {
      prod.stock_actual = stockDespues;
    }

    db.movimientos.unshift({
      id: db.movimientos.length > 0 ? Math.max(...db.movimientos.map(m => m.id)) + 1 : 1,
      fecha_hora: now,
      tipo: 'Salida',
      producto: it.producto,
      cantidad: -Math.abs(Number(it.cantidad || 0)),
      area_proveedor: newSalida.area_servicio,
      registrado_por: newSalida.registrado_por,
      numero_documento: newSalida.numero_documento,
      ubicacion: it.ubicacion || (prod ? prod.ubicacion : 'Estante A - Fila 2'),
      stock_antes: stockAntes,
      stock_despues: stockDespues,
      observacion: newSalida.observacion,
      documento_pdf: newSalida.documento_pdf
    });
  });

  writeDb(db);
  res.status(201).json(newSalida);
});

// ================= MOVIMIENTOS =================
app.get('/api/movimientos', (req, res) => {
  const db = readDb();
  res.json(db.movimientos || []);
});

// ================= USUARIOS =================
app.get('/api/usuarios', (req, res) => {
  const db = readDb();
  res.json(db.users || []);
});

app.post('/api/usuarios', (req, res) => {
  const db = readDb();
  const nextId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = {
    id: nextId,
    nombres: req.body.nombres || '',
    apellidos: req.body.apellidos || '',
    correo: req.body.correo || '',
    dni: req.body.dni || '',
    rol: req.body.rol || 'Usuario',
    area: req.body.area || 'Administración',
    estado: req.body.estado || 'Activo',
    fecha_registro: getNowFormatted()
  };
  db.users.push(newUser);
  writeDb(db);
  res.status(201).json(newUser);
});

app.put('/api/usuarios/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
  db.users[idx] = { ...db.users[idx], ...req.body, id };
  writeDb(db);
  res.json(db.users[idx]);
});

app.delete('/api/usuarios/:id', (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.users = db.users.filter(u => u.id !== id);
  writeDb(db);
  res.json({ success: true });
});

// ================= CONFIGURACIÓN (CATEGORÍAS, UNIDADES, ÁREAS, UBICACIONES, CENTRO) =================
app.get('/api/config/:seccion', (req, res) => {
  const db = readDb();
  const seccion = req.params.seccion;
  if (seccion === 'categorias') return res.json(db.categorias || []);
  if (seccion === 'unidades') return res.json(db.unidades || []);
  if (seccion === 'areas') return res.json(db.areas || []);
  if (seccion === 'ubicaciones') return res.json(db.ubicaciones || []);
  if (seccion === 'centro') return res.json(db.centro_info || {});
  res.status(404).json({ error: 'Sección no encontrada' });
});

app.post('/api/config/:seccion', (req, res) => {
  const db = readDb();
  const seccion = req.params.seccion;
  if (!db[seccion]) db[seccion] = [];
  const nextId = db[seccion].length > 0 ? Math.max(...db[seccion].map(x => x.id || 0)) + 1 : 1;

  const item = {
    id: nextId,
    fecha_registro: getNowFormatted(),
    ...req.body
  };
  db[seccion].push(item);
  writeDb(db);
  res.status(201).json(item);
});

app.put('/api/config/:seccion/:id', (req, res) => {
  const db = readDb();
  const seccion = req.params.seccion;
  if (seccion === 'centro') {
    db.centro_info = { ...db.centro_info, ...req.body };
    writeDb(db);
    return res.json(db.centro_info);
  }
  const id = Number(req.params.id);
  const idx = (db[seccion] || []).findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Elemento no encontrado' });
  db[seccion][idx] = { ...db[seccion][idx], ...req.body, id };
  writeDb(db);
  res.json(db[seccion][idx]);
});

app.delete('/api/config/:seccion/:id', (req, res) => {
  const db = readDb();
  const seccion = req.params.seccion;
  const id = Number(req.params.id);
  if (db[seccion]) {
    db[seccion] = db[seccion].filter(x => x.id !== id);
    writeDb(db);
  }
  res.json({ success: true });
});

// ================= DASHBOARD & RESUMEN =================
app.get('/api/dashboard', (req, res) => {
  const db = readDb();
  const total = db.productos.length;
  const stockBajo = db.productos.filter(p => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo).length;
  const agotados = db.productos.filter(p => p.stock_actual <= 0).length;
  const disponibles = db.productos.filter(p => p.stock_actual > p.stock_minimo).length;

  res.json({
    total_registrados: total,
    disponibles,
    stock_bajo: stockBajo,
    agotados,
    ultimos_movimientos: (db.movimientos || []).slice(0, 5),
    alertas: db.productos.filter(p => p.stock_actual <= p.stock_minimo).slice(0, 5)
  });
});

// Fallback a index.html para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor SISLUCMA activo en http://localhost:${PORT}`);
});
