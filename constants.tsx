import React from 'react';
import { LayoutDashboard, FileText, FileSignature, PenSquare, Settings, Home } from 'lucide-react';

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/contratos', label: 'Contratos', icon: <FileText size={20} /> },
  { href: '/orcamentos', label: 'Orçamentos', icon: <FileSignature size={20} /> },
  { href: '/assinaturas', label: 'Assinaturas', icon: <PenSquare size={20} /> },
  { href: '/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  { href: '/', label: 'Ver Site', icon: <Home size={20} />, isExternal: true },
];

export const DISCOVERY_OPTIONS = [
    "Google", "Instagram", "Indicação", "YouTube", "Outro"
];
