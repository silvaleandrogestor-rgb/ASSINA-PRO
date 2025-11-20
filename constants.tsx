
import React from 'react';
import { LayoutDashboard, FileText, FileSignature, Sigma, ImageIcon, Mic, Settings, Home } from 'lucide-react';

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/contratos', label: 'Contratos', icon: <FileText size={20} /> },
  { href: '/orcamentos', label: 'Orçamentos', icon: <FileSignature size={20} /> },
  { href: '/editor-imagem', label: 'Editor de Imagem', icon: <ImageIcon size={20} /> },
  { href: '/transcricao', label: 'Transcrição Rápida', icon: <Mic size={20} /> },
  { href: '/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
];

export const EXTRA_LINKS = [
    { href: '/', label: 'Ver Site', icon: <Home size={20} /> },
]

export const DISCOVERY_OPTIONS = [
    "Google", "Instagram", "Indicação", "YouTube", "Outro"
];