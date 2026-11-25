// app.js - Lógica completa de navegación, formularios, modales y llamadas API para SISLUCMA
let currentView = 'dashboard';
let currentConfigTab = 'categorias';
let appState = {
  productos: [],
  proveedores: [],
  entradas: [],
  salidas: [],
  movimientos: [],
  usuarios: [],
  categorias: [],
  unidades: [],
  areas: [],
  ubicaciones: [],
  centro: {},
  dashboard: {}
};

// ================= INICIALIZACIÓN =================
document.addEventListener('DOMContentLoaded', () => {
  setupLogin();
  setupNavigation();
  setupModals();
});

// Login handling
function setupLogin() {
  const form = document.getElementById('login-form');
  const loginView = document.getElementById('login-view');
  const appLayout = document.getElementById('app-layout');
  const logoutBtn = document.getElementById('btn-logout');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    loginView.style.display = 'none';
    appLayout.style.display = 'flex';
    navigateTo('dashboard');
  });

  logoutBtn.addEventListener('click', () => {
    appLayout.style.display = 'none';
    loginView.style.display = 'flex';
  });
}

// Navegación Sidebar
function setupNavigation() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const mobileToggleBtn = document.getElementById('mobile-toggle-btn');

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    });
  }

  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-nav');
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      }
      navigateTo(target);
    });
  });
}

function navigateTo(viewName) {
  currentView = viewName;
  const container = document.getElementById('content-container');
  container.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">Cargando...</div>';

  switch (viewName) {
    case 'dashboard':
      renderDashboard(container);
      break;
    case 'inventario':
      renderInventario(container);
      break;
    case 'productos':
      renderProductos(container);
      break;
    case 'proveedores':
      renderProveedores(container);
      break;
    case 'entradas':
      renderEntradas(container);
      break;
    case 'salidas':
      renderSalidas(container);
      break;
    case 'movimientos':
      renderMovimientos(container);
      break;
    case 'alertas':
      renderAlertas(container);
      break;
    case 'usuarios':
      renderUsuarios(container);
      break;
    case 'configuracion':
      renderConfiguracion(container);
      break;
    default:
      container.innerHTML = `<h2>Vista ${viewName} en desarrollo</h2>`;
  }
}

// ================= MODAL HELPERS =================
const modalOverlay = document.getElementById('main-modal-overlay');
const modalCard = document.getElementById('main-modal-card');
const successOverlay = document.getElementById('success-modal-overlay');
const successMsg = document.getElementById('success-modal-msg');
const successContinue = document.getElementById('btn-success-continue');

function setupModals() {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  successContinue.addEventListener('click', () => {
    successOverlay.classList.remove('active');
    navigateTo(currentView);
  });
}

function openModal(htmlContent) {
  modalCard.innerHTML = htmlContent;
  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
  modalCard.innerHTML = '';
}

function showSuccessModal(message = 'Guardado correctamente') {
  closeModal();
  successMsg.textContent = message;
  successOverlay.classList.add('active');
}

