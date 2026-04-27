import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/CrudPages.css';

export default function OS() {
  const [oss, setOss] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [form, setForm] = useState({ cliente_id: '', veiculo_id: '', descricao: '', status: 'Pendente' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOS();
    loadClientes();
    loadVeiculos();
  }, []);

  const loadOS = async () => {
    try {
      const res = await api.get('/os');
      setOss(res.data);
    } catch (err) {
      console.error('Erro ao carregar OS:', err);
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

  const loadVeiculos = async () => {
    try {
      const res = await api.get('/veiculos');
      setVeiculos(res.data);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/os/${editingId}`, form);
      } else {
        await api.post('/os', form);
      }
      setForm({ cliente_id: '', veiculo_id: '', descricao: '', status: 'Pendente' });
      setEditingId(null);
      loadOS();
    } catch (err) {
      console.error('Erro ao salvar OS:', err);
    }
  };

  const handleEdit = (os) => {
    setForm(os);
    setEditingId(os.id);
  };

  const handleViewDetails = (id) => {
    navigate(`/os/${id}`);
  };

  const handleGeneratePDF = async (id) => {
    try {
      const response = await api.get(`/os/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OS_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
  };

  return (
    <div className="crud-container">
      <header className="crud-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Voltar
        </button>
        <h1>🔧 Ordens de Serviço</h1>
      </header>

      <div className="crud-content">
        <div className="form-section">
          <h2>{editingId ? 'Editar OS' : 'Nova OS'}</h2>
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
              <label>Veículo</label>
              <select
                value={form.veiculo_id}
                onChange={(e) => setForm({ ...form, veiculo_id: e.target.value })}
                required
              >
                <option value="">Selecione um veículo</option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo} ({v.placa})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                required
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Pendente">Pendente</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
              </select>
            </div>
            <button type="submit" className="submit-button">
              {editingId ? 'Atualizar' : 'Adicionar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ cliente_id: '', veiculo_id: '', descricao: '', status: 'Pendente' });
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
          <h2>Lista de OS</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Veículo</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {oss.map((os) => (
                <tr key={os.id}>
                  <td>#{os.id}</td>
                  <td>{os.cliente_nome}</td>
                  <td>{os.veiculo_modelo}</td>
                  <td>
                    <span className={`status-badge status-${os.status.toLowerCase().replace(' ', '-')}`}>
                      {os.status}
                    </span>
                  </td>
                  <td>{new Date(os.data_criacao).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <button
                      onClick={() => handleViewDetails(os.id)}
                      className="edit-button"
                      title="Ver Detalhes"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleGeneratePDF(os.id)}
                      className="edit-button"
                      title="Gerar PDF"
                    >
                      📄
                    </button>
                    <button
                      onClick={() => handleEdit(os)}
                      className="edit-button"
                    >
                      ✏️
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
