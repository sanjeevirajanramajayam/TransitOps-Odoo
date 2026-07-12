import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts'
import { DollarSign, ArrowUpRight, TrendingUp, Download, PieChart } from 'lucide-react'

export default function FinancialAnalystView() {
  const financialData = [
    { name: 'Jan', revenue: 12000, costs: 8000 },
    { name: 'Feb', revenue: 15000, costs: 9500 },
    { name: 'Mar', revenue: 18000, costs: 11000 },
    { name: 'Apr', revenue: 16000, costs: 10500 },
    { name: 'May', revenue: 21000, costs: 12000 },
    { name: 'Jun', revenue: 24000, costs: 13500 }
  ]

  const expenseBreakdown = [
    { name: 'Fuel Logs', value: 5400, color: '#f59e0b' },
    { name: 'Maintenance', value: 3100, color: '#ec4899' },
    { name: 'Tolls & Fees', value: 1200, color: '#3b82f6' },
    { name: 'Insurance', value: 1800, color: '#10b981' }
  ]

  const expenses = [
    { id: 1, ref: 'EXP-9021', vehicle: 'TX-8902', type: 'Fuel Log', amount: 120.50, date: '2026-07-11', desc: '50 Gallons Diesel' },
    { id: 2, ref: 'EXP-8843', vehicle: 'NY-1029', type: 'Maintenance', amount: 450.00, date: '2026-07-10', desc: 'Brake Pad Replacement' },
    { id: 3, ref: 'EXP-8812', vehicle: 'CA-4412', type: 'Tolls', amount: 45.00, date: '2026-07-09', desc: 'Highway Express Pass' },
    { id: 4, ref: 'EXP-8790', vehicle: 'FL-7711', type: 'Fuel Log', amount: 380.00, date: '2026-07-08', desc: 'Full Tank Refill' },
    { id: 5, ref: 'EXP-8640', vehicle: 'IL-5050', type: 'Insurance', amount: 150.00, date: '2026-07-05', desc: 'Monthly Liability' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Command Center</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm">Track fleet operational expenses, monitor profit margins, and review aggregate operating costs.</p>
        </div>
        <Button className="rounded-lg gap-2">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Total Profit Margin</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">43.7%</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">+2.4% net margin gain since last month</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Operating Expenses</span>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">$11,500</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">47.8% dedicated to fuel allocations</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Gross Fleet Revenue</span>
            <ArrowUpRight className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">$24,000</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Reflects 6 active dispatched routes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Revenue vs Operating Cost Trends</CardTitle>
            <CardDescription>Aggregate monthly cashflows in USD</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={0.15} fill="url(#colorRev)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="costs" stroke="#f43f5e" fillOpacity={0.05} fill="url(#colorCost)" strokeWidth={2.5} />
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
            <CardDescription>Operating expense allocation</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseBreakdown} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Recent Ledger Transactions</CardTitle>
          <CardDescription>Direct expenses, maintenance logs, and fuel logs recorded this week.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 font-medium">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">{e.ref}</td>
                  <td className="py-3.5 px-4">{e.vehicle}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                      e.type === 'Fuel Log' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                      e.type === 'Maintenance' ? 'bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      {e.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{e.desc}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-zinc-200">${e.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
