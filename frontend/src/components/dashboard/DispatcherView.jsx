import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Truck, Route, Plus, Trash2, Edit2, Search, MapPin,
  ChevronDown, ArrowRight, CheckCircle, AlertTriangle, Users, Save, X
} from 'lucide-react'

export default function DispatcherView({ activeSubTab }) {
  // Mock Vehicles (Fleet tab - just a view)
  const [vehicles, setVehicles] = useState([
    { id: 1, reg: 'TX-8902', model: 'Ford Transit', type: 'Van', cap: '3,500 kg', odo: '45,200 mi', status: 'Available', img: '/van.png' },
    { id: 2, reg: 'CA-4412', model: 'Freightliner M2', type: 'Truck', cap: '15,000 kg', odo: '120,400 mi', status: 'On Trip', img: '/truck.png' },
    { id: 3, reg: 'NY-1029', model: 'Ram ProMaster', type: 'Van', cap: '4,000 kg', odo: '28,100 mi', status: 'In Shop', img: '/van.png' },
    { id: 4, reg: 'FL-7711', model: 'Volvo VNL 860', type: 'Semi', cap: '45,000 kg', odo: '310,000 mi', status: 'Available', img: '/semi.png' },
    { id: 5, reg: 'IL-5050', model: 'Isuzu NPR', type: 'Box Truck', cap: '10,000 kg', odo: '95,300 mi', status: 'Retired', img: '/box_truck.png' }
  ])

  // Mock Drivers (for Trip assignment)
  const [drivers] = useState([
    { id: 1, name: 'Alex Rivera', status: 'Available', safetyScore: 98 },
    { id: 2, name: 'Priya Patel', status: 'On Trip', safetyScore: 95 },
    { id: 3, name: 'Marcus Vance', status: 'Suspended', safetyScore: 82 },
    { id: 4, name: 'Sarah Connor', status: 'Available', safetyScore: 91 }
  ])

  // Mock Trips (CRUD Tab)
  const [trips, setTrips] = useState([
    { id: 1, source: 'Dallas, TX', dest: 'Houston, TX', vehicle: 'TX-8902', driver: 'Alex Rivera', weight: '2,800 kg', status: 'On Trip' },
    { id: 2, source: 'Los Angeles, CA', dest: 'San Jose, CA', vehicle: 'CA-4412', driver: 'Priya Patel', weight: '11,200 kg', status: 'Dispatched' }
  ])

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

    if (!selectedVehicle || !selectedDriver) {
      setError('Invalid driver or vehicle selection')
      return
    }

    if (editingTripId) {
      // Update
      setTrips(prev => prev.map(t => t.id === editingTripId ? {
        ...t,
        source,
        dest: destination,
        weight: `${parseFloat(cargoWeight).toLocaleString()} kg`,
        vehicle: selectedVehicle.reg,
        driver: selectedDriver.name
      } : t))
      setSuccess('Trip details successfully updated!')
      resetForm()
    } else {
      // Create
      const newTrip = {
        id: Date.now(),
        source,
        dest: destination,
        weight: `${parseFloat(cargoWeight).toLocaleString()} kg`,
        vehicle: selectedVehicle.reg,
        driver: selectedDriver.name,
        status: 'Dispatched'
      }
      setTrips([newTrip, ...trips])
      setSuccess('New trip successfully created and dispatched!')
      resetForm()
    }
  }

  // Open Edit Form
  const handleEdit = (trip) => {
    const selectedVeh = vehicles.find(v => v.reg === trip.vehicle)
    const selectedDrv = drivers.find(d => d.name === trip.driver)

    setEditingTripId(trip.id)
    setSource(trip.source)
    setDestination(trip.dest)
    setCargoWeight(trip.weight.replace(/[^0-9]/g, ''))
    setAssignedVehicleId(selectedVeh ? selectedVeh.id.toString() : '')
    setAssignedDriverId(selectedDrv ? selectedDrv.id.toString() : '')
    setIsFormOpen(true)
  }

  // Handle Delete
  const handleDelete = (id) => {
    setTrips(prev => prev.filter(t => t.id !== id))
    setSuccess('Trip has been deleted successfully.')
  }

  const resetForm = () => {
    setSource('')
    setDestination('')
    setCargoWeight('')
    setAssignedVehicleId('')
    setAssignedDriverId('')
    setEditingTripId(null)
    setIsFormOpen(false)
  }

  // Filter Fleet
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.reg.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.model.toLowerCase().includes(vehicleSearch.toLowerCase())
    const matchesStatus = vehicleStatusFilter === 'All' || v.status === vehicleStatusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Fleet Tab (Just a View) */}
      {activeSubTab === 'Fleet' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search registration or model..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto justify-end items-center">
              <div className="relative w-36">
                <select
                  value={vehicleStatusFilter}
                  onChange={(e) => setVehicleStatusFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="All">Status: All</option>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((v) => (
              <Card key={v.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden flex flex-col justify-between group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors duration-200">
                <div>
                  <div className="h-40 w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 relative border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <img
                      src={v.img}
                      alt={v.model}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={'absolute top-3 right-3 px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full border ' + (v.status === 'Available' ? 'bg-zinc-50/90 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' : v.status === 'On Trip' ? 'bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200' : 'bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700')}>
                      {v.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{v.model}</h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{v.type}</p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg">
                        {v.reg}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1 text-xs border-t border-zinc-100 dark:border-zinc-800/80">
                      <div>
                        <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Max Capacity</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{v.cap}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Odometer</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{v.odo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Trips Tab (CRUD) */}
      {activeSubTab === 'Trips' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Trip Dispatches</h3>
            <Button
              onClick={() => { resetForm(); setIsFormOpen(true); }}
              size="sm"
              className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 gap-1.5 border border-zinc-200 dark:border-zinc-800 select-none"
            >
              <Plus className="h-4 w-4" /> Create Trip
            </Button>
          </div>

          {/* Form Modal / Dropdown segment */}
          {isFormOpen && (
            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">
                    {editingTripId ? 'Edit Trip Settings' : 'New Trip Dispatch Form'}
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Configure trip parameters, safety restrictions, and route details.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={resetForm} className="h-7 w-7 rounded-full bg-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <form onSubmit={handleTripSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-rose-500 flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Trip Origin (Source)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dallas, TX"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Trip Destination</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Houston, TX"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Cargo Weight (kg)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 2500"
                        value={cargoWeight}
                        onChange={(e) => setCargoWeight(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Assign Vehicle</label>
                      <div className="relative">
                        <select
                          value={assignedVehicleId}
                          onChange={(e) => setAssignedVehicleId(e.target.value)}
                          className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                          <option value="">Select vehicle...</option>
                          {vehicles.map((v) => (
                            <option
                              key={v.id}
                              value={v.id}
                              disabled={v.status !== 'Available'}
                              className={v.status !== 'Available' ? 'text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-950/20' : ''}
                            >
                              {v.reg} ({v.model}) - Max {v.cap} [{v.status}]
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Assign Driver</label>
                      <div className="relative">
                        <select
                          value={assignedDriverId}
                          onChange={(e) => setAssignedDriverId(e.target.value)}
                          className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                          <option value="">Select driver...</option>
                          {drivers.map((d) => (
                            <option
                              key={d.id}
                              value={d.id}
                              disabled={d.status !== 'Available'}
                              className={d.status !== 'Available' ? 'text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-950/20' : ''}
                            >
                              {d.name} [{d.status}]
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm} className="h-9 px-4 text-xs font-semibold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-transparent">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 px-4 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 select-none">
                    <Save className="h-3.5 w-3.5 mr-1" /> {editingTripId ? 'Save Changes' : 'Confirm Dispatch'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Active Trips Table */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Trips Log & Management</CardTitle>
              <CardDescription className="text-xs text-zinc-500">Live operational routes, tracking weights, and dispatch edits.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Cargo Weight</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">No trips logged.</td>
                    </tr>
                  ) : (
                    trips.map((trip) => (
                      <tr key={trip.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                          <span className="flex items-center gap-1.5">
                            {trip.source} <ArrowRight className="h-3 w-3 text-zinc-400" /> {trip.dest}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">{trip.vehicle}</td>
                        <td className="py-3.5 px-4 font-medium">{trip.driver}</td>
                        <td className="py-3.5 px-4">{trip.weight}</td>
                        <td className="py-3.5 px-4">
                          <span className={trip.status === 'On Trip' ? 'px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200' : 'px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleEdit(trip)}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(trip.id)}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent"
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
        </div>
      )}
    </div>
  )
}
