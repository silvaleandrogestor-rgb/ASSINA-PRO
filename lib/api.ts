
import { supabase } from './supabase';
import { Contract, CompanyProfile, Quote, HistoryItem, CreditWallet, Subscription, User } from '../types';

/*
 * ===================================================================================
 * ❗❗❗ AÇÃO OBRIGATÓRIA: CORRIJA SEU BANCO DE DADOS ❗❗❗
 * ===================================================================================
 *
 * Os erros "Could not find the table..." que você está vendo acontecem porque
 * as tabelas do banco de dados AINDA NÃO FORAM CRIADAS no seu projeto Supabase.
 * O código está tentando usar tabelas que não existem.
 *
 * PARA RESOLVER TODOS OS ERROS DE UMA VEZ:
 *
 * 1.  Vá para o seu projeto no site do Supabase (app.supabase.com).
 * 2.  No menu lateral esquerdo, clique em "SQL Editor" (ícone de um banco de dados com "SQL").
 * 3.  Clique no botão azul "+ New query".
 * 4.  Copie TODO o código SQL abaixo (desde -- APAGA TABELAS ANTIGAS... até o final).
 * 5.  Cole o código no editor SQL.
 * 6.  Clique no botão verde "RUN" no canto inferior direito.
 *
 * Isso irá criar todas as tabelas e permissões necessárias. A aplicação SÓ FUNCIONARÁ
 * depois que você executar este script.
 *
 * ===================================================================================
 * INÍCIO DO SCRIPT SQL (Copie tudo abaixo)
 * ===================================================================================
 */
// FIX: Commented out the SQL script to prevent TypeScript compilation errors.
/*
-- APAGA TABELAS ANTIGAS PARA UMA INSTALAÇÃO LIMPA (CUIDADO: ISSO DELETA TODOS OS DADOS)
DROP TABLE IF EXISTS public.creditos_log;
DROP TABLE IF EXISTS public.historico;
DROP TABLE IF EXISTS public.orcamentos;
DROP TABLE IF EXISTS public.contratos;
DROP TABLE IF EXISTS public.assinaturas;
DROP TABLE IF EXISTS public.carteira_creditos;
DROP TABLE IF EXISTS public.perfis_empresa;
DROP TABLE IF EXISTS public.usuarios_perfil;

-- CRIA AS TABELAS NOVAS
CREATE TABLE public.usuarios_perfil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  idade TEXT,
  sexo TEXT,
  profissao TEXT,
  data_criacao TIMESTAMPTZ DEFAULT now(),
  ultimo_acesso TIMESTAMPTZ,
  ip TEXT,
  user_agent TEXT
);

CREATE TABLE public.carteira_creditos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  creditos INTEGER DEFAULT 0 NOT NULL,
  trial_ativo BOOLEAN DEFAULT true NOT NULL,
  trial_usado BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE public.assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_plano TEXT, -- 'mensal'
  status TEXT, -- 'ativo', 'expirado'
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ
);

CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT,
  texto TEXT,
  status TEXT DEFAULT 'draft',
  assinatura_cliente TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.creditos_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT, -- 'debito' ou 'credito'
  quantidade INTEGER,
  descricao TEXT,
  data TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao TEXT,
  valor TEXT,
  data TIMESTAMPTZ DEFAULT now(),
  ip TEXT,
  user_agent TEXT
);

CREATE TABLE public.perfis_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome_empresa TEXT,
  logo_url TEXT,
  identificador TEXT,
  endereco TEXT,
  telefone TEXT,
  assinatura_padrao TEXT
);

CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_cliente TEXT,
  produto_servico TEXT,
  detalhes TEXT,
  valor NUMERIC,
  status TEXT DEFAULT 'sent',
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- HABILITA RLS (ROW LEVEL SECURITY) EM TODAS AS TABELAS
ALTER TABLE public.usuarios_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carteira_creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditos_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

-- CRIA AS POLÍTICAS DE ACESSO (PERMISSÕES)
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.usuarios_perfil FOR ALL USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.carteira_creditos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.assinaturas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir acesso de leitura pública em contratos" ON public.contratos FOR SELECT USING (true);
CREATE POLICY "Permitir acesso de escrita para o dono do contrato" ON public.contratos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.creditos_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir acesso de leitura para o dono do histórico" ON public.historico FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Permitir inserção para usuários autenticados" ON public.historico FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir inserção anônima no histórico (para assinaturas)" ON public.historico FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.perfis_empresa FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.orcamentos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
*/
/*
 * ===================================================================================
 * FIM DO SCRIPT SQL
 * ===================================================================================
 */

