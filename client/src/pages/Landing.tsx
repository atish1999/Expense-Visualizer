import { Button } from "@/components/ui/button";
import { ArrowRight, PieChart, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">FinTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/api/login">Log in</Link>
            </Button>
            <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Link href="/api/login">Get Started <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="py-24 md:py-32 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: Quarterly insights available
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Master your money with zero effort.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Track expenses, visualize spending patterns, and gain financial clarity. 
            Simple, secure, and beautiful.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-lg rounded-xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1" asChild>
              <Link href="/api/login">Start Tracking Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-xl border-2 hover:bg-muted/50" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30 border-t border-border/40">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">Expense Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Log transactions in seconds. Categorize spending to know exactly where your money goes.
                </p>
              </div>

              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <PieChart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">Visual Insights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Beautiful charts and graphs help you spot trends and understand your spending habits.
                </p>
              </div>

              <div className="bg-card p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">Secure & Private</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your financial data is encrypted and secure. We never share your information with third parties.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border/40 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}
