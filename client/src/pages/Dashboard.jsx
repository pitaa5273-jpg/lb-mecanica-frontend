import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Dashboard.css';
import { Home, FileText, Users, MoreHorizontal } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    receita: 0,
    despesa: 0,
    lucro: 0,
    osAbertas: 0,
    osConcluidas: 0,
    orcamentos: 0,
    clientes: 0,
    veiculos: 0,
    pecas: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        // Dados de exemplo se a API falhar
        setStats({
          receita: 659,
          despesa: 250,
          lucro: 409,
          osAbertas: 0,
          osConcluidas: 1,
          orcamentos: 0,
          clientes: 1,
          veiculos: 1,
          pecas: 3
        });
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img src="/logo.png" alt="LB Mecânica" className="header-logo" />
            <span className="header-title">LB MECÂNICA AUTOMOTIVA</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Greeting */}
        <div className="greeting-section">
          <h1>Bom trabalho hoje</h1>
        </div>

        {/* Revenue Card */}
        <div className="revenue-card">
          <div className="revenue-header">
            <h2>RECEITA DO MÊS</h2>
          </div>
          <div className="revenue-amount">
            <h3>R$ {stats.receita?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="revenue-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-icon">📉</span>
              <span>Despesa R$ {stats.despesa?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-icon">📈</span>
              <span>Lucro R$ {stats.lucro?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/os')}>
            <div className="stat-icon os-icon">📋</div>
            <div className="stat-value">{stats.osAbertas}</div>
            <div className="stat-label">OS Abertas</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/os')}>
            <div className="stat-icon concluida-icon">✓</div>
            <div className="stat-value">{stats.osConcluidas}</div>
            <div className="stat-label">Concluídas</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/os')}>
            <div className="stat-icon orcamento-icon">📄</div>
            <div className="stat-value">{stats.orcamentos}</div>
            <div className="stat-label">Orçamentos</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/clientes')}>
            <div className="stat-icon cliente-icon">👥</div>
            <div className="stat-value">{stats.clientes}</div>
            <div className="stat-label">Clientes</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/veiculos')}>
            <div className="stat-icon veiculo-icon">🚗</div>
            <div className="stat-value">{stats.veiculos}</div>
            <div className="stat-label">Veículos</div>
          </div>

          <div className="stat-card" onClick={() => navigate('/financeiro')}>
            <div className="stat-icon peca-icon">📦</div>
            <div className="stat-value">{stats.pecas}</div>
            <div className="stat-label">Peças</div>
          </div>
        </div>

        {/* Spacer for bottom nav */}
        <div style={{ height: '80px' }}></div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/dashboard')}>
          <Home size={24} />
          <span>Início</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/os')}>
          <FileText size={24} />
          <span>OS</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/clientes')}>
          <Users size={24} />
          <span>Clientes</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/financeiro')}>
          <MoreHorizontal size={24} />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
}
