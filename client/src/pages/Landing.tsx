import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Target, 
  Users, 
  CheckCircle2,
  Wallet,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Wallet className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight" data-testid="text-logo">FinTrack</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">Features</a>
              <a href="#design" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-interfaces">Interfaces</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-pricing">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild data-testid="button-login">
                <a href="/api/login">Log In</a>
              </Button>
              <Button size={isMobile ? "sm" : "default"} asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-md">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              <a 
                href="#features" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2" 
                data-testid="link-features-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#design" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2" 
                data-testid="link-interfaces-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Interfaces
              </a>
              <a 
                href="#pricing" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2" 
                data-testid="link-pricing-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="pt-2 space-y-2 border-t border-border/40">
                <Button variant="ghost" className="w-full justify-start" asChild data-testid="button-login-mobile">
                  <a href="/api/login">Log In</a>
                </Button>
                <Button className="w-full" asChild data-testid="button-get-started-mobile">
                  <a href="/api/login">Get Started</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="py-12 md:py-16 lg:py-24 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Left side - Text content */}
              <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium" data-testid="badge-hero">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  The future of financial tracking
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.1]" data-testid="text-hero-title">
                  Master your finances{" "}
                  <span className="text-muted-foreground">without the effort.</span>
                </h1>
                
                <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed" data-testid="text-hero-description">
                  Experience the cleanest, most intuitive way to track spending, manage budgets, and split bills with friends. All in one unified dashboard.
                </p>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-4">
                  <Button size="lg" className="rounded-full w-full sm:w-auto" asChild data-testid="button-start-trial">
                    <a href="/api/login">
                      Start Your Free Trial
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                  <Button size="lg" variant="ghost" className="gap-2 w-full sm:w-auto" data-testid="button-watch-demo">
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4 pt-2 md:pt-4">
                  <div className="flex -space-x-3">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-background">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">JD</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-background">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">SK</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-background">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">MR</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-background">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">AL</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground" data-testid="text-trust-badge">
                    Trusted by <span className="font-semibold text-foreground">12,000+</span> individuals and teams
                  </p>
                </div>
              </div>

              {/* Right side - Dashboard Preview */}
              <div className="relative lg:pl-8 order-first lg:order-last">
                <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-primary/5 p-4 md:p-6 space-y-3 md:space-y-4" data-testid="card-dashboard-preview">
                  {/* Balance cards */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-primary rounded-xl p-3 md:p-4 text-primary-foreground">
                      <p className="text-xs opacity-80 mb-1" data-testid="text-label-balance">Total Balance</p>
                      <p className="text-xl md:text-2xl font-bold font-mono" data-testid="text-preview-balance">$12,450.00</p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 md:p-4">
                      <p className="text-xs text-muted-foreground mb-1" data-testid="text-label-savings">Total Savings</p>
                      <p className="text-xl md:text-2xl font-bold font-mono" data-testid="text-preview-savings">$5,200.00</p>
                    </div>
                  </div>

                  {/* Transaction items */}
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted/50 rounded-lg" data-testid="row-transaction-split">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-foreground" />
                        </div>
                        <span className="text-xs md:text-sm font-medium" data-testid="text-transaction-split">Split Instant</span>
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground" data-testid="text-time-split">Just now</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted/50 rounded-lg" data-testid="row-transaction-savings">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Target className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                        </div>
                        <span className="text-xs md:text-sm font-medium" data-testid="text-transaction-savings">Savings Goal</span>
                      </div>
                      <span className="text-xs md:text-sm font-mono text-primary" data-testid="text-amount-savings">+$1,500.00</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted/50 rounded-lg" data-testid="row-transaction-shopping">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                          <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-destructive" />
                        </div>
                        <span className="text-xs md:text-sm font-medium" data-testid="text-transaction-shopping">Shopping</span>
                      </div>
                      <span className="text-xs md:text-sm font-mono text-destructive" data-testid="text-amount-shopping">-$112.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 lg:py-28 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 md:mb-4" data-testid="text-features-title">
                Powerful features, <span className="text-muted-foreground">unified design.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4" data-testid="text-features-desc">
                We took the best parts of our dashboard and built them directly into the core experience of FinTrack.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {/* Feature 1 - Live Insights */}
              <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm" data-testid="card-feature-insights">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-5">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display mb-2" data-testid="text-feature-insights-title">Live Insights</h3>
                <p className="text-sm text-muted-foreground mb-6" data-testid="text-feature-insights-desc">
                  Get real-time updates on your spending habits with our signature comparison charts.
                </p>
                {/* Mini chart placeholder */}
                <div className="h-20 bg-muted/50 rounded-lg flex items-end justify-around p-3 gap-1">
                  <div className="w-full h-8 bg-primary/30 rounded-sm"></div>
                  <div className="w-full h-12 bg-primary/50 rounded-sm"></div>
                  <div className="w-full h-6 bg-primary/30 rounded-sm"></div>
                  <div className="w-full h-16 bg-primary rounded-sm"></div>
                  <div className="w-full h-10 bg-primary/50 rounded-sm"></div>
                </div>
              </div>

              {/* Feature 2 - Smart Budgets */}
              <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm" data-testid="card-feature-budgets">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground mb-5">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display mb-2" data-testid="text-feature-budgets-title">Smart Budgets</h3>
                <p className="text-sm text-muted-foreground mb-6" data-testid="text-feature-budgets-desc">
                  Stay on track with visual budget bars that update as you spend. Never overspend again.
                </p>
                {/* Mini budget bars */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-primary/70 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[90%] bg-primary/50 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3 - Instant Splits */}
              <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm" data-testid="card-feature-splits">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-secondary-foreground mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display mb-2" data-testid="text-feature-splits-title">Instant Splits</h3>
                <p className="text-sm text-muted-foreground mb-6" data-testid="text-feature-splits-desc">
                  Easily divide expenses with friends with our integrated bill split tool.
                </p>
                {/* Mini split UI */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between" data-testid="row-split-you">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[10px] bg-primary/20">You</AvatarFallback>
                      </Avatar>
                      <span className="text-xs" data-testid="text-split-name-you">You</span>
                    </div>
                    <span className="text-xs font-mono" data-testid="text-split-amount-you">$45.00</span>
                  </div>
                  <div className="flex items-center justify-between" data-testid="row-split-john">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[10px] bg-accent">JD</AvatarFallback>
                      </Avatar>
                      <span className="text-xs" data-testid="text-split-name-john">John</span>
                    </div>
                    <span className="text-xs font-mono" data-testid="text-split-amount-john">$45.00</span>
                  </div>
                  <div className="mt-2">
                    <Button size="sm" className="w-full" data-testid="button-split-now">Split Now</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Design Showcase Section */}
        <section id="design" className="py-12 md:py-20 lg:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              {/* Chart preview */}
              <div className="bg-card rounded-2xl border border-border/50 p-4 md:p-6 shadow-sm order-2 lg:order-1" data-testid="card-chart-preview">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h4 className="text-sm md:text-base font-semibold" data-testid="text-chart-title">Monthly Spending</h4>
                  <span className="text-xs text-muted-foreground" data-testid="text-chart-period">Last 6 months</span>
                </div>
                <div className="h-40 md:h-48 flex items-end justify-around gap-1.5 md:gap-2">
                  <div className="flex flex-col items-center gap-1.5 md:gap-2">
                    <div className="w-6 md:w-8 lg:w-12 bg-primary/20 rounded-t-sm" style={{height: '50px'}}></div>
                    <span className="text-[10px] text-muted-foreground">Jan</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 md:gap-2">
                    <div className="w-6 md:w-8 lg:w-12 bg-primary/30 rounded-t-sm" style={{height: '75px'}}></div>
                    <span className="text-[10px] text-muted-foreground">Feb</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 md:gap-2">
                    <div className="w-6 md:w-8 lg:w-12 bg-primary/40 rounded-t-sm" style={{height: '60px'}}></div>
                    <span className="text-[10px] text-muted-foreground">Mar</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 md:gap-2">
                    <div className="w-6 md:w-8 lg:w-12 bg-primary/60 rounded-t-sm" style={{height: '100px'}}></div>
                    <span className="text-[10px] text-muted-foreground">Apr</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 md:gap-2">
                    <div className="w-6 md:w-8 lg:w-12 bg-primary/80 rounded-t-sm" style={{height: '85px'}}></div>
                    <span className="text-[10px] text-muted-foreground">May</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 md:gap-2">
                    <div className="w-6 md:w-8 lg:w-12 bg-primary rounded-t-sm" style={{height: '120px'}}></div>
                    <span className="text-[10px] text-muted-foreground">Jun</span>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="space-y-4 md:space-y-6 text-center lg:text-left order-1 lg:order-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold leading-tight" data-testid="text-design-title">
                  Design that speaks the language of{" "}
                  <span className="text-primary">clarity.</span>
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed" data-testid="text-design-desc">
                  We believe financial tools should be beautiful. That's why FinTrack uses a clean, minimal interface that focuses on what matters: your goals.
                </p>
                <ul className="space-y-3 md:space-y-4 text-left">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm" data-testid="text-design-point-1">Consistent iconography across platforms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm" data-testid="text-design-point-2">Subtle teal and grey visual system</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm" data-testid="text-design-point-3">Professional typography for legibility</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="pricing" className="py-12 md:py-20 lg:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 md:mb-4" data-testid="text-cta-title">
              Ready to take control?
            </h2>
            <p className="text-sm md:text-base text-primary-foreground/80 max-w-xl mx-auto mb-6 md:mb-8" data-testid="text-cta-desc">
              Join thousands of users who have simplified their financial lives with FinTrack. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Button size="lg" variant="secondary" className="rounded-full w-full sm:w-auto" asChild data-testid="button-cta-start">
                <a href="/api/login">
                  Get Started for Free
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-cta-pricing">
                View Pricing
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-8 md:py-12 border-y border-border/40 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
              <div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-display" data-testid="text-stat-users">12K+</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1" data-testid="text-stat-users-label">Active Users</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-display" data-testid="text-stat-transactions">$2M+</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1" data-testid="text-stat-transactions-label">Tracked</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-display" data-testid="text-stat-savings">98%</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1" data-testid="text-stat-savings-label">Satisfaction</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-display" data-testid="text-stat-countries">50+</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1" data-testid="text-stat-countries-label">Countries</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 md:py-12 lg:py-16 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Wallet className="text-primary-foreground w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xl" data-testid="text-footer-logo">FinTrack</span>
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-footer-tagline">
                Smart financial tracking for the modern world. Built with precision and care.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base" data-testid="text-footer-product-heading">Product</h4>
              <ul className="space-y-2 md:space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-features">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-integrations">Integrations</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors" data-testid="link-footer-pricing">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-updates">Updates</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base" data-testid="text-footer-company-heading">Company</h4>
              <ul className="space-y-2 md:space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-about">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-careers">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-blog">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base" data-testid="text-footer-newsletter-heading">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-3 md:mb-4" data-testid="text-footer-newsletter-desc">
                Get the latest insights delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Email" 
                  className="text-sm flex-1"
                  data-testid="input-newsletter-email"
                />
                <Button size="icon" className="shrink-0" data-testid="button-newsletter-submit">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
            <p data-testid="text-copyright">&copy; {new Date().getFullYear()} FinTrack Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-privacy">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors" data-testid="link-terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
