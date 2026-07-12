import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Truck, Route, Plus, Trash2, Edit2, Search, MapPin,
  ChevronDown, ArrowRight, CheckCircle, AlertTriangle, Users, Save, X
} from 'lucide-react'

export default function DispatcherView({ activeSubTab }) {
  // Cleared mock arrays to empty by default
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [trips, setTrips] = useState([])

  // State for Fleet View filtering
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All')

  // States for Trips CRUD Form
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTripId, setEditingTripId] = useState(null)
  
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [assignedVehicleId, setAssignedVehicleId] = useState('')
  const [assignedDriverId, setAssignedDriverId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchBackendData = async () => {
    try {
      const vRes = await fetch('http://localhost:5000/api/v1/vehicles')
      const vJson = await vRes.json()
      if (vJson.success) {
        setVehicles(vJson.data.map(v => ({
          id: v.id,
          reg: v.registrationNumber,
          model: v.modelName,
          type: v.vehicleType,
          cap: `${v.maxLoadCapacity.toLocaleString()} kg`,
          odo: `${v.currentOdometer.toLocaleString()} km`,
          status: v.status === 'OnTrip' ? 'On Trip' : v.status === 'InShop' ? 'In Shop' : v.status,
          img: v.vehicleType === 'Van' ? '/van.png' : v.vehicleType === 'Truck' ? '/truck.png' : v.vehicleType === 'Semi' ? '/semi.png' : '/box_truck.png'
        })))
      }

      const dRes = await fetch('http://localhost:5000/api/v1/drivers')
      const dJson = await dRes.json()
      if (dJson.success) {
        setDrivers(dJson.data.map(d => ({
          id: d.id,
          name: d.name,
          status: d.status === 'OnTrip' ? 'On Trip' : d.status === 'OffDuty' ? 'Off Duty' : d.status,
          safetyScore: d.safetyScore || 100
        })))
      }

      const tRes = await fetch('http://localhost:5000/api/v1/trips')
      const tJson = await tRes.json()
      if (tJson.success) {
        setTrips(tJson.data.map(t => ({
          id: t.id,
          source: t.source,
          dest: t.destination,
          vehicle: t.vehicle?.registrationNumber || 'Unknown',
          driver: t.driver?.name || 'Unknown',
          weight: `${t.cargoWeight} kg`,
          status: t.status === 'OnTrip' ? 'On Trip' : t.status
        })))
      }
    } catch (err) {
      console.warn("Backend unavailable, running in local fallback mode:", err)
    }
  }

  useEffect(() => {
    if (activeSubTab === 'Fleet' || activeSubTab === 'Trips') {
      fetchBackendData()
    }
  }, [activeSubTab])

  // Handle Create or Update Submit
  const handleTripSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!source || !destination || !cargoWeight || !assignedVehicleId || !assignedDriverId) {
      setError('Please fill in all fields')
      return
    }

    const selectedVehicle = vehicles.find(v => v.id.toString() === assignedVehicleId.toString())
    const selectedDriver = drivers.find(d => d.id.toString() === assignedDriverId.toString())

    if (editingTripId) {
      // Edit mode local state fallback
      setTrips(trips.map(t => t.id === editingTripId ? {
        ...t,
        source,
        dest: destination,
        weight: `${parseFloat(cargoWeight).toLocaleString()} kg`,
        vehicle: selectedVehicle ? selectedVehicle.reg : 'Unknown',
        driver: selectedDriver ? selectedDriver.name : 'Unknown',
        status: t.status
      } : t))
      setSuccess('Trip updated successfully')
    } else {
      // Create mode local state fallback
      const newTrip = {
        id: Date.now(),
        source,
        dest: destination,
        weight: `${parseFloat(cargoWeight).toLocaleString()} kg`,
        vehicle: selectedVehicle ? selectedVehicle.reg : 'Unknown',
        driver: selectedDriver ? selectedDriver.name : 'Unknown',
        status: 'Dispatched'
      }
      setTrips([newTrip, ...trips])
      setSuccess('Trip created and dispatched successfully')
    }

    // Reset Form
    setIsFormOpen(false)
    setEditingTripId(null)
    setSource('')
    setDestination('')
    setCargoWeight('')
    setAssignedVehicleId('')
    setAssignedDriverId('')
  }

  // Handle Edit Action
  const handleEditClick = (trip) => {
    setEditingTripId(trip.id)
    setSource(trip.source)
    setDestination(trip.dest)
    setCargoWeight(trip.weight.replace(/[^0-9.]/g, ''))
    
    const matchedVehicle = vehicles.find(v => v.reg === trip.vehicle)
    if (matchedVehicle) setAssignedVehicleId(matchedVehicle.id.toString())

    const matchedDriver = drivers.find(d => d.name === trip.driver)
    if (matchedDriver) setAssignedDriverId(matchedDriver.id.toString())

    setIsFormOpen(true)
  }

  // Handle Delete Action
  const handleDeleteClick = (id) => {
    setTrips(trips.filter(t => t.id !== id))
    setSuccess('Trip record removed')
  }

  // Filter Vehicles (Fleet Tab)
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.reg.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.model.toLowerCase().includes(vehicleSearch.toLowerCase())
    const matchesStatus = vehicleStatusFilter === 'All' || v.status === vehicleStatusFilter
    return matchesSearch && matchesStatus
  })

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Fleet':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search registration or model..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-705 dark:text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="relative w-full md:w-40">
                <select
                  value={vehicleStatusFilter}
                  onChange={(e) => setVehicleStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-705 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="All">Status: All</option>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-400">
                No vehicles found in fleet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((v) => (
                  <Card key={v.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden flex flex-col justify-between group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors">
                    <div>
                      <div className="h-40 w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 relative border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                        <img src={v.img} alt={v.model} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        <span className={'absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ' + (v.status === 'Available' ? 'bg-zinc-50/90 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' : v.status === 'On Trip' ? 'bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200' : 'bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700')}>
                          {v.status}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{v.model}</h4>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{v.reg} • {v.type}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-zinc-100 dark:border-zinc-800">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Capacity</span>
                            <span className="block font-semibold mt-0.5">{v.cap}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Odometer</span>
                            <span className="block font-semibold mt-0.5">{v.odo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 'Trips':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dispatched Operational Trips</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Manage live cargo dispatches and route mappings.</p>
              </div>
              <Button onClick={() => { setIsFormOpen(true); setEditingTripId(null); }} size="sm" className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 select-none">
                <Plus className="h-3.5 w-3.5 mr-1" /> New Trip
              </Button>
            </div>

            {success && <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-emerald-500">{success}</div>}

            {isFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{editingTripId ? 'Edit Active Trip' : 'Dispatch New Trip'}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="h-7 w-7 rounded-full bg-transparent text-zinc-400">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {error && <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-500">{error}</div>}
                  <form onSubmit={handleTripSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Trip Origin</label>
                        <input type="text" placeholder="e.g. Dallas, TX" value={source} onChange={(e) => setSource(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Destination</label>
                        <input type="text" placeholder="e.g. Houston, TX" value={destination} onChange={(e) => setDestination(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400">Cargo Weight (kg)</label>
                      <input type="number" placeholder="e.g. 3500" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} required className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Assign Vehicle</label>
                        <div className="relative">
                          <select value={assignedVehicleId} onChange={(e) => setAssignedVehicleId(e.target.value)} required className="w-full appearance-none px-3 py-1.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs pr-8 text-zinc-900 dark:text-zinc-100">
                            <option value="">Select vehicle...</option>
                            {vehicles.map(v => (
                              <option key={v.id} value={v.id}>{v.reg} ({v.model})</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400">Assign Driver</label>
                        <div className="relative">
                          <select value={assignedDriverId} onChange={(e) => setAssignedDriverId(e.target.value)} required className="w-full appearance-none px-3 py-1.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs pr-8 text-zinc-900 dark:text-zinc-100">
                            <option value="">Select driver...</option>
                            {drivers.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="h-8 text-xs bg-transparent border-zinc-200 dark:border-zinc-800">Cancel</Button>
                      <Button type="submit" size="sm" className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950">
                        {editingTripId ? 'Save Changes' : 'Dispatch Trip'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                      <th className="py-2.5 px-4">Route</th>
                      <th className="py-2.5 px-4">Vehicle</th>
                      <th className="py-2.5 px-4">Driver</th>
                      <th className="py-2.5 px-4">Cargo Weight</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">No active trips dispatched.</td>
                      </tr>
                    ) : (
                      trips.map((trip) => (
                        <tr key={trip.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 text-xs">
                          <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-55 flex items-center gap-1">
                            {trip.source} <ArrowRight className="h-3.5 w-3.5 text-zinc-400" /> {trip.dest}
                          </td>
                          <td className="py-3 px-4">{trip.vehicle}</td>
                          <td className="py-3 px-4 font-medium">{trip.driver}</td>
                          <td className="py-3 px-4">{trip.weight}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              {trip.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-1">
                              <Button onClick={() => handleEditClick(trip)} size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent"><Edit2 className="h-3.5 w-3.5" /></Button>
                              <Button onClick={() => handleDeleteClick(trip.id)} size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent"><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
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

      case 'Settings':
        return (
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
            <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Dispatcher Settings</CardTitle>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 block">Default Load Capacity Threshold</label>
                <div className="relative">
                  <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-850 dark:text-zinc-200 focus:outline-none">
                    <option>5,000 kg</option>
                    <option>10,000 kg (Default)</option>
                    <option>15,000 kg</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>
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