/**
 * ===================================================================================
 * ❗❗❗ AÇÃO OBRIGATÓRIA: CRIAR EDGE FUNCTION PARA CHECKOUT PAGSEGURO ❗❗❗
 * ===================================================================================
 * O erro "Failed to send a request to the Edge Function" acontece porque a função
 * que processa o pagamento AINDA NÃO EXISTE no seu projeto Supabase.
 *
 * PARA RESOLVER:
 *
 * 1.  No seu projeto (no seu computador), se não tiver a CLI do Supabase, instale-a.
 * 2.  Execute: `supabase functions new iniciar-checkout-pagseguro`
 * 3.  Isso criará um arquivo em: `supabase/functions/iniciar-checkout-pagseguro/index.ts`
 * 4.  Abra esse arquivo e substitua TODO o conteúdo dele pelo código abaixo.
 * 5.  Adicione seu token do PagSeguro como um "Secret" no Supabase:
 *     `supabase secrets set PAGSEGURO_TOKEN=SEU_TOKEN_AQUI`
 * 6.  Faça o deploy da função: `supabase functions deploy`
 *
 * ===================================================================================
 * INÍCIO DO CÓDIGO DA EDGE FUNCTION (Copie e cole no arquivo index.ts)
 * ===================================================================================
 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PAGSEGURO_TOKEN = Deno.env.get("PAGSEGURO_TOKEN");
const PAGSEGURO_API_URL = "https://sandbox.api.pagseguro.com/checkouts"; // Mude para a URL de produção quando estiver pronto

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tipo, valor, descricao, customer, userId } = await req.json();

    if (!PAGSEGURO_TOKEN) {
      throw new Error("PagSeguro token is not configured in Supabase secrets.");
    }

    const body = {
      reference_id: `${userId}-${crypto.randomUUID()}`,
      description: descricao,
      amount: {
        value: Number(valor) * 100, // PagSeguro expects value in cents
        currency: "BRL",
      },
      payment_notification_urls: [
        `https://njxcddubrgybmkzueavr.supabase.co/functions/v1/webhook-pagseguro`,
      ],
      customer: {
        name: customer.name || "N/A",
        email: customer.email,
        tax_id: "11111111111", // Placeholder, idealmente coletar do usuário
      },
      // Adicionando o userId nos metadados para o webhook
      metadata: {
        userId: userId,
        tipoCompra: tipo,
      },
    };

    const response = await fetch(PAGSEGURO_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAGSEGURO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PagSeguro API Error:", data);
      throw new Error(data.error_messages[0]?.description || "Failed to create checkout.");
    }

    const checkoutUrl = data.links?.find((link: any) => link.rel === "PAY")?.href;

    if (!checkoutUrl) {
        throw new Error("Checkout URL not found in PagSeguro response.");
    }

    return new Response(JSON.stringify({ checkoutUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
 
 * ===================================================================================
 * FIM DO CÓDIGO DA EDGE FUNCTION
 * ===================================================================================
 */

/**
 * Improved error logger for Supabase errors.
 * @param context A string describing where the error occurred.
 * @param error The Supabase error object.
 */
function logSupabaseError(context: string, error: any) {
    if (!error) return;
    console.error(`--- Supabase Error in ${context} ---`);
    console.error(`Message: ${error.message}`);
    console.error(`Details: ${error.details}`);
    console.error(`Hint: ${error.hint}`);
    console.error("Full Error Object:", error);
    console.error("------------------------------------");
}

/**
 * ============================================================================
 * Authentication & Profile
 * ============================================================================
 */
export async function registerUser(userData: { [key: string]: string }) {
    const { email, password, nome, ...profileData } = userData;
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { data: { full_name: nome } } 
    });
    
    if (authError) {
        logSupabaseError('registerUser (signUp)', authError);
    } else if (authData.user) {
        const { error: profileError } = await salvarPerfilUsuario(authData.user.id, {
            email,
            nome,
            ...profileData
        });
        if (!profileError) {
            await criarCarteiraInicial(authData.user.id);
        }
    }
    return { user: authData.user, session: authData.session, error: authError };
}

export async function loginUser(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) logSupabaseError('loginUser', error);
    return { data, error };
}

export async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) logSupabaseError('loginWithGoogle', error);
    return { data, error };
}

export async function salvarPerfilUsuario(userId: string, profileData: { [key: string]: any }) {
    // Remove confirmPassword before saving
    const { confirmPassword, ...dataToSave } = profileData;
    const { data, error } = await supabase.from('usuarios_perfil').insert([{ 
        auth_id: userId, 
        user_agent: navigator.userAgent,
        ...dataToSave
    }]).select().single();
    if (error) logSupabaseError('salvarPerfilUsuario', error);
    return { data, error };
}

