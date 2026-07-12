import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Route, AlertTriangle, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react'

export default function DriverView() {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const mockDrivers = [
    { id: '1', name: 'Alex Rivera', status: 'Available', expiry: '2027-12-31' },
    { id: '2', name: 'John Doe', status: 'Available', expiry: '2026-07-10' },
    { id: '3', name: 'Priya Patel', status: 'On Trip', expiry: '2028-04-15' },
    { id: '4', name: 'Marcus Vance', status: 'Suspended', expiry: '2027-09-20' }
  ]

  const mockVehicles = [
    { id: '1', reg: 'TX-8902', type: 'Ford Transit Van', maxWeight: 3500, status: 'Available' },
    { id: '2', reg: 'CA-4412', type: 'Freightliner Truck', maxWeight: 15000, status: 'Available' },
    { id: '3', reg: 'NY-1029', type: 'Ram ProMaster Van', maxWeight: 4000, status: 'In Shop' },
    { id: '4', reg: 'FL-7711', type: 'Volvo VNL Semi', maxWeight: 45000, status: 'Available' }
  ]

  const [activeTrips, setActiveTrips] = useState([
    { id: 1, source: 'Dallas, TX', dest: 'Houston, TX', vehicle: 'TX-8902', driver: 'Alex Rivera', weight: '2,800 lbs', status: 'On Trip' },
    { id: 2, source: 'Los Angeles, CA', dest: 'San Jose, CA', vehicle: 'CA-4412', driver: 'Priya Patel', weight: '11,200 lbs', status: 'Dispatched' }
  ])

  const handleDispatch = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!source || !destination || !cargoWeight || !selectedVehicleId || !selectedDriverId) {
      setError('Please fill in all fields to dispatch the trip')
      return
    }

    const driver = mockDrivers.find(d => d.id === selectedDriverId)
    const vehicle = mockVehicles.find(v => v.id === selectedVehicleId)

    if (!driver || !vehicle) return

    const expiryDate = new Date(driver.expiry)
    const today = new Date()
    if (expiryDate <= today) {
      setError(`Compliance Guard: Driver ${driver.name} has an expired license (Expired: ${driver.expiry})`)
      return
    }

    if (driver.status === 'Suspended') {
      setError(`Compliance Guard: Driver ${driver.name} is currently suspended and cannot be dispatched`)
      return
    }

    if (driver.status === 'On Trip') {
      setError(`Availability Guard: Driver ${driver.name} is currently on another trip`)
      return
    }

    if (vehicle.status !== 'Available') {
      setError(`Availability Guard: Vehicle ${vehicle.reg} is currently ${vehicle.status} and unavailable`)
      return
    }

    const inputWeight = parseFloat(cargoWeight)
    if (inputWeight > vehicle.maxWeight) {
      setError(`Capacity Guard: Cargo weight (${inputWeight} lbs) exceeds the vehicle's maximum capacity (${vehicle.maxWeight} lbs for ${vehicle.reg})`)
      return
    }

    const newTrip = {
      id: Date.now(),
      source,
      dest: destination,
      vehicle: vehicle.reg,
      driver: driver.name,
      weight: `${inputWeight.toLocaleString()} lbs`,
      status: 'Dispatched'
    }

    setActiveTrips([newTrip, ...activeTrips])
    setSuccess(`Trip successfully dispatched! ${vehicle.reg} and ${driver.name} are now marked On Trip.`)
    setSource('')
    setDestination('')
    setCargoWeight('')
    setSelectedVehicleId('')
    setSelectedDriverId('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Dispatch Command Form</CardTitle>
          <CardDescription>Creates trips, performs capacity checks, and safety compliance audits.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDispatch} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Source</label>
                <input
                  type="text"
                  placeholder="e.g. Chicago, IL"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Detroit, MI"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Cargo Weight (lbs)</label>
              <input
                type="number"
                placeholder="Weight in lbs"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Select Vehicle</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
              >
                <option value="">Choose a vehicle</option>
                {mockVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.reg} - {v.type} (Max: {v.maxWeight} lbs) - [{v.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Select Driver</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
              >
                <option value="">Choose a driver</option>
                {mockDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} - [{d.status}] - Exp: {d.expiry}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs rounded-lg flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <Button type="submit" className="w-full rounded-lg">Dispatch Cargo Trip</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg">Active Operational Deliveries</CardTitle>
          <CardDescription>Live tracking logs of active routes and dispatched payloads.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 font-medium">
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Payload</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeTrips.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-zinc-200">
                    <div className="flex items-center gap-1.5">
                      <span>{t.source}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span>{t.dest}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{t.vehicle}</td>
                  <td className="py-3.5 px-4">{t.driver}</td>
                  <td className="py-3.5 px-4">{t.weight}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      t.status === 'Dispatched' ? 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400' :
                      'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
