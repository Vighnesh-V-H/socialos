"use client";

import { cn } from "@/lib/utils";
import { sidebarConfig } from "@/lib/config/sidebar";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarOptions() {
  const pathname = usePathname();

  return (
    <>
      {sidebarConfig.map((section, index) => (
        <SidebarGroup
          key={section.title}
          className={cn("space-y-2", index > 0 && "mt-8")}>
          <SidebarGroupLabel className='text-base font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-3 px-3'>
            {section.title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item, index) => (
                <Link href={item.url} key={index}>
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "h-12 -mt-1  px-4 rounded-4xl  transition-all duration-200 group relative",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "data-[active=true]:bg-[radial-gradient(circle_at_center_60%,#2222228f,#41414177)] data-[active=true]:text-sidebar-primary-foreground ",
                        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                      )}
                      isActive={item.url === pathname}>
                      <div>
                        <item.icon className='h-5 w-5 shrink-0' />
                        <span className='group-data-[collapsible=icon]:hidden text-base font-medium'>
                          {item.title}
                        </span>
                        {item.badge && (
                          <SidebarMenuBadge className='ml-auto bg-sidebar-accent text-sidebar-foreground font-semibold px-2 py-0.5 rounded-full text-xs'>
                            {item.badge}
                          </SidebarMenuBadge>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
