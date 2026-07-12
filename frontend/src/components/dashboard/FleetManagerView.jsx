import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'
import {
  Truck, Wrench, ShieldAlert, Plus, Calendar, Settings,
  MapPin, Fuel, FileCheck, Activity,
  TrendingUp, Users, IndianRupee, AlertOctagon, Search, Map, ChevronDown, ArrowLeft, Route, AlertTriangle, CheckCircle, Clock,
  Edit2, Trash2
} from 'lucide-react'

export default function FleetManagerView({ activeSubTab, setActiveTab }) {
  const [vehicles, setVehicles] = useState([])
  const [driversList, setDriversList] = useState([])
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
  const [editingVehicleId, setEditingVehicleId] = useState(null)
  const [editingDriverId, setEditingDriverId] = useState(null)
  const [sentEmails, setSentEmails] = useState([])

  // New vehicle & driver form states
  const [newVehicle, setNewVehicle] = useState({ reg: '', model: '', type: 'Van', cap: '', odo: '', cost: '', status: 'Available' })
  const [newDriver, setNewDriver] = useState({ name: '', license: '', category: 'Class A', expiry: '', contact: '', email: '' })

  const [vehicleFormError, setVehicleFormError] = useState('')
  const [driverFormError, setDriverFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [driverFieldErrors, setDriverFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const fetchVehicles = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/vehicles')
      const data = await res.json()
      if (data.success) {
        const mapped = data.data.map(v => ({
          id: v.id,
          reg: v.registrationNumber,
          model: v.modelName,
          type: v.vehicleType,
          cap: v.maxLoadCapacity,
          odo: v.currentOdometer,
          cost: v.acquisitionCost,
          status: v.status === 'OnTrip' ? 'On Trip' : v.status === 'InShop' ? 'In Shop' : v.status,
          trips: v.trips || []
        }))
        setVehicles(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch vehicles', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTrips = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/trips')
      const data = await res.json()
      if (data.success) {
        const mapped = data.data.map(t => ({
          id: t.id,
          source: t.source,
          dest: t.destination,
          vehicle: t.vehicle?.registrationNumber || 'Unknown',
          driver: t.driver?.name || 'Unknown',
          weight: `${t.cargoWeight} kg`,
          status: t.status === 'OnTrip' ? 'On Trip' : t.status
        }))
        setActiveTrips(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch trips', err)
    }
  }

  // Maintenance states & API integration
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [isMaintFormOpen, setIsMaintFormOpen] = useState(false)
  const [maintVehicleId, setMaintVehicleId] = useState('')
  const [maintDescription, setMaintDescription] = useState('')
  const [maintCost, setMaintCost] = useState('')
  const [maintError, setMaintError] = useState('')
  const [maintSuccess, setMaintSuccess] = useState('')
  const [maintFieldErrors, setMaintFieldErrors] = useState({})

  const fetchMaintenance = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/maintenance')
      const data = await res.json()
      if (data.success) {
        setMaintenanceLogs(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch maintenance logs', err)
    }
  }

  const handleMaintSubmit = async (e) => {
    e.preventDefault()
    setMaintError('')
    setMaintSuccess('')
    setMaintFieldErrors({})

    const errors = {}
    if (!maintVehicleId) errors.vehicleId = 'Please select a vehicle'
    if (!maintDescription || maintDescription.trim().length < 3) errors.description = 'Description must be at least 3 characters'
    if (!maintCost || parseFloat(maintCost) <= 0) errors.cost = 'Cost must be a positive number'

    if (Object.keys(errors).length > 0) {
      setMaintFieldErrors(errors)
      setMaintError('Validation failed. Please correct the fields.')
      return
    }

    try {
      const res = await fetch('http://localhost:5000/api/v1/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: parseInt(maintVehicleId),
          description: maintDescription.trim(),
          cost: parseFloat(maintCost)
        })
      })
      const data = await res.json()
      if (res.status === 201) {
        setMaintSuccess('Maintenance log successfully created. Vehicle status changed to In Shop.')
        setMaintVehicleId('')
        setMaintDescription('')
        setMaintCost('')
        setIsMaintFormOpen(false)
        fetchMaintenance()
        fetchVehicles()
      } else if (res.status === 422 && data.data?.errors) {
        const apiErrors = {}
        data.data.errors.forEach(err => { apiErrors[err.field] = err.message })
        setMaintFieldErrors(apiErrors)
        setMaintError('Validation failed. Please check inputs.')
      } else {
        setMaintError(data.message || 'Failed to schedule maintenance')
      }
    } catch (err) {
      setMaintError('Network error: Could not reach the server')
    }
  }

  const handleCloseMaint = async (logId) => {
    setMaintError('')
    setMaintSuccess('')
    try {
      const res = await fetch(`http://localhost:5000/api/v1/maintenance/${logId}/close`, {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        setMaintSuccess('Maintenance log closed. Vehicle is now Available.')
        fetchMaintenance()
        fetchVehicles()
      } else {
        setMaintError(data.message || 'Failed to close maintenance log')
      }
    } catch (err) {
      setMaintError('Network error: Could not reach the server')
    }
  }

  // Analytics & KPI States
  const [kpis, setKpis] = useState({
    activeVehicles: 0,
    availableVehicles: 0,
    vehiclesInMaintenance: 0,
    activeTrips: 0,
    pendingTrips: 0,
    driversOnDuty: 0,
    fleetUtilization: 0
  })
  const [reports, setReports] = useState([])

  const fetchAnalytics = async () => {
    try {
      const kpiRes = await fetch('http://localhost:5000/api/v1/analytics/kpis')
      const kpiData = await kpiRes.json()
      if (kpiData.success) {
        setKpis(kpiData.data)
      }

      const repRes = await fetch('http://localhost:5000/api/v1/analytics/reports')
      const repData = await repRes.json()
      if (repData.success) {
        setReports(repData.data)
      }
    } catch (err) {
      console.error('Failed to fetch analytics data', err)
    }
  }

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
    fetchTrips()
    fetchMaintenance()
    fetchAnalytics()
  }, [])

  // Dispatch form states
  const [dispatchSource, setDispatchSource] = useState('')
  const [dispatchDestination, setDispatchDestination] = useState('')
  const [dispatchWeight, setDispatchWeight] = useState('')
  const [dispatchVehicleId, setDispatchVehicleId] = useState('')
  const [dispatchDriverId, setDispatchDriverId] = useState('')
  const [dispatchError, setDispatchError] = useState('')
  const [dispatchSuccess, setDispatchSuccess] = useState('')

  const [activeTrips, setActiveTrips] = useState([])

  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All')
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All')

  // Mock data cleared to empty lists
  const trackingVehicles = []
  const fuelLogs = []
  const safetyAlerts = []
  const complianceDocs = []

  const roiData = reports.map(r => ({
    name: r.registrationNumber,
    roi: Math.round(r.roi * 100 * 10) / 10
  }))
  const fuelData = reports.map(r => ({
    name: r.registrationNumber,
    efficiency: r.fuelEfficiency
  }))


  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.reg.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                          v.model.toLowerCase().includes(vehicleSearch.toLowerCase())
    const matchesType = vehicleTypeFilter === 'All' || v.type === vehicleTypeFilter
    const matchesStatus = vehicleStatusFilter === 'All'
      ? v.status !== 'Retired'
      : v.status === vehicleStatusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleVehicleSubmit = async (e) => {
    e.preventDefault()
    setVehicleFormError('')
    setFieldErrors({})

    const errors = {}
    
    const regClean = newVehicle.reg.trim().toUpperCase()
    if (!regClean) {
      errors.reg = 'Registration number is required'
    } else if (!/^[A-Z0-9\-\s]{4,30}$/.test(regClean)) {
      errors.reg = 'Must be 4-30 characters, alphanumeric, spaces or hyphens only'
    }

    const modelClean = newVehicle.model.trim()
    if (!modelClean) {
      errors.model = 'Model name is required'
    } else if (modelClean.length < 2) {
      errors.model = 'Model name must be at least 2 characters'
    }

    const capRaw = newVehicle.cap.replace(/[^\d\.]/g, '')
    const capNum = parseFloat(capRaw)
    if (isNaN(capNum) || capNum <= 0) {
      errors.cap = 'Max capacity must be a positive number'
    }

    const odoRaw = newVehicle.odo.replace(/[^\d\.]/g, '')
    const odoNum = parseFloat(odoRaw)
    if (isNaN(odoNum) || odoNum < 0) {
      errors.odo = 'Odometer reading must be a non-negative number'
    }

    const costRaw = newVehicle.cost.replace(/[^\d\.]/g, '')
    const costNum = parseFloat(costRaw)
    if (isNaN(costNum) || costNum <= 0) {
      errors.cost = 'Acquisition cost must be a positive number'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      const isEditing = !!editingVehicleId
      const url = isEditing 
        ? `http://localhost:5000/api/v1/vehicles/${editingVehicleId}` 
        : 'http://localhost:5000/api/v1/vehicles'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: regClean,
          modelName: modelClean,
          vehicleType: newVehicle.type,
          maxLoadCapacity: capNum,
          currentOdometer: odoNum,
          acquisitionCost: costNum,
          ...(isEditing ? { status: newVehicle.status } : {})
        })
      })

      const data = await res.json()
      if (res.status === 201 || (isEditing && res.status === 200)) {
        setNewVehicle({ reg: '', model: '', type: 'Van', cap: '', odo: '', cost: '', status: 'Available' })
        setEditingVehicleId(null)
        fetchVehicles()
        setActiveTab('Vehicles')
      } else if (res.status === 422 && data.data?.errors) {
        const apiErrors = {}
        data.data.errors.forEach(err => {
          apiErrors[err.field] = err.message
        })
        setFieldErrors(apiErrors)
        setVehicleFormError('Validation failed. Please check the inputs.')
      } else {
        setVehicleFormError(data.message || (isEditing ? 'Failed to update vehicle' : 'Failed to register vehicle'))
      }
    } catch (err) {
      setVehicleFormError('Network error: Failed to reach the server')
    }
  }

  const handleVehicleEditClick = (v) => {
    setEditingVehicleId(v.id)
    setNewVehicle({
      reg: v.reg,
      model: v.model,
      type: v.type,
      cap: v.rawCap ? v.rawCap.toString() : '',
      odo: v.rawOdo ? v.rawOdo.toString() : '',
      cost: v.cost ? v.cost.toString() : '',
      status: v.status === 'On Trip' ? 'OnTrip' : v.status === 'In Shop' ? 'InShop' : v.status
    })
    setActiveTab('Add Vehicle')
  }

  const handleVehicleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/v1/vehicles/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchVehicles()
      } else {
        alert(data.message || 'Failed to delete vehicle')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete vehicle')
    }
  }

  const handleCancelVehicle = () => {
    setEditingVehicleId(null)
    setNewVehicle({ reg: '', model: '', type: 'Van', cap: '', odo: '', cost: '', status: 'Available' })
    setVehicleFormError('')
    setFieldErrors({})
    setActiveTab('Vehicles')
  }

  const fetchDrivers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/drivers')
      const data = await res.json()
      if (data.success) {
        const mapped = data.data.map((d, i) => ({
          id: d.id,
          name: d.name,
          license: d.licenseNumber,
          category: d.licenseCategory,
          expiry: d.licenseExpiryDate?.split('T')[0] ?? '',
          contact: d.contactNumber,
          safetyScore: d.safetyScore ?? 100,
          status: d.status === 'OnTrip' ? 'On Trip' : d.status,
          vehicle: 'None',
          email: d.email ?? '',
          img: `/driver${(i % 3) + 1}.png`
        }))
        setDriversList(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch drivers', err)
    }
  }

  const handleSendExpiryEmail = async (driverId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/drivers/${driverId}/send-email`, {
        method: 'POST'
      })
      if (res.ok) {
        setSentEmails(prev => [...prev, driverId])
      }
    } catch (err) {
      console.error('Failed to send expiry email', err)
    }
  }

  const handleDriverSubmit = async (e) => {
    e.preventDefault()
    setDriverFormError('')
    setDriverFieldErrors({})

    const errors = {}

    const nameClean = newDriver.name.trim()
    if (!nameClean || nameClean.length < 2) errors.name = 'Full name must be at least 2 characters'

    const licenseClean = newDriver.license.trim().toUpperCase()
    if (!licenseClean || licenseClean.length < 2) errors.license = 'License number is required'

    if (!newDriver.category) errors.category = 'License category is required'

    if (!newDriver.expiry) {
      errors.expiry = 'Expiry date is required'
    } else {
      const expiryDate = new Date(newDriver.expiry)
      if (isNaN(expiryDate.getTime())) errors.expiry = 'Invalid date format'
    }

    const contactClean = newDriver.contact.trim()
    if (!contactClean || contactClean.length < 5) errors.contact = 'Contact number must be at least 5 characters'

    if (Object.keys(errors).length > 0) {
      setDriverFieldErrors(errors)
      return
    }

    try {
      const isEditing = !!editingDriverId
      const url = isEditing 
        ? `http://localhost:5000/api/v1/drivers/${editingDriverId}` 
        : 'http://localhost:5000/api/v1/drivers'
      const method = isEditing ? 'PUT' : 'POST'

      const payload = {
        name: nameClean,
        licenseNumber: licenseClean,
        licenseCategory: newDriver.category,
        licenseExpiryDate: new Date(newDriver.expiry).toISOString(),
        contactNumber: contactClean,
        ...(isEditing ? { status: newDriver.status } : {})
      }
      if (newDriver.email?.trim()) payload.email = newDriver.email.trim()

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.status === 201 || (isEditing && res.status === 200)) {
        setNewDriver({ name: '', license: '', category: 'Class A', expiry: '', contact: '', email: '', status: 'Available' })
        setEditingDriverId(null)
        fetchDrivers()
        setActiveTab('Drivers')
      } else if (res.status === 422 && data.data?.errors) {
        const apiErrors = {}
        data.data.errors.forEach(err => { apiErrors[err.field] = err.message })
        setDriverFieldErrors(apiErrors)
        setDriverFormError('Validation failed. Please check the inputs.')
      } else {
        setDriverFormError(data.message || (isEditing ? 'Failed to update driver' : 'Failed to register driver'))
      }
    } catch (err) {
      setDriverFormError('Network error: Failed to reach the server')
    }
  }

  const handleDriverEditClick = (driver) => {
    setEditingDriverId(driver.id)
    setNewDriver({
      name: driver.name,
      license: driver.license,
      category: driver.category ?? 'Class A',
      expiry: driver.expiry,
      contact: driver.contact,
      email: driver.email,
      status: driver.status === 'On Trip' ? 'OnTrip' : driver.status === 'Off Duty' ? 'OffDuty' : driver.status
    })
    setActiveTab('Add Driver')
  }

  const handleDriverDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return
    try {
      const res = await fetch(`http://localhost:5000/api/v1/drivers/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        fetchDrivers()
      } else {
        alert(data.message || 'Failed to delete driver')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete driver')
    }
  }

  const handleCancelDriver = () => {
    setEditingDriverId(null)
    setNewDriver({ name: '', license: '', category: 'Class A', expiry: '', contact: '', email: '', status: 'Available' })
    setDriverFormError('')
    setDriverFieldErrors({})
    setActiveTab('Drivers')
  }

  const handleDispatch = (e) => {
    e.preventDefault()
    setDispatchError('')
    setDispatchSuccess('')

    if (!dispatchSource || !dispatchDestination || !dispatchWeight || !dispatchVehicleId || !dispatchDriverId) {
      setDispatchError('Please fill in all fields to dispatch the trip')
      return
    }

    const driver = driversList.find(d => d.id.toString() === dispatchDriverId)
    const vehicle = vehicles.find(v => v.id.toString() === dispatchVehicleId)

    if (!driver || !vehicle) return

    const expiryDate = new Date(driver.expiry)
    const today = new Date()
    if (expiryDate <= today) {
      setDispatchError(`Compliance Guard: Driver ${driver.name} has an expired license (Expired: ${driver.expiry})`)
      return
    }

    if (driver.status === 'Suspended') {
      setDispatchError(`Compliance Guard: Driver ${driver.name} is currently suspended and cannot be dispatched`)
      return
    }

    if (driver.status === 'On Trip') {
      setDispatchError(`Availability Guard: Driver ${driver.name} is currently on another trip`)
      return
    }

    if (vehicle.status !== 'Available') {
      setDispatchError(`Availability Guard: Vehicle ${vehicle.reg} is currently ${vehicle.status} and unavailable`)
      return
    }

    const inputWeight = parseFloat(dispatchWeight)
    const vehicleMaxCap = parseFloat(vehicle.cap.replace(/[^0-9]/g, '')) || 5000
    if (inputWeight > vehicleMaxCap) {
      setDispatchError(`Capacity Guard: Cargo weight (${inputWeight} kg) exceeds the vehicle's maximum capacity (${vehicle.cap} for ${vehicle.reg})`)
      return
    }

    const newTrip = {
      id: Date.now(),
      source: dispatchSource,
      dest: dispatchDestination,
      vehicle: vehicle.reg,
      driver: driver.name,
      weight: `${inputWeight.toLocaleString()} kg`,
      status: 'Dispatched'
    }

    // Update statuses
    setVehicles(vehicles.map(v => v.id === vehicle.id ? { ...v, status: 'On Trip' } : v))
    setDriversList(driversList.map(d => d.id === driver.id ? { ...d, status: 'On Trip', vehicle: vehicle.reg } : d))

    setActiveTrips([newTrip, ...activeTrips])
    setDispatchSuccess(`Trip successfully dispatched! ${vehicle.reg} and ${driver.name} are now marked On Trip.`)
    setDispatchSource('')
    setDispatchDestination('')
    setDispatchWeight('')
    setDispatchVehicleId('')
    setDispatchDriverId('')
  }

  // Render Sub-tab Content
  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-200">
                  <span className="text-xs uppercase font-bold tracking-wider">Fleet Utilization</span>
                  <Activity className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{kpis.fleetUtilization}%</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> active
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">{kpis.activeVehicles} of {kpis.activeVehicles + kpis.availableVehicles + kpis.vehiclesInMaintenance} operational fleet</p>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-200">
                  <span className="text-xs uppercase font-bold tracking-wider">Drivers On Duty</span>
                  <Users className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{kpis.driversOnDuty}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-505">drivers</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Available or currently active on trips</p>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-200">
                  <span className="text-xs uppercase font-bold tracking-wider">Active / Pending</span>
                  <Route className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{kpis.activeTrips} / {kpis.pendingTrips}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">trips</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Dispatched routes vs Draft bookings</p>
              </Card>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-4 shadow-sm rounded-xl">
                <div className="flex justify-between items-center text-zinc-400 dark:text-zinc-200">
                  <span className="text-xs uppercase font-bold tracking-wider">In Shop</span>
                  <Wrench className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{kpis.vehiclesInMaintenance}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">vehicles</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Undergoing active service checks</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Fleet Fuel Efficiency Trend</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Average Miles Per Gallon (MPG) across all active assets</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fuelData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                      <Line type="monotone" dataKey="efficiency" stroke="#27272a" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Vehicle Return on Investment (ROI)</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Estimated revenue vs acquisition cost percentage</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="roi" fill="#27272a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'Vehicles':
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
                  className="pl-9 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto justify-end items-center">
                {/* Custom Type Selector dropdown with arrows slightly left of the border */}
                <div className="relative w-36">
                  <select
                    value={vehicleTypeFilter}
                    onChange={(e) => setVehicleTypeFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
                  >
                    <option value="All">Type: All</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Semi">Semi</option>
                    <option value="Box Truck">Box Truck</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                </div>

                {/* Custom Status Selector dropdown */}
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

                <Button onClick={() => setActiveTab('Add Vehicle')} size="sm" className="h-8 text-sm font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 gap-1.5 border border-zinc-200 dark:border-zinc-800 select-none">
                  <Plus className="h-4 w-4" /> Add Vehicle
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((v) => {
                let imgUrl = '/van.png';
                if (v.type === 'Van') imgUrl = '/van.png';
                else if (v.type === 'Truck') imgUrl = '/truck.png';
                else if (v.type === 'Semi') imgUrl = '/semi.png';
                else if (v.type === 'Box Truck') imgUrl = '/box_truck.png';

                return (
                  <Card key={v.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden flex flex-col justify-between group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors duration-200">
                    <div>
                      {/* Vehicle Image */}
                      <div className="h-40 w-full overflow-hidden bg-zinc-50 dark:bg-zinc-955 relative border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                        <img 
                          src={imgUrl} 
                          alt={v.model} 
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className={'absolute top-3 right-3 px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full border ' + (v.status === 'Available' ? 'bg-zinc-50/90 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' : v.status === 'On Trip' ? 'bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200' : 'bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700')}>
                          {v.status}
                        </span>
                      </div>

                      {/* Card Info */}
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
                          <div>
                            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Investment</span>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{cSym}{(v.cost || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block uppercase tracking-wider text-[8px] font-bold">Total Revenue</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-405 text-xs">
                              {cSym}{(v.trips || []).filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.revenue, 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="px-4 pb-4 pt-1 flex justify-end gap-1.5">
                      <Button
                        onClick={() => handleVehicleEditClick(v)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 bg-transparent shrink-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleVehicleDelete(v.id)}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 'Drivers':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search drivers by name or license..."
                  className="pl-9 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>

              <Button onClick={() => setActiveTab('Add Driver')} size="sm" className="h-8 text-sm font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 gap-1.5 border border-zinc-200 dark:border-zinc-800 select-none">
                <Plus className="h-4 w-4" /> Add Driver
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {driversList.map((driver) => {
                const expiryDate = new Date(driver.expiry)
                const today = new Date()
                const diffTime = expiryDate.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                const expiringSoon = diffDays >= 0 && diffDays <= 30
                const alreadyExpired = diffDays < 0

                return (
                  <Card key={driver.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 relative overflow-hidden group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors duration-200 flex flex-col justify-between h-52">
                    {/* Hover Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 bg-white/90 dark:bg-zinc-900/90 p-1 rounded-lg backdrop-blur-sm shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
                      <Button
                        onClick={() => handleDriverEditClick(driver)}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-transparent shrink-0"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleDriverDelete(driver.id)}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 bg-transparent shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex gap-4">
                      {/* Driver Profile Image */}
                      <div className="h-16 w-16 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-950">
                        <img 
                          src={driver.img} 
                          alt={driver.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Driver Basic Details */}
                      <div className="space-y-1 select-text">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">{driver.name}</h4>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">Commercial Driver</p>
                        
                        <div className="pt-2 pt-2.5 space-y-1 text-xs text-zinc-650 dark:text-zinc-450">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-zinc-500">License:</span>
                            <span className="font-mono text-zinc-700 dark:text-zinc-300">{driver.license} ({driver.category})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-zinc-500">Expires:</span>
                            <span className={`font-semibold ${expiringSoon || alreadyExpired ? 'text-red-500 font-bold' : 'text-zinc-750 dark:text-zinc-300'}`}>{driver.expiry}</span>
                          </div>
                          <div className="text-zinc-700 dark:text-zinc-300">{driver.contact}</div>
                          <div className="text-zinc-500 dark:text-zinc-400 truncate w-40">{driver.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Stats / Badges */}
                    <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 flex justify-between items-center text-xs">
                      <div className="flex gap-2">
                        <span className={'px-2 py-0.5 text-[9px] font-bold rounded border ' + (driver.status === 'Available' ? 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800' : driver.status === 'On Trip' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200' : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800')}>
                          {driver.status}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded">
                          Score: {driver.safetyScore}
                        </span>
                        {(expiringSoon || alreadyExpired) && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${alreadyExpired ? 'bg-red-50/90 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-amber-50/90 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border-amber-200 dark:border-amber-800 animate-pulse'}`}>
                            {alreadyExpired ? 'Expired' : 'Expiring Soon'}
                          </span>
                        )}
                      </div>

                      {expiringSoon || alreadyExpired ? (
                        sentEmails.includes(driver.id) ? (
                          <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 select-none font-sans">
                            <CheckCircle className="h-3.5 w-3.5" /> Mail Sent
                          </span>
                        ) : (
                          <Button
                            onClick={() => handleSendExpiryEmail(driver.id)}
                            size="xs"
                            className="h-5 px-2 text-[9px] bg-red-600 dark:bg-red-700 text-white font-bold rounded hover:bg-red-700 dark:hover:bg-red-800 select-none shrink-0 border-0 flex items-center gap-1"
                          >
                            Send Mail
                          </Button>
                        )
                      ) : (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                          v: {driver.vehicle}
                        </span>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 'Tracking & GPS':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Telemetry Stream */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Live Telematics</h3>
                {trackingVehicles.map((tv) => (
                  <Card key={tv.id} className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{tv.id}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Driver: {tv.driver}</p>
                      </div>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                        {tv.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>Route Progress</span>
                        <span>{tv.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${tv.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-center border-t border-zinc-100 dark:border-zinc-800 text-xs">
                      <div>
                        <span className="text-zinc-400 block uppercase">Speed</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">{tv.speed}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase">Battery</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">{tv.battery}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase">Destination</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200 truncate block px-1">{tv.dest.split(',')[0]}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Map Mock */}
              <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white min-h-[400px] flex flex-col justify-between overflow-hidden relative rounded-xl shadow-inner">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-slate-950 opacity-40 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* SVG Route lines */}
                <svg className="absolute inset-0 w-full h-full text-zinc-800" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 100 Q 200 150 400 80 T 700 250" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 100 350 C 300 200 400 380 650 200" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M 50 250 H 750" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                </svg>

                {/* Map markers */}
                <div className="absolute top-[120px] left-[320px] group cursor-pointer z-10">
                  <div className="h-3 w-3 bg-zinc-400 rounded-full animate-ping absolute"></div>
                  <div className="h-3 w-3 bg-zinc-100 border border-black rounded-full relative"></div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[10px] font-bold py-1 px-1.5 rounded-lg shadow whitespace-nowrap opacity-90 text-white">
                    TX-8902
                  </div>
                </div>

                <div className="absolute top-[210px] left-[450px] group cursor-pointer z-10">
                  <div className="h-3 w-3 bg-zinc-400 rounded-full animate-ping absolute"></div>
                  <div className="h-3 w-3 bg-zinc-100 border border-black rounded-full relative"></div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[10px] font-bold py-1 px-1.5 rounded-lg shadow whitespace-nowrap opacity-90 text-white">
                    CA-4412
                  </div>
                </div>

                <div className="absolute top-[320px] left-[150px] group cursor-pointer z-10">
                  <div className="h-3 w-3 bg-zinc-300 border border-black rounded-full relative"></div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[10px] font-bold py-1 px-1.5 rounded-lg shadow whitespace-nowrap opacity-90 text-white">
                    FL-7711
                  </div>
                </div>

                <div className="p-4 z-10 flex justify-between bg-gradient-to-b from-black/80 to-transparent">
                  <div>
                    <h4 className="font-bold text-sm">Telemetry Vector Map</h4>
                    <p className="text-[10px] text-zinc-400">Simulation active: 3 dispatch nodes reporting</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-300 hover:text-white bg-zinc-800/80 rounded border border-zinc-700/50">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-300 hover:text-white bg-zinc-800/80 rounded border border-zinc-700/50">
                      <Map className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 z-10 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-center text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-100 inline-block animate-pulse"></span>
                    GPS Stream connected
                  </span>
                  <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-lg text-zinc-300 font-mono">
                    30.2672° N, 97.7431° W
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'Maintenance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Service Logs & Reminders</h3>
              <Button
                onClick={() => { setMaintError(''); setMaintSuccess(''); setMaintFieldErrors({}); setIsMaintFormOpen(!isMaintFormOpen); }}
                size="sm"
                className="h-8 text-sm font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-950 dark:text-zinc-955 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 gap-1.5 select-none"
              >
                <Calendar className="h-3.5 w-3.5" /> {isMaintFormOpen ? 'Close Scheduler' : 'Schedule Maintenance'}
              </Button>
            </div>

            {isMaintFormOpen && (
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
                <CardHeader className="p-0 pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Schedule Service</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500">Book maintenance for active fleet vehicles. Will set vehicle status to In Shop.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsMaintFormOpen(false)} className="h-6 w-6 rounded-full bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <form onSubmit={handleMaintSubmit} className="space-y-4">
                  {maintError && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-xs text-rose-500 rounded-lg">
                      {maintError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Select Vehicle</label>
                      <select
                        value={maintVehicleId}
                        onChange={(e) => setMaintVehicleId(e.target.value)}
                        className={`w-full p-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs focus:outline-none ${maintFieldErrors.vehicleId ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                      >
                        <option value="">Choose vehicle...</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id} disabled={v.status === 'In Shop' || v.status === 'On Trip' || v.status === 'Retired'}>
                            {v.reg} ({v.model}) [{v.status}]
                          </option>
                        ))}
                      </select>
                      {maintFieldErrors.vehicleId && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{maintFieldErrors.vehicleId}</p>}
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Service Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Brake Pads Replacement, Engine Audit"
                        value={maintDescription}
                        onChange={(e) => setMaintDescription(e.target.value)}
                        className={`w-full p-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs focus:outline-none ${maintFieldErrors.description ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                      />
                      {maintFieldErrors.description && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{maintFieldErrors.description}</p>}
                    </div>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <div className="w-1/3 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400">Cost (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={maintCost}
                        onChange={(e) => setMaintCost(e.target.value)}
                        className={`w-full p-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs focus:outline-none ${maintFieldErrors.cost ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400'}`}
                      />
                      {maintFieldErrors.cost && <p className="text-[9px] text-red-500 font-semibold mt-0.5">{maintFieldErrors.cost}</p>}
                    </div>
                    <Button type="submit" size="sm" className="h-8 bg-zinc-900 dark:bg-zinc-100 text-zinc-950 dark:text-zinc-955 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg select-none">
                      Schedule Service
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {maintSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{maintSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Maintenance Ledger</CardTitle>
                  <CardDescription className="text-[10px] text-zinc-500">Uptime audits, scheduled tasks, and repair invoices.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                        <th className="py-2.5 px-3">Service ID</th>
                        <th className="py-2.5 px-3">Vehicle</th>
                        <th className="py-2.5 px-3">Operation Type</th>
                        <th className="py-2.5 px-3">Invoice</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-zinc-400">No maintenance tasks scheduled.</td>
                        </tr>
                      ) : (
                        maintenanceLogs.map((log) => {
                          const veh = vehicles.find(v => v.id === log.vehicleId)
                          return (
                            <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                              <td className="py-3 px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-50">#{log.id}</td>
                              <td className="py-3 px-3 text-xs">{veh ? veh.reg : `ID: ${log.vehicleId}`}</td>
                              <td className="py-3 px-3 text-xs">{log.description}</td>
                              <td className="py-3 px-3 text-xs">₹{log.cost.toLocaleString()}</td>
                              <td className="py-3 px-3 text-xs text-[10px] text-zinc-500 dark:text-zinc-400">{log.date.split('T')[0]}</td>
                              <td className="py-3 px-3 text-xs">
                                <span className={'px-2.5 py-0.5 text-[10px] font-semibold rounded-full border uppercase ' + (log.status === 'Active' ? 'bg-amber-50/90 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-emerald-50/90 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800')}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-xs text-right">
                                {log.status === 'Active' && (
                                  <Button
                                    onClick={() => handleCloseMaint(log.id)}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px] bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-50 font-semibold border-zinc-200 dark:border-zinc-800 select-none"
                                  >
                                    Close Log
                                  </Button>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Maintenance Health checklist */}
              <div className="space-y-4">
                <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-4">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4 text-zinc-400" /> Pending DTC Diagnostics
                  </h4>
                  <p className="text-xs text-zinc-500">Diagnostic Trouble Codes flagged via OBD-II adapters.</p>
                  
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-start gap-3">
                      <div className="p-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-mono font-bold">P0302</div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 block">Cylinder 2 Misfire</span>
                        <span className="text-[10px] text-zinc-500 block">NY-1029 • Urgent Shop Schedule</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-start gap-3">
                      <div className="p-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-mono font-bold">C0034</div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 block">Wheel Speed Sensor</span>
                        <span className="text-[10px] text-zinc-500 block">CA-4412 • Action at next rotation</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl space-y-2">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Workshop Capacity</h4>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Shop Bays In Use</span>
                    <span>1 / 4 Bays</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: '25%' }}></div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
            )

      case 'Settings':
        return (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Fleet Operations Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General Settings Card */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">General Settings</CardTitle>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 block">Depot Name</label>
                    <div className="relative">
                      <select className="w-full appearance-none pl-3 pr-8 py-2 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none">
                        <option>Mumbai Central Depot (HQ)</option>
                        <option>Delhi Okhla Terminal</option>
                        <option>Bengaluru Whitefield Yard</option>
                        <option>Chennai Port Hub</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

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
                </div>
              </Card>

              {/* Role-Based Access Control (RBAC) Card */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
                <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Role-Based Access Control (RBAC)</CardTitle>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium">
                        <th className="py-2 pb-3">Role</th>
                        <th className="py-2 pb-3">Scope</th>
                        <th className="py-2 pb-3">Permitted Tabs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                      <tr>
                        <td className="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">Fleet Manager</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">Full</span>
                        </td>
                        <td className="py-2.5 text-zinc-500">Fleet, Maintenance, Drivers, Settings</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">Dispatcher</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[10px] font-semibold text-indigo-500">Operational</span>
                        </td>
                        <td className="py-2.5 text-zinc-500">Active Trips Dispatch & Complete Log</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">Financial Analyst</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] font-semibold text-emerald-500">Financial</span>
                        </td>
                        <td className="py-2.5 text-zinc-500">Fuel Logs, Expense Ledgers, ROI, Fuel Analytics</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">Safety Officer</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[10px] font-semibold text-rose-500">Compliance</span>
                        </td>
                        <td className="py-2.5 text-zinc-500">Active Safety Alerts, Driver Compliance Warnings</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'Add Vehicle':
        return (
          <div className="max-w-2xl mx-auto space-y-6 py-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleCancelVehicle} 
                className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {editingVehicleId ? 'Edit Vehicle' : 'Register New Vehicle'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {editingVehicleId ? 'Update details of the registered vehicle.' : 'Add a new commercial vehicle to the active fleet registry.'}
                </p>
              </div>
            </div>

            {vehicleFormError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-xl flex gap-2.5 text-xs text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{vehicleFormError}</span>
              </div>
            )}

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <form onSubmit={handleVehicleSubmit}>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Registration Number</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. TX-8902" 
                        value={newVehicle.reg}
                        onChange={(e) => setNewVehicle({...newVehicle, reg: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${fieldErrors.reg || fieldErrors.registrationNumber ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {(fieldErrors.reg || fieldErrors.registrationNumber) && (
                        <p className="text-[10px] text-red-500 font-medium">{fieldErrors.reg || fieldErrors.registrationNumber}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Model Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Ford Transit" 
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${fieldErrors.model || fieldErrors.modelName ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {(fieldErrors.model || fieldErrors.modelName) && (
                        <p className="text-[10px] text-red-500 font-medium">{fieldErrors.model || fieldErrors.modelName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Vehicle Type</label>
                      <div className="relative">
                        <select 
                          value={newVehicle.type}
                          onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                          className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                          <option value="Van">Van</option>
                          <option value="Truck">Truck</option>
                          <option value="Semi">Semi</option>
                          <option value="Box Truck">Box Truck</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Max Capacity</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 3,500 kg" 
                        value={newVehicle.cap}
                        onChange={(e) => setNewVehicle({...newVehicle, cap: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${fieldErrors.cap || fieldErrors.maxLoadCapacity ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {(fieldErrors.cap || fieldErrors.maxLoadCapacity) && (
                        <p className="text-[10px] text-red-500 font-medium">{fieldErrors.cap || fieldErrors.maxLoadCapacity}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Initial Odometer Reading</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 45,200 mi" 
                        value={newVehicle.odo}
                        onChange={(e) => setNewVehicle({...newVehicle, odo: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${fieldErrors.odo || fieldErrors.currentOdometer ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {(fieldErrors.odo || fieldErrors.currentOdometer) && (
                        <p className="text-[10px] text-red-500 font-medium">{fieldErrors.odo || fieldErrors.currentOdometer}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Acquisition Cost</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 2,50,000" 
                        value={newVehicle.cost}
                        onChange={(e) => setNewVehicle({...newVehicle, cost: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${fieldErrors.cost || fieldErrors.acquisitionCost ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {(fieldErrors.cost || fieldErrors.acquisitionCost) && (
                        <p className="text-[10px] text-red-500 font-medium">{fieldErrors.cost || fieldErrors.acquisitionCost}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Status</label>
                      <div className="relative">
                        <select 
                          value={newVehicle.status}
                          onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                          className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                          <option value="Available">Available</option>
                          <option value="OnTrip">On Trip</option>
                          <option value="InShop">In Shop</option>
                          <option value="Retired">Retired</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-2 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelVehicle}
                    className="h-9 px-4 text-xs font-semibold rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 select-none bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="h-9 px-4 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 select-none"
                  >
                    {editingVehicleId ? 'Save Changes' : 'Register Asset'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )

      case 'Add Driver':
        return (
          <div className="max-w-2xl mx-auto space-y-6 py-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleCancelDriver} 
                className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {editingDriverId ? 'Edit Operator' : 'Register New Operator'}
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  {editingDriverId ? 'Update details of the driver profile.' : 'Add a new commercial driver profile to the fleet operations.'}
                </p>
              </div>
            </div>

            {driverFormError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-xl flex gap-2.5 text-xs text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{driverFormError}</span>
              </div>
            )}

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
              <form onSubmit={handleDriverSubmit}>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Driver Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Sarah Connor" 
                        value={newDriver.name}
                        onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${driverFieldErrors.name ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {driverFieldErrors.name && <p className="text-[10px] text-red-500 font-medium">{driverFieldErrors.name}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">CDL License Number</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. CDL-A-3388" 
                        value={newDriver.license}
                        onChange={(e) => setNewDriver({...newDriver, license: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${driverFieldErrors.license || driverFieldErrors.licenseNumber ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {(driverFieldErrors.license || driverFieldErrors.licenseNumber) && <p className="text-[10px] text-red-500 font-medium">{driverFieldErrors.license || driverFieldErrors.licenseNumber}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">License Category</label>
                      <div className="relative">
                        <select 
                          value={newDriver.category}
                          onChange={(e) => setNewDriver({...newDriver, category: e.target.value})}
                          className={`w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border ${driverFieldErrors.category || driverFieldErrors.licenseCategory ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                        >
                          <option value="Class A">Class A — Heavy Combination</option>
                          <option value="Class B">Class B — Single Vehicle</option>
                          <option value="Class C">Class C — Passenger/Hazmat</option>
                          <option value="Class D">Class D — Non-Commercial</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      </div>
                      {(driverFieldErrors.category || driverFieldErrors.licenseCategory) && <p className="text-[10px] text-red-500 font-medium">{driverFieldErrors.category || driverFieldErrors.licenseCategory}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">License Expiration Date</label>
                      <input 
                        type="date" 
                        required
                        value={newDriver.expiry}
                        onChange={(e) => setNewDriver({...newDriver, expiry: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${driverFieldErrors.expiry || driverFieldErrors.licenseExpiryDate ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {(driverFieldErrors.expiry || driverFieldErrors.licenseExpiryDate) && <p className="text-[10px] text-red-500 font-medium">{driverFieldErrors.expiry || driverFieldErrors.licenseExpiryDate}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Contact Number</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. +1 (555) 345-6789" 
                        value={newDriver.contact}
                        onChange={(e) => setNewDriver({...newDriver, contact: e.target.value})}
                        className={`w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border ${driverFieldErrors.contact || driverFieldErrors.contactNumber ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none`}
                      />
                      {(driverFieldErrors.contact || driverFieldErrors.contactNumber) && <p className="text-[10px] text-red-500 font-medium">{driverFieldErrors.contact || driverFieldErrors.contactNumber}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Email Address <span className="text-zinc-400 font-normal normal-case">(optional)</span></label>
                      <input 
                        type="email"
                        placeholder="e.g. sarah.c@transitops.com" 
                        value={newDriver.email}
                        onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>
                  {editingDriverId && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-zinc-400">Status</label>
                        <div className="relative">
                          <select 
                            value={newDriver.status}
                            onChange={(e) => setNewDriver({...newDriver, status: e.target.value})}
                            className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                          >
                            <option value="Available">Available</option>
                            <option value="OnTrip">On Trip</option>
                            <option value="OffDuty">Off Duty</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-2 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelDriver}
                    className="h-9 px-4 text-xs font-semibold rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 select-none bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="h-9 px-4 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 select-none"
                  >
                    {editingDriverId ? 'Save Changes' : 'Create Profile'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )

      case 'Trip':
        return (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Fleet Dispatch Command</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Dispatch Command Form</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Initiate new dispatches. Auto-checks driver licenses, vehicle statuses, and weight limits.</CardDescription>
                </CardHeader>
                <form onSubmit={handleDispatch}>
                  <CardContent className="space-y-4">
                    {dispatchError && (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-rose-500 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{dispatchError}</span>
                      </div>
                    )}
                    {dispatchSuccess && (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-emerald-500 flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{dispatchSuccess}</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Trip Origin (Source)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dallas, TX"
                        value={dispatchSource}
                        onChange={(e) => setDispatchSource(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Trip Destination</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Houston, TX"
                        value={dispatchDestination}
                        onChange={(e) => setDispatchDestination(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Cargo Weight (kg)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 2500"
                        value={dispatchWeight}
                        onChange={(e) => setDispatchWeight(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase font-bold text-zinc-400">Assign Vehicle</label>
                      <div className="relative">
                        <select
                          value={dispatchVehicleId}
                          onChange={(e) => setDispatchVehicleId(e.target.value)}
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
                              {v.reg} ({v.model}) - Max {(v.cap || 0).toLocaleString()} {distanceUnit === 'mi' ? 'lbs' : 'kg'} [{v.status}]
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
                          value={dispatchDriverId}
                          onChange={(e) => setDispatchDriverId(e.target.value)}
                          className="w-full appearance-none pl-3 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                          <option value="">Select driver...</option>
                          {driversList.map((d) => (
                            <option
                              key={d.id}
                              value={d.id}
                              disabled={d.status !== 'Available'}
                              className={d.status !== 'Available' ? 'text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-950/20' : ''}
                            >
                              {d.name} - CDL Exp: {d.expiry} [{d.status}]
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-2">
                    <Button type="submit" className="w-full h-9 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-800 select-none">
                      Dispatch Trip
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">Active Operational Trips</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Live operational routes, tracking payloads, and driver statuses.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium text-xs">
                        <th className="py-3 px-4">Route</th>
                        <th className="py-3 px-4">Vehicle</th>
                        <th className="py-3 px-4">Driver</th>
                        <th className="py-3 px-4">Cargo Weight</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTrips.map((trip) => (
                        <tr key={trip.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-xs text-zinc-800 dark:text-zinc-200">
                          <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
                            <span className="flex items-center gap-1.5">
                              {trip.source} <ArrowLeft className="h-3 w-3 rotate-180 text-zinc-400" /> {trip.dest}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 bg-white dark:bg-zinc-900">
            <h3 className="text-xl font-bold">Placeholder View: {activeSubTab}</h3>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderSubContent()}
    </div>
  )
}
