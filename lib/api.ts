// lib/api.ts
// ============================================================================
// API central da aplicação AssinaPro
// - Autenticação
// - Perfil de usuário
// - Perfil de empresa
// - Carteira de créditos & assinaturas
// - Contratos
// - Orçamentos
// - Histórico & notificações
// - Integração com PagSeguro (cartão + Pix pelo checkout deles)
// ============================================================================

import { supabase } from './supabase';
import {
  Contract,
  CompanyProfile,
  Quote,
  HistoryItem,
  CreditWallet,
  Subscription,
  User,
} from '../types';

// ============================================================================
// Helper de log de erro
// ============================================================================

function logSupabaseError(context: string, error: any) {
  if (!error) return;
  // Evita travar SSR
  try {
    console.error(`--- Supabase Error in ${context} ---`);
    console.error(JSON.stringify(error, null, 2));
    console.error('------------------------------------');
  } catch {
    console.error(`--- Supabase Error in ${context} (raw) ---`, error);
  }
}

// ============================================================================
// AUTENTICAÇÃO & PERFIL DE USUÁRIO
// ============================================================================

/**
 * Registra usuário no Supabase Auth e cria:
 * - perfil em usuarios_perfil
 * - carteira de créditos inicial
 */
export async function registerUser(userData: { [key: string]: string }) {
  const { email, password, nome, ...profileData } = userData;

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nome,
      },
    },
  });

  if (authError) {
    logSupabaseError('registerUser(signUp)', authError);
    return { user: null, session: null, error: authError };
  }

  if (!authData.user) {
    return { user: null, session: null, error: { message: 'Usuário não retornado' } };
  }

  // Cria perfil
  const { error: profileError } = await salvarPerfilUsuario(authData.user.id, {
    email,
    nome,
    ...profileData,
  });

  if (profileError) {
    logSupabaseError('registerUser(salvarPerfilUsuario)', profileError);
  } else {
    // Cria carteira de créditos inicial
    await criarCarteiraInicial(authData.user.id);
  }

  return { user: authData.user, session: authData.session, error: authError || profileError };
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) logSupabaseError('loginUser', error);
  return { data, error };
}

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) logSupabaseError('loginWithGoogle', error);
  return { data, error };
}

/**
 * Cria/atualiza perfil do usuário em usuarios_perfil
 */
export async function salvarPerfilUsuario(
  userId: string,
  profileData: { [key: string]: any },
) {
  // tira campos de confirmação
  const { confirmEmail, confirmPassword, ...dataToSave } = profileData;

  const { data, error } = await supabase
    .from('usuarios_perfil')
    .upsert(
      [
        {
          auth_id: userId,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          ...dataToSave,
        },
      ],
      { onConflict: 'auth_id' },
    )
    .select()
    .single();

  if (error) logSupabaseError('salvarPerfilUsuario', error);
  return { data, error };
}

export async function checkUserProfileExists(userId: string) {
  const { error, count } = await supabase
    .from('usuarios_perfil')
    .select('id', { count: 'exact', head: true })
    .eq('auth_id', userId);

  if (error) {
    logSupabaseError('checkUserProfileExists', error);
    return false;
  }

  return (count ?? 0) > 0;
}

