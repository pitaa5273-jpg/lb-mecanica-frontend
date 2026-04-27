import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Veiculos from './pages/Veiculos';
import OS from './pages/OS';
import OSDetalhes from './pages/OSDetalhes';
import Financeiro from './pages/Financeiro';
import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <Clientes />
            </PrivateRoute>
          }
        />
        <Route
          path="/veiculos"
          element={
            <PrivateRoute>
              <Veiculos />
            </PrivateRoute>
          }
        />
        <Route
          path="/os"
          element={
            <PrivateRoute>
              <OS />
            </PrivateRoute>
          }
        />
        <Route
          path="/os/:id"
          element={
            <PrivateRoute>
              <OSDetalhes />
            </PrivateRoute>
          }
        />
        <Route
          path="/financeiro"
          element={
            <PrivateRoute>
              <Financeiro />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
