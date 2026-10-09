import {
  BedDouble,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Receipt,
  Settings,
  UserCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  /** Absolute path, also used as the route path. */
  path: string;
  icon: LucideIcon;
  /** Shown on the module's placeholder page until the module is built. */
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Single source of truth for the sidebar and the router. Role-based filtering
// is added with authentication.
export const navigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        description: 'Occupancy, fees and daily activity at a glance.',
      },
    ],
  },
  {
    label: 'Hostel',
    items: [
      {
        title: 'Hostels',
        path: '/hostels',
        icon: Building2,
        description: 'Hostels, buildings and floors in your organization.',
      },
      {
        title: 'Rooms & Beds',
        path: '/rooms',
        icon: BedDouble,
        description: 'Rooms, beds and who occupies them.',
      },
      {
        title: 'Students',
        path: '/students',
        icon: GraduationCap,
        description: 'Student profiles, guardians and documents.',
      },
      {
        title: 'Admissions',
        path: '/admissions',
        icon: ClipboardList,
        description: 'Admission workflow, bed allocation and check-in.',
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        title: 'Billing',
        path: '/billing',
        icon: Receipt,
        description: 'Fee structures, invoices and outstanding dues.',
      },
      {
        title: 'Payments',
        path: '/payments',
        icon: CreditCard,
        description: 'Payments, receipts and refunds.',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        title: 'Complaints',
        path: '/complaints',
        icon: Wrench,
        description: 'Complaint tickets and their resolution.',
      },
      {
        title: 'Leave',
        path: '/leave',
        icon: CalendarDays,
        description: 'Leave requests and approvals.',
      },
      {
        title: 'Outpass',
        path: '/outpass',
        icon: DoorOpen,
        description: 'Outpass requests, departures and returns.',
      },
      {
        title: 'Visitors',
        path: '/visitors',
        icon: UserCheck,
        description: 'Visitor requests, entry and exit.',
      },
      {
        title: 'Notices',
        path: '/notices',
        icon: Megaphone,
        description: 'Announcements for students and staff.',
      },
    ],
  },
];

export const footerNavigation: NavItem[] = [
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Organization and account settings.',
  },
];

export const allNavItems: NavItem[] = [
  ...navigation.flatMap((group) => group.items),
  ...footerNavigation,
];

/** Whether a nav item should be highlighted for the current URL. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.path === '/') return pathname === '/';
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