export async function atualizarUltimoAcesso(userId: string) {
  const { data, error } = await supabase
    .from('usuarios_perfil')
    .update({
      ultimo_acesso: new Date().toISOString(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
    .eq('auth_id', userId);

  if (error) logSupabaseError('atualizarUltimoAcesso', error);
  return { data, error };
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('usuarios_perfil')
    .select('nome')
    .eq('auth_id', userId)
    .single();

  if (error) logSupabaseError('getUserProfile', error);
  return { data: (data as { nome: string } | null) ?? null, error };
}

// ============================================================================
// PERFIL DA EMPRESA
// ============================================================================

export async function getPerfilEmpresa(userId: string) {
  const { data, error } = await supabase
    .from('perfis_empresa')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logSupabaseError('getPerfilEmpresa', error);
  }

  return {
    data: (data as CompanyProfile | null) ?? null,
    error: error?.code === 'PGRST116' ? null : error,
  };
}

export async function salvarPerfilEmpresa(
  userId: string,
  profileData: Partial<CompanyProfile> & { logoFile?: File | null },
) {
  const { logoFile, ...rest } = profileData;
  let logo_url = rest.logo_url;

  // Upload da logo se enviada
  if (logoFile) {
    const filePath = `public/${userId}-${Date.now()}-${logoFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, logoFile, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      logSupabaseError('salvarPerfilEmpresa(upload-logo)', uploadError);
      return { data: null, error: uploadError };
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath);
    logo_url = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('perfis_empresa')
    .upsert(
      [
        {
          ...rest,
          user_id: userId,
          logo_url,
        },
      ],
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) logSupabaseError('salvarPerfilEmpresa(upsert)', error);
  return { data, error };
}

// ============================================================================
// CARTEIRA, ASSINATURA, PERMISSÕES
// ============================================================================

export async function criarCarteiraInicial(userId: string) {
  const { data, error } = await supabase
    .from('carteira_creditos')
    .insert([
      {
        user_id: userId,
        creditos: 0,
        trial_ativo: true,
        trial_usado: false,
      },
    ]);

  if (error) logSupabaseError('criarCarteiraInicial', error);
  return { data, error };
}

export async function getCreditWallet(userId: string) {
  const { data, error } = await supabase
    .from('carteira_creditos')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logSupabaseError('getCreditWallet', error);
  }

  return {
    data: (data as CreditWallet | null) ?? null,
    error: error?.code === 'PGRST116' ? null : error,
  };
}

export async function getAssinaturaAtiva(userId: string) {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ativo')
    .maybeSingle();

  if (error) logSupabaseError('getAssinaturaAtiva', error);
  return { data: (data as Subscription | null) ?? null, error };
}

/**
 * Verifica se o usuário pode usar uma funcionalidade:
 * - 'criar_contrato'
 * - 'assinatura'
 * - 'orcamento'
 *
 * Retorna:
 * - permitido: boolean
 * - modo: 'plano_mensal' | 'credito' | 'trial'
 * - motivo: 'upgrade' | mensagem de erro
 */
export async function verificarPermissao(
  userId: string,
  acao: 'criar_contrato' | 'assinatura' | 'orcamento',
): Promise<{
  permitido: boolean;
  motivo?: string;
  modo?: 'plano_mensal' | 'credito' | 'trial';
}> {
  // 1. Tenta assinatura ativa
  const { data: subscription } = await getAssinaturaAtiva(userId);
  if (subscription) {
    return { permitido: true, modo: 'plano_mensal' };
  }

  // 2. Carteira de créditos
  const { data: wallet } = await getCreditWallet(userId);
  if (!wallet) {
    return {
      permitido: false,
      motivo: 'Não foi possível verificar sua carteira de créditos.',
    };
  }

  if (wallet.credits > 0 || wallet.creditos > 0) {
    // compatibilidade se o tipo tiver os dois nomes
    const creditos = (wallet as any).creditos ?? (wallet as any).credits ?? 0;
    if (creditos > 0) return { permitido: true, modo: 'credito' };
  }

  // 3. Trial
  if (wallet.trial_ativo && !wallet.trial_usado) {
    if (acao === 'criar_contrato' || acao === 'assinatura' || acao === 'orcamento') {
      return { permitido: true, modo: 'trial' };
    }
  }

  return { permitido: false, motivo: 'upgrade' };
}

export async function gastarCredito(
  userId: string,
  quantidade: number,
  descricao: string,
) {
  const { data: wallet } = await getCreditWallet(userId);
  const creditosAtuais = (wallet as any)?.creditos ?? 0;

  if (!wallet || creditosAtuais < quantidade) {
    return { data: null, error: { message: 'Créditos insuficientes.' } };
  }

  const { data, error } = await supabase
    .from('carteira_creditos')
    .update({ creditos: creditosAtuais - quantidade })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) logSupabaseError('gastarCredito', error);
  else await registrarCreditoLog(userId, 'debito', quantidade, descricao);

  return { data, error };
}

export async function usarTrial(userId: string) {
  const { data, error } = await supabase
    .from('carteira_creditos')
    .update({ trial_ativo: false, trial_usado: true })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) logSupabaseError('usarTrial', error);
  else
    await registrarHistorico(
      userId,
      null,
      'trial_encerrado',
      'Primeiro recurso do trial foi utilizado.',
    );

  return { data, error };
}

// ============================================================================
// INTEGRAÇÃO PAGSEGURO (checkout redireciona para cartão / Pix)
// ============================================================================

/**
 * Chama a Edge Function `iniciar-checkout-pagseguro`
 * que deve devolver:
 * { checkoutUrl: string }
 */
export async function iniciarCheckoutPagSeguro(
  tipo: 'mensal' | 'creditos',
  valor: number,
  descricao: string,
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    alert('Erro: usuário não autenticado para iniciar o checkout.');
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      'iniciar-checkout-pagseguro',
      {
        body: {
          tipo,
          valor,
          descricao,
          customer: {
            name: (user.user_metadata as any)?.full_name || 'Cliente AssinaPro',
            email: user.email,
          },
          userId: user.id,
        },
      },
    );

    if (error) {
      console.error('Erro retornado pela Edge Function:', error);
      alert('Não foi possível iniciar o checkout. Verifique a Edge Function.');
      return;
    }

    if (!data || !data.checkoutUrl) {
      console.error('Resposta inesperada da Edge Function:', data);
      alert('Erro: a Edge Function não retornou uma checkoutUrl válida.');
      return;
    }

    // Redireciona para o checkout do PagSeguro (cartão / pix / outros)
    window.location.href = data.checkoutUrl;
  } catch (err) {
    console.error('Erro ao chamar iniciarCheckoutPagSeguro:', err);
    alert('Falha ao enviar requisição ao servidor do checkout.');
  }
}

// ============================================================================
// HISTÓRICO & LOGS
// ============================================================================

export async function registrarHistorico(
  userId: string | null,
  contractId: string | null,
  action: string,
  value: string | null,
) {
  const { data, error } = await supabase
    .from('historico')
    .insert([
      {
        user_id: userId,
        contrato_id: contractId,
        acao: action,
        valor: value,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      },
    ]);

  if (error) logSupabaseError('registrarHistorico', error);
  return { data, error };
}

async function registrarCreditoLog(
  userId: string,
  type: 'credito' | 'debito',
  quantity: number,
  description: string,
) {
  const { data, error } = await supabase
    .from('creditos_log')
    .insert([
      {
        user_id: userId,
        tipo: type,
        quantidade: quantity,
        descricao: description,
      },
    ]);

  if (error) logSupabaseError('registrarCreditoLog', error);
  return { data, error };
}

export async function getRecentHistory(
  userId: string,
): Promise<{ data: HistoryItem[] | null; error: any }> {
  const { data, error } = await supabase
    .from('historico')
    .select(
      `
      id,
      acao,
      valor,
      data,
      contrato:contratos(titulo)
    `,
    )
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(5);

  if (error) {
    logSupabaseError('getRecentHistory', error);
    return { data: null, error };
  }

  // Supabase pode retornar contrato como array, padroniza p/ objeto ou null
  const transformed =
    data?.map((item: any) => ({
      ...item,
      contrato: Array.isArray(item.contrato) ? item.contrato[0] || null : item.contrato,
    })) ?? null;

  return { data: transformed as HistoryItem[] | null, error };
}

/**
 * Notificações = histórico mais recente (pode personalizar pela ação)
 */
export async function getNotifications(
  userId: string,
): Promise<{ data: HistoryItem[] | null; error: any }> {
  const { data, error } = await supabase
    .from('historico')
    .select(
      `
      id,
      acao,
      valor,
      data,
      contrato:contratos(titulo)
    `,
    )
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(10);

  if (error) {
    logSupabaseError('getNotifications', error);
    return { data: null, error };
  }

  const transformed =
    data?.map((item: any) => ({
      ...item,
      contrato: Array.isArray(item.contrato) ? item.contrato[0] || null : item.contrato,
    })) ?? null;

  return { data: transformed as HistoryItem[] | null, error };
}

// ============================================================================
// ORÇAMENTOS (Quotes)
// ============================================================================

export async function criarOrcamento(userId: string, quoteData: Partial<Quote>) {
  const { nome_cliente, produto_servico, detalhes, valor } = quoteData;

  const { data, error } = await supabase
    .from('orcamentos')
    .insert([
      {
        user_id: userId,
        nome_cliente,
        produto_servico,
        detalhes,
        valor,
        status: 'sent',
      },
    ])
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
  return { data: (data as Quote[] | null) ?? null, error };
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

// ============================================================================
// CONTRATOS
// ============================================================================

export async function criarContrato(
  userId: string,
  title: string,
  text: string,
) {
  const { data, error } = await supabase
    .from('contratos')
    .insert([
      {
        user_id: userId,
        titulo: title,
        texto: text,
        status: 'draft',
      },
    ])
    .select()
    .single();

  if (error) logSupabaseError('criarContrato', error);
  return { data, error };
}

export async function listarContratos(userId: string) {
  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .eq('user_id', userId)
    .order('criado_em', { ascending: false });

  if (error) logSupabaseError('listarContratos', error);
  return { data: (data as Contract[] | null) ?? null, error };
}

export async function getContratoById(contractId: string) {
  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .eq('id', contractId)
    .single();

  if (error) logSupabaseError('getContratoById', error);
  return { data: (data as Contract | null) ?? null, error };
}

export async function salvarAssinatura(contractId: string, signature: string) {
  const { data, error } = await supabase
    .from('contratos')
    .update({
      assinatura_cliente: signature,
      status: 'signed',
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', contractId)
    .select()
    .single();

  if (error) logSupabaseError('salvarAssinatura', error);
  return { data, error };
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
