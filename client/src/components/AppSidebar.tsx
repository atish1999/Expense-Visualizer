import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, LogOut, WalletCards, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { setOpenMobile } = useSidebar();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expenses", label: "Transactions", icon: Receipt },
    { href: "/insights", label: "Insights", icon: BarChart3 },
  ];

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-300 flex items-center justify-center shadow-lg shadow-primary/20">
            <WalletCards className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight">FinTrack</h1>
            <p className="text-xs text-muted-foreground">Personal Finance</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href;
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`link-${link.label.toLowerCase()}`}
                    >
                      <Link href={link.href} onClick={handleLinkClick}>
                        <Icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 px-1">Currency</p>
          <Select 
            value={currency.code} 
            onValueChange={(value) => setCurrency(value as CurrencyCode)}
          >
            <SelectTrigger 
              className="w-full" 
              data-testid="select-currency"
            >
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CURRENCIES).map((curr) => (
                <SelectItem 
                  key={curr.code} 
                  value={curr.code}
                  data-testid={`currency-option-${curr.code}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono">{curr.symbol}</span>
                    <span>{curr.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium" data-testid="text-username">{user?.firstName || "User"}</p>
          <p className="text-xs text-muted-foreground truncate" data-testid="text-email">{user?.email}</p>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-colors"
          onClick={() => logout()}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
