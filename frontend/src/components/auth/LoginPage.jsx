import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Route, Shield, Truck, Users, Activity, DollarSign } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }
    onLogin('Fleet Manager')
  }

  const roles = [
    {
      name: 'Fleet Manager',
      description: 'Manage assets, vehicle lifecycles, and efficiency metrics',
      icon: Truck,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50'
    },
    {
      name: 'Driver',
      description: 'Manage deliveries, dispatches, and log trip statuses',
      icon: Route,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50'
    },
    {
      name: 'Safety Officer',
      description: 'Monitor safety scores and driver license compliances',
      icon: Shield,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50'
    },
    {
      name: 'Financial Analyst',
      description: 'Review expenses, fuel consumption, and ROI metrics',
      icon: DollarSign,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        <div className="space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30">
              <Route className="h-8 w-8" />
            </div>
            <span className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              TransitOps
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Centralized Fleet & Dispatch Hub
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              Replace spreadsheets with dynamic routing, real-time logging, compliance alerts, and financial tracking.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-zinc-900/60 backdrop-blur-xl border-zinc-800 text-slate-100 shadow-2xl p-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Access Control</CardTitle>
              <CardDescription className="text-slate-400">
                Select a quick access persona below to log in instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                {error && <p className="text-rose-400 text-xs font-medium">{error}</p>}
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg py-2.5">
                  Sign In
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900/10 px-2 text-slate-500 bg-zinc-900">Or Quick Select Role</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon
                  return (
                    <button
                      key={role.name}
                      onClick={() => onLogin(role.name)}
                      className={`p-3 text-left border rounded-xl bg-zinc-950/30 transition-all flex flex-col justify-between h-28 group ${role.color}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-1.5 rounded-lg bg-white/5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">→</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-xs text-slate-200 block">{role.name}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">{role.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
