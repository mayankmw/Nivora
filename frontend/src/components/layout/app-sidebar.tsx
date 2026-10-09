import { Link, useLocation } from 'react-router';
import { footerNavigation, isNavItemActive, navigation, type NavItem } from '@/app/navigation';
import { AppLogo } from '@/components/layout/app-logo';
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
  useSidebar,
} from '@/components/ui/sidebar';

function NavMenu({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton
            asChild
            isActive={isNavItemActive(item, pathname)}
            tooltip={item.title}
          >
            {/* On mobile the sidebar is a drawer, so close it after navigating. */}
            <Link to={item.path} onClick={() => setOpenMobile(false)}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMenu items={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavMenu items={footerNavigation} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
