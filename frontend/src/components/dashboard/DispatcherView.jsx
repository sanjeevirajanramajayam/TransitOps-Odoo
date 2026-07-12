import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Truck, Route, Plus, Trash2, Edit2, Search, MapPin, Map,
  ChevronDown, ArrowRight, CheckCircle, AlertTriangle, Users, Save, X,
  Play, Check, Ban
} from 'lucide-react'

const CITY_COORDS = {
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  delhi: [28.6139, 77.2090],
  noida: [28.5355, 77.3910],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867],
  houston: [29.7604, -95.3698],
  austin: [30.2672, -97.7431],
  dallas: [32.7767, -96.7970],
  chicago: [41.8781, -87.6298],
  newyork: [40.7128, -74.0060],
  boston: [42.3601, -71.0589],
  losangeles: [34.0522, -118.2437],
  sanfrancisco: [37.7749, -122.4194],
  seattle: [47.6062, -122.3321]
};

const getCoords = (cityName) => {
  if (!cityName) return [19.0760, 72.8777]; // fallback Mumbai
  const clean = cityName.toLowerCase().replace(/[^a-z]/g, '');
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (clean.includes(city) || city.includes(clean)) {
      return coords;
    }
  }
  const firstWord = clean.split(' ')[0];
  if (CITY_COORDS[firstWord]) return CITY_COORDS[firstWord];
  
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 15 + (Math.abs(hash % 100) / 10);
  const lon = 73 + (Math.abs((hash >> 8) % 100) / 10);
  return [lat, lon];
};

const getArcPoints = (p1, p2, offsetFactor) => {
  const midLat = (p1[0] + p2[0]) / 2;
  const midLon = (p1[1] + p2[1]) / 2;
  
  const dLat = p2[0] - p1[0];
  const dLon = p2[1] - p1[1];
  
  const offsetLat = -dLon * offsetFactor;
  const offsetLon = dLat * offsetFactor;
  
  return [
    p1,
    [midLat + offsetLat, midLon + offsetLon],
    p2
  ];
};

