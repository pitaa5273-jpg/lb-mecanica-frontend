import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/CrudPages.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '' });
  const [editingId, setEditingId] = useState(null);
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

  return (
    <div className="crud-container">
      <header className="crud-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Voltar
        </button>
        <h1>👥 Clientes</h1>
      </header>

      <div className="crud-content">
        <div className="form-section">
          <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <button type="submit" className="submit-button">
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ nome: '', telefone: '', email: '' });
                  setEditingId(null);
                }}
                className="cancel-button"
              >
                Cancelar
              </button>
            )}
          </form>
        </div>

        <div className="list-section">
          <h2>Lista de Clientes</h2>
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
                  <td>{cliente.telefone}</td>
                  <td>{cliente.email}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="edit-button"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
                      className="delete-button"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
