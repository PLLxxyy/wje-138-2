from fleet_app import models


def list_records():
    records = models.MaintenanceRecord.objects.all().order_by('-date')
    if records.exists():
        return [
            {
                'id': r.id,
                'vehicleId': r.vehicle_id,
                'type': r.maintenance_type,
                'items': r.items,
                'cost': r.cost,
                'vendor': r.vendor,
                'date': r.date.isoformat() if r.date else '',
                'nextMileage': r.next_mileage,
                'nextDate': r.next_date.isoformat() if r.next_date else '',
                'status': r.status,
            }
            for r in records
        ]
    return [
        {'id': 1, 'vehicleId': 1, 'type': 'Routine', 'items': ['机油', '轮胎检查'], 'cost': 2100, 'vendor': '青浦维保站', 'date': '2026-06-06', 'nextMileage': 93000, 'nextDate': '2026-09-06', 'status': 'Completed'},
        {'id': 2, 'vehicleId': 2, 'type': 'Inspection', 'items': ['年检准备'], 'cost': 980, 'vendor': '苏州车检中心', 'date': '2026-06-14', 'nextMileage': 215000, 'nextDate': '2026-08-22', 'status': 'Scheduled'},
        {'id': 3, 'vehicleId': 1, 'type': 'Routine', 'items': ['刹车片更换', '刹车油'], 'cost': 3500, 'vendor': '青浦维保站', 'date': '2026-03-10', 'nextMileage': 90000, 'nextDate': '2026-07-10', 'status': 'Completed'},
        {'id': 4, 'vehicleId': 3, 'type': 'Routine', 'items': ['机油', '机滤', '空滤'], 'cost': 1800, 'vendor': '浦东维保中心', 'date': '2026-05-20', 'nextMileage': 65000, 'nextDate': '2026-08-20', 'status': 'Completed'},
        {'id': 5, 'vehicleId': 4, 'type': 'Repair', 'items': ['发动机检修'], 'cost': 8500, 'vendor': '嘉定修理厂', 'date': '2026-04-15', 'nextMileage': 120000, 'nextDate': '2026-10-15', 'status': 'Completed'},
        {'id': 6, 'vehicleId': 5, 'type': 'Routine', 'items': ['机油', '变速箱油'], 'cost': 2800, 'vendor': '青浦维保站', 'date': '2026-02-10', 'nextMileage': 78000, 'nextDate': '2026-07-25', 'status': 'Completed'},
        {'id': 7, 'vehicleId': 6, 'type': 'Routine', 'items': ['轮胎换位', '四轮定位'], 'cost': 1200, 'vendor': '宝山维保站', 'date': '2026-05-28', 'nextMileage': None, 'nextDate': '2026-07-05', 'status': 'Completed'},
        {'id': 8, 'vehicleId': 7, 'type': 'Routine', 'items': ['空调滤芯', '火花塞检查'], 'cost': 950, 'vendor': '松江维保中心', 'date': '2026-06-01', 'nextMileage': 52000, 'nextDate': None, 'status': 'Completed'},
    ]
