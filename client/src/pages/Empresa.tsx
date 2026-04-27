import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save, CheckCircle } from "lucide-react";

const LOGO_URL = "/manus-storage/lb-logo_9fa76d8d.jpg";

export default function Empresa() {
  const utils = trpc.useUtils();
  const { data: empresa, isLoading } = trpc.empresa.get.useQuery();

  const [form, setForm] = useState({
    nome: "LB Mecânica Automotiva",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (empresa) {
      setForm({
        nome: (empresa as any).nome || "LB Mecânica Automotiva",
        cnpj: (empresa as any).cnpj || "",
        endereco: (empresa as any).endereco || "",
        telefone: (empresa as any).telefone || "",
        email: (empresa as any).email || "",
      });
    }
  }, [empresa]);

  const updateMutation = trpc.empresa.update.useMutation({
    onSuccess: () => {
      toast.success("Dados da empresa salvos com sucesso!");
      utils.empresa.get.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) return (
    <div className="p-6 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20 text-primary"><Building2 className="w-5 h-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Dados da Empresa</h1>
          <p className="text-muted-foreground text-sm">Configure as informações que aparecerão nos documentos</p>
        </div>
      </div>

      {/* Logo Preview */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Logo e Identidade Visual</h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl bg-black flex items-center justify-center overflow-hidden border border-border">
            <img src={LOGO_URL} alt="Logo LB Mecânica" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <p className="text-foreground font-semibold text-lg">LB Mecânica Automotiva</p>
            <p className="text-muted-foreground text-sm mt-1">Logo integrada automaticamente em todos os documentos</p>
            <div className="flex gap-2 mt-3">
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Orçamentos</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Garantias</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Relatórios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-5">Informações Cadastrais</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-foreground">Nome da Empresa</Label>
            <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome da empresa" className="bg-secondary border-border" />
            <p className="text-xs text-muted-foreground">Este nome aparece no cabeçalho de todos os documentos</p>
          </div>

          <div className="space-y-1">
            <Label className="text-foreground">CNPJ</Label>
            <Input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" className="bg-secondary border-border" />
          </div>

          <div className="space-y-1">
            <Label className="text-foreground">Endereço Completo</Label>
            <Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, Número, Bairro, Cidade - Estado" className="bg-secondary border-border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-foreground">Telefone / WhatsApp</Label>
              <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" className="bg-secondary border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-foreground">E-mail</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@lbmecanica.com.br" className="bg-secondary border-border" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="bg-primary text-primary-foreground gap-2 w-full md:w-auto" disabled={updateMutation.isPending}>
              {saved ? <><CheckCircle className="w-4 h-4" />Salvo!</> : <><Save className="w-4 h-4" />Salvar Dados</>}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview dos documentos */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Pré-visualização do Cabeçalho</h3>
        <div className="border border-border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between border-b-2 border-yellow-500 pb-3">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
            <div className="text-right">
              <p className="text-lg font-bold text-yellow-600">{form.nome || "LB Mecânica Automotiva"}</p>
              {form.cnpj && <p className="text-xs text-gray-600">CNPJ: {form.cnpj}</p>}
              {form.endereco && <p className="text-xs text-gray-600">{form.endereco}</p>}
              {form.telefone && <p className="text-xs text-gray-600">{form.telefone}</p>}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center italic">Assim aparecerá no cabeçalho dos seus documentos</p>
        </div>
      </div>
    </div>
  );
}
