export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'TransitOps API Documentation',
    version: '1.0.0',
    description: 'REST API endpoints for the TransitOps fleet, trip, expense, and safety operations dashboard.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      TransitVehicle: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          registrationNumber: { type: 'string' },
          modelName: { type: 'string' },
          vehicleType: { type: 'string' },
          maxLoadCapacity: { type: 'number' },
          currentOdometer: { type: 'number' },
          acquisitionCost: { type: 'number' },
          status: { type: 'string', enum: ['Available', 'OnTrip', 'InShop', 'Retired'] }
        }
      },
      TransitDriver: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          licenseNumber: { type: 'string' },
          licenseCategory: { type: 'string' },
          licenseExpiryDate: { type: 'string', format: 'date' },
          contactNumber: { type: 'string' },
          safetyScore: { type: 'number' },
          status: { type: 'string', enum: ['Available', 'OnTrip', 'OffDuty', 'Suspended'] },
          email: { type: 'string', format: 'email' }
        }
      },
      TransitTrip: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          source: { type: 'string' },
          destination: { type: 'string' },
          vehicleId: { type: 'integer' },
          driverId: { type: 'integer' },
          cargoWeight: { type: 'number' },
          plannedDistance: { type: 'number' },
          revenue: { type: 'number' },
          status: { type: 'string', enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'] }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/api/v1/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['FleetManager', 'SafetyOfficer', 'FinancialAnalyst', 'Dispatcher'] }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Authenticate a user and return a JWT',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      }
    },
    '/api/v1/vehicles': {
      get: {
        summary: 'Retrieve all vehicles',
        tags: ['Vehicles'],
        responses: {
          200: {
            description: 'List of vehicles',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      },
      post: {
        summary: 'Register a new vehicle',
        tags: ['Vehicles'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['registrationNumber', 'modelName', 'vehicleType', 'maxLoadCapacity', 'currentOdometer', 'acquisitionCost'],
                properties: {
                  registrationNumber: { type: 'string' },
                  modelName: { type: 'string' },
                  vehicleType: { type: 'string' },
                  maxLoadCapacity: { type: 'number' },
                  currentOdometer: { type: 'number' },
                  acquisitionCost: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Vehicle registered successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      }
    },
    '/api/v1/vehicles/{id}': {
      get: {
        summary: 'Get vehicle by ID',
        tags: ['Vehicles'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Vehicle details' }
        }
      },
      put: {
        summary: 'Update vehicle details',
        tags: ['Vehicles'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  modelName: { type: 'string' },
                  vehicleType: { type: 'string' },
                  maxLoadCapacity: { type: 'number' },
                  currentOdometer: { type: 'number' },
                  acquisitionCost: { type: 'number' },
                  status: { type: 'string', enum: ['Available', 'OnTrip', 'InShop', 'Retired'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Vehicle updated successfully' }
        }
      },
      delete: {
        summary: 'Delete a vehicle',
        tags: ['Vehicles'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Vehicle deleted successfully' }
        }
      }
    },
    '/api/v1/drivers': {
      get: {
        summary: 'Retrieve all drivers',
        tags: ['Drivers'],
        responses: {
          200: { description: 'List of drivers' }
        }
      },
      post: {
        summary: 'Register a new driver',
        tags: ['Drivers'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'licenseNumber', 'licenseCategory', 'licenseExpiryDate', 'contactNumber'],
                properties: {
                  name: { type: 'string' },
                  licenseNumber: { type: 'string' },
                  licenseCategory: { type: 'string' },
                  licenseExpiryDate: { type: 'string', format: 'date-time' },
                  contactNumber: { type: 'string' },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Driver registered successfully' }
        }
      }
    },
    '/api/v1/drivers/{id}': {
      get: {
        summary: 'Get driver details by ID',
        tags: ['Drivers'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Driver details' }
        }
      },
      put: {
        summary: 'Update driver profile',
        tags: ['Drivers'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  licenseNumber: { type: 'string' },
                  licenseCategory: { type: 'string' },
                  licenseExpiryDate: { type: 'string', format: 'date-time' },
                  contactNumber: { type: 'string' },
                  safetyScore: { type: 'number' },
                  status: { type: 'string', enum: ['Available', 'OnTrip', 'OffDuty', 'Suspended'] },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Driver updated successfully' }
        }
      },
      delete: {
        summary: 'Delete a driver',
        tags: ['Drivers'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Driver deleted successfully' }
        }
      }
    },
    '/api/v1/drivers/{id}/send-email': {
      post: {
        summary: 'Send license expiry notification email to driver',
        tags: ['Drivers'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Notification email sent successfully' }
        }
      }
    },
    '/api/v1/trips': {
      get: {
        summary: 'Retrieve all trips',
        tags: ['Trips'],
        responses: {
          200: { description: 'List of trips' }
        }
      },
      post: {
        summary: 'Create a new trip draft',
        tags: ['Trips'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['source', 'destination', 'vehicleId', 'driverId', 'cargoWeight', 'plannedDistance', 'revenue'],
                properties: {
                  source: { type: 'string' },
                  destination: { type: 'string' },
                  vehicleId: { type: 'integer' },
                  driverId: { type: 'integer' },
                  cargoWeight: { type: 'number' },
                  plannedDistance: { type: 'number' },
                  revenue: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Trip draft created successfully' }
        }
      }
    },
    '/api/v1/trips/{id}': {
      put: {
        summary: 'Modify trip details (Draft only)',
        tags: ['Trips'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  source: { type: 'string' },
                  destination: { type: 'string' },
                  vehicleId: { type: 'integer' },
                  driverId: { type: 'integer' },
                  cargoWeight: { type: 'number' },
                  plannedDistance: { type: 'number' },
                  revenue: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Trip updated successfully' }
        }
      },
      delete: {
        summary: 'Delete trip draft or cancelled trip',
        tags: ['Trips'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Trip deleted successfully' }
        }
      }
    },
    '/api/v1/trips/{id}/dispatch': {
      post: {
        summary: 'Dispatch a trip route',
        tags: ['Trips'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Trip successfully dispatched' }
        }
      }
    },
    '/api/v1/trips/{id}/complete': {
      post: {
        summary: 'Record completion of dispatched trip',
        tags: ['Trips'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['actualDistanceTraveled', 'fuelConsumed', 'finalOdometer'],
                properties: {
                  actualDistanceTraveled: { type: 'number' },
                  fuelConsumed: { type: 'number' },
                  finalOdometer: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Trip recorded as completed' }
        }
      }
    },
    '/api/v1/trips/{id}/cancel': {
      post: {
        summary: 'Cancel trip routing',
        tags: ['Trips'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Trip successfully cancelled' }
        }
      }
    },
    '/api/v1/maintenance': {
      get: {
        summary: 'Retrieve all maintenance logs',
        tags: ['Maintenance'],
        responses: {
          200: { description: 'List of logs' }
        }
      },
      post: {
        summary: 'Schedule maintenance for vehicle',
        tags: ['Maintenance'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleId', 'description', 'cost'],
                properties: {
                  vehicleId: { type: 'integer' },
                  description: { type: 'string' },
                  cost: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Maintenance service scheduled successfully' }
        }
      }
    },
    '/api/v1/maintenance/{id}/close': {
      post: {
        summary: 'Close active maintenance log',
        tags: ['Maintenance'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Maintenance log successfully closed' }
        }
      }
    },
    '/api/v1/expenses/fuel': {
      get: {
        summary: 'Retrieve all fuel logs',
        tags: ['Expenses'],
        responses: {
          200: { description: 'List of fuel logs' }
        }
      },
      post: {
        summary: 'Log a vehicle fuel fill-up',
        tags: ['Expenses'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleReg', 'liters', 'cost', 'odometerReading'],
                properties: {
                  vehicleReg: { type: 'string' },
                  liters: { type: 'number' },
                  cost: { type: 'number' },
                  odometerReading: { type: 'number' },
                  date: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Fuel log saved successfully' }
        }
      }
    },
    '/api/v1/expenses/fuel/{id}': {
      put: {
        summary: 'Update fuel fill-up record',
        tags: ['Expenses'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  vehicleReg: { type: 'string' },
                  liters: { type: 'number' },
                  cost: { type: 'number' },
                  odometerReading: { type: 'number' },
                  date: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Fuel log updated successfully' }
        }
      },
      delete: {
        summary: 'Delete fuel fill-up record',
        tags: ['Expenses'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Fuel log deleted' }
        }
      }
    },
    '/api/v1/expenses/other': {
      get: {
        summary: 'Retrieve all other expenses',
        tags: ['Expenses'],
        responses: {
          200: { description: 'List of operating expenses' }
        }
      },
      post: {
        summary: 'Log an operating expense',
        tags: ['Expenses'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicleReg', 'expenseType', 'amount', 'description'],
                properties: {
                  vehicleReg: { type: 'string' },
                  expenseType: { type: 'string' },
                  amount: { type: 'number' },
                  description: { type: 'string' },
                  date: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Operating expense logged' }
        }
      }
    },
    '/api/v1/expenses/other/{id}': {
      put: {
        summary: 'Update operating expense details',
        tags: ['Expenses'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  vehicleReg: { type: 'string' },
                  expenseType: { type: 'string' },
                  amount: { type: 'number' },
                  description: { type: 'string' },
                  date: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Operating expense updated' }
        }
      },
      delete: {
        summary: 'Delete operating expense record',
        tags: ['Expenses'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Operating expense record deleted' }
        }
      }
    },
    '/api/v1/analytics/kpis': {
      get: {
        summary: 'Get key performance metrics',
        tags: ['Analytics'],
        responses: {
          200: { description: 'KPI data' }
        }
      }
    },
    '/api/v1/analytics/reports': {
      get: {
        summary: 'Get vehicle operational cost and ROI reports',
        tags: ['Analytics'],
        responses: {
          200: { description: 'Reports list' }
        }
      }
    }
  }
}
