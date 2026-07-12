import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts'
import { DollarSign, ArrowUpRight, TrendingUp, Download, Landmark, Fuel, ChevronDown, IndianRupee } from 'lucide-react'

export default function FinancialAnalystView({ activeSubTab }) {
  const financialData = [
    { name: 'Jan', revenue: 12000, costs: 8000 },
    { name: 'Feb', revenue: 15000, costs: 9500 },
    { name: 'Mar', revenue: 18000, costs: 11000 },
    { name: 'Apr', revenue: 16000, costs: 10500 },
    { name: 'May', revenue: 21000, costs: 12000 },
    { name: 'Jun', revenue: 24000, costs: 13500 }
  ]

  const expenseBreakdown = [
    { name: 'Fuel Logs', value: 5400, color: '#18181b' },
    { name: 'Maintenance', value: 3100, color: '#3f3f46' },
    { name: 'Tolls & Fees', value: 1200, color: '#71717a' },
    { name: 'Insurance', value: 1800, color: '#a1a1aa' }
  ]

  const expenses = [
    { id: 1, ref: 'EXP-9021', vehicle: 'TX-8902', type: 'Fuel Log', amount: 120.50, date: '2026-07-11', desc: '50 Gallons Diesel' },
    { id: 2, ref: 'EXP-8843', vehicle: 'NY-1029', type: 'Maintenance', amount: 450.00, date: '2026-07-10', desc: 'Brake Pad Replacement' },
    { id: 3, ref: 'EXP-8812', vehicle: 'CA-4412', type: 'Tolls', amount: 45.00, date: '2026-07-09', desc: 'Highway Express Pass' },
    { id: 4, ref: 'EXP-8790', vehicle: 'FL-7711', type: 'Fuel Log', amount: 380.00, date: '2026-07-08', desc: 'Full Tank Refill' },
    { id: 5, ref: 'EXP-8640', vehicle: 'IL-5050', type: 'Insurance', amount: 150.00, date: '2026-07-05', desc: 'Monthly Liability' }
  ]

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Expense Ledger':
        return (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Recent Ledger Transactions</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Direct expenses, maintenance logs, and fuel logs recorded this week.</CardDescription>
              </div>
              <Button size="sm" className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 gap-1.5 bg-transparent text-zinc-900 dark:text-zinc-100 select-none">
                <Download className="h-3.5 w-3.5" /> Export Ledger
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
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
                    <tr key={e.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                      <td className="py-3.5 px-4 font-semibold text-zinc-955 dark:text-zinc-55 text-xs">{e.ref}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">{e.vehicle}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                          {e.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-555">{e.desc}</td>
                      <td className="py-3.5 px-4 font-bold">₹{e.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">{e.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )

      case 'ROI Reports':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-400 dark:text-zinc-500">
                  <span className="text-sm font-medium">Total Profit Margin</span>
                  <TrendingUp className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight">43.7%</div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">+2.4% net margin gain since last month</p>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-400 dark:text-zinc-500">
                  <span className="text-sm font-medium">Operating Expenses</span>
                  <IndianRupee className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight">₹11,500</div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">47.8% dedicated to fuel allocations</p>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-400 dark:text-zinc-500">
                  <span className="text-sm font-medium">Gross Fleet Revenue</span>
                  <IndianRupee className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight">₹24,000</div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Reflects 6 active dispatched routes</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Revenue vs Operating Cost Trends</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Aggregate monthly cashflows in INR (₹)</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#18181b" fillOpacity={0.1} fill="url(#colorRev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="costs" stroke="#71717a" fillOpacity={0.05} fill="url(#colorCost)" strokeWidth={1.5} />
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#71717a" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )

      case 'Fuel Optimization':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Expense Breakdown</CardTitle>
                <CardDescription className="text-xs text-zinc-550">Operating expense allocation by category</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseBreakdown} layout="vertical">
                    <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-4">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Fuel className="h-4 w-4 text-zinc-400" /> Fuel Surcharge Coverage
              </h4>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span className="text-[10px] text-zinc-450 uppercase block leading-none">Net Fleet MPG</span>
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-50 block mt-1.5">10.4 MPG</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Overall heavy vehicle and commercial van averages are within 4% of targeted fuel card limits.
              </p>
            </Card>
          </div>
        )

      case 'Settings':
        return (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
            <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Financial Threshold Settings</CardTitle>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 block">Weekly Fuel Budget Limit (per vehicle)</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none">
                    <option>₹500</option>
                    <option>₹800 (Default)</option>
                    <option>₹1,200</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 text-sm">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">Enforce Purchase Invoice Matching</span>
                  <span className="text-[10px] text-zinc-500 block">Requires dispatch invoices to align with driver gas reports.</span>
                </div>
                <input type="checkbox" defaultChecked className="accent-zinc-900 dark:accent-zinc-100 h-4 w-4" />
              </div>
            </div>
          </Card>
        )

      default:
        return (
          <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 bg-white dark:bg-zinc-900">
            <h3 className="text-lg font-bold">Placeholder View: {activeSubTab}</h3>
          </div>
        )
    }
  }

  return <div className="space-y-6">{renderContent()}</div>
}
