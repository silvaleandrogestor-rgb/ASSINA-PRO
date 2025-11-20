
import { supabase } from './supabase';
import { Contract, CompanyProfile, Quote, HistoryItem, CreditWallet, Subscription } from '../types';

/*
 * ===================================================================================
 * ❗❗❗ AÇÃO OBRIGATÓRIA: SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS ❗❗❗
 * ===================================================================================
 *
 * Os erros "Could not find the table..." ocorrem porque as tabelas e permissões
 * necessárias ainda não existem no seu banco de dados Supabase.
 *
 * PARA RESOLVER TUDO DE UMA VEZ, SIGA ESTES PASSOS:
 *
 * 1.  Copie TODO o código SQL abaixo.
 * 2.  Vá para o seu projeto no site do Supabase (app.supabase.com).
 * 3.  No menu esquerdo, clique em "SQL Editor".
 * 4.  Clique em "+ New query".
 * 5.  Cole o script SQL que você copiou.
 * 6.  Clique no botão verde "RUN".
 *
 * --- INÍCIO DO SCRIPT SQL ---
 
DROP TABLE IF EXISTS public.creditos_log CASCADE;
DROP TABLE IF EXISTS public.historico CASCADE;
DROP TABLE IF EXISTS public.orcamentos CASCADE;
DROP TABLE IF EXISTS public.contratos CASCADE;
DROP TABLE IF EXISTS public.assinaturas CASCADE;
DROP TABLE IF EXISTS public.carteira_creditos CASCADE;
DROP TABLE IF EXISTS public.perfis_empresa CASCADE;
DROP TABLE IF EXISTS public.usuarios_perfil CASCADE;
DROP FUNCTION IF EXISTS public.adicionar_creditos(uuid, integer);
DROP FUNCTION IF EXISTS public.get_user_status(uuid);

CREATE TABLE public.usuarios_perfil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome TEXT, email TEXT, telefone TEXT, idade TEXT, sexo TEXT, profissao TEXT,
  data_criacao TIMESTAMPTZ DEFAULT now(), ultimo_acesso TIMESTAMPTZ, ip TEXT, user_agent TEXT
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
  tipo_plano TEXT, status TEXT, data_inicio TIMESTAMPTZ, data_fim TIMESTAMPTZ
);
CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT, texto TEXT, status TEXT DEFAULT 'draft', assinatura_cliente TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(), atualizado_em TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE public.creditos_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT, quantidade INTEGER, descricao TEXT, data TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE public.historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao TEXT, valor TEXT, data TIMESTAMPTZ DEFAULT now(), ip TEXT, user_agent TEXT
);
CREATE TABLE public.perfis_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome_empresa TEXT, logo_url TEXT, identificador TEXT, endereco TEXT, telefone TEXT, assinatura_padrao TEXT, tipo_assinatura TEXT
);
CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_cliente TEXT, produto_servico TEXT, detalhes TEXT, valor NUMERIC, status TEXT DEFAULT 'sent', criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.adicionar_creditos(p_user_id UUID, p_quantidade INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.carteira_creditos
  SET creditos = creditos + p_quantidade
  WHERE user_id = p_user_id;

  INSERT INTO public.creditos_log (user_id, tipo, quantidade, descricao)
  VALUES (p_user_id, 'credito', p_quantidade, 'Créditos adicionados via PagSeguro');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_status(p_user_id UUID)
RETURNS json AS $$
DECLARE
    wallet_data json;
    subscription_data json;
BEGIN
    SELECT row_to_json(c) INTO wallet_data FROM public.carteira_creditos c WHERE c.user_id = p_user_id;
    SELECT row_to_json(a) INTO subscription_data FROM public.assinaturas a WHERE a.user_id = p_user_id AND a.status = 'ativo' LIMIT 1;
    
    RETURN json_build_object(
        'wallet', wallet_data,
        'subscription', subscription_data
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


ALTER TABLE public.usuarios_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carteira_creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditos_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.usuarios_perfil FOR ALL USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.carteira_creditos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.assinaturas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir leitura pública em contratos" ON public.contratos FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para o dono do contrato" ON public.contratos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.creditos_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir leitura para dono do histórico" ON public.historico FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Permitir inserção para usuários autenticados" ON public.historico FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir inserção anônima no histórico (assinaturas)" ON public.historico FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.perfis_empresa FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.orcamentos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT EXECUTE ON FUNCTION public.get_user_status(uuid) TO authenticated;

-- --- FIM DO SCRIPT SQL ---
 * ===================================================================================
 */

