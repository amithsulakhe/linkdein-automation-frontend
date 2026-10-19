import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Library,
  PenLine,
  Settings,
  Sparkles,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true, tone: 'bg-sky-500/15 text-sky-500' },
  { to: '/analytics', label: 'Post Analytics', icon: BarChart3, tone: 'bg-violet-500/15 text-violet-500' },
  { to: '/calendar', label: 'Content Calendar', icon: CalendarDays, tone: 'bg-amber-500/15 text-amber-500' },
  { to: '/compose', label: 'Create Post', icon: PenLine, tone: 'bg-emerald-500/15 text-emerald-500' },
  { to: '/generator', label: 'AI Generator', icon: Sparkles, tone: 'bg-fuchsia-500/15 text-fuchsia-500' },
  { to: '/approval-queue', label: 'Approval Queue', icon: CheckSquare, tone: 'bg-teal-500/15 text-teal-500' },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: Library, tone: 'bg-orange-500/15 text-orange-500' },
  { to: '/chatbot', label: 'AI Chatbot', icon: Bot, tone: 'bg-indigo-500/15 text-indigo-500' },
  { to: '/settings', label: 'Settings', icon: Settings, tone: 'bg-rose-500/15 text-rose-500' },
];

function isNavActive(pathname, item) {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function AppSidebar({ user }) {
  const location = useLocation();
  const initials =
    user?.displayName
      ?.split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="LinkedIn AI Agent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
                <span className="text-xs font-bold">in</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">LinkedIn AI Agent</span>
                <span className="truncate text-xs text-muted-foreground">Content studio</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={isNavActive(location.pathname, item)}
                    render={<NavLink to={item.to} end={item.end} />}
                  >
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-md ${item.tone}`}>
                      <item.icon className="size-3.5" />
                    </span>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={user?.displayName || 'Account'}>
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
