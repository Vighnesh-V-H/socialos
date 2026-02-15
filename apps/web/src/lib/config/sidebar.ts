import {
  LayoutDashboard,
  FileText,
  LucideIcon,
  File,
  TextSelect,
  CheckSquare2,
  Settings,
  DraftingCompassIcon,
  CropIcon,
  ProjectorIcon,
  Calendar1Icon,
  LayoutDashboardIcon,
  Contact2,
  Link,
} from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const sidebarConfig: SidebarSection[] = [
  {
    title: "MENU",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Scheduler",
        url: "/schedule",
        icon: Calendar1Icon,
      },
      {
        title: "Leads",
        url: "/leads",
        icon: Contact2,
      },
      {
        title: "connections",
        url: "/connections",
        icon: Link,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
  // {
  //   title: "GENERAL",
  //   items: [

  //     {
  //       title: "Help",
  //       url: "/help",
  //       icon: HelpCircle,
  //     },
  //     {
  //       title: "Logout",
  //       url: "/logout",
  //       icon: LogOut,
  //     },
  //   ],
  // },
];
