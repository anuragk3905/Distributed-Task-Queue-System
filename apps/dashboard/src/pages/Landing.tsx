import { Link } from "react-router-dom";
import { ArrowRight, Activity, GitMerge, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-md bg-background/80 fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Distributed Task Queue System v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            Scale your background <br className="hidden md:block" />
            jobs <span className="text-primary">effortlessly.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A high-performance, distributed task processing platform. Monitor execution, manage retry logic, and visualize complex workflows in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105">
                Start Processing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm border-muted hover:bg-muted/50 transition-all">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 px-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Monitoring</h3>
            <p className="text-muted-foreground leading-relaxed">
              Track job progress, view execution logs, and monitor worker health with sub-second latency through WebSockets.
            </p>
          </div>
          
          <div className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <GitMerge className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Complex Workflows</h3>
            <p className="text-muted-foreground leading-relaxed">
              Design and execute multi-step workflows with dependencies. Automatic retries, exponential backoff, and DLQ support.
            </p>
          </div>

          <div className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">RBAC & Auditing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Enterprise-grade security with Role-Based Access Control and comprehensive audit logs for every system action.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 TaskFlow System. Built for distributed architectures.</p>
      </footer>
    </div>
  );
}
