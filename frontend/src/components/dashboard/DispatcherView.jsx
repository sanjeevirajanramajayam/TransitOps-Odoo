import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Truck, Route, Plus, Trash2, Edit2, Search, MapPin,
  ChevronDown, ArrowRight, CheckCircle, AlertTriangle, Users, Save, X,
  Play, Check, Ban
} from 'lucide-react'

export default function DispatcherView({ activeSubTab }) {
  // Database states
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  // State for Fleet View filtering
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All')

  // States for Trips CRUD Form
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTripId, setEditingTripId] = useState(null)
  
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [plannedDistance, setPlannedDistance] = useState('')
  const [revenue, setRevenue] = useState('')
  const [assignedVehicleId, setAssignedVehicleId] = useState('')
  const [assignedDriverId, setAssignedDriverId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // States for Completion Modal
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [completingTripId, setCompletingTripId] = useState(null)
  const [actualDistance, setActualDistance] = useState('')
  const [fuelConsumed, setFuelConsumed] = useState('')
  const [finalOdometer, setFinalOdometer] = useState('')

  // Fetch all database entities
  const fetchData = async () => {
    try {
      setLoading(true)
      const [vehRes, drvRes, tripRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/vehicles'),
        fetch('http://localhost:5000/api/v1/drivers'),
        fetch('http://localhost:5000/api/v1/trips')
      ])
      
      const vehData = await vehRes.json()
      const drvData = await drvRes.json()
      const tripData = await tripRes.json()

      if (vehData.success) {
        setVehicles(vehData.data.map(v => ({
          id: v.id,
          reg: v.registrationNumber,
          model: v.modelName,
          type: v.vehicleType,
          cap: `${v.maxLoadCapacity.toLocaleString()} kg`,
          odo: `${v.currentOdometer.toLocaleString()} mi`,
          status: v.status === 'OnTrip' ? 'On Trip' : v.status === 'InShop' ? 'In Shop' : v.status,
          img: v.vehicleType === 'Truck' ? '/truck.png' : v.vehicleType === 'Semi' ? '/semi.png' : v.vehicleType === 'Box Truck' ? '/box_truck.png' : '/van.png'
        })))
      }

      if (drvData.success) {
        setDrivers(drvData.data.map(d => ({
          id: d.id,
          name: d.name,
          status: d.status === 'OnTrip' ? 'On Trip' : d.status === 'OffDuty' ? 'Off Duty' : d.status,
          safetyScore: d.safetyScore
        })))
      }

      if (tripData.success) {
        setTrips(tripData.data)
      }
    } catch (err) {
      console.error('Error fetching dispatcher dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (activeSubTab === 'Fleet' || activeSubTab === 'Trips') {
      fetchData()
    }
  }, [activeSubTab])

  // Handle Create or Update Submit
  const handleTripSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFieldErrors({})

    const errors = {}
    if (!source.trim() || source.trim().length < 2) errors.source = 'Origin must be at least 2 characters'
    if (!destination.trim() || destination.trim().length < 2) errors.destination = 'Destination must be at least 2 characters'
    if (!cargoWeight || parseFloat(cargoWeight) <= 0) errors.cargoWeight = 'Cargo weight must be a positive number'
    if (!plannedDistance || parseFloat(plannedDistance) <= 0) errors.plannedDistance = 'Planned distance must be a positive number'
    if (!revenue || parseFloat(revenue) <= 0) errors.revenue = 'Estimated revenue must be a positive number'
    if (!assignedVehicleId) errors.vehicleId = 'Please select a vehicle'
    if (!assignedDriverId) errors.driverId = 'Please select a driver'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Validation failed. Please correct the fields.')
      return
    }

    const payload = {
      source: source.trim(),
      destination: destination.trim(),
      cargoWeight: parseFloat(cargoWeight),
      plannedDistance: parseFloat(plannedDistance),
      revenue: parseFloat(revenue),
      vehicleId: parseInt(assignedVehicleId),
      driverId: parseInt(assignedDriverId)
    }

    try {
      let res
      if (editingTripId) {
        res = await fetch(`http://localhost:5000/api/v1/trips/${editingTripId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (res.status === 200) {
          setSuccess('Trip details successfully updated!')
          resetForm()
          fetchData()
        } else if (res.status === 422 && data.data?.errors) {
          const apiErrors = {}
          data.data.errors.forEach(err => { apiErrors[err.field] = err.message })
          setFieldErrors(apiErrors)
          setError('Validation failed. Please check the inputs.')
        } else {
          setError(data.message || 'Failed to submit trip')
        }
      } else {
        // Create trip (created in Draft state)
        res = await fetch('http://localhost:5000/api/v1/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (res.status === 201) {
          const tripId = data.data.id
          // Immediately auto-dispatch the trip
          const dispatchRes = await fetch(`http://localhost:5000/api/v1/trips/${tripId}/dispatch`, {
            method: 'POST'
          })
          const dispatchData = await dispatchRes.json()
          if (dispatchRes.ok) {
            setSuccess('Trip successfully created and dispatched!')
            resetForm()
            fetchData()
          } else {
            // If dispatch fails, delete the draft trip to avoid lingering draft trips
            await fetch(`http://localhost:5000/api/v1/trips/${tripId}`, {
              method: 'DELETE'
            })
            setError(dispatchData.message || 'Failed to dispatch trip')
          }
        } else if (res.status === 422 && data.data?.errors) {
          const apiErrors = {}
          data.data.errors.forEach(err => { apiErrors[err.field] = err.message })
          setFieldErrors(apiErrors)
          setError('Validation failed. Please check the inputs.')
        } else {
          setError(data.message || 'Failed to submit trip')
        }
      }
    } catch (err) {
      setError('Network error: Could not reach the server')
    }
  }

  // Handle Dispatch API Trigger
  const handleDispatch = async (tripId) => {
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`http://localhost:5000/api/v1/trips/${tripId}/dispatch`, {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Trip successfully dispatched! Driver and Vehicle marked On Trip.')
        fetchData()
      } else {
        setError(data.message || 'Failed to dispatch trip')
      }
    } catch (err) {
      setError('Network error: Could not reach the server')
    }
  }

  // Handle Cancel API Trigger
  const handleCancel = async (tripId) => {
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`http://localhost:5000/api/v1/trips/${tripId}/cancel`, {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Trip has been successfully cancelled.')
        fetchData()
      } else {
        setError(data.message || 'Failed to cancel trip')
      }
    } catch (err) {
      setError('Network error: Could not reach the server')
    }
  }

  // Handle Complete Form Submit
  const handleCompleteSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!actualDistance || !fuelConsumed || !finalOdometer) {
      setError('Please fill in all completion parameters')
      return
    }

    try {
      const res = await fetch(`http://localhost:5000/api/v1/trips/${completingTripId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualDistanceTraveled: parseFloat(actualDistance),
          fuelConsumed: parseFloat(fuelConsumed),
          finalOdometer: parseFloat(finalOdometer)
        })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Trip successfully marked as Completed! Vehicle odometer updated.')
        setIsCompleteModalOpen(false)
        setActualDistance('')
        setFuelConsumed('')
        setFinalOdometer('')
        setCompletingTripId(null)
        fetchData()
      } else {
        setError(data.message || 'Failed to complete trip')
      }
    } catch (err) {
      setError('Network error: Could not reach the server')
    }
  }

  // Open Edit Form
  const handleEdit = (trip) => {
    setEditingTripId(trip.id)
    setSource(trip.source)
    setDestination(trip.destination)
    setCargoWeight(trip.cargoWeight.toString())
    setPlannedDistance(trip.plannedDistance.toString())
    setRevenue(trip.revenue.toString())
    setAssignedVehicleId(trip.vehicleId.toString())
    setAssignedDriverId(trip.driverId.toString())
    setIsFormOpen(true)
  }

  // Handle Delete API Trigger
  const handleDelete = async (tripId) => {
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`http://localhost:5000/api/v1/trips/${tripId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Trip deleted successfully.')
        fetchData()
      } else {
        setError(data.message || 'Failed to delete trip')
      }
    } catch (err) {
      setError('Network error: Could not reach the server')
    }
  }

  const resetForm = () => {
    setSource('')
    setDestination('')
    setCargoWeight('')
    setPlannedDistance('')
    setRevenue('')
    setAssignedVehicleId('')
    setAssignedDriverId('')
    setEditingTripId(null)
    setFieldErrors({})
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

          {loading ? (
            <p className="text-xs text-zinc-500">Loading fleet data...</p>
          ) : (
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
          )}
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
              className="h-8 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-950 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 gap-1.5 border border-zinc-200 dark:border-zinc-800 select-none"
            >
              <Plus className="h-4 w-4" /> Create Trip
            </Button>
          </div>

            {success && <div className="p-3 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-emerald-500">{success}</div>}

          {isFormOpen && (
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <form onSubmit={handleTripSubmit}>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Trip Origin (Source)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dallas, TX"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors ${fieldErrors.source ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                      />
                      {fieldErrors.source && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{fieldErrors.source}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Trip Destination</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Houston, TX"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors ${fieldErrors.destination ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                      />
                      {fieldErrors.destination && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{fieldErrors.destination}</p>}
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
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors ${fieldErrors.cargoWeight ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                      />
                      {fieldErrors.cargoWeight && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{fieldErrors.cargoWeight}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Planned Distance (mi)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 240"
                        value={plannedDistance}
                        onChange={(e) => setPlannedDistance(e.target.value)}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors ${fieldErrors.plannedDistance ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                      />
                      {fieldErrors.plannedDistance && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{fieldErrors.plannedDistance}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Estimated Revenue ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 1200"
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors ${fieldErrors.revenue ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                      />
                      {fieldErrors.revenue && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{fieldErrors.revenue}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Assign Vehicle</label>
                      <div className="relative">
                        <select
                          value={assignedVehicleId}
                          onChange={(e) => setAssignedVehicleId(e.target.value)}
                          className={`w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors ${fieldErrors.vehicleId ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                        >
                          <option value="">Select vehicle...</option>
                          {vehicles.map((v) => (
                            <option
                              key={v.id}
                              value={v.id}
                              disabled={v.status !== 'Available' && editingTripId === null}
                              className={v.status !== 'Available' ? 'text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-955/20' : ''}
                            >
                              {v.reg} ({v.model}) - Max {v.cap} [{v.status}]
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      </div>
                      {fieldErrors.vehicleId && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{fieldErrors.vehicleId}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Assign Driver</label>
                      <div className="relative">
                        <select
                          value={assignedDriverId}
                          onChange={(e) => setAssignedDriverId(e.target.value)}
                          className={`w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none transition-colors ${fieldErrors.driverId ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                        >
                          <option value="">Select driver...</option>
                          {drivers.map((d) => (
                            <option
                              key={d.id}
                              value={d.id}
                              disabled={d.status !== 'Available' && editingTripId === null}
                              className={d.status !== 'Available' ? 'text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-955/20' : ''}
                            >
                              {d.name} [{d.status}]
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      </div>
                      {fieldErrors.driverId && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{fieldErrors.driverId}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm} className="h-9 px-4 text-xs font-semibold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-transparent">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 px-4 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-950 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 select-none">
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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">Loading trips logged...</td>
                    </tr>
                  ) : trips.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">No trips logged.</td>
                    </tr>
                  ) : (
                    trips.map((trip) => {
                      const veh = vehicles.find(v => v.id === trip.vehicleId)
                      const drv = drivers.find(d => d.id === trip.driverId)
                      return (
                        <tr key={trip.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                          <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                            <span className="flex items-center gap-1.5">
                              {trip.source} <ArrowRight className="h-3 w-3 text-zinc-400" /> {trip.destination}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">{veh ? veh.reg : `ID: ${trip.vehicleId}`}</td>
                          <td className="py-3.5 px-4 font-medium">{drv ? drv.name : `ID: ${trip.driverId}`}</td>
                          <td className="py-3.5 px-4">{trip.cargoWeight.toLocaleString()} kg</td>
                          <td className="py-3.5 px-4">
                            <span className={'px-2.5 py-0.5 text-[10px] font-semibold rounded-full border uppercase ' + (trip.status === 'Dispatched' ? 'bg-indigo-50/90 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : trip.status === 'Completed' ? 'bg-emerald-50/90 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : trip.status === 'Cancelled' ? 'bg-red-50/90 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700')}>
                              {trip.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              {trip.status === 'Draft' && (
                                <>
                                  <Button
                                    onClick={() => handleDispatch(trip.id)}
                                    size="sm"
                                    className="h-7 px-2.5 text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 select-none flex items-center gap-1"
                                  >
                                    <Play className="h-3 w-3 text-emerald-500 fill-emerald-500" /> Dispatch
                                  </Button>
                                  <Button
                                    onClick={() => handleEdit(trip)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent"
                                    title="Edit Draft"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDelete(trip.id)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent"
                                    title="Delete Draft"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}

                              {trip.status === 'Dispatched' && (
                                <>
                                  <Button
                                    onClick={() => { setCompletingTripId(trip.id); setIsCompleteModalOpen(true); }}
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2.5 text-[10px] border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 select-none flex items-center gap-1"
                                  >
                                    <Check className="h-3 w-3 text-emerald-500" /> Complete
                                  </Button>
                                  <Button
                                    onClick={() => handleCancel(trip.id)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-lg text-amber-500 hover:text-amber-600 bg-transparent"
                                    title="Cancel Trip"
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}

                              {(trip.status === 'Cancelled' || trip.status === 'Completed') && (
                                <Button
                                  onClick={() => handleDelete(trip.id)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent"
                                  title="Delete Trip"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion Dialog / Modal Overlay */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80">
              <div>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Complete Trip Parameters</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Record final logs to return driver and vehicle to Available pool.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCompleteModalOpen(false)} className="h-7 w-7 rounded-full bg-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCompleteSubmit}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-zinc-400">Actual Distance Traveled (mi)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 248"
                    value={actualDistance}
                    onChange={(e) => setActualDistance(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-zinc-400">Fuel Consumed (Liters)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-zinc-400">Final Odometer Reading (mi)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45448"
                    value={finalOdometer}
                    onChange={(e) => setFinalOdometer(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-3 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <Button type="button" variant="outline" onClick={() => setIsCompleteModalOpen(false)} className="h-9 px-4 text-xs font-semibold rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-transparent">
                  Cancel
                </Button>
                <Button type="submit" className="h-9 px-4 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-zinc-950 dark:text-zinc-950 select-none">
                  Record Completion
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

