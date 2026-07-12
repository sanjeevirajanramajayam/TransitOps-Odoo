import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Truck, Users, DollarSign, ArrowRight } from 'lucide-react'

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
      description: 'Manage assets, vehicle lifecycles, and metrics',
      icon: Truck,
      color: 'text-zinc-100 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
    },
    {
      name: 'Dispatcher',
      description: 'Monitor fleet availability and dispatch active trips',
      icon: Users,
      color: 'text-zinc-100 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
    },
    {
      name: 'Safety Officer',
      description: 'Monitor safety scores and compliances',
      icon: Shield,
      color: 'text-zinc-100 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
    },
    {
      name: 'Financial Analyst',
      description: 'Review expenses, fuel, and ROI metrics',
      icon: DollarSign,
      color: 'text-zinc-100 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        <div className="space-y-6 text-center md:text-left">
          <span className="font-black text-3xl tracking-wider text-zinc-50 uppercase block select-none">
            TransitOps
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
              Fleet & Dispatch Command
            </h1>
            <p className="text-zinc-500 text-sm max-w-md mx-auto md:mx-0">
              Replace spreadsheets with dynamic routing, real-time logging, compliance alerts, and financial tracking.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-zinc-900/40 backdrop-blur border-zinc-800 text-zinc-100 shadow-2xl p-2 rounded-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">Access Control</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
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
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
                {error && <p className="text-zinc-400 text-xs font-semibold">{error}</p>}
                <Button type="submit" className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-bold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 border border-zinc-200">
                  Sign In <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                  <span className="bg-zinc-900 px-2.5">Or Quick Select Role</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {roles.map((role) => {
                  const Icon = role.icon
                  return (
                    <button
                      key={role.name}
                      onClick={() => onLogin(role.name)}
                      className={`p-3 text-left border rounded-xl bg-transparent transition-all flex flex-col justify-between h-24 group ${role.color}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-zinc-200 block">{role.name}</span>
                        <span className="text-[9px] text-zinc-500 block leading-tight">{role.description}</span>
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
