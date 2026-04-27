import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [summary, setSummary] = useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [osCount, setOsCount] = useState(0);
  const [clientesCount, setClientesCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const summaryRes = await api.get('/financeiro/summary');
      setSummary(summaryRes.data);

      const osRes = await api.get('/os');
      setOsCount(osRes.data.length);

      const clientesRes = await api.get('/clientes');
      setClientesCount(clientesRes.data.length);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>📊 Dashboard</h1>
          <p>LB Mecânica Automotiva</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </header>

      <div className="dashboard-content">
        <div className="cards-grid">
          <div className="card card-entradas">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Entradas</h3>
              <p className="card-value">R$ {summary.entradas.toFixed(2)}</p>
            </div>
          </div>

          <div className="card card-saidas">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <h3>Saídas</h3>
              <p className="card-value">R$ {summary.saidas.toFixed(2)}</p>
            </div>
          </div>

          <div className="card card-saldo">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>Saldo</h3>
              <p className="card-value">R$ {summary.saldo.toFixed(2)}</p>
            </div>
          </div>

          <div className="card card-os">
            <div className="card-icon">🔧</div>
            <div className="card-content">
              <h3>Ordens de Serviço</h3>
              <p className="card-value">{osCount}</p>
            </div>
          </div>

          <div className="card card-clientes">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>Clientes</h3>
              <p className="card-value">{clientesCount}</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Ações Rápidas</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/clientes')} className="action-btn">
              ➕ Novo Cliente
            </button>
            <button onClick={() => navigate('/os')} className="action-btn">
              🔧 Nova OS
            </button>
            <button onClick={() => navigate('/financeiro')} className="action-btn">
              💰 Financeiro
            </button>
            <button onClick={() => navigate('/veiculos')} className="action-btn">
              🚗 Veículos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
