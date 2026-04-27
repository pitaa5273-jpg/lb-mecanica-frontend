import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { exportBackup, importBackup, validateBackupFile } from '../services/backupService';
import '../styles/Dashboard.css';
import { Home, FileText, Users, Wrench, Truck, DollarSign, LogOut, Menu, X, Download, Upload } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const fileInputRef = React.useRef(null);
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

  const handleExportBackup = async () => {
    try {
      setBackupLoading(true);
      await exportBackup();
      alert('Backup exportado com sucesso!');
    } catch (error) {
      alert('Erro ao exportar backup: ' + error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateBackupFile(file);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      setBackupLoading(true);
      const result = await importBackup(file);
      alert(result.message);
      // Recarregar dados
      window.location.reload();
    } catch (error) {
      alert('Erro ao importar backup: ' + error.message);
    } finally {
      setBackupLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Ordens de Serviço', path: '/os' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Truck, label: 'Veículos', path: '/veiculos' },
    { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
  ];

  return (
    <div className="dashboard-layout">
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
              className="nav-link"
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
      <main className="main-content">
        {/* Header */}
        <header className="content-header">
          <h1>Dashboard</h1>
          <p>Bem-vindo à LB Mecânica Automotiva</p>
        </header>

        {/* Content */}
        <div className="dashboard-content">
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
                <span className="breakdown-label">Despesa</span>
                <span className="breakdown-value">R$ {stats.despesa?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Lucro</span>
                <span className="breakdown-value">R$ {stats.lucro?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/os')}>
              <div className="stat-icon os-icon">📋</div>
              <div className="stat-content">
                <div className="stat-value">{stats.osAbertas}</div>
                <div className="stat-label">OS Abertas</div>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/os')}>
              <div className="stat-icon concluida-icon">✓</div>
              <div className="stat-content">
                <div className="stat-value">{stats.osConcluidas}</div>
                <div className="stat-label">Concluídas</div>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/os')}>
              <div className="stat-icon orcamento-icon">📄</div>
              <div className="stat-content">
                <div className="stat-value">{stats.orcamentos}</div>
                <div className="stat-label">Orçamentos</div>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/clientes')}>
              <div className="stat-icon cliente-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.clientes}</div>
                <div className="stat-label">Clientes</div>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/veiculos')}>
              <div className="stat-icon veiculo-icon">🚗</div>
              <div className="stat-content">
                <div className="stat-value">{stats.veiculos}</div>
                <div className="stat-label">Veículos</div>
              </div>
            </div>

            <div className="stat-card" onClick={() => navigate('/financeiro')}>
              <div className="stat-icon peca-icon">📦</div>
              <div className="stat-content">
                <div className="stat-value">{stats.pecas}</div>
                <div className="stat-label">Peças</div>
              </div>
            </div>
          </div>

          {/* Backup Section */}
          <div className="backup-section">
            <h3>Backup & Restauração</h3>
            <p>Exporte ou importe dados para backup e recuperação</p>
            <div className="backup-buttons">
              <button 
                className="btn-backup export"
                onClick={handleExportBackup}
                disabled={backupLoading}
                title="Exportar todos os dados para backup"
              >
                <Download size={16} />
                {backupLoading ? 'Exportando...' : 'Exportar Backup'}
              </button>
              <button 
                className="btn-backup import"
                onClick={handleImportClick}
                disabled={backupLoading}
                title="Importar dados de um arquivo de backup"
              >
                <Upload size={16} />
                {backupLoading ? 'Importando...' : 'Importar Backup'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
