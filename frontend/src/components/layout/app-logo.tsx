import { Link } from 'react-router';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

/** Brand mark at the top of the sidebar. Collapses to the icon alone. */
export function AppLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="lg" tooltip="Nivora">
          <Link to="/">
            <span
              aria-hidden
              className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            >
              N
            </span>
            <span className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold">Nivora</span>
              <span className="truncate text-xs text-muted-foreground">Hostel management</span>
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