export async function checkUserProfileExists(userId: string) {
    const { data, error, count } = await supabase.from('usuarios_perfil').select('id', { count: 'exact', head: true }).eq('auth_id', userId);
    if (error) { logSupabaseError('checkUserProfileExists', error); return false; }
    return (count ?? 0) > 0;
}

export async function atualizarUltimoAcesso(userId: string) {
  const { data, error } = await supabase.from('usuarios_perfil').update({ ultimo_acesso: new Date().toISOString(), user_agent: navigator.userAgent }).eq('auth_id', userId);
  if (error) logSupabaseError('atualizarUltimoAcesso', error);
  return { data, error };
}

export async function getPerfilEmpresa(userId: string) {
    const { data, error } = await supabase
        .from('perfis_empresa')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') {
        logSupabaseError('getPerfilEmpresa', error);
    }
    return { data: data as CompanyProfile | null, error: error?.code === 'PGRST116' ? null : error };
}

export async function salvarPerfilEmpresa(userId: string, profileData: Partial<CompanyProfile>) {
    const { data, error } = await supabase
        .from('perfis_empresa')
        .upsert({ ...profileData, user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();
    if (error) logSupabaseError('salvarPerfilEmpresa', error);
    return { data, error };
}

export async function getUserProfile(userId: string) {
    const { data, error } = await supabase.from('usuarios_perfil').select('nome').eq('auth_id', userId).single();
    if (error) logSupabaseError('getUserProfile', error);
    return { data: data as { nome: string } | null, error };
}

/**
 * ============================================================================
 * Wallet, Subscription & Permissions
 * ============================================================================
 */
export async function criarCarteiraInicial(userId: string) {
    const { data, error } = await supabase.from('carteira_creditos').insert([{ user_id: userId, creditos: 0, trial_ativo: true, trial_usado: false }]);
    if (error) logSupabaseError('criarCarteiraInicial', error);
    return { data, error };
}

export async function getCreditWallet(userId: string) {
    const { data, error } = await supabase.from('carteira_creditos').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') logSupabaseError('getCreditWallet', error);
    return { data: data as CreditWallet | null, error: error?.code === 'PGRST116' ? null : error };
}

export async function getAssinaturaAtiva(userId: string) {
    const { data, error } = await supabase.from('assinaturas').select('*').eq('user_id', userId).eq('status', 'ativo').maybeSingle();
    if (error) logSupabaseError('getAssinaturaAtiva', error);
    return { data: data as Subscription | null, error };
}

export async function verificarPermissao(userId: string, acao: 'criar_contrato' | 'assinatura' | 'orcamento'): Promise<{ permitido: boolean, motivo?: string, modo?: 'plano_mensal' | 'credito' | 'trial' }> {
    const { data: subscription } = await getAssinaturaAtiva(userId);
    if (subscription) {
        return { permitido: true, modo: "plano_mensal" };
    }

    const { data: wallet } = await getCreditWallet(userId);
    if (!wallet) return { permitido: false, motivo: "Não foi possível verificar sua carteira de créditos." };
    if (wallet.creditos > 0) {
        return { permitido: true, modo: "credito" };
    }

    if (wallet.trial_ativo && !wallet.trial_usado) {
         if (acao === 'criar_contrato' || acao === 'assinatura' || acao === 'orcamento') {
            return { permitido: true, modo: "trial" };
         }
    }
    
    return { permitido: false, motivo: "upgrade" };
}

export async function gastarCredito(userId: string, quantidade: number, descricao: string) {
    const { data: wallet } = await getCreditWallet(userId);
    if (!wallet || wallet.creditos < quantidade) return { error: { message: "Créditos insuficientes." } };

    const { data, error } = await supabase.from('carteira_creditos').update({ creditos: wallet.creditos - quantidade }).eq('user_id', userId).select().single();
    if (error) logSupabaseError('gastarCredito', error);
    else await registrarCreditoLog(userId, 'debito', quantidade, descricao);
    return { data, error };
}

export async function usarTrial(userId: string) {
    const { data, error } = await supabase.from('carteira_creditos').update({ trial_ativo: false, trial_usado: true }).eq('user_id', userId).select().single();
    if (error) logSupabaseError('usarTrial', error);
    else await registrarHistorico(userId, null, 'trial_encerrado', 'Primeiro recurso do trial foi utilizado.');
    return { data, error };
}

/**
 * ============================================================================
 * Checkout PagSeguro
 * ============================================================================
 */
export async function iniciarCheckoutPagSeguro(tipo: 'mensal' | 'creditos', valor: number, descricao: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Erro: usuário não autenticado para iniciar o checkout.");
        return;
    }
    
    try {
        const { data, error } = await supabase.functions.invoke('iniciar-checkout-pagseguro', {
            body: JSON.stringify({
                tipo,
                valor,
                descricao,
                customer: { name: user.user_metadata?.full_name || "Cliente AssinaPro", email: user.email },
                userId: user.id
            })
        });

        if (error) throw error;

        if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
        } else {
            logSupabaseError("iniciarCheckoutPagSeguro (response)", data);
            alert("Não foi possível iniciar o checkout. Verifique se a Edge Function 'iniciar-checkout-pagseguro' foi implantada (deployed) corretamente no seu projeto Supabase.");
        }
    } catch (error: any) {
        logSupabaseError("iniciarCheckoutPagSeguro (fetch)", error);
        alert("Falha ao iniciar o checkout. Verifique se a Edge Function 'iniciar-checkout-pagseguro' foi criada e implantada (deployed) no seu projeto Supabase. (Erro: Failed to fetch)");
    }
}

