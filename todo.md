# LB Mecânica Automotiva - TODO

## Fase 1: Schema e Autenticação
- [x] Schema do banco de dados (clientes, veículos, OS, peças, orçamento, financeiro, garantia, empresa)
- [x] Autenticação local fixa (login: lbmecanica / senha: eaixuxu) com JWT
- [x] Middleware de autenticação no backend

## Fase 2: Backend - Módulos Base
- [x] Router de clientes (CRUD completo)
- [x] Router de veículos (CRUD vinculado ao cliente)
- [x] Router de peças (CRUD com controle de estoque)
- [x] Router de empresa (CNPJ, endereço, telefone)

## Fase 3: Backend - Módulos Avançados
- [x] Router de OS (CRUD com status, serviços, peças, valor total)
- [x] Upload de fotos na OS (antes/durante/depois) via S3
- [x] Router de orçamento (CRUD com itens e valores)
- [x] Router financeiro (receitas, despesas, fechamento de caixa)
- [x] Router de garantia (geração de termo)
- [x] Router de relatórios (OS por período, faturamento, peças, clientes)

## Fase 4: Assets e Tema
- [x] Upload da logo LB Mecânica para S3
- [x] Tema dark com cores da marca (preto/dourado)
- [x] Fontes e estilos globais

## Fase 5: Frontend Base
- [x] Página de login com credenciais fixas
- [x] Layout dashboard com sidebar
- [x] Dashboard com indicadores principais
- [x] Módulo de clientes (listagem, cadastro, edição, histórico)
- [x] Módulo de veículos (listagem, cadastro, edição, histórico OS)

## Fase 6: Frontend OS e Peças
- [x] Módulo de OS (listagem, criação, edição, status)
- [x] Upload de fotos antes/durante/depois na OS
- [x] Visualização de fotos por etapa
- [x] Módulo de peças (listagem, cadastro, edição, estoque)

## Fase 7: Frontend Documentos e Financeiro
- [x] Módulo de orçamento (criação, edição, exportação PDF)
- [x] Módulo financeiro (lançamentos, fechamento de caixa, exportação PDF)
- [x] Módulo de garantia (geração de termo, assinatura digital, exportação PDF)
- [x] Módulo de relatórios (OS por período, faturamento, peças, clientes)

## Fase 8: Área Empresa e Integração
- [x] Área empresa (CNPJ, endereço, telefone)
- [x] Logo e nome integrados nos documentos PDF
- [x] Integração completa entre módulos

## Fase 9: Testes e Entrega
- [x] Testes unitários dos routers principais (10 testes passando)
- [x] Ajustes visuais finais
- [x] Checkpoint e entrega


## Fase 10: Painel Web Administrativo
- [x] Configurar WebSockets para sincronização em tempo real
- [x] Criar layout do painel web com dashboard
- [x] Implementar módulo de clientes no painel
- [x] Implementar módulo de veículos no painel
- [x] Implementar módulo de OS no painel
- [x] Implementar módulo de peças no painel
- [x] Implementar módulo de orçamentos no painel
- [x] Implementar módulo de financeiro no painel
- [x] Implementar módulo de garantias no painel
- [x] Implementar módulo de relatórios no painel
- [x] Integrar dados da empresa no painel
- [x] Testes e sincronização em tempo real

## Fase 11: Implementacao Completa do Painel
- [x] Implementar exportacao PDF real de garantias no painel
- [x] Implementar exportacao PDF real de relatorios no painel
- [x] Implementar visualizacao de garantias no painel
- [x] Validar sincronizacao WebSocket ponta a ponta
- [x] Adicionar testes de integracao com eventos WebSocket
