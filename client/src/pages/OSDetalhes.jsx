import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/CrudPages.css';

export default function OSDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOS] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [pecas, setPecas] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [servicoForm, setServicoForm] = useState({ descricao: '', valor: '' });
  const [pecaForm, setPecaForm] = useState({ nome: '', valor: '' });
  const [fotoTipo, setFotoTipo] = useState('antes');

  useEffect(() => {
    loadOS();
  }, [id]);

  const loadOS = async () => {
    try {
      const res = await api.get(`/os/${id}`);
      setOS(res.data);
      setServicos(res.data.servicos || []);
      setPecas(res.data.pecas || []);
      setFotos(res.data.fotos || []);
    } catch (err) {
      console.error('Erro ao carregar OS:', err);
    }
  };

  const handleAddServico = async (e) => {
    e.preventDefault();
    try {
      await api.post('/servicos', { os_id: id, ...servicoForm });
      setServicoForm({ descricao: '', valor: '' });
      loadOS();
    } catch (err) {
      console.error('Erro ao adicionar serviço:', err);
    }
  };

  const handleAddPeca = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pecas', { os_id: id, ...pecaForm });
      setPecaForm({ nome: '', valor: '' });
      loadOS();
    } catch (err) {
      console.error('Erro ao adicionar peça:', err);
    }
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);
    formData.append('os_id', id);
    formData.append('tipo', fotoTipo);

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      loadOS();
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
    }
  };

  const handleDeleteServico = async (servicoId) => {
    if (window.confirm('Deletar este serviço?')) {
      try {
        await api.delete(`/servicos/${servicoId}`);
        loadOS();
      } catch (err) {
        console.error('Erro ao deletar serviço:', err);
      }
    }
  };

  const handleDeletePeca = async (pecaId) => {
    if (window.confirm('Deletar esta peça?')) {
      try {
        await api.delete(`/pecas/${pecaId}`);
        loadOS();
      } catch (err) {
        console.error('Erro ao deletar peça:', err);
      }
    }
  };

  if (!os) return <div>Carregando...</div>;

  const totalServicos = servicos.reduce((sum, s) => sum + (s.valor || 0), 0);
  const totalPecas = pecas.reduce((sum, p) => sum + (p.valor || 0), 0);
  const total = totalServicos + totalPecas;

  return (
    <div className="crud-container">
      <header className="crud-header">
        <button onClick={() => navigate('/os')} className="back-button">
          ← Voltar
        </button>
        <h1>🔧 OS #{os.id}</h1>
      </header>

      <div className="os-detalhes-content">
        <div className="info-section">
          <h2>Informações</h2>
          <p><strong>Cliente:</strong> {os.cliente_nome}</p>
          <p><strong>Telefone:</strong> {os.cliente_telefone}</p>
          <p><strong>Veículo:</strong> {os.marca} {os.modelo} ({os.placa})</p>
          <p><strong>Ano:</strong> {os.ano}</p>
          <p><strong>Status:</strong> {os.status}</p>
          <p><strong>Descrição:</strong> {os.descricao}</p>
        </div>

        <div className="servicos-section">
          <h2>Serviços</h2>
          <form onSubmit={handleAddServico}>
            <input
              type="text"
              placeholder="Descrição"
              value={servicoForm.descricao}
              onChange={(e) => setServicoForm({ ...servicoForm, descricao: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Valor"
              value={servicoForm.valor}
              onChange={(e) => setServicoForm({ ...servicoForm, valor: e.target.value })}
              required
            />
            <button type="submit">Adicionar Serviço</button>
          </form>
          <ul>
            {servicos.map((s) => (
              <li key={s.id}>
                {s.descricao} - R$ {s.valor.toFixed(2)}
                <button onClick={() => handleDeleteServico(s.id)}>🗑️</button>
              </li>
            ))}
          </ul>
          <p><strong>Total Serviços: R$ {totalServicos.toFixed(2)}</strong></p>
        </div>

        <div className="pecas-section">
          <h2>Peças</h2>
          <form onSubmit={handleAddPeca}>
            <input
              type="text"
              placeholder="Nome"
              value={pecaForm.nome}
              onChange={(e) => setPecaForm({ ...pecaForm, nome: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Valor"
              value={pecaForm.valor}
              onChange={(e) => setPecaForm({ ...pecaForm, valor: e.target.value })}
              required
            />
            <button type="submit">Adicionar Peça</button>
          </form>
          <ul>
            {pecas.map((p) => (
              <li key={p.id}>
                {p.nome} - R$ {p.valor.toFixed(2)}
                <button onClick={() => handleDeletePeca(p.id)}>🗑️</button>
              </li>
            ))}
          </ul>
          <p><strong>Total Peças: R$ {totalPecas.toFixed(2)}</strong></p>
        </div>

        <div className="fotos-section">
          <h2>Fotos</h2>
          <div>
            <select value={fotoTipo} onChange={(e) => setFotoTipo(e.target.value)}>
              <option value="antes">Antes</option>
              <option value="durante">Durante</option>
              <option value="depois">Depois</option>
            </select>
            <input type="file" onChange={handleUploadFoto} accept="image/*" />
          </div>
          <div className="fotos-grid">
            {fotos.map((f) => (
              <div key={f.id} className="foto-item">
                <img src={`${import.meta.env.VITE_API_URL}/uploads/${f.caminho}`} alt={f.tipo} />
                <p>{f.tipo}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="total-section">
          <h2>Total: R$ {total.toFixed(2)}</h2>
        </div>
      </div>
    </div>
  );
}
