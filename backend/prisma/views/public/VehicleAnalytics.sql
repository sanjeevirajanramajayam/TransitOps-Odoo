SELECT
  v.id,
  v.registration_number,
  v.model_name,
  v.acquisition_cost,
  COALESCE(sum(DISTINCT t.revenue), (0) :: double precision) AS total_revenue,
  COALESCE(sum(DISTINCT f.cost), (0) :: double precision) AS total_fuel_cost,
  COALESCE(sum(DISTINCT m.cost), (0) :: double precision) AS total_maintenance_cost,
  COALESCE(sum(DISTINCT e.amount), (0) :: double precision) AS total_other_expenses,
  (
    (
      COALESCE(sum(DISTINCT f.cost), (0) :: double precision) + COALESCE(sum(DISTINCT m.cost), (0) :: double precision)
    ) + COALESCE(sum(DISTINCT e.amount), (0) :: double precision)
  ) AS total_operational_cost,
  (
    COALESCE(sum(DISTINCT t.revenue), (0) :: double precision) - (
      (
        COALESCE(sum(DISTINCT f.cost), (0) :: double precision) + COALESCE(sum(DISTINCT m.cost), (0) :: double precision)
      ) + COALESCE(sum(DISTINCT e.amount), (0) :: double precision)
    )
  ) AS net_profit,
  COALESCE(
    sum(DISTINCT t.actual_distance_traveled),
    (0) :: double precision
  ) AS total_distance,
  COALESCE(sum(DISTINCT f.liters), (0) :: double precision) AS total_fuel_liters,
  CASE
    WHEN (
      COALESCE(sum(DISTINCT f.liters), (0) :: double precision) > (0) :: double precision
    ) THEN (
      COALESCE(
        sum(DISTINCT t.actual_distance_traveled),
        (0) :: double precision
      ) / COALESCE(sum(DISTINCT f.liters), (0) :: double precision)
    )
    ELSE (0) :: double precision
  END AS fuel_efficiency,
  CASE
    WHEN (v.acquisition_cost > (0) :: double precision) THEN (
      (
        COALESCE(sum(DISTINCT t.revenue), (0) :: double precision) - (
          COALESCE(sum(DISTINCT m.cost), (0) :: double precision) + COALESCE(sum(DISTINCT f.cost), (0) :: double precision)
        )
      ) / v.acquisition_cost
    )
    ELSE (0) :: double precision
  END AS roi
FROM
  (
    (
      (
        (
          transit_vehicle v
          LEFT JOIN transit_trip t ON (
            (
              (t.vehicle_id = v.id)
              AND (t.status = 'Completed' :: "TripStatus")
            )
          )
        )
        LEFT JOIN transit_fuel_log f ON ((f.vehicle_id = v.id))
      )
      LEFT JOIN transit_maintenance_log m ON ((m.vehicle_id = v.id))
    )
    LEFT JOIN transit_expense e ON ((e.vehicle_id = v.id))
  )
GROUP BY
  v.id,
  v.registration_number,
  v.model_name,
  v.acquisition_cost;