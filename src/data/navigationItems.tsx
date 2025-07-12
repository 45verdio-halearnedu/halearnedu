import React from 'react';
import { 
  Home, 
  Search, 
  FileText, 
  TrendingUp, 
  BarChart3, 
  Coins, 
  Wallet, 
  GraduationCap,
  CreditCard,
  Target,
  QrCode,
  Smartphone,
  AlertTriangle,
  Settings,
  Coins as TokenIcon,
  Users
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const mainNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <Home className="h-5 w-5" />
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    path: '/marketplace',
    icon: <Search className="h-5 w-5" />
  },
  {
    id: "p2p-marketplace",
    label: "P2P Trading",
    path: "/p2p-marketplace",
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: 'my-loans',
    label: 'My Loans',
    path: '/my-loans',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    path: '/portfolio',
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: 'insights',
    label: 'Insights',
    path: '/insights',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    id: 'staking',
    label: 'Staking',
    path: '/staking',
    icon: <Coins className="h-5 w-5" />
  },
  {
    id: 'wallet',
    label: 'Wallet',
    path: '/wallet',
    icon: <Wallet className="h-5 w-5" />
  },
  {
    id: 'community',
    label: 'Community',
    path: '/community',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'education',
    label: 'Education',
    path: '/education',
    icon: <GraduationCap className="h-5 w-5" />
  }
];

export const secondaryNavItems: NavItem[] = [
  {
    id: 'bill-payments',
    label: 'Bill Payments',
    path: '/bill-payments',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: 'savings-goals',
    label: 'Savings Goals',
    path: '/savings-goals',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'qr-payments',
    label: 'QR Payments',
    path: '/qr-payments',
    icon: <QrCode className="h-5 w-5" />
  },
  {
    id: 'mobile-money',
    label: 'Mobile Money',
    path: '/mobile-money',
    icon: <Smartphone className="h-5 w-5" />
  },
  {
    id: 'disputes',
    label: 'Disputes',
    path: '/disputes',
    icon: <AlertTriangle className="h-5 w-5" />
  },
  {
    id: 'token-management',
    label: 'Token Management',
    path: '/token-management',
    icon: <TokenIcon className="h-5 w-5" />
  }
];

export const settingsNavItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />
  }
];
