"use client";

import type * as React from "react";
import {
  ChevronLeft,
  DraftingCompassIcon,
  StretchHorizontal,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarOptions } from "@/components/sidebar/sidebar-options";
import { TooltipGlobal } from "@/components/tooltip-global";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "../theme-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar, setOpen, open } = useSidebar();

  function handleSidebarClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (!open) {
      setOpen(true);
    }
  }

  return (
    <Sidebar
      collapsible='icon'
      variant='sidebar'
      onClick={handleSidebarClick}
      className={`${
        !open ? "cursor-e-resize" : ""
      } border-r-8 border-r-[#b5b2b2e4] bg-background/95 dark:bg-[#161616] backdrop-blur-sm m-1  overflow-hidden`}
      {...props}>
      <SidebarHeader>
        <div className='flex items-center'>
          <div className='flex items-center dark:bg-[#111010] p-2 rounded-3xl  w-full  gap-1'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl  shadow-lg text-sidebar-primary-foreground'>
              <StretchHorizontal size={24} />
            </div>
            <span className='font-bold text-xl group-data-[collapsible=icon]:hidden text-foreground'>
              SocialOS
            </span>
          </div>
          <TooltipGlobal content='Toggle sidebar'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleSidebar}
              className={cn(
                "h-8 w-8 rounded-lg transition-transform duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                open ? "" : "rotate-180",
              )}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
          </TooltipGlobal>
        </div>
      </SidebarHeader>
      <hr className='border-0 h-1 bg-white/10 my-4 w-full' />
      <SidebarContent>
        <SidebarOptions />
      </SidebarContent>

      <SidebarFooter className='md:hidden block'>
        <div className='flex flex-col gap-5 mr-4'>
          <ThemeToggle />
          <NavUser />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
