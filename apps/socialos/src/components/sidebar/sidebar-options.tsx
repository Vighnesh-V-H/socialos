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
          <SidebarGroupLabel className='text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3 px-3'>
            {section.title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-1'>
              {section.items.map((item, index) => (
                <Link href={item.url} key={index}>
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        "h-11 px-4 rounded-lg transition-all duration-200 group relative",
                        "hover:bg-indigo-100 hover:text-indigo-900 dark:hover:bg-indigo-800/10 dark:hover:text-indigo-100",
                        "data-[active=true]:bg-indigo-600 data-[active=true]:text-white dark:data-[active=true]:bg-sky-700 dark:data-[active=true]:text-white",
                        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                      )}
                      isActive={item.url === pathname}>
                      <div>
                        <item.icon className='h-5 w-5 shrink-0' />
                        <span className='group-data-[collapsible=icon]:hidden font-medium'>
                          {item.title}
                        </span>
                        {item.badge && (
                          <SidebarMenuBadge className='ml-auto bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 font-semibold px-2 py-0.5 rounded-full text-xs'>
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
