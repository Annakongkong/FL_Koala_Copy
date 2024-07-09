import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';





export const navAdminItems: NavItemConfig[] = [
  { key: 'user', title: 'User Management', href: paths.dashboard.customers, icon: 'user-icon-path' },
];

export const navItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'overview-icon-path' },
  { key: 'script', title: 'Script List', href: paths.dashboard.scripts, icon: 'script-icon-path' },
  { key: 'executionList', title: 'Execution List', href: paths.dashboard.execution, icon: 'execution-history' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'account-icon-path' },
  { key: 'guide', title: 'Script Guide', href: paths.dashboard.guide, icon: 'doc' },
];
