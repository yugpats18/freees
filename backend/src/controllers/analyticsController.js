const pool = require('../config/database');

const getDashboardKPIs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'On Trip' THEN 1 END) as active_fleet,
        COUNT(CASE WHEN status = 'In Shop' THEN 1 END) as maintenance_alerts,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as available_vehicles,
        COUNT(*) as total_vehicles,
        ROUND((COUNT(CASE WHEN status IN ('On Trip', 'In Shop') THEN 1 END)::numeric / 
               NULLIF(COUNT(*)::numeric, 0)) * 100, 2) as utilization_rate
      FROM vehicles
      WHERE status != 'Retired'
    `);

    const tripsResult = await pool.query(`
      SELECT COUNT(*) as pending_cargo
      FROM trips
      WHERE status = 'Draft'
    `);

    res.json({
      ...result.rows[0],
      pending_cargo: parseInt(tripsResult.rows[0].pending_cargo)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFuelEfficiency = async (req, res) => {
  try {
    const { vehicle_id } = req.query;
    let query = `
      SELECT 
        v.id,
        v.model_name,
        v.license_plate,
        v.odometer,
        COALESCE(SUM(e.fuel_liters), 0) as total_fuel,
        CASE 
          WHEN COALESCE(SUM(e.fuel_liters), 0) > 0 
          THEN ROUND(v.odometer / SUM(e.fuel_liters), 2)
          ELSE 0 
        END as fuel_efficiency
      FROM vehicles v
      LEFT JOIN expenses e ON v.id = e.vehicle_id AND e.expense_type = 'Fuel'
      WHERE v.status != 'Retired'
    `;
    const params = [];

    if (vehicle_id) {
      query += ' AND v.id = $1';
      params.push(vehicle_id);
    }

    query += ' GROUP BY v.id, v.model_name, v.license_plate, v.odometer ORDER BY fuel_efficiency DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVehicleROI = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id,
        v.model_name,
        v.license_plate,
        v.acquisition_cost,
        COALESCE(SUM(t.revenue), 0) as total_revenue,
        COALESCE(SUM(e.cost), 0) as fuel_cost,
        COALESCE((SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = v.id), 0) as maintenance_cost,
        COALESCE(SUM(t.revenue), 0) - (COALESCE(SUM(e.cost), 0) + 
          COALESCE((SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = v.id), 0)) as net_profit,
        CASE 
          WHEN v.acquisition_cost > 0 THEN
            ROUND(((COALESCE(SUM(t.revenue), 0) - (COALESCE(SUM(e.cost), 0) + 
              COALESCE((SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = v.id), 0))) / 
              v.acquisition_cost) * 100, 2)
          ELSE 0
        END as roi_percentage
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id AND t.status = 'Completed'
      LEFT JOIN expenses e ON v.id = e.vehicle_id
      WHERE v.status != 'Retired'
      GROUP BY v.id, v.model_name, v.license_plate, v.acquisition_cost
      ORDER BY roi_percentage DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportReport = async (req, res) => {
  try {
    const { type } = req.params;
    
    let query = '';
    if (type === 'vehicles') {
      query = 'SELECT * FROM vehicles ORDER BY created_at DESC';
    } else if (type === 'trips') {
      query = 'SELECT * FROM trips ORDER BY created_at DESC';
    } else if (type === 'expenses') {
      query = 'SELECT * FROM expenses ORDER BY expense_date DESC';
    }

    const result = await pool.query(query);
    
    // Convert to CSV format
    if (result.rows.length === 0) {
      return res.json({ data: [] });
    }

    const headers = Object.keys(result.rows[0]);
    const csv = [
      headers.join(','),
      ...result.rows.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboardKPIs, getFuelEfficiency, getVehicleROI, exportReport };
