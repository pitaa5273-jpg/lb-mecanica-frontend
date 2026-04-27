CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(200) NOT NULL,
	`telefone` varchar(20),
	`cpfCnpj` varchar(20),
	`email` varchar(200),
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `empresa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(200) NOT NULL DEFAULT 'LB Mecânica Automotiva',
	`cnpj` varchar(20),
	`endereco` text,
	`telefone` varchar(20),
	`email` varchar(200),
	`logoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `empresa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fechamentosCaixa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp NOT NULL,
	`totalReceitas` decimal(10,2) DEFAULT '0',
	`totalDespesas` decimal(10,2) DEFAULT '0',
	`saldoFinal` decimal(10,2) DEFAULT '0',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fechamentosCaixa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financeiro` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('receita','despesa') NOT NULL,
	`categoria` varchar(100),
	`descricao` varchar(300) NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`data` timestamp NOT NULL DEFAULT (now()),
	`osId` int,
	`formaPagamento` varchar(50),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financeiro_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `garantias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`osId` int NOT NULL,
	`clienteId` int NOT NULL,
	`veiculoId` int NOT NULL,
	`numero` varchar(20) NOT NULL,
	`dataEmissao` timestamp NOT NULL DEFAULT (now()),
	`dataVencimento` timestamp NOT NULL,
	`servicosGarantidos` text NOT NULL,
	`condicoesGarantia` text,
	`assinaturaCliente` text,
	`assinaturaResponsavel` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `garantias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamentoItens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orcamentoId` int NOT NULL,
	`tipo` enum('servico','peca') NOT NULL,
	`descricao` varchar(300) NOT NULL,
	`pecaId` int,
	`quantidade` decimal(10,2) NOT NULL DEFAULT '1',
	`valorUnitario` decimal(10,2) NOT NULL DEFAULT '0',
	`valorTotal` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orcamentoItens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` varchar(20) NOT NULL,
	`clienteId` int NOT NULL,
	`veiculoId` int NOT NULL,
	`status` enum('pendente','aprovado','reprovado','expirado') NOT NULL DEFAULT 'pendente',
	`descricao` text,
	`observacoes` text,
	`validadeAte` timestamp,
	`valorServicos` decimal(10,2) DEFAULT '0',
	`valorPecas` decimal(10,2) DEFAULT '0',
	`desconto` decimal(10,2) DEFAULT '0',
	`valorTotal` decimal(10,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orcamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ordensServico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` varchar(20) NOT NULL,
	`clienteId` int NOT NULL,
	`veiculoId` int NOT NULL,
	`status` enum('aberta','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'aberta',
	`descricaoProblema` text,
	`servicosRealizados` text,
	`observacoes` text,
	`kmEntrada` varchar(20),
	`kmSaida` varchar(20),
	`previsaoEntrega` timestamp,
	`dataEntrada` timestamp NOT NULL DEFAULT (now()),
	`dataConclusao` timestamp,
	`valorServicos` decimal(10,2) DEFAULT '0',
	`valorPecas` decimal(10,2) DEFAULT '0',
	`desconto` decimal(10,2) DEFAULT '0',
	`valorTotal` decimal(10,2) DEFAULT '0',
	`formaPagamento` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ordensServico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `osFotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`osId` int NOT NULL,
	`etapa` enum('antes','durante','depois') NOT NULL,
	`url` text NOT NULL,
	`fileKey` text NOT NULL,
	`descricao` varchar(300),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `osFotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `osItens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`osId` int NOT NULL,
	`tipo` enum('servico','peca') NOT NULL,
	`descricao` varchar(300) NOT NULL,
	`pecaId` int,
	`quantidade` decimal(10,2) NOT NULL DEFAULT '1',
	`valorUnitario` decimal(10,2) NOT NULL DEFAULT '0',
	`valorTotal` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `osItens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pecas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(200) NOT NULL,
	`codigo` varchar(50),
	`descricao` text,
	`quantidade` int NOT NULL DEFAULT 0,
	`precoCompra` decimal(10,2) NOT NULL DEFAULT '0',
	`precoVenda` decimal(10,2) NOT NULL DEFAULT '0',
	`unidade` varchar(20) DEFAULT 'un',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pecas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `veiculos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clienteId` int NOT NULL,
	`placa` varchar(10) NOT NULL,
	`modelo` varchar(100) NOT NULL,
	`marca` varchar(100),
	`ano` varchar(4),
	`cor` varchar(50),
	`km` varchar(20),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `veiculos_id` PRIMARY KEY(`id`)
);
