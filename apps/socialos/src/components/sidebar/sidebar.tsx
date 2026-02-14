"use client";

import type * as React from "react";
import { ChevronLeft, DraftingCompassIcon, Target } from "lucide-react";
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
      variant='floating'
      onClick={handleSidebarClick}
      className={`${
        !open ? "cursor-e-resize" : ""
      } border border-border/40 dark:border-border/20 bg-background/95 dark:bg-background/90 backdrop-blur-sm rounded-2xl shadow-lg m-1  overflow-hidden`}
      {...props}>
      <SidebarHeader className=' pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center  gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 shadow-lg dark:shadow-indigo-500/20'>
              <DraftingCompassIcon size={20} />
            </div>
            <span className='font-bold text-xl group-data-[collapsible=icon]:hidden bg-gradient-to-r from-indigo-600 to-sky-500 dark:from-indigo-400 dark:to-violet-300 bg-clip-text text-transparent'>
              SocialOS
            </span>
          </div>
          <TooltipGlobal content='Toggle sidebar'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleSidebar}
              className={cn(
                "h-8 w-8 rounded-lg transition-transform duration-300 hover:bg-accent/50",
                open ? "" : "rotate-180",
              )}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
          </TooltipGlobal>
        </div>
      </SidebarHeader>

      <SidebarContent className='py-2 space-y-2'>
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
