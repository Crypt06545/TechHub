import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Users, Package,
  BarChart3, Settings, HelpCircle, Bell, Moon,
  Sun, ChevronDown, LogOut, User, ChevronRight,
  Database, FileText, Zap,
  Tags,
  TicketPercent,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
  SidebarProvider, SidebarTrigger, SidebarInset, SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ── nav ── */
const NAV_MAIN = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Orders", to: "/dashboard/orders", icon: ShoppingBag, badge: "12" },
  { title: "Products", to: "/dashboard/products", icon: Package },
  { title: "Categories", to: "/dashboard/categories", icon: Tags },
  { title: "Coupons", to: "/dashboard/coupons", icon: TicketPercent },
  { title: "Customers", to: "/dashboard/customers", icon: Users },
  { title: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
];

const NAV_RESOURCES = [
  {
    title: "Inventory", icon: Database,
    children: [
      { title: "Stock Levels", to: "/dashboard/inventory/stock" },
      { title: "Suppliers",    to: "/dashboard/inventory/suppliers" },
    ],
  },
  {
    title: "Reports", icon: FileText,
    children: [
      { title: "Sales Report", to: "/dashboard/reports/sales" },
      { title: "Export Data",  to: "/dashboard/reports/export" },
    ],
  },
  { title: "Automation", to: "/dashboard/automation", icon: Zap },
];

const NAV_SECONDARY = [
  { title: "Settings", to: "/dashboard/settings", icon: Settings },
  { title: "Help",     to: "/dashboard/help",     icon: HelpCircle },
];

/* ── NavItem ── */
const NavItem = ({ item }) => {
  const { pathname } = useLocation();
  const isActive = item.to === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(item.to);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <NavLink to={item.to}>
          <item.icon />
          <span>{item.title}</span>
          {item.badge && (
            <Badge className="ml-auto h-4 px-1.5 text-[10px] border-0 bg-sidebar-primary text-sidebar-primary-foreground">
              {item.badge}
            </Badge>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

/* ── NavCollapsible ── */
const NavCollapsible = ({ item }) => {
  const { pathname } = useLocation();
  const isChildActive = item.children?.some((c) => pathname.startsWith(c.to));
  const [open, setOpen] = useState(!!isChildActive);

  if (!item.children) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith(item.to)} tooltip={item.title}>
          <NavLink to={item.to}><item.icon /><span>{item.title}</span></NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isChildActive}>
            <item.icon />
            <span>{item.title}</span>
            <ChevronRight size={14} className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton asChild isActive={pathname === child.to}>
                  <NavLink to={child.to}>{child.title}</NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

/* ── AppSidebar ── */
const AppSidebar = () => (
  <Sidebar collapsible="icon" variant="inset">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="/dashboard">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                T
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">TechHub</span>
                <span className="truncate text-xs text-sidebar-foreground/60">Admin Panel</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {NAV_MAIN.map((item) => <NavItem key={item.title} item={item} />)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel>Resources</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {NAV_RESOURCES.map((item) => <NavCollapsible key={item.title} item={item} />)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            {NAV_SECONDARY.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} size="sm">
                  <NavLink to={item.to}><item.icon /><span>{item.title}</span></NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs font-bold bg-sidebar-primary text-sidebar-primary-foreground">
                    MH
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Mehadi Hasan</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">admin@techhub.com</span>
                </div>
                <ChevronDown size={14} className="ml-auto shrink-0 text-sidebar-foreground/60" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-52">
              <DropdownMenuItem className="gap-2 text-sm">
                <User size={13} /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm">
                <Settings size={13} /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive">
                <LogOut size={13} /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
);

/* ── SiteHeader ── */
const SiteHeader = ({ dark, setDark }) => (
  <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 lg:px-6">
    <SidebarTrigger className="text-muted-foreground hover:text-foreground -ml-1" />
    <Separator orientation="vertical" className="mx-1 h-4" />

    {/* Page title slot — children pages can override via context if needed */}
    <span className="text-sm font-medium text-foreground">Dashboard</span>

    <div className="ml-auto flex items-center gap-1">
      {/* Dark mode toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Toggle dark mode"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      <button
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label="Notifications"
      >
        <Bell size={16} />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
      </button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="ml-1 flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            <Avatar className="size-7 rounded-lg">
              <AvatarFallback className="rounded-lg text-[10px] font-bold bg-primary text-primary-foreground">
                MH
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block">Mehadi</span>
            <ChevronDown size={13} className="text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="gap-2 text-sm">
            <User size={13} /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm">
            <Settings size={13} /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive">
            <LogOut size={13} /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
);

/* ── DashLayout ── */
const DashLayout = () => {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  // Apply dark class directly to <html> — the only reliable way with shadcn
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "15rem",
        "--header-height": "3.5rem",
      }}
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader dark={dark} setDark={setDark} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashLayout;
