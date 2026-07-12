import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Truck, Users, Route, Landmark, Settings, AlertTriangle, ShieldCheck, Sun, Moon } from 'lucide-react'

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const stats = [
    {
      title: "Active Vehicles",
      value: "12 / 15",
      description: "80% utilization rate",
      icon: Truck,
      color: "text-indigo-500 bg-indigo-500/10"
    },
    {
      title: "Active Drivers",
      value: "8 / 10",
      description: "2 on break, 0 suspended",
      icon: Users,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Dispatched Trips",
      value: "4 Active",
      description: "2 completed today",
      icon: Route,
      color: "text-sky-500 bg-sky-500/10"
    },
    {
      title: "Total Revenue",
      value: "$14,250",
      description: "+12.5% from last week",
      icon: Landmark,
      color: "text-amber-500 bg-amber-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 transition-colors duration-200">
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
              <Route className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              TransitOps
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="rounded-lg">
              {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
            <Button className="rounded-lg gap-2">
              <Settings className="h-4 w-4" />
              Manage Fleet
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-900 p-8 md:p-12 text-white shadow-xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/25">
              <ShieldCheck className="h-3.5 w-3.5" /> Platform Active
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Transit Operations Command
            </h1>
            <p className="text-indigo-200 text-lg">
              Real-time fleet tracking, dynamic routing compliance checks, and automated driver dispatch logs.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button className="bg-white text-indigo-950 hover:bg-slate-100 rounded-lg font-medium">
                Dispatch New Trip
              </Button>
              <Button variant="outline" className="border-indigo-500/35 hover:bg-indigo-500/10 text-white rounded-lg">
                View Maintenance Log
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <Card key={i} className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    {stat.title}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle>System Status & Integrations</CardTitle>
              <CardDescription>Verify UI components, tailwind classes, and CSS dark mode styles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-slate-100 dark:border-zinc-800 rounded-lg bg-slate-50/50 dark:bg-zinc-900/50 flex flex-wrap gap-2 items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Shadcn Buttons Check</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Toggle different button variant states</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="destructive" size="sm">Destructive</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                </div>
              </div>

              <div className="p-4 border border-slate-100 dark:border-zinc-800 rounded-lg bg-slate-50/50 dark:bg-zinc-900/50 flex flex-wrap gap-2 items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Responsive Grid System</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Adaptive layouts matching viewport size</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                    Active
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    Maintenance
                  </span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    Suspended
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-zinc-800 pt-4 flex justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Database Provider: PostgreSQL (Neon)</span>
              <span>ORM Layer: Prisma Client v6</span>
            </CardFooter>
          </Card>

          <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
            <CardHeader className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle className="text-lg">Compliance Checks</CardTitle>
              </div>
              <CardDescription>Critical warnings requiring immediate dispatch review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/50 rounded-lg">
                  <h5 className="font-semibold text-xs text-red-800 dark:text-red-400">License Expiry warning</h5>
                  <p className="text-[11px] text-red-600 dark:text-red-400/80 mt-0.5">Driver John Doe's commercial license expired on 2026-07-10.</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/50 rounded-lg">
                  <h5 className="font-semibold text-xs text-amber-800 dark:text-amber-400">Vehicle capacity breach</h5>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5">Cargo weight (12,500 lbs) exceeds Max Load Capacity of vehicle #TX-8902.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
  );
}

export default App
