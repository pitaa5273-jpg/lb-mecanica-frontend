import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/CrudPages.css';
import { Home, FileText, Users, Wrench, Truck, DollarSign, LogOut, Menu, X, Edit2, Trash2, Plus } from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clientes/${editingId}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setForm({ nome: '', telefone: '', email: '' });
      setEditingId(null);
      loadClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
    }
  };

  const handleEdit = (cliente) => {
    setForm(cliente);
    setEditingId(cliente.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja deletar este cliente?')) {
      try {
        await api.delete(`/clientes/${id}`);
        loadClientes();
      } catch (err) {
        console.error('Erro ao deletar cliente:', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Ordens de Serviço', path: '/os' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Truck, label: 'Veículos', path: '/veiculos' },
    { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
  ];

  return (
    <div className="crud-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="LB Mecânica" className="sidebar-logo" />
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${item.path === '/clientes' ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-link"
            onClick={handleLogout}
            title="Sair"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="crud-main">
        {/* Header */}
        <header className="crud-header">
          <h1>👥 Clientes</h1>
          <p>Gerenciamento de clientes</p>
        </header>

        {/* Content */}
        <div className="crud-content">
          {/* Form Section */}
          <div className="form-card">
            <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ nome: '', telefone: '', email: '' });
                      setEditingId(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Section */}
          <div className="list-card">
            <h2>Lista de Clientes ({clientes.length})</h2>
            {clientes.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum cliente cadastrado</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>Email</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td>{cliente.nome}</td>
                        <td>{cliente.telefone || '-'}</td>
                        <td>{cliente.email || '-'}</td>
                        <td className="actions">
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="btn-icon edit"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="btn-icon delete"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