/**
 * ============================================================================
 * History & Logs
 * ============================================================================
 */
export async function registrarHistorico(userId: string | null, contractId: string | null, action: string, value: string | null) {
  const { data, error } = await supabase.from('historico').insert([{ user_id: userId, contrato_id: contractId, acao: action, valor: value, user_agent: navigator.userAgent }]);
  if (error) logSupabaseError('registrarHistorico', error);
  return { data, error };
}

async function registrarCreditoLog(userId: string, type: 'credito' | 'debito', quantity: number, description: string) {
    const { data, error } = await supabase.from('creditos_log').insert([{ user_id: userId, tipo: type, quantidade: quantity, descricao: description }]);
    if (error) logSupabaseError('registrarCreditoLog', error);
    return { data, error };
}

export async function getRecentHistory(userId: string): Promise<{ data: HistoryItem[] | null, error: any }> {
  const { data, error } = await supabase
    .from('historico')
    .select(`
      id,
      acao,
      valor,
      data,
      contrato:contratos(titulo)
    `)
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(5);

  if (error) logSupabaseError('getRecentHistory', error);
  return { data, error };
}


/**
 * ============================================================================
 * Quotes (Orcamentos)
 * ============================================================================
 */
export async function criarOrcamento(userId: string, quoteData: Partial<Quote>) {
  const { nome_cliente, produto_servico, detalhes, valor } = quoteData;
  const { data, error } = await supabase
    .from('orcamentos')
    .insert([{
      user_id: userId,
      nome_cliente,
      produto_servico,
      detalhes,
      valor,
      status: 'sent',
    }])
    .select()
    .single();
  if (error) logSupabaseError('criarOrcamento', error);
  return { data, error };
}

export async function listarOrcamentos(userId: string) {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*')
    .eq('user_id', userId)
    .order('criado_em', { ascending: false });
  if (error) logSupabaseError('listarOrcamentos', error);
  return { data: data as Quote[] | null, error };
}

export async function getOrcamentosEnviadosCount(userId: string) {
  const { count, error } = await supabase
    .from('orcamentos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'sent');
  if (error) logSupabaseError('getOrcamentosEnviadosCount', error);
  return { count, error };
}

/**
 * ============================================================================
 * Contracts
 * ============================================================================
 */
export async function getContratosPorStatus(userId: string, status: string) {
  const { count, error } = await supabase
    .from('contratos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', status);
  if (error) logSupabaseError('getContratosPorStatus', error);
  return { count, error };
}

export async function criarContrato(userId: string, title: string, text: string) {
  const { data, error } = await supabase.from('contratos').insert([{ user_id: userId, titulo: title, texto: text, status: 'draft' }]).select().single();
  if (error) logSupabaseError('criarContrato', error);
  return { data, error };
}

export async function listarContratos(userId: string) {
  const { data, error } = await supabase.from('contratos').select('*').eq('user_id', userId).order('criado_em', { ascending: false });
  if (error) logSupabaseError('listarContratos', error);
  return { data: data as Contract[] | null, error };
}

export async function getContratoById(contractId: string) {
    const { data, error } = await supabase.from('contratos').select('*').eq('id', contractId).single();
    if (error) logSupabaseError('getContratoById', error);
    return { data: data as Contract | null, error };
}

export async function salvarAssinatura(contractId: string, signature: string) {
    const { data, error } = await supabase.from('contratos').update({ assinatura_cliente: signature, status: 'signed' }).eq('id', contractId);
    if (error) logSupabaseError('salvarAssinatura', error);
    return { data, error };
}
