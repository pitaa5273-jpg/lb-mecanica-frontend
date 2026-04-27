import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/CrudPages.css';

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [form, setForm] = useState({ tipo: 'entrada', descricao: '', valor: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadLancamentos();
  }, []);

  const loadLancamentos = async () => {
    try {
      const res = await api.get('/financeiro');
      setLancamentos(res.data);
    } catch (err) {
      console.error('Erro ao carregar lançamentos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/financeiro', form);
      setForm({ tipo: 'entrada', descricao: '', valor: '' });
      loadLancamentos();
    } catch (err) {
      console.error('Erro ao adicionar lançamento:', err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.get('/financeiro/report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Relatorio_Financeiro.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
    }
  };

  const totalEntradas = lancamentos
    .filter((l) => l.tipo === 'entrada')
    .reduce((sum, l) => sum + l.valor, 0);
  const totalSaidas = lancamentos
    .filter((l) => l.tipo === 'saida')
    .reduce((sum, l) => sum + l.valor, 0);

  return (
    <div className="crud-container">
      <header className="crud-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Voltar
        </button>
        <h1>💰 Financeiro</h1>
      </header>

      <div className="crud-content">
        <div className="form-section">
          <h2>Novo Lançamento</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Valor</label>
              <input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Adicionar
            </button>
          </form>

          <div className="resumo">
            <h3>Resumo</h3>
            <p>Entradas: R$ {totalEntradas.toFixed(2)}</p>
            <p>Saídas: R$ {totalSaidas.toFixed(2)}</p>
            <p><strong>Saldo: R$ {(totalEntradas - totalSaidas).toFixed(2)}</strong></p>
            <button onClick={handleGenerateReport} className="submit-button">
              📄 Gerar Relatório
            </button>
          </div>
        </div>

        <div className="list-section">
          <h2>Lançamentos</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.data).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`tipo-badge tipo-${l.tipo}`}>
                      {l.tipo === 'entrada' ? '⬆️ Entrada' : '⬇️ Saída'}
                    </span>
                  </td>
                  <td>{l.descricao}</td>
                  <td className={l.tipo === 'entrada' ? 'valor-positivo' : 'valor-negativo'}>
                    R$ {l.valor.toFixed(2)}
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
