import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts'
import {
  DollarSign, ArrowUpRight, TrendingUp, Download, Landmark, Fuel,
  ChevronDown, IndianRupee, Plus, FileText, Calendar, Info, X, Edit2, Trash2, AlertTriangle
} from 'lucide-react'

export default function FinancialAnalystView({ activeSubTab }) {
  const API_BASE = 'http://localhost:5000/api/v1/expenses'

  // Cleared placeholder data
  const financialData = []
  const expenseBreakdown = []

  // States for CRUD Logs - initialized to empty arrays
  const [expenses, setExpenses] = useState([])
  const [fuelLogs, setFuelLogs] = useState([])
  const [reports, setReports] = useState([])
  const [currency, setCurrency] = useState(() => localStorage.getItem('transitops_currency') || 'INR')
  const [distanceUnit, setDistanceUnit] = useState(() => localStorage.getItem('transitops_distance_unit') || 'km')
  const [exchangeRate, setExchangeRate] = useState(() => parseFloat(localStorage.getItem('transitops_exchange_rate')) || 95)
  const [inflationRate, setInflationRate] = useState(() => parseFloat(localStorage.getItem('transitops_inflation_rate')) || 6.0)

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem('transitops_currency') || 'INR')
      setDistanceUnit(localStorage.getItem('transitops_distance_unit') || 'km')
      setExchangeRate(parseFloat(localStorage.getItem('transitops_exchange_rate')) || 95)
      setInflationRate(parseFloat(localStorage.getItem('transitops_inflation_rate')) || 6.0)
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('local-storage-update', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage-update', handleStorageChange)
    }
  }, [])

  const getCurrencySymbol = (code) => {
    if (code === 'USD') return '$'
    if (code === 'EUR') return '€'
    if (code === 'GBP') return '£'
    return '₹'
  }
  const cSym = getCurrencySymbol(currency)

  const handleCurrencyChange = (val) => {
    setCurrency(val)
    localStorage.setItem('transitops_currency', val)
    window.dispatchEvent(new Event('local-storage-update'))
  }

  const handleDistanceChange = (val) => {
    setDistanceUnit(val)
    localStorage.setItem('transitops_distance_unit', val)
    window.dispatchEvent(new Event('local-storage-update'))
  }

  const handleExchangeRateChange = (val) => {
    const parsed = parseFloat(val) || 0
    setExchangeRate(parsed)
    localStorage.setItem('transitops_exchange_rate', parsed)
    window.dispatchEvent(new Event('local-storage-update'))
  }

  const handleInflationRateChange = (val) => {
    const parsed = parseFloat(val) || 0
    setInflationRate(parsed)
    localStorage.setItem('transitops_inflation_rate', parsed)
    window.dispatchEvent(new Event('local-storage-update'))
  }

  const convertAmount = (amountInINR) => {
    let converted = amountInINR;
    if (currency === 'USD') {
      converted = amountInINR / (exchangeRate || 95);
    } else if (currency === 'EUR') {
      converted = amountInINR / ((exchangeRate || 95) * 1.1);
    } else if (currency === 'GBP') {
      converted = amountInINR / ((exchangeRate || 95) * 1.25);
    }
    return converted;
  }

  const formatFinancial = (amountInINR, originalColorClass = "text-zinc-900 dark:text-zinc-100") => {
    const orig = convertAmount(amountInINR);
    const inflated = orig * (1 + inflationRate / 100);
    return (
      <div className="flex flex-col text-left">
        <span className={`${originalColorClass} font-bold`}>
          {cSym}{orig.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[10px] text-zinc-400 font-medium block leading-none mt-0.5">
          Inflated: {cSym}{inflated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    );
  }

  const [availableVehicles, setAvailableVehicles] = useState([
    { id: 1, reg: 'TX-8902', model: 'Ford Transit' },
    { id: 2, reg: 'CA-4412', model: 'Freightliner M2' },
    { id: 3, reg: 'NY-1029', model: 'Ram ProMaster' },
    { id: 4, reg: 'FL-7711', model: 'Volvo VNL 860' },
    { id: 5, reg: 'IL-5050', model: 'Isuzu NPR' }
  ])

  // Form states
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false)
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
  const [editingFuelId, setEditingFuelId] = useState(null)
  const [editingExpenseId, setEditingExpenseId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleteTargetType, setDeleteTargetType] = useState(null) // 'fuel' | 'expense'

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

  // Fetch Vehicles
  const fetchVehiclesFromBackend = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/vehicles')
      const json = await res.json()
      if (json.success && json.data.length > 0) {
        setAvailableVehicles(json.data.map(v => ({
          id: v.id,
          reg: v.registrationNumber,
          model: v.modelName
        })))
      }
    } catch (err) {
      console.warn("Backend unavailable, using static fallback vehicles")
    }
  }

  // Fetch from Backend
  const fetchLogsFromBackend = async () => {
    try {
      const fuelRes = await fetch(`${API_BASE}/fuel`)
      const fuelJson = await fuelRes.json()
      if (fuelJson.success) {
        const mappedFuel = fuelJson.data.map(log => ({
          id: log.id,
          reg: log.vehicle?.registrationNumber || 'Generic',
          date: new Date(log.date).toISOString().split('T')[0],
          liters: log.liters,
          cost: log.cost,
          odometerReading: log.odometerReading
        }))
        setFuelLogs(mappedFuel)
      }

      const expRes = await fetch(`${API_BASE}/other`)
      const expJson = await expRes.json()
      if (expJson.success) {
        const mappedExpenses = expJson.data.map(exp => ({
          id: exp.id,
          ref: `EXP-${exp.id + 9000}`,
          vehicle: exp.vehicle?.registrationNumber || 'Generic',
          type: exp.expenseType,
          amount: exp.amount,
          date: new Date(exp.date).toISOString().split('T')[0],
          desc: exp.description || ''
        }))
        setExpenses(mappedExpenses)
      }
    } catch (err) {
      console.warn("Backend unavailable, running with empty states:", err)
    }
  }

  const fetchReportsFromBackend = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/analytics/reports')
      const json = await res.json()
      if (json.success) {
        setReports(json.data)
      }
    } catch (err) {
      console.warn("Analytics reports endpoint offline")
    }
  }

  // Load backend data on mount or when tab changes
  useEffect(() => {
    if (activeSubTab === 'Fuel and Expenses' || activeSubTab === 'ROI Reports' || activeSubTab === 'Fuel Optimization') {
      fetchLogsFromBackend()
      fetchVehiclesFromBackend()
      fetchReportsFromBackend()
    }
  }, [activeSubTab])

  const handleAddFuel = async (e) => {
    e.preventDefault()
    if (!fuelReg || !fuelDate || !fuelVolume || !fuelCost || !fuelMpg || isSubmitting) return

    setIsSubmitting(true)

    const cleanVolume = parseFloat(fuelVolume.toString().replace(/[^0-9.]/g, '')) || 0
    const cleanCost = parseFloat(fuelCost.toString().replace(/[^0-9.]/g, '')) || 0
    const cleanOdo = parseFloat(fuelMpg.toString().replace(/[^0-9.]/g, '')) || 0

    const payload = {
      vehicleReg: fuelReg,
      liters: cleanVolume,
      cost: cleanCost,
      odometerReading: cleanOdo,
      date: fuelDate
    }

    try {
      let res
      if (editingFuelId) {
        res = await fetch(`${API_BASE}/fuel/${editingFuelId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`${API_BASE}/fuel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const json = await res.json()
      if (json.success) {
        fetchLogsFromBackend()
      } else {
        updateFuelStateLocally()
      }
    } catch (err) {
      console.error(err)
      updateFuelStateLocally()
    } finally {
      setIsSubmitting(false)
      setIsFuelFormOpen(false)
      clearFuelForm()
      setEditingFuelId(null)
    }
  }

  const updateFuelStateLocally = () => {
    if (editingFuelId) {
      setFuelLogs(prev => prev.map(log => log.id === editingFuelId ? {
        ...log,
        reg: fuelReg,
        date: fuelDate,
        volume: `${fuelVolume} L`,
        cost: `₹${parseFloat(fuelCost).toLocaleString()}`,
        mpg: `${fuelMpg} km/l`
      } : log))
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
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!expReg || !expDesc || !expAmount || !expDate || isSubmitting) return

    setIsSubmitting(true)

    const payload = {
      vehicleReg: expReg,
      expenseType: expType,
      amount: parseFloat(expAmount),
      description: expDesc,
      date: expDate
    }

    try {
      let res
      if (editingExpenseId) {
        res = await fetch(`${API_BASE}/other/${editingExpenseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`${API_BASE}/other`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const json = await res.json()
      if (json.success) {
        fetchLogsFromBackend()
      } else {
        updateExpenseStateLocally()
      }
    } catch (err) {
      console.error(err)
      updateExpenseStateLocally()
    } finally {
      setIsSubmitting(false)
      setIsExpenseFormOpen(false)
      clearExpenseForm()
      setEditingExpenseId(null)
    }
  }

  const updateExpenseStateLocally = () => {
    if (editingExpenseId) {
      setExpenses(prev => prev.map(exp => exp.id === editingExpenseId ? {
        ...exp,
        vehicle: expReg,
        type: expType,
        amount: parseFloat(expAmount),
        date: expDate,
        desc: expDesc
      } : exp))
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
  }

  const handleEditFuelClick = (log) => {
    setEditingFuelId(log.id)
    setFuelReg(log.reg)
    setFuelDate(log.date)
    setFuelVolume((log.liters || '').toString())
    setFuelCost((log.cost || '').toString())
    setFuelMpg((log.odometerReading || '').toString())
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

  const promptDeleteFuel = (id) => {
    setDeleteTargetId(id)
    setDeleteTargetType('fuel')
    setIsDeleteModalOpen(true)
  }

  const promptDeleteExpense = (id) => {
    setDeleteTargetId(id)
    setDeleteTargetType('expense')
    setIsDeleteModalOpen(true)
  }

  const executeDelete = async () => {
    if (!deleteTargetId || !deleteTargetType) return

    try {
      if (deleteTargetType === 'fuel') {
        const res = await fetch(`${API_BASE}/fuel/${deleteTargetId}`, { method: 'DELETE' })
        const json = await res.json()
        if (json.success) {
          fetchLogsFromBackend()
        } else {
          setFuelLogs(prev => prev.filter(log => log.id !== deleteTargetId))
        }
      } else {
        const res = await fetch(`${API_BASE}/other/${deleteTargetId}`, { method: 'DELETE' })
        const json = await res.json()
        if (json.success) {
          fetchLogsFromBackend()
        } else {
          setExpenses(prev => prev.filter(exp => exp.id !== deleteTargetId))
        }
      }
    } catch (err) {
      if (deleteTargetType === 'fuel') {
        setFuelLogs(prev => prev.filter(log => log.id !== deleteTargetId))
      } else {
        setExpenses(prev => prev.filter(exp => exp.id !== deleteTargetId))
      }
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteTargetId(null)
      setDeleteTargetType(null)
    }
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

            {/* Modal for Delete Confirmation */}
            {isDeleteModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <Card className="w-full max-w-sm border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Confirm Deletion</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Are you sure you want to delete this {deleteTargetType === 'fuel' ? 'fuel purchase log' : 'operating expense log'}? This action is permanent and cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeleteTargetId(null); setDeleteTargetType(null); }} className="h-8 text-xs bg-transparent border-zinc-200 dark:border-zinc-800">
                      Cancel
                    </Button>
                    <Button onClick={executeDelete} className="h-8 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/10">
                      Confirm Delete
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Modal for Fuel Logging */}
            {isFuelFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <Card className="w-full max-w-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {editingFuelId ? 'Edit Fuel Purchase' : 'Log Fuel Purchase'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => { setIsFuelFormOpen(false); setEditingFuelId(null); }} className="h-7 w-7 rounded-full bg-transparent text-zinc-400" disabled={isSubmitting}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleAddFuel} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Vehicle Reg</label>
                        <div className="relative">
                          <select
                            value={fuelReg}
                            onChange={(e) => setFuelReg(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="w-full appearance-none px-3 py-1.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs pr-8 text-zinc-900 dark:text-zinc-100"
                          >
                            <option value="">Select vehicle...</option>
                            {availableVehicles.map(v => (
                              <option key={v.id} value={v.reg}>{v.reg} ({v.model})</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Date</label>
                        <input type="date" value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Volume (Liters)</label>
                        <input type="number" step="any" placeholder="e.g. 50" value={fuelVolume} onChange={(e) => setFuelVolume(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Total Cost (₹)</label>
                        <input type="number" step="any" placeholder="e.g. 4500" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">MPG / Efficiency</label>
                        <input type="text" placeholder="e.g. 12" value={fuelMpg} onChange={(e) => setFuelMpg(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => { setIsFuelFormOpen(false); setEditingFuelId(null); }} disabled={isSubmitting} className="h-8 text-xs bg-transparent border-zinc-200 dark:border-zinc-800">Cancel</Button>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950">
                        {isSubmitting ? 'Logging...' : editingFuelId ? 'Save Changes' : 'Add Fuel Log'}
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
                    <Button variant="ghost" size="icon" onClick={() => { setIsExpenseFormOpen(false); setEditingExpenseId(null); }} className="h-7 w-7 rounded-full bg-transparent text-zinc-400" disabled={isSubmitting}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Vehicle Reg</label>
                        <div className="relative">
                          <select
                            value={expReg}
                            onChange={(e) => setExpReg(e.target.value)}
                            required
                            className="w-full appearance-none px-3 py-1.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs pr-8 text-zinc-900 dark:text-zinc-100"
                          >
                            <option value="">Select vehicle...</option>
                            {availableVehicles.map(v => (
                              <option key={v.id} value={v.reg}>{v.reg} ({v.model})</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Expense Type</label>
                        <div className="relative">
                          <select value={expType} onChange={(e) => setExpType(e.target.value)} className="w-full appearance-none px-3 py-1.5 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100">
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
                      <input type="text" placeholder="e.g. Brake pad change" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Amount (₹)</label>
                        <input type="number" placeholder="e.g. 1500" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Date</label>
                        <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => { setIsExpenseFormOpen(false); setEditingExpenseId(null); }} disabled={isSubmitting} className="h-8 text-xs bg-transparent border-zinc-200 dark:border-zinc-800">Cancel</Button>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950">
                        {isSubmitting ? 'Logging...' : editingExpenseId ? 'Save Changes' : 'Add Expense Log'}
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
                      {fuelLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">No fuel purchase records found.</td>
                        </tr>
                      ) : (
                        fuelLogs.map((log) => (
                          <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                            <td className="py-3 px-3 font-bold">{log.reg}</td>
                            <td className="py-3 px-3 text-zinc-500">{log.date}</td>
                            <td className="py-3 px-3 font-semibold">{log.liters.toLocaleString()} L</td>
                            <td className="py-3 px-3">{formatFinancial(log.cost)}</td>
                            <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">{log.odometerReading.toLocaleString()} {distanceUnit === 'mi' ? 'mi/g' : 'km/l'}</td>
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
                                  onClick={() => promptDeleteFuel(log.id)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-zinc-400">No operational expenses records found.</td>
                        </tr>
                      ) : (
                        expenses.map((e) => (
                          <tr key={e.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                            <td className="py-3 px-3 font-mono text-zinc-500">{e.ref}</td>
                            <td className="py-3 px-3 font-bold">{e.vehicle}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                {e.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-zinc-500">{e.desc}</td>
                            <td className="py-3 px-3">{formatFinancial(e.amount)}</td>
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
                                  onClick={() => promptDeleteExpense(e.id)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Block 3: Total Summary Card */}
              {(() => {
                const totalFuelCost = fuelLogs.reduce((acc, log) => acc + (log.cost || 0), 0);
                const totalExpCost = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
                const totalOpsCost = totalFuelCost + totalExpCost;

                return (
                  <Card className="border-zinc-255 dark:border-zinc-855 bg-zinc-50 dark:bg-black rounded-xl p-5 border shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Operational Cost Aggregation</h4>
                        <p className="text-[10px] text-zinc-500">Calculated sum of active diesel purchases and operating ledger payouts.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 block text-[9px] uppercase font-bold mb-0.5">Total Fuel Cost</span>
                          {formatFinancial(totalFuelCost)}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 block text-[9px] uppercase font-bold mb-0.5">Total Expenses</span>
                          {formatFinancial(totalExpCost)}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-450 dark:text-zinc-500 block text-[9px] uppercase font-bold mb-0.5">Total Operational Cost</span>
                          {formatFinancial(totalOpsCost, "text-white dark:text-black")}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>
          </div>
        )

      case 'ROI Reports': {
        const totalRevenue = reports.reduce((acc, r) => acc + r.totalRevenue, 0)
        const totalOps = reports.reduce((acc, r) => acc + r.totalOperationalCost, 0)
        const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalOps) / totalRevenue) * 100 : 0
        const avgRoi = reports.length > 0 ? (reports.reduce((acc, r) => acc + r.roi, 0) / reports.length) * 100 : 0

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-400 dark:text-zinc-500">
                  <span className="text-sm font-medium">Average ROI %</span>
                  <TrendingUp className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight">{avgRoi.toFixed(1)}%</div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Average return on acquisition cost</p>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-400 dark:text-zinc-500">
                  <span className="text-sm font-medium">Operating Expenses</span>
                  <IndianRupee className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </CardHeader>
                <CardContent>
                  {formatFinancial(totalOps)}
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2">Aggregate operational ledger cost</p>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-zinc-400 dark:text-zinc-500">
                  <span className="text-sm font-medium">Gross Fleet Revenue</span>
                  <IndianRupee className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </CardHeader>
                <CardContent>
                  {formatFinancial(totalRevenue)}
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2">Reflects all completed dispatches</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Revenue vs Operating Cost per Vehicle</CardTitle>
                <CardDescription className="text-[10px] text-zinc-500">Acquisition cost profitability comparison in INR (₹)</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {reports.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-400">No vehicle data logged.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reports}>
                      <XAxis dataKey="registrationNumber" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#10b981" fillOpacity={0.1} fill="url(#colorRev)" strokeWidth={2} />
                      <Area type="monotone" dataKey="totalOperationalCost" name="Costs" stroke="#ef4444" fillOpacity={0.05} fill="url(#colorCost)" strokeWidth={1.5} />
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Vehicle Investment & ROI Breakdown</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Profitability metrics of active fleet vehicles computed against acquisition cost.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Gross Revenue</th>
                      <th className="py-2.5 px-3">Operational Cost</th>
                      <th className="py-2.5 px-3">Net Profit</th>
                      <th className="py-2.5 px-3">ROI (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-zinc-400">No vehicle ROI records available. Log trips and operational costs to compute metrics.</td>
                      </tr>
                    ) : (
                      reports.map((r) => (
                        <tr key={r.vehicleId} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                          <td className="py-3 px-3 font-bold">{r.registrationNumber} ({r.modelName})</td>
                          <td className="py-3 px-3">{formatFinancial(r.totalRevenue)}</td>
                          <td className="py-3 px-3">{formatFinancial(r.totalOperationalCost)}</td>
                          <td className="py-3 px-3">{formatFinancial(r.netProfit)}</td>
                          <td className="py-3 px-3">
                            <span className={'px-2 py-0.5 rounded text-[10px] font-bold ' + (r.roi >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')}>
                              {(r.roi * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )
      }

      case 'Fuel Optimization': {
        const avgEfficiency = reports.length > 0 ? (reports.reduce((acc, r) => acc + r.fuelEfficiency, 0) / reports.length) : 0
        const expenseTypes = {}
        expenses.forEach(e => {
          expenseTypes[e.type] = (expenseTypes[e.type] || 0) + e.amount
        })
        const dynamicExpenseBreakdown = Object.keys(expenseTypes).map((type, idx) => ({
          name: type,
          value: expenseTypes[type],
          color: idx === 0 ? '#18181b' : idx === 1 ? '#3f3f46' : idx === 2 ? '#71717a' : '#a1a1aa'
        }))

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Category Expense Breakdown</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Operating expense allocation by category</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {dynamicExpenseBreakdown.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-400">No operating expenses recorded.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dynamicExpenseBreakdown} layout="vertical">
                        <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={80} />
                        <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="value" name={`Amount (${cSym})`} radius={[0, 4, 4, 0]}>
                          {dynamicExpenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-4">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Fuel className="h-4 w-4 text-zinc-400" /> Fuel Efficiency Summary
                </h4>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase block leading-none">Net Fleet Efficiency</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-55 block mt-1.5">{avgEfficiency.toFixed(1)} {distanceUnit === 'mi' ? 'mpg' : 'km/L'}</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Overall heavy vehicle and commercial van averages are within 4% of targeted fuel card limits.
                </p>
              </Card>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Vehicle Fuel Efficiency Logs</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Live operational fuel consumption efficiency metrics mapped per vehicle.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Fuel Efficiency</th>
                      <th className="py-2.5 px-3">Total Operational Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-xs text-zinc-400">No fuel efficiency records available. Log fuel logs and trips to view logs.</td>
                      </tr>
                    ) : (
                      reports.map((r) => (
                        <tr key={r.vehicleId} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                          <td className="py-3 px-3 font-bold">{r.registrationNumber} ({r.modelName})</td>
                          <td className="py-3 px-3 font-mono text-[11px]">{r.fuelEfficiency.toFixed(1)} {distanceUnit === 'mi' ? 'mpg' : 'km/L'}</td>
                          <td className="py-3 px-3">{formatFinancial(r.totalOperationalCost)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )
      }

      case 'Settings':
        return (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4 max-w-xl">
            <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Financial & Telemetry Configs</CardTitle>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 block">Currency Type</label>
                <div className="relative">
                  <select 
                    value={currency} 
                    onChange={(e) => handleCurrencyChange(e.target.value)} 
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 block">Distance Unit</label>
                <div className="relative">
                  <select 
                    value={distanceUnit} 
                    onChange={(e) => handleDistanceChange(e.target.value)} 
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="mi">Miles (mi)</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 block">USD to INR Exchange Rate (₹ per $1)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={exchangeRate} 
                  onChange={(e) => handleExchangeRateChange(e.target.value)} 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 block">Inflation Adjustment Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={inflationRate} 
                  onChange={(e) => handleInflationRateChange(e.target.value)} 
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 block">Weekly Fuel Budget Limit (per vehicle)</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none">
                    <option>{cSym}500</option>
                    <option>{cSym}800 (Default)</option>
                    <option>{cSym}1,200</option>
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
