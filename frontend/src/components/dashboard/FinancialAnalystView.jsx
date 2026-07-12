import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts'
import {
  DollarSign, ArrowUpRight, TrendingUp, Download, Landmark, Fuel,
  ChevronDown, IndianRupee, Plus, FileText, Calendar, Info, X, Edit2, Trash2
} from 'lucide-react'

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

  // States for CRUD Logs
  const [expenses, setExpenses] = useState([
    { id: 1, ref: 'EXP-9021', vehicle: 'TX-8902', type: 'Maintenance', amount: 120.50, date: '2026-07-11', desc: 'Engine Check' },
    { id: 2, ref: 'EXP-8843', vehicle: 'NY-1029', type: 'Maintenance', amount: 450.00, date: '2026-07-10', desc: 'Brake Pad Replacement' },
    { id: 3, ref: 'EXP-8812', vehicle: 'CA-4412', type: 'Tolls', amount: 45.00, date: '2026-07-09', desc: 'Highway Express Pass' },
    { id: 4, ref: 'EXP-8790', vehicle: 'FL-7711', type: 'Insurance', amount: 380.00, date: '2026-07-08', desc: 'Liability Insurance' }
  ])

  const [fuelLogs, setFuelLogs] = useState([
    { id: 1, reg: 'TX-8902', date: '2026-07-12', volume: '18.4 L', cost: '₹1,500', mpg: '14.2 km/l' },
    { id: 2, reg: 'CA-4412', date: '2026-07-11', volume: '45.2 L', cost: '₹3,800', mpg: '7.8 km/l' },
    { id: 3, reg: 'NY-1029', date: '2026-07-11', volume: '15.0 L', cost: '₹1,250', mpg: '13.5 km/l' }
  ])

  // Form states
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false)
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
  const [editingFuelId, setEditingFuelId] = useState(null)
  const [editingExpenseId, setEditingExpenseId] = useState(null)

  // Fuel form fields
  const [fuelReg, setFuelReg] = useState('')
  const [fuelDate, setFuelDate] = useState('')
  const [fuelVolume, setFuelVolume] = useState('')
  const [fuelCost, setFuelCost] = useState('')
  const [fuelMpg, setFuelMpg] = useState('')

  // Expense form fields
  const [expReg, setExpReg] = useState('')
  const [expType, setExpType] = useState('Maintenance')
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expDate, setExpDate] = useState('')

  const handleAddFuel = (e) => {
    e.preventDefault()
    if (!fuelReg || !fuelDate || !fuelVolume || !fuelCost || !fuelMpg) return
    
    if (editingFuelId) {
      setFuelLogs(prev => prev.map(log => log.id === editingFuelId ? {
        ...log,
        reg: fuelReg,
        date: fuelDate,
        volume: fuelVolume.toString().endsWith(' L') ? fuelVolume : `${fuelVolume} L`,
        cost: fuelCost.toString().startsWith('₹') ? fuelCost : `₹${parseFloat(fuelCost).toLocaleString()}`,
        mpg: fuelMpg.toString().endsWith(' km/l') ? fuelMpg : `${fuelMpg} km/l`
      } : log))
      setEditingFuelId(null)
    } else {
      const newLog = {
        id: Date.now(),
        reg: fuelReg,
        date: fuelDate,
        volume: `${fuelVolume} L`,
        cost: `₹${parseFloat(fuelCost).toLocaleString()}`,
        mpg: `${fuelMpg} km/l`
      }
      setFuelLogs([newLog, ...fuelLogs])
    }
    setIsFuelFormOpen(false)
    clearFuelForm()
  }

  const handleAddExpense = (e) => {
    e.preventDefault()
    if (!expReg || !expDesc || !expAmount || !expDate) return

    if (editingExpenseId) {
      setExpenses(prev => prev.map(exp => exp.id === editingExpenseId ? {
        ...exp,
        vehicle: expReg,
        type: expType,
        amount: parseFloat(expAmount),
        date: expDate,
        desc: expDesc
      } : exp))
      setEditingExpenseId(null)
    } else {
      const newExp = {
        id: Date.now(),
        ref: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicle: expReg,
        type: expType,
        amount: parseFloat(expAmount),
        date: expDate,
        desc: expDesc
      }
      setExpenses([newExp, ...expenses])
    }
    setIsExpenseFormOpen(false)
    clearExpenseForm()
  }

  const handleEditFuelClick = (log) => {
    setEditingFuelId(log.id)
    setFuelReg(log.reg)
    setFuelDate(log.date)
    setFuelVolume(log.volume.replace(/[^0-9.]/g, ''))
    setFuelCost(log.cost.replace(/[^0-9.]/g, ''))
    setFuelMpg(log.mpg.replace(' km/l', ''))
    setIsExpenseFormOpen(false)
    setIsFuelFormOpen(true)
  }

  const handleEditExpenseClick = (exp) => {
    setEditingExpenseId(exp.id)
    setExpReg(exp.vehicle)
    setExpType(exp.type)
    setExpDesc(exp.desc)
    setExpAmount(exp.amount)
    setExpDate(exp.date)
    setIsFuelFormOpen(false)
    setIsExpenseFormOpen(true)
  }

  const handleDeleteFuel = (id) => {
    setFuelLogs(prev => prev.filter(log => log.id !== id))
  }

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id))
  }

  const clearFuelForm = () => {
    setFuelReg('')
    setFuelDate('')
    setFuelVolume('')
    setFuelCost('')
    setFuelMpg('')
  }

  const clearExpenseForm = () => {
    setExpReg('')
    setExpType('Maintenance')
    setExpDesc('')
    setExpAmount('')
    setExpDate('')
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Fuel and Expenses':
        return (
          <div className="space-y-6 relative">
            {/* Scrolled / High Z-Index top right action buttons (white in light theme, black in dark theme) */}
            <div className="fixed top-[72px] right-8 z-50 flex gap-2.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl shadow-lg">
              <Button
                onClick={() => { setEditingFuelId(null); clearFuelForm(); setIsExpenseFormOpen(false); setIsFuelFormOpen(true); }}
                size="sm"
                className="h-8 text-xs font-semibold rounded-lg bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 select-none"
              >
                <Fuel className="h-3.5 w-3.5 mr-1" /> Log Fuel
              </Button>
              <Button
                onClick={() => { setEditingExpenseId(null); clearExpenseForm(); setIsFuelFormOpen(false); setIsExpenseFormOpen(true); }}
                size="sm"
                className="h-8 text-xs font-semibold rounded-lg bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 select-none"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Log Expense
              </Button>
            </div>

            {/* Modal for Fuel Logging */}
            {isFuelFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <Card className="w-full max-w-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {editingFuelId ? 'Edit Fuel Purchase' : 'Log Fuel Purchase'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => { setIsFuelFormOpen(false); setEditingFuelId(null); }} className="h-7 w-7 rounded-full bg-transparent text-zinc-400">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleAddFuel} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Vehicle Reg</label>
                        <input type="text" placeholder="e.g. TX-8902" value={fuelReg} onChange={(e) => setFuelReg(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Date</label>
                        <input type="date" value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Volume (Liters)</label>
                        <input type="number" step="any" placeholder="e.g. 50" value={fuelVolume} onChange={(e) => setFuelVolume(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Total Cost (₹)</label>
                        <input type="number" step="any" placeholder="e.g. 4500" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">MPG / Efficiency</label>
                        <input type="text" placeholder="e.g. 12 km/l" value={fuelMpg} onChange={(e) => setFuelMpg(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => { setIsFuelFormOpen(false); setEditingFuelId(null); }} className="h-8 text-xs bg-transparent border-zinc-200 dark:border-zinc-800">Cancel</Button>
                      <Button type="submit" size="sm" className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-955">
                        {editingFuelId ? 'Save Changes' : 'Add Fuel Log'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {/* Modal for Expense Logging */}
            {isExpenseFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <Card className="w-full max-w-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {editingExpenseId ? 'Edit Operating Expense' : 'Log Operating Expense'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => { setIsExpenseFormOpen(false); setEditingExpenseId(null); }} className="h-7 w-7 rounded-full bg-transparent text-zinc-400">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Vehicle Reg</label>
                        <input type="text" placeholder="e.g. CA-4412" value={expReg} onChange={(e) => setExpReg(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Expense Type</label>
                        <div className="relative">
                          <select value={expType} onChange={(e) => setExpType(e.target.value)} className="w-full appearance-none px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs">
                            <option value="Maintenance">Maintenance</option>
                            <option value="Tolls">Tolls</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Permits">Permits</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Description</label>
                      <input type="text" placeholder="e.g. Brake pad change" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Amount (₹)</label>
                        <input type="number" placeholder="e.g. 1500" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Date</label>
                        <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => { setIsExpenseFormOpen(false); setEditingExpenseId(null); }} className="h-8 text-xs bg-transparent border-zinc-200 dark:border-zinc-800">Cancel</Button>
                      <Button type="submit" size="sm" className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-955">
                        {editingExpenseId ? 'Save Changes' : 'Add Expense Log'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {/* Stacked row layout (one block per row) for Fuel and Expenses */}
            <div className="space-y-6">
              {/* Block 1: Fuel Logs */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Fuel Purchase Logbook</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Telemetry logs of diesel purchases, quantities, and fuel economy metrics.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Volume</th>
                        <th className="py-2.5 px-3">Cost</th>
                        <th className="py-2.5 px-3">Efficiency</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelLogs.map((log) => (
                        <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                          <td className="py-3 px-3 font-bold">{log.reg}</td>
                          <td className="py-3 px-3 text-zinc-500">{log.date}</td>
                          <td className="py-3 px-3 font-semibold">{log.volume}</td>
                          <td className="py-3 px-3 font-black text-zinc-900 dark:text-zinc-100">{log.cost}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">{log.mpg}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                onClick={() => handleEditFuelClick(log)}
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteFuel(log.id)}
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Block 2: Operating Expenses */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Operational Expenses ledger</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Record of general operating costs, tolls, permits, and maintenance payouts.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                          <td className="py-3 px-3 font-mono text-zinc-500">{e.ref}</td>
                          <td className="py-3 px-3 font-bold">{e.vehicle}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              {e.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-zinc-500">{e.desc}</td>
                          <td className="py-3 px-3 font-black text-zinc-900 dark:text-zinc-100">₹{e.amount.toLocaleString()}</td>
                          <td className="py-3 px-3 text-zinc-400">{e.date}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                onClick={() => handleEditExpenseClick(e)}
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteExpense(e.id)}
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Block 3: Total Summary Card */}
              {(() => {
                const totalFuelCost = fuelLogs.reduce((acc, log) => acc + (parseFloat(log.cost.replace(/[^0-9.]/g, '')) || 0), 0);
                const totalExpCost = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
                const totalOpsCost = totalFuelCost + totalExpCost;

                return (
                  <Card className="border-zinc-250 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl p-5 border shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Operational Cost Aggregation</h4>
                        <p className="text-[10px] text-zinc-500">Calculated sum of active diesel purchases and operating ledger payouts.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 block text-[9px] uppercase font-bold">Total Fuel Cost</span>
                          <span className="text-zinc-900 dark:text-zinc-100">₹{totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 block text-[9px] uppercase font-bold">Total Expenses</span>
                          <span className="text-zinc-900 dark:text-zinc-100">₹{totalExpCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 dark:text-zinc-500 block text-[9px] uppercase font-bold">Total Operational Cost</span>
                          <span className="text-xs font-bold">₹{totalOpsCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>
          </div>
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
                <CardDescription className="text-xs text-zinc-500">Operating expense allocation by category</CardDescription>
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
                <span className="text-[10px] text-zinc-400 uppercase block leading-none">Net Fleet MPG</span>
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
                  <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none">
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
