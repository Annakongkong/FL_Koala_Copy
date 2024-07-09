import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import {
  ArrowRight as ArrowRightIcon,
  BookOpenText,
  ClockCounterClockwise as HistoryIcon,
  House as HouseIcon,
  List as ListIcon,
} from '@phosphor-icons/react/dist/ssr';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';





export const navIcons: Record<string, Icon> = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'user-icon-path': UsersIcon,
  'overview-icon-path': HouseIcon,
  'script-icon-path': ListIcon,
  'account-icon-path': UserIcon,
  'arrow-right': ArrowRightIcon,
  'execution-history': HistoryIcon,
  doc: BookOpenText,
  user: UserIcon,
  users: UsersIcon,
};
