import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ClipboardList, Users, Car, Package, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

const LOGO_URL = "/manus-storage/lb-logo_9fa76d8d.jpg";

function StatCard({ title, value, icon: Icon, color, href }: { title: string; value: string | number; icon: any; color: string; href?: string }) {
  const content = (
    <div className={`bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all duration-200 group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (isLoading) return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-64 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-card border border-border rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-primary/30 flex-shrink-0">
          <img src={LOGO_URL} alt="LB" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            LB Mecânica Automotiva
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* OS Status */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ordens de Serviço</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de OS" value={stats?.totalOS ?? 0} icon={ClipboardList} color="bg-blue-500/20 text-blue-400" href="/os" />
          <StatCard title="OS Abertas" value={stats?.osAbertas ?? 0} icon={AlertCircle} color="bg-blue-500/20 text-blue-400" href="/os" />
          <StatCard title="Em Andamento" value={stats?.osEmAndamento ?? 0} icon={ClipboardList} color="bg-amber-500/20 text-amber-400" href="/os" />
          <StatCard title="Concluídas" value={stats?.osConcluidas ?? 0} icon={ClipboardList} color="bg-green-500/20 text-green-400" href="/os" />
        </div>
      </div>

      {/* Cadastros */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cadastros</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Clientes" value={stats?.totalClientes ?? 0} icon={Users} color="bg-purple-500/20 text-purple-400" href="/clientes" />
          <StatCard title="Peças em Estoque" value={stats?.totalPecas ?? 0} icon={Package} color="bg-orange-500/20 text-orange-400" href="/pecas" />
        </div>
      </div>

      {/* Financeiro do mês */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financeiro — Mês Atual</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-green-500/30 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Receitas</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{formatCurrency(stats?.receitasMes ?? 0)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-green-500/20 text-green-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="bg-card border border-red-500/30 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Despesas</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(stats?.despesasMes ?? 0)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/20 text-red-400">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className={`bg-card border rounded-xl p-5 ${(stats?.lucroMes ?? 0) >= 0 ? "border-primary/30" : "border-red-500/30"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Lucro Líquido</p>
                <p className={`text-2xl font-bold mt-1 ${(stats?.lucroMes ?? 0) >= 0 ? "text-primary" : "text-red-400"}`}>
                  {formatCurrency(stats?.lucroMes ?? 0)}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg ${(stats?.lucroMes ?? 0) >= 0 ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"}`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/os", label: "Nova OS", icon: ClipboardList },
            { href: "/clientes", label: "Novo Cliente", icon: Users },
            { href: "/orcamentos", label: "Novo Orçamento", icon: Car },
            { href: "/financeiro", label: "Lançamento", icon: DollarSign },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className="flex items-center gap-3 bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/40 rounded-xl p-4 transition-all duration-150 cursor-pointer">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