// ================= 1. VISTA DASHBOARD =================
async function renderDashboard(container) {
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    const prodRes = await fetch('/api/productos');
    const prods = await prodRes.json();

    const catCounts = {};
    prods.forEach(p => {
      const c = p.categoria || 'Otros';
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    const total = data.total_registrados || prods.length;
    const disp = data.disponibles || 0;
    const bajo = data.stock_bajo || 0;
    const agot = data.agotados || 0;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <div class="page-subtitle">Bienvenido, Dr. Alejandro Gómez • Resumen del estado actual del almacén médico.</div>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stat-cards-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Productos registrados</span>
            <svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div>
            <div class="stat-card-number">${total}</div>
            <div class="stat-card-desc">Total catálogo</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Productos disponibles</span>
            <svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="#0284c7"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          </div>
          <div>
            <div class="stat-card-number">${disp}</div>
            <div class="stat-card-desc">Stock en nivel óptimo</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Productos con stock bajo</span>
            <svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <div class="stat-card-number">${bajo}</div>
            <div class="stat-card-desc">Requiere reabastecimiento</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">Productos agotados</span>
            <svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <div class="stat-card-number">${agot}</div>
            <div class="stat-card-desc">Atención inmediata necesaria</div>
          </div>
        </div>
      </div>

      <!-- Fila de Gráficos -->
      <div class="dashboard-grid-2">
        <div class="dash-box">
          <div class="dash-box-title">Estado del inventario</div>
          <div class="donut-chart-container">
            <div class="donut-svg-wrapper">
              <svg width="140" height="140" viewBox="0 0 42 42" class="donut">
                <circle class="donut-hole" cx="21" cy="21" r="15.915" fill="#fff"></circle>
                <circle class="donut-ring" cx="21" cy="21" r="15.915" fill="transparent" stroke="#e0f2fe" stroke-width="5"></circle>
                <circle class="donut-segment" cx="21" cy="21" r="15.915" fill="transparent" stroke="#243b53" stroke-width="5" stroke-dasharray="78 22" stroke-dashoffset="25"></circle>
                <circle class="donut-segment" cx="21" cy="21" r="15.915" fill="transparent" stroke="#64b5f6" stroke-width="5" stroke-dasharray="14 86" stroke-dashoffset="47"></circle>
                <circle class="donut-segment" cx="21" cy="21" r="15.915" fill="transparent" stroke="#90caf9" stroke-width="5" stroke-dasharray="8 92" stroke-dashoffset="33"></circle>
              </svg>
              <div class="donut-center-text">
                <div class="donut-number">${total}</div>
                <div class="donut-label">Total</div>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-item"><span class="legend-dot" style="background: #243b53;"></span> Disponibles (${disp} - 78%)</div>
              <div class="legend-item"><span class="legend-dot" style="background: #64b5f6;"></span> Stock bajo (${bajo} - 14%)</div>
              <div class="legend-item"><span class="legend-dot" style="background: #90caf9;"></span> Agotados (${agot} - 8%)</div>
            </div>
          </div>
        </div>

        <div class="dash-box">
          <div class="dash-box-title">Productos por categoría</div>
          <div>
            <div class="cat-progress-item">
              <div class="cat-progress-header"><span>Insumos médicos</span><span>85</span></div>
              <div class="progress-track"><div class="progress-bar-fill" style="width: 75%;"></div></div>
            </div>
            <div class="cat-progress-item">
              <div class="cat-progress-header"><span>Limpieza</span><span>25</span></div>
              <div class="progress-track"><div class="progress-bar-fill" style="width: 25%;"></div></div>
            </div>
            <div class="cat-progress-item">
              <div class="cat-progress-header"><span>Oficina</span><span>10</span></div>
              <div class="progress-track"><div class="progress-bar-fill" style="width: 15%;"></div></div>
            </div>
            <div class="cat-progress-item">
              <div class="cat-progress-header"><span>Otros</span><span>5</span></div>
              <div class="progress-track"><div class="progress-bar-fill" style="width: 8%;"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila de Listas Alertas y Últimos Movimientos -->
      <div class="dashboard-grid-2">
        <div class="dash-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div class="dash-box-title" style="margin-bottom:0;">Alertas de inventario</div>
            <a href="#" style="font-size:12px; color:#2d556e; font-weight:600; text-decoration:none;" onclick="event.preventDefault(); navigateTo('alertas')">Ver todas</a>
          </div>
          <div>
            ${prods.filter(p => p.stock_actual <= p.stock_minimo).slice(0, 3).map(p => `
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; color: #1e293b; font-size: 13px;">${p.nombre}</div>
                  <div style="font-size: 12px; color: #64748b;">${p.codigo}</div>
                </div>
                <div>
                  <span class="badge ${p.stock_actual <= 0 ? 'badge-agotado' : 'badge-stock-bajo'}">
                    ${p.stock_actual <= 0 ? 'Agotado' : 'Stock Bajo'}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="dash-box">
          <div class="dash-box-title">Últimos movimientos</div>
          <table class="data-table" style="font-size: 12px;">
            <thead>
              <tr>
                <th style="padding: 8px;">Fecha</th>
                <th style="padding: 8px;">Producto</th>
                <th style="padding: 8px;">Tipo</th>
                <th style="padding: 8px;">Cant.</th>
                <th style="padding: 8px;">Usuario</th>
              </tr>
            </thead>
            <tbody>
              ${(data.ultimos_movimientos || []).map(m => `
                <tr>
                  <td style="padding: 8px;">${m.fecha_hora ? m.fecha_hora.split(' ')[0] : '27/10/26'}</td>
                  <td style="padding: 8px; font-weight: 500;">${m.producto}</td>
                  <td style="padding: 8px;">${m.tipo}</td>
                  <td style="padding: 8px; font-weight: 600; color: ${m.cantidad > 0 ? '#059669' : '#dc2626'}">
                    ${m.cantidad > 0 ? '+' : ''}${m.cantidad}
                  </td>
                  <td style="padding: 8px; color: #64748b;">${m.registrado_por}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error al cargar dashboard: ${err.message}</div>`;
  }
}

// ================= 2. VISTA INVENTARIO =================
async function renderInventario(container) {
  try {
    const res = await fetch('/api/productos');
    const prods = await res.json();
    const activos = prods.filter(p => p.estado === 'Activo').length;
    const inactivos = prods.length - activos;
    const categorias = [...new Set(prods.map(p => p.categoria))].filter(Boolean);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Inventario</h1>
          <div class="page-subtitle">Consulta el stock actual de los productos del centro de salud.</div>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stat-cards-grid">
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Productos en total</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div><div class="stat-card-number">152</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Activos</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div><div class="stat-card-number">140</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Inactivos</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div><div class="stat-card-number">12</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Categorías</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div><div class="stat-card-number">8</div></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-card">
        <div class="filter-input-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="inv-search" placeholder="Buscar por nombre, código o descripción....">
        </div>
        <div class="filter-select-group">
          <label>Categoría</label>
          <select id="inv-cat-filter">
            <option value="Todos">Todos</option>
            ${categorias.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="filter-select-group">
          <label>Estado</label>
          <select id="inv-status-filter">
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter" id="btn-inv-filter">Aplicar filtros</button>
          <button class="btn-clear" id="btn-inv-clear">Limpiar</button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Área/Servicio</th>
              <th>Ubicación</th>
              <th>Stock actual</th>
              <th>Stock mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="inv-table-body">
            ${prods.map(p => `
              <tr>
                <td>${p.id}</td>
                <td style="font-weight:600;">${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${p.area_servicio || 'Almacén'}</td>
                <td>${p.ubicacion || 'Almacén 1'}</td>
                <td style="font-weight:700;">${p.stock_actual}</td>
                <td>${p.stock_minimo}</td>
                <td><span class="badge ${p.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'}">${p.estado}</span></td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn" title="Movimientos" onclick="showProductMovements('${p.nombre}')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    </button>
                    <button class="action-btn" title="Ver detalle" onclick="viewProductDetail(${p.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div>Mostrando 1 - ${prods.length} registros de ${prods.length} registros</div>
          <div class="pagination-controls">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">&gt;</button>
          </div>
        </div>
      </div>
    `;

    // Filter listeners
    document.getElementById('btn-inv-filter').addEventListener('click', async () => {
      const q = document.getElementById('inv-search').value;
      const cat = document.getElementById('inv-cat-filter').value;
      const st = document.getElementById('inv-status-filter').value;
      const query = new URLSearchParams({ q, categoria: cat, estado: st });
      const r = await fetch(`/api/productos?${query}`);
      const filtered = await r.json();
      document.getElementById('inv-table-body').innerHTML = filtered.map(p => `
        <tr>
          <td>${p.id}</td>
          <td style="font-weight:600;">${p.codigo}</td>
          <td>${p.nombre}</td>
          <td>${p.categoria}</td>
          <td>${p.area_servicio || 'Almacén'}</td>
          <td>${p.ubicacion || 'Almacén 1'}</td>
          <td style="font-weight:700;">${p.stock_actual}</td>
          <td>${p.stock_minimo}</td>
          <td><span class="badge ${p.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'}">${p.estado}</span></td>
          <td>
            <div class="action-icons">
              <button class="action-btn" title="Ver detalle" onclick="viewProductDetail(${p.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    });

    document.getElementById('btn-inv-clear').addEventListener('click', () => {
      renderInventario(container);
    });

  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

// ================= 3. VISTA PRODUCTOS =================
async function renderProductos(container) {
  try {
    const res = await fetch('/api/productos');
    const prods = await res.json();
    const categorias = [...new Set(prods.map(p => p.categoria))].filter(Boolean);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Productos</h1>
          <div class="page-subtitle">Gestiona el catálogo de productos del centro de salud.</div>
        </div>
        <button class="btn-header-action" id="btn-nuevo-producto">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Producto
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="stat-cards-grid">
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Productos en total</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div><div class="stat-card-number">152</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Activos</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div><div class="stat-card-number">140</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Inactivos</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div><div class="stat-card-number">12</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Categorías</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
          <div><div class="stat-card-number">8</div></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-card">
        <div class="filter-input-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="prd-search" placeholder="Buscar por nombre, código o descripción....">
        </div>
        <div class="filter-select-group">
          <label>Categoría</label>
          <select id="prd-cat-filter">
            <option value="Todos">Todos</option>
            ${categorias.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="filter-select-group">
          <label>Estado</label>
          <select id="prd-status-filter">
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter" id="btn-prd-filter">Aplicar filtros</button>
          <button class="btn-clear" id="btn-prd-clear">Limpiar</button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Unidad de medida</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="prd-table-body">
            ${prods.map(p => `
              <tr>
                <td>${p.id}</td>
                <td style="font-weight:600;">${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${p.unidad}</td>
                <td>${p.proveedor}</td>
                <td><span class="badge ${p.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'}">${p.estado}</span></td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn" title="Ver detalle" onclick="viewProductDetail(${p.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="action-btn" title="Editar" onclick="openEditProductModal(${p.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button class="action-btn delete" title="Eliminar" onclick="deleteProduct(${p.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div>Mostrando 1 - ${prods.length} registros de ${prods.length} registros</div>
          <div class="pagination-controls">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">&gt;</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-nuevo-producto').addEventListener('click', openNewProductModal);

    document.getElementById('btn-prd-filter').addEventListener('click', async () => {
      const q = document.getElementById('prd-search').value;
      const cat = document.getElementById('prd-cat-filter').value;
      const st = document.getElementById('prd-status-filter').value;
      const query = new URLSearchParams({ q, categoria: cat, estado: st });
      const r = await fetch(`/api/productos?${query}`);
      const filtered = await r.json();
      document.getElementById('prd-table-body').innerHTML = filtered.map(p => `
        <tr>
          <td>${p.id}</td>
          <td style="font-weight:600;">${p.codigo}</td>
          <td>${p.nombre}</td>
          <td>${p.categoria}</td>
          <td>${p.unidad}</td>
          <td>${p.proveedor}</td>
          <td><span class="badge ${p.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'}">${p.estado}</span></td>
          <td>
            <div class="action-icons">
              <button class="action-btn" title="Ver detalle" onclick="viewProductDetail(${p.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="action-btn" title="Editar" onclick="openEditProductModal(${p.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="action-btn delete" title="Eliminar" onclick="deleteProduct(${p.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    });

    document.getElementById('btn-prd-clear').addEventListener('click', () => {
      renderProductos(container);
    });

  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

// Modal Detalle del Producto (Exacto imagen 5)
async function viewProductDetail(id) {
  const res = await fetch('/api/productos');
  const prods = await res.json();
  const p = prods.find(item => item.id === id);
  if (!p) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Detalle del Producto</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <div class="detail-header-block">
      <div class="detail-img-box">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0288d1" stroke-width="2">
          <path d="M12 2v20M2 12h20"/><rect x="4" y="4" width="16" height="16" rx="2"/>
        </svg>
      </div>
      <div>
        <h2 style="font-size: 20px; font-weight: 700; color: #1e3a5f;">${p.nombre}</h2>
        <div class="detail-tags">
          <span style="background: #2d556e; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">${p.codigo}</span>
          <span style="background: #2d556e; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">✔ ${p.estado}</span>
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
          <strong>Categoría:</strong> ${p.categoria} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Proveedor:</strong> ${p.proveedor}
        </div>
      </div>
    </div>

    <div class="modal-section-title">Información del Producto</div>
    <div class="detail-key-value-list">
      <div class="detail-label">Nombre del Producto</div><div class="detail-value">${p.nombre}</div>
      <div class="detail-label">Descripción</div><div class="detail-value">${p.descripcion || '-'}</div>
      <div class="detail-label">Unidad de medida</div><div class="detail-value">${p.unidad}</div>
      <div class="detail-label">Presentación</div><div class="detail-value">${p.presentacion || 'Caja x 100 unidades'}</div>
      <div class="detail-label">Estado</div><div><span class="badge badge-activo">${p.estado}</span></div>
    </div>

    <div class="modal-section-title">Información de inventario</div>
    <div class="stock-indicator-boxes">
      <div class="stock-indicator-box">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d556e"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <div>
          <div class="stock-box-number">${p.stock_minimo}</div>
          <div class="stock-box-label">Stock mínimo</div>
        </div>
      </div>
      <div class="stock-indicator-box">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d556e"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <div>
          <div class="stock-box-number">${p.stock_maximo}</div>
          <div class="stock-box-label">Stock máximo</div>
        </div>
      </div>
    </div>

    <div class="modal-section-title">Información de proveedor</div>
    <div class="detail-key-value-list">
      <div class="detail-label">Nombre o razón social</div><div class="detail-value">${p.proveedor}</div>
      <div class="detail-label">RUC</div><div class="detail-value">20123456789</div>
      <div class="detail-label">Persona de contacto</div><div class="detail-value">Juan Perez</div>
      <div class="detail-label">Teléfono</div><div class="detail-value">987 654 321</div>
      <div class="detail-label">Correo electrónico</div><div class="detail-value">contacto@farmaplus.com</div>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cerrar</button>
    </div>
  `;
  openModal(content);
}

// Modal Editar Producto (Exacto imagen 6)
async function openEditProductModal(id) {
  const res = await fetch('/api/productos');
  const prods = await res.json();
  const p = prods.find(item => item.id === id);
  if (!p) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Editar Producto</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <div class="modal-info-alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      El Código del Producto no se puede modificar.
    </div>

    <form id="form-edit-prod">
      <div class="modal-section-title">Información del Producto</div>
      
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Código*</label>
          <input type="text" class="form-control" value="${p.codigo}" disabled style="background:#f1f5f9;">
        </div>
        <div class="form-group">
          <label>Nombre del producto*</label>
          <input type="text" id="edit-prod-nombre" class="form-control" value="${p.nombre}" required>
        </div>
      </div>

      <div class="modal-grid-2">
        <div class="form-group">
          <label>Categoría*</label>
          <select id="edit-prod-categoria" class="form-control">
            <option ${p.categoria === 'Material Médico' ? 'selected' : ''}>Material Médico</option>
            <option ${p.categoria === 'Material de limpieza' ? 'selected' : ''}>Material de limpieza</option>
            <option ${p.categoria === 'Material de Escritorio' ? 'selected' : ''}>Material de Escritorio</option>
            <option ${p.categoria === 'Equipos Médicos' ? 'selected' : ''}>Equipos Médicos</option>
            <option ${p.categoria === 'Medicamentos' ? 'selected' : ''}>Medicamentos</option>
          </select>
        </div>
        <div class="form-group">
          <label>Descripción*</label>
          <textarea id="edit-prod-desc" class="form-control" rows="2">${p.descripcion || ''}</textarea>
        </div>
      </div>

      <div class="modal-grid-2">
        <div class="form-group">
          <label>Unidad de medida*</label>
          <select id="edit-prod-unidad" class="form-control">
            <option ${p.unidad === 'Caja' ? 'selected' : ''}>Caja</option>
            <option ${p.unidad === 'Unidad' ? 'selected' : ''}>Unidad</option>
            <option ${p.unidad === 'Paquete' ? 'selected' : ''}>Paquete</option>
            <option ${p.unidad === 'Litro' ? 'selected' : ''}>Litro</option>
            <option ${p.unidad === 'Kilogramo' ? 'selected' : ''}>Kilogramo</option>
          </select>
        </div>
        <div class="form-group">
          <label>Proveedor*</label>
          <input type="text" id="edit-prod-proveedor" class="form-control" value="${p.proveedor}">
        </div>
      </div>

      <div class="modal-section-title">Control de inventario</div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Stock mínimo*</label>
          <input type="number" id="edit-prod-stock-min" class="form-control" value="${p.stock_minimo}" required>
        </div>
        <div class="form-group">
          <label>Stock máximo*</label>
          <input type="number" id="edit-prod-stock-max" class="form-control" value="${p.stock_maximo}" required>
        </div>
      </div>

      <div class="modal-section-title">Estado</div>
      <div class="form-group" style="max-width: 50%;">
        <label>Estado*</label>
        <select id="edit-prod-estado" class="form-control">
          <option ${p.estado === 'Activo' ? 'selected' : ''}>Activo</option>
          <option ${p.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-submit-navy">Guardar Cambios</button>
      </div>
    </form>
  `;

  openModal(content);

  document.getElementById('form-edit-prod').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      nombre: document.getElementById('edit-prod-nombre').value,
      categoria: document.getElementById('edit-prod-categoria').value,
      descripcion: document.getElementById('edit-prod-desc').value,
      unidad: document.getElementById('edit-prod-unidad').value,
      proveedor: document.getElementById('edit-prod-proveedor').value,
      stock_minimo: document.getElementById('edit-prod-stock-min').value,
      stock_maximo: document.getElementById('edit-prod-stock-max').value,
      estado: document.getElementById('edit-prod-estado').value
    };

    await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    showSuccessModal('Productos guardados correctamente');
  });
}

// Modal Nuevo Producto (Exacto imagen 7 y 8)
function openNewProductModal() {
  const content = `
    <div class="modal-header">
      <div class="modal-title">Nuevo Producto</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <div class="modal-info-alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      El Código del Producto se genera automáticamente después de guardar.
    </div>

    <form id="form-new-prod">
      <div class="modal-section-title">Información del Producto</div>
      
      <div class="form-group">
        <label>Nombre del producto*</label>
        <input type="text" id="new-prod-nombre" class="form-control" placeholder="Ej. Guantes descartables" required>
      </div>

      <div class="modal-grid-2">
        <div class="form-group">
          <label>Categoría*</label>
          <select id="new-prod-categoria" class="form-control" required>
            <option value="">Seleccionar categoría</option>
            <option>Material Médico</option>
            <option>Material de limpieza</option>
            <option>Material de Escritorio</option>
            <option>Equipos Médicos</option>
            <option>Medicamentos</option>
          </select>
        </div>
        <div class="form-group">
          <label>Descripción*</label>
          <input type="text" id="new-prod-desc" class="form-control" placeholder="Descripción del Producto" required>
        </div>
      </div>

      <div class="modal-grid-2">
        <div class="form-group">
          <label>Unidad de medida*</label>
          <select id="new-prod-unidad" class="form-control" required>
            <option value="">Seleccionar unidad</option>
            <option>Caja</option>
            <option>Unidad</option>
            <option>Paquete</option>
            <option>Litro</option>
            <option>Kilogramo</option>
          </select>
        </div>
        <div class="form-group">
          <label>Proveedor*</label>
          <select id="new-prod-proveedor" class="form-control" required>
            <option value="">Seleccionar proveedor</option>
            <option>FarmaPlus SAC</option>
            <option>MediCord</option>
            <option>BioSalud</option>
            <option>SaludTotal</option>
            <option>CleanPerú</option>
          </select>
        </div>
      </div>

      <div class="modal-section-title">Control de inventario</div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Stock mínimo*</label>
          <input type="number" id="new-prod-stock-min" class="form-control" placeholder="Ej. 10" required>
        </div>
        <div class="form-group">
          <label>Stock máximo*</label>
          <input type="number" id="new-prod-stock-max" class="form-control" placeholder="Ej. 100" required>
        </div>
      </div>

      <div class="modal-section-title">Estado</div>
      <div class="form-group" style="max-width: 50%;">
        <label>Estado*</label>
        <select id="new-prod-estado" class="form-control">
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-submit-navy">Guardar Producto</button>
      </div>
    </form>
  `;

  openModal(content);

  document.getElementById('form-new-prod').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newP = {
      nombre: document.getElementById('new-prod-nombre').value,
      categoria: document.getElementById('new-prod-categoria').value,
      descripcion: document.getElementById('new-prod-desc').value,
      unidad: document.getElementById('new-prod-unidad').value,
      proveedor: document.getElementById('new-prod-proveedor').value,
      stock_minimo: document.getElementById('new-prod-stock-min').value,
      stock_maximo: document.getElementById('new-prod-stock-max').value,
      stock_actual: 0,
      estado: document.getElementById('new-prod-estado').value
    };

    await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newP)
    });

    showSuccessModal('Productos guardados correctamente');
  });
}

async function deleteProduct(id) {
  if (confirm('¿Está seguro de eliminar este producto?')) {
    await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    showSuccessModal('Producto eliminado correctamente');
  }
}

// ================= 4. VISTA PROVEEDORES =================
async function renderProveedores(container) {
  try {
    const res = await fetch('/api/proveedores');
    const provs = await res.json();
    const activos = provs.filter(p => p.estado === 'Activo').length;
    const inactivos = provs.length - activos;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Proveedores</h1>
          <div class="page-subtitle">Gestiona el catálogo de Proveedores del centro de salud.</div>
        </div>
        <button class="btn-header-action" id="btn-nuevo-proveedor">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Proveedor
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="stat-cards-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Proveedores en total</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg></div>
          <div><div class="stat-card-number">12</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Activos</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg></div>
          <div><div class="stat-card-number">10</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Inactivos</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg></div>
          <div><div class="stat-card-number">2</div></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-card">
        <div class="filter-input-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="prov-search" placeholder="Buscar por nombre, RUC o contacto....">
        </div>
        <div class="filter-select-group">
          <label>Categoría</label>
          <select id="prov-cat-filter">
            <option value="Todos">Todos</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter" id="btn-prov-filter">Aplicar filtros</button>
          <button class="btn-clear" id="btn-prov-clear">Limpiar</button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Proveedor</th>
              <th>RUC</th>
              <th>Personas de contacto</th>
              <th>Teléfono</th>
              <th>Correo electrónico</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="prov-table-body">
            ${provs.map(p => `
              <tr>
                <td>${p.id}</td>
                <td style="font-weight:600;">${p.nombre}</td>
                <td>${p.ruc}</td>
                <td>${p.contacto}</td>
                <td>${p.telefono}</td>
                <td>${p.email}</td>
                <td><span class="badge ${p.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'}">${p.estado}</span></td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn" title="Ver detalle" onclick="viewProveedorDetail(${p.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="action-btn" title="Editar" onclick="openEditProveedorModal(${p.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button class="action-btn delete" title="Eliminar" onclick="deleteProveedor(${p.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div>Mostrando 1 - ${provs.length} registros de 12 registros</div>
          <div class="pagination-controls">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">&gt;</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-nuevo-proveedor').addEventListener('click', openNewProveedorModal);

    document.getElementById('btn-prov-filter').addEventListener('click', async () => {
      const q = document.getElementById('prov-search').value;
      const resF = await fetch(`/api/proveedores?q=${encodeURIComponent(q)}`);
      const filtered = await resF.json();
      document.getElementById('prov-table-body').innerHTML = filtered.map(p => `
        <tr>
          <td>${p.id}</td>
          <td style="font-weight:600;">${p.nombre}</td>
          <td>${p.ruc}</td>
          <td>${p.contacto}</td>
          <td>${p.telefono}</td>
          <td>${p.email}</td>
          <td><span class="badge ${p.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'}">${p.estado}</span></td>
          <td>
            <div class="action-icons">
              <button class="action-btn" title="Ver detalle" onclick="viewProveedorDetail(${p.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="action-btn" title="Editar" onclick="openEditProveedorModal(${p.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="action-btn delete" title="Eliminar" onclick="deleteProveedor(${p.id})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    });

    document.getElementById('btn-prov-clear').addEventListener('click', () => {
      renderProveedores(container);
    });

  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

// Modal Detalle Proveedor (Exacto imagen 10)
async function viewProveedorDetail(id) {
  const res = await fetch('/api/proveedores');
  const provs = await res.json();
  const p = provs.find(item => item.id === id);
  if (!p) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Detalle del Proveedor</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <div class="detail-header-block">
      <div class="detail-img-box">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0288d1" stroke-width="2">
          <path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/>
        </svg>
      </div>
      <div>
        <h2 style="font-size: 20px; font-weight: 700; color: #1e3a5f;">${p.nombre}</h2>
        <div class="detail-tags">
          <span style="background: #2d556e; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">✔ ${p.estado}</span>
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
          <strong>RUC:</strong> ${p.ruc}
        </div>
      </div>
    </div>

    <div class="modal-section-title">Información del Proveedor</div>
    <div class="detail-key-value-list">
      <div class="detail-label">Nombre o razon social</div><div class="detail-value">${p.nombre}</div>
      <div class="detail-label">RUC</div><div class="detail-value">${p.ruc}</div>
      <div class="detail-label">Estado</div><div><span class="badge badge-activo">${p.estado}</span></div>
    </div>

    <div class="modal-section-title">Información de contacto</div>
    <div class="detail-key-value-list">
      <div class="detail-label">Persona de contacto</div><div class="detail-value">${p.contacto}</div>
      <div class="detail-label">Cargo</div><div class="detail-value">${p.cargo || 'Gerente de Ventas'}</div>
      <div class="detail-label">Teléfono</div><div class="detail-value">${p.telefono}</div>
      <div class="detail-label">Correo electrónico</div><div class="detail-value">${p.email}</div>
    </div>

    <div class="modal-section-title">Dirección</div>
    <div class="detail-key-value-list">
      <div class="detail-label">Dirección</div><div class="detail-value">${p.direccion || 'Av. Los Olivos 123, Lima'}</div>
      <div class="detail-label">Referencia</div><div class="detail-value">${p.referencia || 'A 2 cuadras del centro comercial'}</div>
      <div class="detail-label">Distrito</div><div class="detail-value">${p.distrito || 'Los Olivos'}</div>
      <div class="detail-label">Provincia</div><div class="detail-value">${p.provincia || 'Lima'}</div>
      <div class="detail-label">Departamento</div><div class="detail-value">${p.departamento || 'Lima'}</div>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cerrar</button>
    </div>
  `;
  openModal(content);
}

// Modal Editar Proveedor (Exacto imagen 11)
async function openEditProveedorModal(id) {
  const res = await fetch('/api/proveedores');
  const provs = await res.json();
  const p = provs.find(item => item.id === id);
  if (!p) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Editar Proveedor</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <form id="form-edit-prov">
      <div class="modal-section-title">Información general</div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Nombre o razón social*</label>
          <input type="text" id="edit-prov-nombre" class="form-control" value="${p.nombre}" required>
        </div>
        <div class="form-group">
          <label>RUC*</label>
          <input type="text" id="edit-prov-ruc" class="form-control" value="${p.ruc}" required>
        </div>
      </div>
      <div class="form-group" style="max-width:50%;">
        <label>Estado*</label>
        <select id="edit-prov-estado" class="form-control">
          <option ${p.estado === 'Activo' ? 'selected' : ''}>Activo</option>
          <option ${p.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>

      <div class="modal-section-title">Información de contacto</div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Persona de contacto*</label>
          <input type="text" id="edit-prov-contacto" class="form-control" value="${p.contacto}" required>
        </div>
        <div class="form-group">
          <label>Cargo*</label>
          <input type="text" id="edit-prov-cargo" class="form-control" value="${p.cargo || 'Gerente de ventas'}" required>
        </div>
      </div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Teléfono*</label>
          <input type="text" id="edit-prov-tel" class="form-control" value="${p.telefono}" required>
        </div>
        <div class="form-group">
          <label>Correo electrónico*</label>
          <input type="email" id="edit-prov-email" class="form-control" value="${p.email}" required>
        </div>
      </div>

      <div class="modal-section-title">Dirección</div>
      <div class="form-group">
        <label>Dirección*</label>
        <input type="text" id="edit-prov-dir" class="form-control" value="${p.direccion || 'Av. Los Olivos 123, Lima'}" required>
      </div>
      <div class="form-group">
        <label>Referencia</label>
        <input type="text" id="edit-prov-ref" class="form-control" value="${p.referencia || 'A 2 cuadras del Hospital, frente a la farmacia San Pedro'}">
      </div>
      <div class="modal-grid-3">
        <div class="form-group">
          <label>Distrito*</label>
          <select id="edit-prov-dist" class="form-control"><option>Los Olivos</option><option>San Isidro</option><option>Breña</option><option>Lince</option></select>
        </div>
        <div class="form-group">
          <label>Provincia*</label>
          <select id="edit-prov-prov" class="form-control"><option>Lima</option><option>Cutervo</option></select>
        </div>
        <div class="form-group">
          <label>Departamento*</label>
          <select id="edit-prov-dep" class="form-control"><option>Lima</option><option>Cajamarca</option></select>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-submit-navy">Guardar Cambios</button>
      </div>
    </form>
  `;

  openModal(content);

  document.getElementById('form-edit-prov').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      nombre: document.getElementById('edit-prov-nombre').value,
      ruc: document.getElementById('edit-prov-ruc').value,
      estado: document.getElementById('edit-prov-estado').value,
      contacto: document.getElementById('edit-prov-contacto').value,
      cargo: document.getElementById('edit-prov-cargo').value,
      telefono: document.getElementById('edit-prov-tel').value,
      email: document.getElementById('edit-prov-email').value,
      direccion: document.getElementById('edit-prov-dir').value,
      referencia: document.getElementById('edit-prov-ref').value,
      distrito: document.getElementById('edit-prov-dist').value,
      provincia: document.getElementById('edit-prov-prov').value,
      departamento: document.getElementById('edit-prov-dep').value
    };

    await fetch(`/api/proveedores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    showSuccessModal('Proveedor guardado correctamente');
  });
}

// Modal Nuevo Proveedor (Exacto imagen 12 y 13)
function openNewProveedorModal() {
  const content = `
    <div class="modal-header">
      <div class="modal-title">Nuevo Proveedor</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <form id="form-new-prov">
      <div class="modal-section-title">Información general</div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Nombre o razón social*</label>
          <input type="text" id="new-prov-nombre" class="form-control" placeholder="Ej. FarmaPlus SAC" required>
        </div>
        <div class="form-group">
          <label>RUC*</label>
          <input type="text" id="new-prov-ruc" class="form-control" placeholder="Ej. 345432674564" required>
        </div>
      </div>
      <div class="form-group" style="max-width:50%;">
        <label>Estado*</label>
        <select id="new-prov-estado" class="form-control">
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>

      <div class="modal-section-title">Información de contacto</div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Persona de contacto*</label>
          <input type="text" id="new-prov-contacto" class="form-control" placeholder="Ej. Juan Perez" required>
        </div>
        <div class="form-group">
          <label>Cargo*</label>
          <input type="text" id="new-prov-cargo" class="form-control" placeholder="Ej. Gerente de ventas" required>
        </div>
      </div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Teléfono*</label>
          <input type="text" id="new-prov-tel" class="form-control" placeholder="Ej. 934 943 943" required>
        </div>
        <div class="form-group">
          <label>Correo electrónico*</label>
          <input type="email" id="new-prov-email" class="form-control" placeholder="Ej. contacto@farmaplus.com" required>
        </div>
      </div>

      <div class="modal-section-title">Dirección</div>
      <div class="form-group">
        <label>Dirección*</label>
        <input type="text" id="new-prov-dir" class="form-control" placeholder="Ej. Av. Los Olivos 123, Lima" required>
      </div>
      <div class="form-group">
        <label>Referencia</label>
        <input type="text" id="new-prov-ref" class="form-control" placeholder="Ej. A 2 cuadras del Hospital, frente a la farmacia San Pedro">
      </div>
      <div class="modal-grid-3">
        <div class="form-group">
          <label>Distrito*</label>
          <select id="new-prov-dist" class="form-control"><option value="">Seleccionar distrito</option><option>Los Olivos</option><option>San Isidro</option></select>
        </div>
        <div class="form-group">
          <label>Provincia*</label>
          <select id="new-prov-prov" class="form-control"><option value="">Seleccionar Provincia</option><option>Lima</option><option>Cutervo</option></select>
        </div>
        <div class="form-group">
          <label>Departamento*</label>
          <select id="new-prov-dep" class="form-control"><option value="">Seleccionar departamento</option><option>Lima</option><option>Cajamarca</option></select>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-submit-navy">Guardar Proveedor</button>
      </div>
    </form>
  `;

  openModal(content);

  document.getElementById('form-new-prov').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newProv = {
      nombre: document.getElementById('new-prov-nombre').value,
      ruc: document.getElementById('new-prov-ruc').value,
      estado: document.getElementById('new-prov-estado').value,
      contacto: document.getElementById('new-prov-contacto').value,
      cargo: document.getElementById('new-prov-cargo').value,
      telefono: document.getElementById('new-prov-tel').value,
      email: document.getElementById('new-prov-email').value,
      direccion: document.getElementById('new-prov-dir').value,
      referencia: document.getElementById('new-prov-ref').value,
      distrito: document.getElementById('new-prov-dist').value || 'Lima',
      provincia: document.getElementById('new-prov-prov').value || 'Lima',
      departamento: document.getElementById('new-prov-dep').value || 'Lima'
    };

    await fetch('/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProv)
    });

    showSuccessModal('Proveedor guardado correctamente');
  });
}

async function deleteProveedor(id) {
  if (confirm('¿Está seguro de eliminar este proveedor?')) {
    await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
    showSuccessModal('Proveedor eliminado correctamente');
  }
}

// ================= 5. VISTA ENTRADAS =================
async function renderEntradas(container) {
  try {
    const res = await fetch('/api/entradas');
    const entradas = await res.json();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Entradas</h1>
          <div class="page-subtitle">Registra y consulta las entradas de productos al inventario.</div>
        </div>
        <button class="btn-header-action" id="btn-nueva-entrada">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Entrada
        </button>
      </div>

      <!-- Filters -->
      <div class="filter-card">
        <div class="filter-input-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar por número de documento, proveedor o producto....">
        </div>
        <div class="filter-select-group">
          <label>Categoría</label>
          <select><option>Elige Categoría</option><option>Material Médico</option><option>Material de limpieza</option></select>
        </div>
        <div class="filter-select-group">
          <label>Fecha desde...</label>
          <input type="date">
        </div>
        <div class="filter-select-group">
          <label>Fecha hasta...</label>
          <input type="date">
        </div>
        <div class="filter-select-group">
          <label>Proveedor</label>
          <select><option>Todos</option><option>FarmaPlus SAC</option><option>Laboratorios Perú</option></select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter">Aplicar filtros</button>
          <button class="btn-clear">Limpiar</button>
        </div>
      </div>

      <!-- Tabla Entradas (Exacto imagen 14) -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° entrada</th>
              <th>Fecha de entrada</th>
              <th>Proveedor</th>
              <th>N° documento</th>
              <th>Total de productos</th>
              <th>Registrado por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${entradas.map(e => `
              <tr>
                <td style="font-weight:600;">${e.numero}</td>
                <td>${e.fecha}</td>
                <td>${e.proveedor}</td>
                <td>${e.numero_documento}</td>
                <td style="font-weight:700;">${e.total_productos}</td>
                <td>${e.registrado_por}</td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn" title="Ver detalle" onclick="viewEntradaDetail(${e.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="action-btn" title="Descargar comprobante" onclick="alert('Descargando comprobante ${e.documento_pdf || 'documento.pdf'}')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div>Mostrando 1 - ${entradas.length} registros de ${entradas.length} registros</div>
          <div class="pagination-controls">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">&gt;</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-nueva-entrada').addEventListener('click', openNuevaEntradaModal);

  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

// Modal Detalle Entrada (Exacto imagen 16)
async function viewEntradaDetail(id) {
  const res = await fetch('/api/entradas');
  const items = await res.json();
  const e = items.find(item => item.id === id);
  if (!e) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Detalle Entrada</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <div class="modal-section-title">Información de la entrada</div>
    <div class="detail-key-value-list" style="grid-template-columns: 140px 1fr 140px 1fr;">
      <div class="detail-label">N° de entrada</div><div class="detail-value">${e.numero}</div>
      <div class="detail-label">N° de documento</div><div class="detail-value">${e.numero_documento}</div>
      <div class="detail-label">Fecha de entrada</div><div class="detail-value">${e.fecha}</div>
      <div class="detail-label">Tipo de documento</div><div class="detail-value">${e.tipo_documento || 'Factura'}</div>
      <div class="detail-label">Proveedor</div><div class="detail-value">${e.proveedor}</div>
      <div class="detail-label">Registrado por</div><div class="detail-value">${e.registrado_por}</div>
      <div class="detail-label">Observación</div><div class="detail-value" style="grid-column: span 3;">${e.observacion || 'Ingreso de insumos'}</div>
    </div>

    <div class="modal-section-title">Productos de la entrada</div>
    <table class="data-table" style="font-size: 12px; margin-bottom: 20px;">
      <thead>
        <tr style="background:#76a1c5; color:#fff;">
          <th style="color:#fff; background:#76a1c5;">#</th>
          <th style="color:#fff; background:#76a1c5;">Producto</th>
          <th style="color:#fff; background:#76a1c5;">Cantidad</th>
          <th style="color:#fff; background:#76a1c5;">Unidad</th>
          <th style="color:#fff; background:#76a1c5;">Ubicación</th>
        </tr>
      </thead>
      <tbody>
        ${(e.items || []).map((it, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td style="font-weight:600;">${it.producto}</td>
            <td>${it.cantidad}</td>
            <td>${it.unidad || 'Caja'}</td>
            <td>${it.ubicacion || 'Estante A - Fila 2'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="modal-section-title">Documento/Comprobante</div>
    <div class="pdf-preview-box">
      <div class="pdf-info">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div>
          <div style="font-weight:700;">${e.documento_pdf || 'FAC-001.pdf'}</div>
          <div style="font-size:11px; opacity: 0.9;">245 KB</div>
        </div>
      </div>
      <button class="btn-view-doc" onclick="alert('Abriendo comprobante digital...')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        Ver documento
      </button>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cerrar</button>
    </div>
  `;
  openModal(content);
}

// Modal Nueva Entrada (Exacto imagen 15)
let pendingEntryItems = [
  { producto: 'Sobre Manila', cantidad: 50, unidad: 'Paquetes', descripcion: 'sobre manila tamaño A4 coloramarillo', marca: 'GALLO' },
  { producto: 'Lapiceros', cantidad: 20, unidad: 'Cajas', descripcion: 'Lapicero tinta seca color azul', marca: 'PILOT' },
  { producto: 'Bolsas', cantidad: 22, unidad: 'Paquetes', descripcion: 'bolsas rojas para bioseguridad de tachos de basura', marca: 'Sin especificar' }
];

function openNuevaEntradaModal() {
  const content = `
    <div class="modal-header">
      <div class="modal-title">Entradas</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="page-subtitle" style="margin-bottom:16px;">Registra y consulta las entradas de productos al almacén</div>

    <!-- Pestañas categorías de entrada -->
    <div style="display:flex; gap:10px; margin-bottom:16px;">
      <button class="subnav-tab-btn active" style="flex:1; padding:10px;">Material de escritorio</button>
      <button class="subnav-tab-btn" style="flex:1; padding:10px;">Productos de limpieza</button>
      <button class="subnav-tab-btn" style="flex:1; padding:10px;">Mobiliario</button>
      <button class="subnav-tab-btn" style="flex:1; padding:10px;">Otros bienes</button>
    </div>

    <div class="modal-grid-2" style="margin-bottom:14px;">
      <div class="filter-input-search" style="flex:1;">
        <input type="text" id="entry-search-mat" class="form-control" placeholder="Buscar material por nombre...">
      </div>
      <div style="display:flex; gap:10px;">
        <div style="flex:1;">
          <label style="font-size:11px; font-weight:700;">N° Guía</label>
          <input type="text" id="entry-guia" class="form-control" value="003664">
        </div>
        <div style="flex:1;">
          <label style="font-size:11px; font-weight:700;">FECHA</label>
          <input type="text" id="entry-date" class="form-control" value="09/10/2026">
        </div>
      </div>
    </div>

    <!-- Caja datos material -->
    <div style="border: 1px solid #dce4e9; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #fff;">
      <h3 style="font-size: 16px; font-weight: 700; color: #1e3a5f; margin-bottom: 12px;">Datos del material</h3>
      <div class="modal-grid-3">
        <div class="form-group">
          <label>Cantidad</label>
          <input type="number" id="entry-item-cant" class="form-control" value="50">
        </div>
        <div class="form-group">
          <label>Unidad</label>
          <select id="entry-item-unit" class="form-control">
            <option>Caja</option>
            <option>Paquetes</option>
            <option>Unidad</option>
          </select>
        </div>
        <div class="form-group">
          <label>Marca</label>
          <input type="text" id="entry-item-marca" class="form-control" value="GALLO">
          <div style="font-size:10px; color:#8fa0b0;">Si no conoce la marca, use Sin especificar.</div>
        </div>
      </div>
      <button type="button" class="btn-primary-dark" id="btn-add-table-item" style="max-width: 200px; padding: 8px 14px; font-size: 13px;">
        Agregar a la tabla
      </button>
    </div>

    <!-- Tabla Productos Pendientes -->
    <div style="border: 1px solid #dce4e9; border-radius: 8px; padding: 16px; background:#fff;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
        <div>
          <h3 style="font-size: 16px; font-weight: 700; color: #1e3a5f;">Productos pendientes</h3>
          <div style="font-size: 12px; color: #64748b;">Revise los productos que se incluirán en este ingreso.</div>
        </div>
        <span style="background:#2d556e; color:#fff; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:700;">
          ${pendingEntryItems.length} productos
        </span>
      </div>

      <table class="data-table" style="font-size:12px;">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Unidad de ingreso</th>
            <th>Descripción</th>
            <th>Marca</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="entry-pending-body">
          ${pendingEntryItems.map((it, idx) => `
            <tr>
              <td style="font-weight:600;">${it.producto}</td>
              <td>${it.cantidad}</td>
              <td>${it.unidad}</td>
              <td>${it.descripcion}</td>
              <td>${it.marca}</td>
              <td>
                <a href="#" style="color:#0284c7; text-decoration:none; margin-right:8px;" onclick="event.preventDefault();">Editar</a>
                <a href="#" style="color:#ef4444; text-decoration:none;" onclick="event.preventDefault(); removePendingItem(${idx})">Quitar</a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 18px; border-top: 1px solid #e2e8f0; padding-top: 14px;">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 10px;">Pendientes de guardar</div>
        <button type="button" class="btn-primary-dark" id="btn-save-full-entry" style="max-width: 180px;">Guardar ingreso</button>
      </div>
    </div>
  `;

  openModal(content);

  document.getElementById('btn-add-table-item').addEventListener('click', () => {
    const cant = document.getElementById('entry-item-cant').value;
    const unit = document.getElementById('entry-item-unit').value;
    const marca = document.getElementById('entry-item-marca').value || 'Sin especificar';
    pendingEntryItems.push({
      producto: 'Alcohol 70% 1L',
      cantidad: Number(cant) || 10,
      unidad: unit,
      descripcion: 'Material de reposición mensual',
      marca: marca
    });
    openNuevaEntradaModal();
  });

  document.getElementById('btn-save-full-entry').addEventListener('click', async () => {
    const entryData = {
      proveedor: 'Laboratorios Perú',
      tipo_documento: 'Guía de Remisión',
      numero_documento: document.getElementById('entry-guia').value || 'GR-003664',
      items: pendingEntryItems
    };

    await fetch('/api/entradas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData)
    });

    pendingEntryItems = [];
    showSuccessModal('Entrada guardada correctamente');
  });
}

function removePendingItem(idx) {
  pendingEntryItems.splice(idx, 1);
  openNuevaEntradaModal();
}

// ================= 6. VISTA SALIDAS =================
async function renderSalidas(container) {
  try {
    const res = await fetch('/api/salidas');
    const salidas = await res.json();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Salidas</h1>
          <div class="page-subtitle">Registra y consulta las salidas de productos al inventario.</div>
        </div>
        <button class="btn-header-action" id="btn-nueva-salida">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Salida
        </button>
      </div>

      <!-- Filters (Exacto imagen 17) -->
      <div class="filter-card">
        <div class="filter-input-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar por número de documento, proveedor o producto....">
        </div>
        <div class="filter-select-group">
          <label>Área/Servicio</label>
          <select><option>Todos</option><option>Limpieza</option><option>Emergencia</option></select>
        </div>
        <div class="filter-select-group">
          <label>Producto</label>
          <select><option>Todos</option><option>Detergente</option><option>Alcohol 70%</option></select>
        </div>
        <div class="filter-select-group">
          <label>Tipo de salida</label>
          <select><option>Todos</option><option>Consumo</option><option>Mantenimiento</option></select>
        </div>
        <div class="filter-select-group">
          <label>Registrado por...</label>
          <select><option>Todos</option><option>Nilver Coronado</option><option>Miguel Mantari</option></select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter">Aplicar filtros</button>
          <button class="btn-clear">Limpiar</button>
        </div>
      </div>

      <!-- Tabla Salidas -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° salida</th>
              <th>Fecha de salida</th>
              <th>Área/Servicio</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Tipo de salida</th>
              <th>Registrado por</th>
              <th>N° documento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${salidas.map(s => `
              <tr>
                <td style="font-weight:600;">${s.numero}</td>
                <td>${s.fecha}</td>
                <td>${s.area_servicio}</td>
                <td style="font-weight:500;">${s.items && s.items[0] ? s.items[0].producto : 'Detergente'}</td>
                <td style="font-weight:700;">${s.items && s.items[0] ? s.items[0].cantidad : 10}</td>
                <td>${s.tipo_salida}</td>
                <td>${s.registrado_por}</td>
                <td>${s.numero_documento}</td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn" title="Ver detalle" onclick="viewSalidaDetail(${s.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div>Mostrando 1 - ${salidas.length} registros de ${salidas.length} registros</div>
          <div class="pagination-controls">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">&gt;</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-nueva-salida').addEventListener('click', openNuevaSalidaModal);

  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

// Modal Detalle de Salida (Exacto imagen 18)
async function viewSalidaDetail(id) {
  const res = await fetch('/api/salidas');
  const salidas = await res.json();
  const s = salidas.find(item => item.id === id);
  if (!s) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Detalle de Salida</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <div class="modal-section-title">Información de la Salida</div>
    <div class="detail-key-value-list" style="grid-template-columns: 140px 1fr 140px 1fr;">
      <div class="detail-label">N° de salida</div><div class="detail-value">${s.numero}</div>
      <div class="detail-label">Fecha de salida</div><div class="detail-value">${s.fecha}</div>
      <div class="detail-label">N° de documento</div><div class="detail-value">${s.numero_documento}</div>
      <div class="detail-label">Tipo de salida</div><div><span style="background:#2d556e; color:#fff; padding:3px 10px; border-radius:4px; font-size:11px;">${s.tipo_salida}</span></div>
      <div class="detail-label">Área/Servicio</div><div class="detail-value">${s.area_servicio}</div>
      <div class="detail-label">Registrado por</div><div class="detail-value">${s.registrado_por}</div>
      <div class="detail-label">Observación</div><div class="detail-value" style="grid-column: span 3;">${s.observacion}</div>
    </div>

    <div class="modal-section-title">Productos de la salida</div>
    <table class="data-table" style="font-size: 12px; margin-bottom: 20px;">
      <thead>
        <tr style="background:#76a1c5; color:#fff;">
          <th style="color:#fff; background:#76a1c5;">Producto</th>
          <th style="color:#fff; background:#76a1c5;">Cantidad</th>
          <th style="color:#fff; background:#76a1c5;">Unidad</th>
          <th style="color:#fff; background:#76a1c5;">Ubicación</th>
        </tr>
      </thead>
      <tbody>
        ${(s.items || []).map(it => `
          <tr>
            <td style="font-weight:600;">${it.producto}</td>
            <td style="font-weight:700;">${it.cantidad}</td>
            <td>${it.unidad || 'Caja'}</td>
            <td>${it.ubicacion || 'Estante A - Fila 2'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="modal-section-title">Producto</div>
    <div class="pdf-preview-box">
      <div class="pdf-info">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div>
          <div style="font-weight:700;">${s.documento_pdf || 'REQ-001.pdf'}</div>
          <div style="font-size:11px; opacity: 0.9;">245 KB</div>
        </div>
      </div>
      <button class="btn-view-doc" onclick="alert('Abriendo requerimiento digital...')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        Ver documento
      </button>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cerrar</button>
    </div>
  `;
  openModal(content);
}

// Modal Nueva Salida (Exacto imagen 19 y 20)
let newSalidaAddedProducts = [];

function openNuevaSalidaModal() {
  const content = `
    <div class="modal-header">
      <div class="modal-title">Nueva Salida</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <form id="form-new-salida">
      <div class="modal-section-title">Información de salida</div>
      
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Área / Servicio *</label>
          <select id="salida-area" class="form-control" required>
            <option value="">Seleccionar área / servicio...</option>
            <option>Emergencia</option>
            <option>Limpieza</option>
            <option>Enfermería</option>
            <option>Administración</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fecha de salida *</label>
          <input type="date" id="salida-fecha" class="form-control" required>
        </div>
      </div>

      <div class="modal-grid-2">
        <div class="form-group">
          <label>Tipo de salida *</label>
          <select id="salida-tipo" class="form-control" required>
            <option value="">Seleccionar...</option>
            <option>Consumo</option>
            <option>Merma/Vencimiento</option>
            <option>Transferencia</option>
          </select>
        </div>
        <div class="form-group">
          <label>N° de documento *</label>
          <input type="text" id="salida-doc" class="form-control" placeholder="Ej. REQ-001, TFR-001" required>
        </div>
      </div>

      <div class="form-group">
        <label>Observación *</label>
        <textarea id="salida-obs" class="form-control" rows="2" placeholder="Ingrese una observación (opcional)..."></textarea>
      </div>

      <div class="modal-section-title">Productos de salida</div>
      
      <div class="modal-grid-3" style="align-items: flex-end;">
        <div class="form-group">
          <label>Producto *</label>
          <select id="salida-item-prod" class="form-control">
            <option value="">Seleccionar Producto</option>
            <option>Alcohol 70% 1L</option>
            <option>Mascarillas Quirúrgicas</option>
            <option>Guantes descartables</option>
            <option>Detergente</option>
          </select>
        </div>
        <div class="form-group">
          <label>Cantidad *</label>
          <input type="number" id="salida-item-cant" class="form-control" value="0">
        </div>
        <div class="form-group">
          <label>Unidad</label>
          <input type="text" id="salida-item-unit" class="form-control" value="Caja">
        </div>
      </div>
      <button type="button" class="btn-primary-dark" id="btn-add-salida-item" style="max-width: 130px; margin-bottom: 16px; padding: 8px 12px;">+ Agregar</button>

      <!-- Tabla productos salida -->
      <div class="items-table-container" style="min-height: 120px; display:flex; flex-direction:column; justify-content:center;">
        ${newSalidaAddedProducts.length === 0 ? `
          <div style="text-align:center; padding: 24px; color: #64748b;">
            <div style="font-weight: 700; color: #334e68; font-size: 14px;">No hay productos agregados</div>
            <div style="font-size: 12px; margin-top: 4px;">Seleccione un producto y presione "Agregar"</div>
          </div>
        ` : `
          <table class="items-subtable">
            <thead>
              <tr><th>Producto</th><th>Cantidad</th><th>Unidad</th><th>Ubicación</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              ${newSalidaAddedProducts.map((p, i) => `
                <tr>
                  <td>${p.producto}</td>
                  <td>${p.cantidad}</td>
                  <td>${p.unidad}</td>
                  <td>Estante A - Fila 2</td>
                  <td><a href="#" style="color:#ef4444;" onclick="event.preventDefault(); removeSalidaItem(${i})">Eliminar</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-submit-navy">Guardar salida</button>
      </div>
    </form>
  `;

  openModal(content);

  document.getElementById('btn-add-salida-item').addEventListener('click', () => {
    const prod = document.getElementById('salida-item-prod').value;
    const cant = Number(document.getElementById('salida-item-cant').value);
    const unit = document.getElementById('salida-item-unit').value;
    if (prod && cant > 0) {
      newSalidaAddedProducts.push({ producto: prod, cantidad: cant, unidad: unit });
      openNuevaSalidaModal();
    }
  });

  document.getElementById('form-new-salida').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (newSalidaAddedProducts.length === 0) {
      alert('Debe agregar al menos un producto a la salida.');
      return;
    }

    const payload = {
      area_servicio: document.getElementById('salida-area').value,
      fecha: document.getElementById('salida-fecha').value,
      tipo_salida: document.getElementById('salida-tipo').value,
      numero_documento: document.getElementById('salida-doc').value,
      observacion: document.getElementById('salida-obs').value,
      items: newSalidaAddedProducts
    };

    await fetch('/api/salidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    newSalidaAddedProducts = [];
    showSuccessModal('Salida guardada correctamente');
  });
}

function removeSalidaItem(i) {
  newSalidaAddedProducts.splice(i, 1);
  openNuevaSalidaModal();
}

// ================= 7. VISTA MOVIMIENTOS =================
async function renderMovimientos(container) {
  try {
    const res = await fetch('/api/movimientos');
    const movs = await res.json();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Movimientos</h1>
          <div class="page-subtitle">Consulta el historial de entradas y salidas de productos del inventario.</div>
        </div>
      </div>

      <!-- Filters (Exacto imagen 21) -->
      <div class="filter-card">
        <div class="filter-input-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar por número de documento, proveedor o producto....">
        </div>
        <div class="filter-select-group"><label>Fecha desde...</label><input type="date"></div>
        <div class="filter-select-group"><label>Fecha hasta...</label><input type="date"></div>
        <div class="filter-select-group"><label>Área/Servicio</label><select><option>Todos</option><option>Limpieza</option></select></div>
        <div class="filter-select-group"><label>Tipo de salida</label><select><option>Todos</option><option>Salida</option><option>Entrada</option></select></div>
        <div class="filter-actions">
          <button class="btn-filter">Aplicar filtros</button>
          <button class="btn-clear">Limpiar</button>
        </div>
      </div>

      <!-- Tabla Movimientos -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Área/Proveedor</th>
              <th>Registrado por</th>
              <th>N° documento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${movs.map(m => `
              <tr>
                <td>${m.fecha_hora}</td>
                <td><span class="badge ${m.tipo === 'Entrada' ? 'badge-activo' : 'badge-stock-bajo'}">${m.tipo}</span></td>
                <td style="font-weight:600;">${m.producto}</td>
                <td style="font-weight:700; color: ${m.cantidad > 0 ? '#059669' : '#dc2626'}">
                  ${m.cantidad > 0 ? '+' : ''}${m.cantidad}
                </td>
                <td>${m.area_proveedor}</td>
                <td>${m.registrado_por}</td>
                <td>${m.numero_documento}</td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn" title="Ver detalle" onclick="viewMovimientoDetail(${m.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div>Mostrando 1 - ${movs.length} registros de ${movs.length} registros</div>
          <div class="pagination-controls">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">&gt;</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

// Modal Detalle Movimiento (Exacto imagen 22)
async function viewMovimientoDetail(id) {
  const res = await fetch('/api/movimientos');
  const movs = await res.json();
  const m = movs.find(item => item.id === id);
  if (!m) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Detalle de movimiento</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <div class="modal-section-title">Información del movimiento</div>
    <div class="detail-key-value-list" style="grid-template-columns: 140px 1fr 140px 1fr;">
      <div class="detail-label">Tipo de movimiento</div><div><span style="background:#76a1c5; color:#fff; padding:3px 10px; border-radius:4px; font-size:11px;">${m.tipo}</span></div>
      <div class="detail-label">Cantidad</div><div class="detail-value" style="color: #dc2626;">${m.cantidad}</div>
      <div class="detail-label">Fecha y hora</div><div class="detail-value">${m.fecha_hora}</div>
      <div class="detail-label">Registrado por</div><div class="detail-value">${m.registrado_por}</div>
      <div class="detail-label">N° de documento</div><div class="detail-value">${m.numero_documento}</div>
      <div class="detail-label">Observación</div><div class="detail-value">${m.observacion || 'Salida de alcohol para atención de emergencia'}</div>
      <div class="detail-label">Producto</div><div class="detail-value">${m.producto}</div>
      <div class="detail-label"></div><div></div>
      <div class="detail-label">Área/Servicio</div><div class="detail-value">${m.area_proveedor}</div>
    </div>

    <div class="modal-section-title">Ubicación y Stock</div>
    <div style="display:flex; justify-content:space-between; padding: 10px 0; font-size: 13px;">
      <div><strong>Ubicación:</strong> ${m.ubicacion || 'Estante A - Fila 2'}</div>
      <div><strong>Stock antes:</strong> <span style="font-weight:700;">${m.stock_antes}</span></div>
      <div><strong>Stock después:</strong> <span style="font-weight:700;">${m.stock_despues}</span></div>
    </div>

    <div class="modal-section-title">Documento asociado</div>
    <div class="pdf-preview-box">
      <div class="pdf-info">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div>
          <div style="font-weight:700;">${m.documento_pdf || 'SAL-001.pdf'}</div>
          <div style="font-size:11px; opacity: 0.9;">145 KB</div>
        </div>
      </div>
      <button class="btn-view-doc" onclick="alert('Abriendo documento...')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        Ver documento
      </button>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cerrar</button>
    </div>
  `;
  openModal(content);
}

// ================= 8. VISTA ALERTAS =================
async function renderAlertas(container) {
  try {
    const res = await fetch('/api/productos');
    const prods = await res.json();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Alertas</h1>
          <div class="page-subtitle">Visualiza los productos con stock bajo, próximos a vencer o vencidos.</div>
        </div>
      </div>

      <!-- Stat Cards (Exacto imagen 23) -->
      <div class="stat-cards-grid">
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Stock crítico</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg></div>
          <div><div class="stat-card-number">12</div><div class="stat-card-desc">productos</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Stock bajo</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg></div>
          <div><div class="stat-card-number">36</div><div class="stat-card-desc">productos</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Próximos a vencer</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg></div>
          <div><div class="stat-card-number">12</div><div class="stat-card-desc">productos</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-title">Vencidos</span><svg class="stat-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg></div>
          <div><div class="stat-card-number">7</div><div class="stat-card-desc">productos</div></div>
        </div>
      </div>

      <!-- Tab Buttons tipo Filtro -->
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button class="btn-primary-dark" style="max-width:140px; padding:8px 12px; font-size:12px;">Stock Crítico (12)</button>
        <button class="btn-clear" style="padding:8px 12px; font-size:12px;">Stock Bajo (36)</button>
        <button class="btn-clear" style="padding:8px 12px; font-size:12px;">Próximos a vencer (12)</button>
        <button class="btn-clear" style="padding:8px 12px; font-size:12px;">Vencidos (7)</button>
      </div>

      <!-- Filters -->
      <div class="filter-card">
        <div class="filter-input-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar por código o nombre del producto...">
        </div>
        <div class="filter-select-group"><label>Categoría</label><select><option>Todos</option></select></div>
        <div class="filter-select-group"><label>Ubicación</label><select><option>Todos</option></select></div>
        <div class="filter-actions">
          <button class="btn-filter">Aplicar filtros</button>
          <button class="btn-clear">Limpiar</button>
        </div>
      </div>

      <!-- Tabla Alertas -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Stock Mín</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Fechas de Vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${prods.map(p => `
              <tr>
                <td style="font-weight:600;">${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td style="font-weight:700;">${p.stock_actual}</td>
                <td>${p.stock_minimo}</td>
                <td>${p.ubicacion || 'Estante A - Fila 2'}</td>
                <td><span class="badge badge-stock-critico">Stock crítico</span></td>
                <td>${p.fecha_vencimiento || '-'}</td>
                <td>
                  <button class="action-btn" title="Detalle alerta" onclick="viewAlertaDetail(${p.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div>Mostrando 1 - 8 registros de 12 registros</div>
          <div class="pagination-controls">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">&gt;</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

// Modal Detalle de Alerta (Exacto imagen 24)
async function viewAlertaDetail(id) {
  const res = await fetch('/api/productos');
  const prods = await res.json();
  const p = prods.find(item => item.id === id);
  if (!p) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Detalle de alerta</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <div class="detail-header-block">
      <div class="detail-img-box">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>
      <div>
        <h2 style="font-size: 20px; font-weight: 700; color: #1e3a5f;">${p.nombre}</h2>
        <div style="font-size: 12px; color: #64748b;">Código: ${p.codigo}</div>
        <div style="font-size: 12px; color: #64748b;">Categoría: ${p.categoria}</div>
      </div>
    </div>

    <div class="modal-section-title">Situación de la alerta</div>
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
      <div>
        <div class="detail-label">Estado</div>
        <div style="margin-top:4px;"><span class="badge badge-stock-critico">Stock Crítico</span></div>
      </div>
      <div>
        <div class="detail-label">Stock actual</div>
        <div class="detail-value" style="font-size:16px;">${p.stock_actual} <span style="font-size:11px; color:#64748b;">unidades</span></div>
      </div>
      <div>
        <div class="detail-label">Stock requerido</div>
        <div class="detail-value" style="font-size:16px;">${p.stock_minimo} <span style="font-size:11px; color:#64748b;">unidades</span></div>
      </div>
      <div>
        <div class="detail-label">Ubicación</div>
        <div class="detail-value">📍 ${p.ubicacion || 'Estante A - Fila 2'}</div>
      </div>
    </div>

    <div class="modal-section-title">Información del producto</div>
    <div class="modal-grid-2" style="margin-bottom: 16px;">
      <div><strong>🚚 Proveedor:</strong> ${p.proveedor}</div>
      <div><strong>📅 Fecha de vencimiento:</strong> ${p.fecha_vencimiento || '15/12/2026'}</div>
    </div>

    <div class="modal-section-title">Últimos movimientos</div>
    <table class="data-table" style="font-size: 12px; margin-bottom: 20px;">
      <thead>
        <tr style="background:#76a1c5; color:#fff;">
          <th style="color:#fff; background:#76a1c5;">Fecha y hora</th>
          <th style="color:#fff; background:#76a1c5;">Tipo</th>
          <th style="color:#fff; background:#76a1c5;">Cantidad</th>
          <th style="color:#fff; background:#76a1c5;">N° documento</th>
          <th style="color:#fff; background:#76a1c5;">Usuario</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>20/09/2026 10:15</td><td>Entrada</td><td style="color:#059669; font-weight:700;">+ 100</td><td>FAC-001</td><td>Luis Salazar</td></tr>
        <tr><td>05/09/2026 14:30</td><td>Salida</td><td style="color:#dc2626; font-weight:700;">- 20</td><td>SAL-002</td><td>Miguel Mantari</td></tr>
        <tr><td>15/08/2026 09:20</td><td>Entrada</td><td style="color:#059669; font-weight:700;">+ 50</td><td>FAC-003</td><td>Anthony Mejia</td></tr>
      </tbody>
    </table>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cerrar</button>
    </div>
  `;
  openModal(content);
}

// ================= 9. VISTA USUARIOS =================
async function renderUsuarios(container) {
  try {
    const res = await fetch('/api/usuarios');
    const users = await res.json();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Usuarios</h1>
          <div class="page-subtitle">Administra los usuarios del sistema, sus roles y accesos.</div>
        </div>
      </div>

      <!-- Filters (Exacto imagen 25) -->
      <div class="filter-card">
        <div class="filter-input-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar por número de documento, proveedor o producto....">
        </div>
        <div class="filter-select-group"><label>Rol</label><select><option>Elige Categoría</option><option>Administrador</option><option>Almacenero</option><option>Usuario</option></select></div>
        <div class="filter-select-group"><label>Estado</label><select><option>Todos</option><option>Activo</option><option>Inactivo</option></select></div>
        <div class="filter-actions">
          <button class="btn-filter">Aplicar filtros</button>
          <button class="btn-clear">Limpiar</button>
        </div>
      </div>

      <!-- Tabla Usuarios -->
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Fecha de entrada</th>
              <th>Correo electrónico</th>
              <th>Rol</th>
              <th>Área/Servicio</th>
              <th>Estado</th>
              <th>Fecha de registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.id}</td>
                <td style="font-weight:600;">${u.nombres} ${u.apellidos}</td>
                <td>${u.fecha_registro}</td>
                <td>${u.correo}</td>
                <td>${u.rol}</td>
                <td>${u.area}</td>
                <td><span class="badge ${u.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'}">${u.estado}</span></td>
                <td>${u.fecha_registro}</td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn" title="Editar usuario" onclick="openEditUsuarioModal(${u.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button class="action-btn delete" title="Eliminar usuario" onclick="deleteUsuario(${u.id})">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination-wrapper">
          <div>Mostrando 1 - ${users.length} registros de 6 registros</div>
          <div class="pagination-controls">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">&gt;</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

// Modal Editar Usuario (Exacto imagen 26)
async function openEditUsuarioModal(id) {
  const res = await fetch('/api/usuarios');
  const users = await res.json();
  const u = users.find(item => item.id === id);
  if (!u) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Editar Usuario</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <form id="form-edit-user">
      <div class="modal-section-title">Información del movimiento</div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Nombres *</label>
          <input type="text" id="user-nombres" class="form-control" value="${u.nombres}" required>
        </div>
        <div class="form-group">
          <label>Apellidos *</label>
          <input type="text" id="user-apellidos" class="form-control" value="${u.apellidos}" required>
        </div>
      </div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Correo electrónico *</label>
          <input type="email" id="user-correo" class="form-control" value="${u.correo}" required>
        </div>
        <div class="form-group">
          <label>DNI *</label>
          <input type="text" id="user-dni" class="form-control" value="${u.dni}" style="background:#b3e5fc;" required>
        </div>
      </div>

      <div class="modal-section-title">Asignación</div>
      <div class="modal-grid-2">
        <div class="form-group">
          <label>Rol *</label>
          <select id="user-rol" class="form-control">
            <option ${u.rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
            <option ${u.rol === 'Almacenero' ? 'selected' : ''}>Almacenero</option>
            <option ${u.rol === 'Usuario' ? 'selected' : ''}>Usuario</option>
          </select>
        </div>
        <div class="form-group">
          <label>Área/Servicio *</label>
          <select id="user-area" class="form-control">
            <option ${u.area === 'Administración' ? 'selected' : ''}>Administración</option>
            <option ${u.area === 'Almacén' ? 'selected' : ''}>Almacén</option>
            <option ${u.area === 'Enfermería' ? 'selected' : ''}>Enfermería</option>
            <option ${u.area === 'Limpieza' ? 'selected' : ''}>Limpieza</option>
            <option ${u.area === 'Farmacia' ? 'selected' : ''}>Farmacia</option>
          </select>
        </div>
      </div>
      <div class="form-group" style="max-width:50%;">
        <label>Estado *</label>
        <select id="user-estado" class="form-control">
          <option ${u.estado === 'Activo' ? 'selected' : ''}>Activo</option>
          <option ${u.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cerrar</button>
        <button type="submit" class="btn-submit-navy">Guardar Cambios</button>
      </div>
    </form>
  `;

  openModal(content);

  document.getElementById('form-edit-user').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      nombres: document.getElementById('user-nombres').value,
      apellidos: document.getElementById('user-apellidos').value,
      correo: document.getElementById('user-correo').value,
      dni: document.getElementById('user-dni').value,
      rol: document.getElementById('user-rol').value,
      area: document.getElementById('user-area').value,
      estado: document.getElementById('user-estado').value
    };

    await fetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    showSuccessModal('Usuario actualizado correctamente');
  });
}

async function deleteUsuario(id) {
  if (confirm('¿Está seguro de eliminar este usuario?')) {
    await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    showSuccessModal('Usuario eliminado correctamente');
  }
}

// ================= 10. VISTA CONFIGURACIÓN =================
async function renderConfiguracion(container) {
  try {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Configuración</h1>
          <div class="page-subtitle">Administra los parámetros y catálogos del sistema de inventario.</div>
        </div>
        <button class="btn-header-action" id="btn-config-action-top">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Categoría
        </button>
      </div>

      <!-- Subnav pestañas superiores (Exacto imagen 27, 30, 31, 32, 33) -->
      <div class="subnav-tabs">
        <div class="subnav-tab-btn ${currentConfigTab === 'categorias' ? 'active' : ''}" data-ctab="categorias">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          Categoría
        </div>
        <div class="subnav-tab-btn ${currentConfigTab === 'unidades' ? 'active' : ''}" data-ctab="unidades">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Unidades de medida
        </div>
        <div class="subnav-tab-btn ${currentConfigTab === 'areas' ? 'active' : ''}" data-ctab="areas">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          Áreas / Servicios
        </div>
        <div class="subnav-tab-btn ${currentConfigTab === 'ubicaciones' ? 'active' : ''}" data-ctab="ubicaciones">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Ubicaciones internas
        </div>
        <div class="subnav-tab-btn ${currentConfigTab === 'parametros' ? 'active' : ''}" data-ctab="parametros">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
          Parámetros de stock
        </div>
        <div class="subnav-tab-btn ${currentConfigTab === 'centro' ? 'active' : ''}" data-ctab="centro">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          Datos del centro
        </div>
      </div>

      <div id="config-subview-content"></div>
    `;

    document.querySelectorAll('.subnav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentConfigTab = btn.getAttribute('data-ctab');
        renderConfiguracion(container);
      });
    });

    renderConfigSubContent(document.getElementById('config-subview-content'));

  } catch (err) {
    container.innerHTML = `<div style="color:red;">Error: ${err.message}</div>`;
  }
}

async function renderConfigSubContent(subContainer) {
  const topBtn = document.getElementById('btn-config-action-top');
  
  if (currentConfigTab === 'categorias') {
    if (topBtn) {
      topBtn.innerHTML = `+ Nueva Categoría`;
      topBtn.onclick = openNuevaCategoriaModal;
    }
    const res = await fetch('/api/config/categorias');
    const items = await res.json();

    subContainer.innerHTML = `
      <div style="border: 1px solid #dce4e9; border-radius: 12px; background:#fff; padding:20px;">
        <h3 style="font-size:16px; font-weight:700; color:#1e3a5f; margin-bottom:4px;">Categorías de productos</h3>
        <div style="font-size:12px; color:#64748b; margin-bottom:16px;">Gestiona las categorías utilizadas para clasificar los productos del inventario</div>

        <div class="filter-card" style="padding:10px 14px; margin-bottom:16px;">
          <div class="filter-input-search"><input type="text" placeholder="Buscar por nombre, correo o DNI...."></div>
          <div class="filter-select-group"><label>Rol</label><select><option>Todos</option></select></div>
          <div class="filter-select-group"><label>Estado</label><select><option>Todos</option></select></div>
          <div class="filter-actions"><button class="btn-filter">Aplicar filtros</button><button class="btn-clear">Limpiar</button></div>
        </div>

        <table class="data-table">
          <thead>
            <tr style="background:#76a1c5; color:#fff;">
              <th style="color:#fff; background:#76a1c5;">ID</th>
              <th style="color:#fff; background:#76a1c5;">Nombre completo</th>
              <th style="color:#fff; background:#76a1c5;">Descripción</th>
              <th style="color:#fff; background:#76a1c5;">Estado</th>
              <th style="color:#fff; background:#76a1c5;">Fecha de registro</th>
              <th style="color:#fff; background:#76a1c5;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(c => `
              <tr>
                <td>${c.id}</td>
                <td style="font-weight:600;">${c.nombre}</td>
                <td>${c.descripcion || '-'}</td>
                <td><span style="background:#76a1c5; color:#fff; padding:3px 10px; border-radius:4px; font-size:11px;">${c.estado}</span></td>
                <td>${c.fecha_registro}</td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn" title="Editar" onclick="openEditCategoriaModal(${c.id})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button class="action-btn delete" title="Eliminar" onclick="deleteConfigItem('categorias', ${c.id})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (currentConfigTab === 'unidades') {
    if (topBtn) {
      topBtn.innerHTML = `+ Nueva unidad de medida`;
      topBtn.onclick = () => alert('Agregar nueva unidad');
    }
    const res = await fetch('/api/config/unidades');
    const items = await res.json();

    subContainer.innerHTML = `
      <div style="border: 1px solid #dce4e9; border-radius: 12px; background:#fff; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="font-size:16px; font-weight:700; color:#1e3a5f;">Unidades de medida</h3>
            <div style="font-size:12px; color:#64748b;">Gestiona las unidades de medida utilizadas para los productos del inventario</div>
          </div>
          <button class="btn-primary-dark" style="max-width:210px; padding:8px 16px; font-size:13px;" onclick="alert('Nueva unidad')">+ Nueva unidad de medida</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre de unidad</th><th>Abreviatura</th><th>Categoría</th><th>Unidad de referencia</th><th>Factor de conversión</th><th>Estado</th><th>Fecha de registro</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(u => `
              <tr>
                <td>${u.id}</td>
                <td style="font-weight:600;">${u.nombre}</td>
                <td>${u.abreviatura}</td>
                <td>${u.categoria}</td>
                <td>${u.referencia}</td>
                <td>${u.factor}</td>
                <td><span class="badge badge-activo">${u.estado}</span></td>
                <td>${u.fecha_registro}</td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (currentConfigTab === 'areas') {
    const res = await fetch('/api/config/areas');
    const items = await res.json();

    subContainer.innerHTML = `
      <div style="border: 1px solid #dce4e9; border-radius: 12px; background:#fff; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="font-size:16px; font-weight:700; color:#1e3a5f;">Área/Servicios</h3>
            <div style="font-size:12px; color:#64748b;">Gestiona las áreas y servicios que utilizan o solicitan productos del inventario</div>
          </div>
          <button class="btn-primary-dark" style="max-width:180px; padding:8px 16px; font-size:13px;" onclick="alert('Nueva área')">Nueva área/servicio</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre de área o servicio</th><th>Descripción</th><th>Estado</th><th>Fecha de registro</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(a => `
              <tr>
                <td>${a.id}</td>
                <td style="font-weight:600;">${a.nombre}</td>
                <td>${a.descripcion}</td>
                <td><span class="badge badge-activo">${a.estado}</span></td>
                <td>${a.fecha_registro}</td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (currentConfigTab === 'ubicaciones') {
    const res = await fetch('/api/config/ubicaciones');
    const items = await res.json();

    subContainer.innerHTML = `
      <div style="border: 1px solid #dce4e9; border-radius: 12px; background:#fff; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="font-size:16px; font-weight:700; color:#1e3a5f;">Ubicaciones internas</h3>
            <div style="font-size:12px; color:#64748b;">Gestiona las posiciones físicas dentro del único almacén</div>
          </div>
          <button class="btn-primary-dark" style="max-width:180px; padding:8px 16px; font-size:13px;" onclick="alert('Nueva ubicación')">Nueva ubicación</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre de ubicación</th><th>Descripción</th><th>Estado</th><th>Fecha de registro</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(u => `
              <tr>
                <td>${u.id}</td>
                <td style="font-weight:600;">${u.nombre}</td>
                <td>${u.descripcion}</td>
                <td><span class="badge badge-activo">${u.estado}</span></td>
                <td>${u.fecha_registro}</td>
                <td>
                  <div class="action-icons">
                    <button class="action-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (currentConfigTab === 'centro') {
    const res = await fetch('/api/config/centro');
    const centro = await res.json();

    subContainer.innerHTML = `
      <div style="border: 1px solid #dce4e9; border-radius: 12px; background:#fff; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <h3 style="font-size:16px; font-weight:700; color:#1e3a5f;">Datos del centro</h3>
            <div style="font-size:12px; color:#64748b;">Administra la información general del centro de salud</div>
          </div>
          <button class="btn-primary-dark" style="max-width:150px; padding:8px 16px; font-size:13px;" onclick="alert('Edición de datos habilitada')">Editar datos</button>
        </div>

        <div class="detail-key-value-list" style="grid-template-columns: 180px 1fr; row-gap: 16px;">
          <div class="detail-label">Nombre del centro:</div><div class="detail-value">${centro.nombre}</div>
          <div class="detail-label">Código RENIPRESS:</div><div class="detail-value">${centro.codigo_renipress}</div>
          <div class="detail-label">Dirección:</div><div class="detail-value">${centro.direccion}</div>
          <div class="detail-label">Teléfono:</div><div class="detail-value">${centro.telefono}</div>
          <div class="detail-label">Director / Responsable:</div><div class="detail-value">${centro.director}</div>
          <div class="detail-label">Correo institucional:</div><div class="detail-value">${centro.email}</div>
        </div>
      </div>
    `;
  } else {
    subContainer.innerHTML = `<div style="padding:20px; background:#fff; border-radius:8px;">Parámetros de stock configurados según normativa MINSA.</div>`;
  }
}

// Modal Nueva Categoría (Exacto imagen 28)
function openNuevaCategoriaModal() {
  const content = `
    <div class="modal-header">
      <div class="modal-title">Nueva Categoría</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <form id="form-new-cat">
      <div class="form-group">
        <label>Nombre de categoría *</label>
        <input type="text" id="cat-name" class="form-control" placeholder="Ingrese el nombre de la categoría" required>
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea id="cat-desc" class="form-control" rows="3" placeholder="Ingresa una descripción (opcional)"></textarea>
      </div>
      <div class="form-group" style="max-width:50%;">
        <label>Estado *</label>
        <select id="cat-status" class="form-control">
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn-submit-navy">Guardar</button>
      </div>
    </form>
  `;

  openModal(content);

  document.getElementById('form-new-cat').addEventListener('submit', async (e) => {
    e.preventDefault();
    await fetch('/api/config/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: document.getElementById('cat-name').value,
        descripcion: document.getElementById('cat-desc').value,
        estado: document.getElementById('cat-status').value
      })
    });
    showSuccessModal('Categoría agregada correctamente');
  });
}

// Modal Editar Categoría (Exacto imagen 29)
async function openEditCategoriaModal(id) {
  const res = await fetch('/api/config/categorias');
  const items = await res.json();
  const c = items.find(item => item.id === id);
  if (!c) return;

  const content = `
    <div class="modal-header">
      <div class="modal-title">Editar Categoría</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>

    <form id="form-edit-cat">
      <div class="form-group">
        <label>Nombre de categoría *</label>
        <input type="text" id="edit-cat-name" class="form-control" value="${c.nombre}" required>
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea id="edit-cat-desc" class="form-control" rows="3">${c.descripcion || ''}</textarea>
      </div>
      <div class="form-group" style="max-width:50%;">
        <label>Estado *</label>
        <select id="edit-cat-status" class="form-control">
          <option ${c.estado === 'Activo' ? 'selected' : ''}>Activo</option>
          <option ${c.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cerrar</button>
        <button type="submit" class="btn-submit-navy">Guardar Cambios</button>
      </div>
    </form>
  `;

  openModal(content);

  document.getElementById('form-edit-cat').addEventListener('submit', async (e) => {
    e.preventDefault();
    await fetch(`/api/config/categorias/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: document.getElementById('edit-cat-name').value,
        descripcion: document.getElementById('edit-cat-desc').value,
        estado: document.getElementById('edit-cat-status').value
      })
    });
    showSuccessModal('Salida guardada correctamente');
  });
}

async function deleteConfigItem(section, id) {
  if (confirm('¿Eliminar este elemento?')) {
    await fetch(`/api/config/${section}/${id}`, { method: 'DELETE' });
    renderConfiguracion(document.getElementById('content-container'));
  }
}

function showProductMovements(prodName) {
  navigateTo('movimientos');
}
