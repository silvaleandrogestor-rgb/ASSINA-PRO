
export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  idade?: number;
  sexo?: 'masculino' | 'feminino' | 'nao-informar';
  profissao?: string;
}

export enum DocumentStatus {
  Draft = 'draft',
  Pending = 'pending',
  Signed = 'signed',
  Archived = 'archived',
}

export interface Contract {
  id: string;
  user_id: string;
  titulo: string;
  texto: string;
  status: 'draft' | 'pending' | 'signed' | 'archived';
  assinatura_cliente: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Quote {
  id: string;
  user_id: string;
  nome_cliente: string;
  produto_servico: string;
  detalhes: string;
  status: 'sent' | 'accepted' | 'declined';
  criado_em: string;
  valor: number;
}

export interface CompanyProfile {
  id?: string;
  user_id: string;
  nome_empresa: string;
  logo_url?: string;
  identificador: string; // CNPJ/CPF
  endereco: string;
  telefone: string;
  assinatura_padrao?: string; // base64 image or 'logo'
  tipo_assinatura?: 'draw' | 'type' | 'stamp';
}

export interface HistoryItem {
  id: string;
  acao: string;
  valor: string | null;
  data: string;
  contrato: {
    titulo: string;
  } | null;
}

export interface CreditWallet {
    user_id: string;
    creditos: number;
    trial_ativo: boolean;
    trial_usado: boolean;
}

export interface Subscription {
    id: string;
    user_id: string;
    tipo_plano: 'mensal';
    status: 'ativo' | 'expirado';
    data_inicio: string;
    data_fim: string | null;
}

export interface CreditLog {
    id: string;
    user_id: string;
    tipo: 'debito' | 'credito';
    quantidade: number;
    descricao: string;
    data: string;
}