import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppSidebar } from '@/components/app-sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <TooltipProvider delay={0}>
      <SidebarProvider defaultOpen className="min-w-0 overflow-x-hidden">
        <AppSidebar user={user} />
        <SidebarInset className="min-w-0 overflow-x-hidden">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">Content operations</span>
            <div className="ml-auto flex items-center gap-2">
              <ModeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
              >
                Sign out
              </Button>
            </div>
          </header>
          <div className="flex min-w-0 max-w-full flex-1 flex-col gap-6 overflow-x-hidden p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