export default function DispatcherView({ activeSubTab }) {
  // Database states
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  // State for Fleet View filtering
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All')

  const [currency, setCurrency] = useState(() => localStorage.getItem('transitops_currency') || 'INR')
  const [distanceUnit, setDistanceUnit] = useState(() => localStorage.getItem('transitops_distance_unit') || 'km')

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem('transitops_currency') || 'INR')
      setDistanceUnit(localStorage.getItem('transitops_distance_unit') || 'km')
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

  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [selectedMapTrip, setSelectedMapTrip] = useState(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (window.L) {
      setLeafletLoaded(true)
    } else {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => {
        setLeafletLoaded(true)
      }
      document.body.appendChild(script)
    }
  }, [])

  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (!isMapModalOpen || !selectedMapTrip || !leafletLoaded || !mapRef.current) return

    // Clean up previous map instance if any
    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }

    const L = window.L
    if (!L) return

    const startCoords = getCoords(selectedMapTrip.source)
    const endCoords = getCoords(selectedMapTrip.destination)

    // Initialize map
    const map = L.map(mapRef.current).setView(startCoords, 6)
    mapInstance.current = map

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Add custom icons or markers
    const startMarker = L.marker(startCoords).addTo(map)
      .bindPopup(`<b>Start:</b> ${selectedMapTrip.source}`)
      .openPopup()

    const endMarker = L.marker(endCoords).addTo(map)
      .bindPopup(`<b>End:</b> ${selectedMapTrip.destination}`)

    // Draw Primary Route (Indigo)
    const primaryPoints = getArcPoints(startCoords, endCoords, 0.05)
    const primaryPoly = L.polyline(primaryPoints, { color: '#4f46e5', weight: 5, opacity: 0.9 }).addTo(map)
      .bindPopup(`<b>Primary Route (Highway)</b><br/>Distance: ${selectedMapTrip.plannedDistance} ${distanceUnit}`)

    // Draw Alternative Route 1 (Emerald - Expressway)
    const altPoints1 = getArcPoints(startCoords, endCoords, 0.2)
    const altPoly1 = L.polyline(altPoints1, { color: '#10b981', weight: 3.5, opacity: 0.8, dashArray: '6, 6' }).addTo(map)
      .bindPopup(`<b>Alternative 1 (Expressway Bypass)</b><br/>Est. Distance: ${(selectedMapTrip.plannedDistance * 1.1).toFixed(0)} ${distanceUnit}`)

    // Draw Alternative Route 2 (Amber - Scenic)
    const altPoints2 = getArcPoints(startCoords, endCoords, -0.2)
    const altPoly2 = L.polyline(altPoints2, { color: '#f59e0b', weight: 3.5, opacity: 0.8, dashArray: '6, 6' }).addTo(map)
      .bindPopup(`<b>Alternative 2 (Local Bypass)</b><br/>Est. Distance: ${(selectedMapTrip.plannedDistance * 1.25).toFixed(0)} ${distanceUnit}`)

    // Fit bounds
    const bounds = L.latLngBounds([startCoords, endCoords])
    map.fitBounds(bounds, { padding: [40, 40] })

    // Force invalidating map size on load to ensure leaflet renders all tiles properly inside the modal
    setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [isMapModalOpen, selectedMapTrip, leafletLoaded])

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
          cap: v.maxLoadCapacity,
          odo: v.currentOdometer,
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
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{(v.cap || 0).toLocaleString()} {distanceUnit === 'mi' ? 'lbs' : 'kg'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Odometer</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{(v.odo || 0).toLocaleString()} {distanceUnit}</span>
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
                      <label className="text-xs uppercase font-bold text-zinc-400">Cargo Weight ({distanceUnit === 'mi' ? 'lbs' : 'kg'})</label>
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
                      <label className="text-xs uppercase font-bold text-zinc-400">Planned Distance ({distanceUnit})</label>
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
                      <label className="text-xs uppercase font-bold text-zinc-400">Estimated Revenue ({cSym})</label>
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
                              {v.reg} ({v.model}) - Max {(v.cap || 0).toLocaleString()} {distanceUnit === 'mi' ? 'lbs' : 'kg'} [{v.status}]
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
                              <Button
                                onClick={() => { setSelectedMapTrip(trip); setIsMapModalOpen(true); }}
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 rounded-full hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent shrink-0"
                                title="View Route Map"
                              >
                                <Map className="h-3.5 w-3.5" />
                              </Button>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">{veh ? veh.reg : `ID: ${trip.vehicleId}`}</td>
                          <td className="py-3.5 px-4 font-medium">{drv ? drv.name : `ID: ${trip.driverId}`}</td>
                          <td className="py-3.5 px-4">{trip.cargoWeight.toLocaleString()} {distanceUnit === 'mi' ? 'lbs' : 'kg'}</td>
                          <td className="py-3.5 px-4 min-w-[200px]">
                            <div className="flex flex-col space-y-1.5">
                              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 select-none">
                                <span className={trip.status === 'Draft' ? 'text-zinc-900 dark:text-zinc-100 font-extrabold' : ''}>Draft</span>
                                <span className={trip.status === 'Dispatched' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : ''}>Dispatched</span>
                                <span className={trip.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : ''}>Completed</span>
                              </div>
                              <div className="relative w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  className={'absolute top-0 left-0 h-full transition-all duration-500 ' + (trip.status === 'Cancelled' ? 'bg-rose-500' : 'bg-zinc-900 dark:bg-zinc-100')}
                                  style={{
                                    width: trip.status === 'Draft' ? '15%' : trip.status === 'Dispatched' ? '55%' : trip.status === 'Completed' ? '100%' : '100%'
                                  }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className={'font-bold uppercase ' + (trip.status === 'Cancelled' ? 'text-rose-500' : trip.status === 'Dispatched' ? 'text-indigo-600 dark:text-indigo-400' : trip.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400')}>
                                  {trip.status}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              {trip.status === 'Draft' && (
                                <>
                                  <Button
                                    onClick={() => handleDispatch(trip.id)}
                                    size="sm"
                                    className="h-7 px-2.5 text-[10px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 select-none flex items-center gap-1 font-semibold rounded-lg"
                                  >
                                    <Play className="h-3 w-3 text-emerald-500 fill-emerald-500" /> Push status
                                  </Button>
                                  <Button
                                    onClick={() => handleEdit(trip)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent shrink-0"
                                    title="Edit Draft"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDelete(trip.id)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent shrink-0"
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
                                    className="h-7 px-2.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white select-none flex items-center gap-1 font-semibold rounded-lg border border-emerald-500/10"
                                  >
                                    <Check className="h-3 w-3" /> Push status
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
                  <label className="text-xs uppercase font-bold text-zinc-400">Actual Distance Traveled ({distanceUnit})</label>
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
                  <label className="text-xs uppercase font-bold text-zinc-400">Final Odometer Reading ({distanceUnit})</label>
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
      {/* Map Dialog / Modal Overlay */}
      {isMapModalOpen && selectedMapTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl overflow-hidden flex flex-col h-[550px]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
              <div>
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Map className="h-4 w-4 text-zinc-500" /> Route Mapping Analysis
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Visualizing multi-route options from <span className="font-bold text-zinc-700 dark:text-zinc-300">{selectedMapTrip.source}</span> to <span className="font-bold text-zinc-700 dark:text-zinc-300">{selectedMapTrip.destination}</span>
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setIsMapModalOpen(false); setSelectedMapTrip(null); }} 
                className="h-7 w-7 rounded-full bg-transparent text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-zinc-100 dark:bg-zinc-950 flex flex-col md:flex-row overflow-hidden">
              {/* Map Container */}
              <div className="flex-1 h-full min-h-[300px]" ref={mapRef} style={{ zIndex: 10 }} />
              
              {/* Sidebar Route Selection */}
              <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 p-4 space-y-4 shrink-0 overflow-y-auto bg-white dark:bg-zinc-900 text-xs">
                <h5 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[10px]">Available Routes</h5>
                
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 space-y-1">
                    <div className="flex justify-between items-center font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Primary Route</span>
                      <span>{selectedMapTrip.plannedDistance} {distanceUnit}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">Fastest highway logistics corridor. Enforces standard toll pings.</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                    <div className="flex justify-between items-center font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Alternative 1</span>
                      <span>{(selectedMapTrip.plannedDistance * 1.1).toFixed(0)} {distanceUnit}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">Expressway bypass. Avoids central terminal traffic bottlenecks.</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                    <div className="flex justify-between items-center font-bold text-amber-600 dark:text-amber-400">
                      <span>Alternative 2</span>
                      <span>{(selectedMapTrip.plannedDistance * 1.25).toFixed(0)} {distanceUnit}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">Scenic local bypass. Ideal for hazardous or heavy cargo loads.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800/80 justify-end bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
              <Button 
                onClick={() => { setIsMapModalOpen(false); setSelectedMapTrip(null); }} 
                className="h-8 text-xs font-semibold px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Close Map Analysis
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

