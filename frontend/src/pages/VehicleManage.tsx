import { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { vehicleApi } from '../api/vehicle';
import { maintenanceApi } from '../api/maintenance';
import type { Vehicle, MaintenanceRecord } from '../types';
import { VehicleCard } from '../components/common/VehicleCard';
import { PageShell } from './PageShell';

export function VehicleManage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      vehicleApi.list<Vehicle>().catch(() => []),
      maintenanceApi.list<MaintenanceRecord>().catch(() => []),
    ])
      .then(([v, r]) => {
        setVehicles(v);
        setRecords(r);
      })
      .finally(() => setLoading(false));
  }, []);

  const recordsByVehicle = records.reduce<Record<number, MaintenanceRecord[]>>((acc, record) => {
    if (!acc[record.vehicleId]) {
      acc[record.vehicleId] = [];
    }
    acc[record.vehicleId].push(record);
    return acc;
  }, {});

  return (
    <PageShell title="车辆管理">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              vehicle={vehicle}
              maintenanceRecords={recordsByVehicle[vehicle.id] ?? []}
              key={vehicle.id}
            />
          ))}
        </div>
      )}
      <Card title="油耗趋势" style={{ marginTop: 16 }}>
        各车油耗趋势图预留，与油耗分析页使用同一数据。
      </Card>
    </PageShell>
  );
}
