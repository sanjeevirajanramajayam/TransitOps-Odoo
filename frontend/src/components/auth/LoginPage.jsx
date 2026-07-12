import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertTriangle, Loader2, Shield, Truck, Users, DollarSign } from 'lucide-react'

const DEMO_CREDENTIALS = {
  'Fleet Manager':     { email: 'fleet@transitops.com',    password: 'demo1234' },
  'Financial Analyst': { email: 'finance@transitops.com',  password: 'demo1234' },
  'Dispatcher':        { email: 'dispatch@transitops.com', password: 'demo1234' },
}

const ROLES = [
  { name: 'Fleet Manager',     desc: 'Vehicle & driver operations', icon: Truck },
  { name: 'Financial Analyst', desc: 'Expenses, fuel & ROI',        icon: DollarSign },
  { name: 'Dispatcher',        desc: 'Live fleet & trip dispatch',  icon: Users },
]

async function callLogin(email, password) {
  const res = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickLoading, setQuickLoading] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const data = await callLogin(email.trim(), password)
      if (!data.success) {
        if (data.data?.errors) {
          const detail = data.data.errors.map(err => `${err.field}: ${err.message}`).join(', ')
          setError(`${data.message}: ${detail}`)
        } else {
          setError(data.message || 'Login failed')
        }
        return
      }
      onLogin(data.data.user, data.data.token)
    } catch {
      setError('Network error: Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (roleName) => {
    setError('')
    setQuickLoading(roleName)
    const creds = DEMO_CREDENTIALS[roleName]
    try {
      const data = await callLogin(creds.email, creds.password)
      if (!data.success) {
        if (data.data?.errors) {
          const detail = data.data.errors.map(err => `${err.field}: ${err.message}`).join(', ')
          setError(`Demo login failed: ${data.message} (${detail})`)
        } else {
          setError(`Demo login failed: ${data.message}`)
        }
        return
      }
      onLogin(data.data.user, data.data.token)
    } catch {
      setError('Network error: Could not reach the server')
    } finally {
      setQuickLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left — branding */}
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

        {/* Right — login card */}
        <div className="space-y-4">
          <Card className="bg-zinc-900/40 backdrop-blur border-zinc-800 text-zinc-100 shadow-2xl p-2 rounded-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">Sign In</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Use your credentials or pick a demo role below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email / Password form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@transitops.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !!quickLoading}
                  className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-bold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 border border-zinc-200 disabled:opacity-60"
                >
                  {loading
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing in...</>
                    : <>Sign In <ArrowRight className="h-3.5 w-3.5" /></>
                  }
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                  <span className="bg-zinc-900 px-2.5">Quick Demo Access</span>
                </div>
              </div>

              {/* Quick-select role buttons — call real API */}
              <div className="grid grid-cols-2 gap-2.5">
                {ROLES.map((role) => {
                  const Icon = role.icon
                  const isThisLoading = quickLoading === role.name
                  return (
                    <button
                      key={role.name}
                      disabled={loading || !!quickLoading}
                      onClick={() => handleQuickLogin(role.name)}
                      className="p-3 text-left border border-zinc-800 rounded-xl bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all flex flex-col justify-between h-20 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100">
                          {isThisLoading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Icon className="h-3.5 w-3.5" />
                          }
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-zinc-200 block">{role.name}</span>
                        <span className="text-[9px] text-zinc-500 block leading-tight">{role.desc}</span>
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
