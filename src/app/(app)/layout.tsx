
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/icons/logo";
import { MessageSquare, ImageIcon, FileText, Settings, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/chat", label: "Talk with Wiz!", icon: MessageSquare },
  { href: "/image-analysis", label: "Image Analysis", icon: ImageIcon },
  { href: "/summarization", label: "Summarization", icon: FileText },
];

// Helper component to render the correct title based on context
const AppTitleRenderer = () => {
  const { isMobile } = useSidebar();

  if (isMobile) {
    // On mobile, always show "Wiz" inside SheetTitle for accessibility
    return (
      <SheetTitle>
        <span className="font-headline font-bold text-2xl text-sidebar-primary">
          Wiz
        </span>
      </SheetTitle>
    );
  }
  // On desktop, use the Logo component which handles collapsed/expanded states
  return <Logo />;
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={true} open={true}>
      <Sidebar variant="sidebar" collapsible="icon" side="left" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <AppTitleRenderer />
        </SidebarHeader>
        <Separator className="bg-sidebar-border" />
        <SidebarContent className="flex-grow p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: "right", align: "center" }}
                  className="justify-start"
                >
                  <Link href={item.href}>
                    <span className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <Separator className="bg-sidebar-border" />
        <SidebarFooter className="p-4">
          {/* Placeholder for settings or logout */}
          {/* <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button> */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl font-headline">
            {navItems.find(item => pathname.startsWith(item.href))?.label || "Wiz"}
          </h1>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
