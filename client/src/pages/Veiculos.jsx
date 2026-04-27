import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/CrudPages.css';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ cliente_id: '', marca: '', modelo: '', placa: '', ano: '' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVeiculos();
    loadClientes();
  }, []);

  const loadVeiculos = async () => {
    try {
      const res = await api.get('/veiculos');
      setVeiculos(res.data);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    }
  };

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
        await api.put(`/veiculos/${editingId}`, form);
      } else {
        await api.post('/veiculos', form);
      }
      setForm({ cliente_id: '', marca: '', modelo: '', placa: '', ano: '' });
      setEditingId(null);
      loadVeiculos();
    } catch (err) {
      console.error('Erro ao salvar veículo:', err);
    }
  };

  const handleEdit = (veiculo) => {
    setForm(veiculo);
    setEditingId(veiculo.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja deletar este veículo?')) {
      try {
        await api.delete(`/veiculos/${id}`);
        loadVeiculos();
      } catch (err) {
        console.error('Erro ao deletar veículo:', err);
      }
    }
  };

  return (
    <div className="crud-container">
      <header className="crud-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Voltar
        </button>
        <h1>🚗 Veículos</h1>
      </header>

      <div className="crud-content">
        <div className="form-section">
          <h2>{editingId ? 'Editar Veículo' : 'Novo Veículo'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Cliente</label>
              <select
                value={form.cliente_id}
                onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Marca</label>
              <input
                type="text"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Modelo</label>
              <input
                type="text"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Placa</label>
              <input
                type="text"
                value={form.placa}
                onChange={(e) => setForm({ ...form, placa: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Ano</label>
              <input
                type="number"
                value={form.ano}
                onChange={(e) => setForm({ ...form, ano: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ cliente_id: '', marca: '', modelo: '', placa: '', ano: '' });
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
          <h2>Lista de Veículos</h2>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Placa</th>
                <th>Ano</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.cliente_nome}</td>
                  <td>{veiculo.marca}</td>
                  <td>{veiculo.modelo}</td>
                  <td>{veiculo.placa}</td>
                  <td>{veiculo.ano}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(veiculo)}
                      className="edit-button"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(veiculo.id)}
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
