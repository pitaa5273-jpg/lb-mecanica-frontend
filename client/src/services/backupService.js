import api from './api';

/**
 * Serviço de Backup e Restore
 * Permite exportar e importar dados do sistema
 */

// Tipos de dados que serão inclusos no backup
const BACKUP_TYPES = {
  CLIENTES: 'clientes',
  VEICULOS: 'veiculos',
  OS: 'os',
  FINANCEIRO: 'financeiro',
  ORCAMENTOS: 'orcamentos',
  GARANTIAS: 'garantias'
};

/**
 * Exportar todos os dados para um arquivo JSON
 */
export const exportBackup = async () => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {}
    };

    // Buscar dados de cada tipo
    const endpoints = {
      [BACKUP_TYPES.CLIENTES]: '/clientes',
      [BACKUP_TYPES.VEICULOS]: '/veiculos',
      [BACKUP_TYPES.OS]: '/os',
      [BACKUP_TYPES.FINANCEIRO]: '/financeiro',
      [BACKUP_TYPES.ORCAMENTOS]: '/orcamentos',
      [BACKUP_TYPES.GARANTIAS]: '/garantias'
    };

    for (const [type, endpoint] of Object.entries(endpoints)) {
      try {
        const response = await api.get(endpoint);
        backup.data[type] = response.data || [];
      } catch (error) {
        console.warn(`Aviso: Não foi possível buscar dados de ${type}:`, error.message);
        backup.data[type] = [];
      }
    }

    // Criar arquivo JSON e fazer download
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_lb_mecanica_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Backup exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar backup:', error);
    throw new Error('Erro ao exportar backup: ' + error.message);
  }
};

/**
 * Importar dados de um arquivo JSON
 */
export const importBackup = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        // Validar estrutura do backup
        if (!backup.data || typeof backup.data !== 'object') {
          throw new Error('Formato de backup inválido');
        }

        // Importar dados
        const results = {
          success: [],
          errors: []
        };

        const endpoints = {
          [BACKUP_TYPES.CLIENTES]: '/clientes/import',
          [BACKUP_TYPES.VEICULOS]: '/veiculos/import',
          [BACKUP_TYPES.OS]: '/os/import',
          [BACKUP_TYPES.FINANCEIRO]: '/financeiro/import',
          [BACKUP_TYPES.ORCAMENTOS]: '/orcamentos/import',
          [BACKUP_TYPES.GARANTIAS]: '/garantias/import'
        };

        for (const [type, endpoint] of Object.entries(endpoints)) {
          try {
            const data = backup.data[type] || [];
            if (data.length > 0) {
              await api.post(endpoint, { items: data });
              results.success.push(`${type}: ${data.length} registros importados`);
            }
          } catch (error) {
            results.errors.push(`${type}: ${error.message}`);
          }
        }

        resolve({
          success: true,
          results,
          message: `Backup importado! ${results.success.length} tipos de dados restaurados.`
        });
      } catch (error) {
        reject(new Error('Erro ao importar backup: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsText(file);
  });
};

/**
 * Validar arquivo de backup
 */
export const validateBackupFile = (file) => {
  if (!file) {
    return { valid: false, message: 'Nenhum arquivo selecionado' };
  }

  if (!file.name.endsWith('.json')) {
    return { valid: false, message: 'O arquivo deve ser um JSON' };
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB
    return { valid: false, message: 'O arquivo é muito grande (máximo 10MB)' };
  }

  return { valid: true, message: 'Arquivo válido' };
};

export default {
  exportBackup,
  importBackup,
  validateBackupFile,
  BACKUP_TYPES
};