function logSupabaseError(context: string, error: any) {
    if (!error) return;
    console.error(`--- Supabase Error in ${context} ---`);
    console.error(JSON.stringify(error, null, 2));
    console.error("------------------------------------");
}

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
    const { confirmEmail, confirmPassword, ...dataToSave } = profileData;
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

export async function salvarPerfilEmpresa(userId: string, profileData: Partial<CompanyProfile> & { logoFile?: File | null }) {
    const { logoFile, ...restOfProfile } = profileData;
    let logo_url = restOfProfile.logo_url;

    if (logoFile) {
        const filePath = `public/${userId}-${Date.now()}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, logoFile, {
            cacheControl: '3600',
            upsert: true
        });

        if (uploadError) {
            logSupabaseError('salvarPerfilEmpresa (upload logo)', uploadError);
            return { data: null, error: uploadError };
        }

        const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath);
        logo_url = urlData.publicUrl;
    }
    
    const { data, error } = await supabase
        .from('perfis_empresa')
        .upsert({ ...restOfProfile, user_id: userId, logo_url: logo_url }, { onConflict: 'user_id' })
        .select()
        .single();
        
    if (error) logSupabaseError('salvarPerfilEmpresa (upsert)', error);
    return { data, error };
}

export async function getUserProfile(userId: string) {
    const { data, error } = await supabase.from('usuarios_perfil').select('nome').eq('auth_id', userId).single();
    if (error) logSupabaseError('getUserProfile', error);
    return { data: data as { nome: string } | null, error };
}

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

export async function iniciarCheckoutPagSeguro(tipo: 'mensal' | 'creditos', valor: number, descricao: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Erro: usuário não autenticado para iniciar o checkout.");
        return;
    }
    
    try {
        const { data, error } = await supabase.functions.invoke('iniciar-checkout-pagseguro', {
            body: {
                valor,
                descricao,
                customer: { name: user.user_metadata?.full_name || "Cliente AssinaPro", email: user.email },
                userId: user.id
            }
        });

        if (error) throw error;

        if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
        } else {
            console.error("Resposta da Edge Function sem checkoutUrl:", data);
            alert("Não foi possível iniciar o checkout. Verifique o console da Edge Function para mais detalhes.");
        }
    } catch (error: any) {
        logSupabaseError("iniciarCheckoutPagSeguro (invoke)", error);
        alert("Falha ao se comunicar com o servidor de checkout. Verifique se a Edge Function 'iniciar-checkout-pagseguro' foi implantada (deployed) corretamente no seu projeto Supabase.");
    }
}

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
      contratos(titulo)
    `)
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(5);

  if (error) logSupabaseError('getRecentHistory', error);
  
  if (data) {
    // FIX: Map the 'contratos' property from the join to 'contrato' to match the HistoryItem type.
    const transformedData = data.map((item: any) => {
      const { contratos, ...rest } = item;
      return {
        ...rest,
        contrato: Array.isArray(contratos) ? contratos[0] || null : contratos,
      };
    });
    return { data: transformedData, error };
  }
  
  return { data, error };
}

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

export async function getNotifications(userId: string): Promise<{ data: HistoryItem[] | null; error: any }> {
    const { data, error } = await supabase
    .from('historico')
    .select(`
      id,
      acao,
      valor,
      data,
      contratos(titulo)
    `)
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(10);

  if (error) logSupabaseError('getNotifications', error);

  if (data) {
    // FIX: Map the 'contratos' property from the join to 'contrato' to match the HistoryItem type.
    const transformedData = data.map((item: any) => {
        const { contratos, ...rest } = item;
        return {
          ...rest,
          contrato: Array.isArray(contratos) ? contratos[0] || null : contratos,
        };
      });
    return { data: transformedData, error };
  }

  return { data, error };
}
