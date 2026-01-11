import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, LogOut, WalletCards } from "lucide-react";
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

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expenses", label: "Transactions", icon: Receipt },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col fixed left-0 top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-300 flex items-center justify-center shadow-lg shadow-primary/20">
          <WalletCards className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight">FinTrack</h1>
          <p className="text-xs text-muted-foreground">Personal Finance</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                  ${isActive 
                    ? "bg-primary/10 text-primary font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
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
          <p className="text-sm font-medium">{user?.firstName || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
      </div>
    </div>
  );
}
