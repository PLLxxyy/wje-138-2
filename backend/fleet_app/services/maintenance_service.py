from datetime import datetime, date
from fleet_app import models


def list_records():
    return [
        {'id': 1, 'vehicleId': 1, 'type': 'Routine', 'items': ['机油', '轮胎检查'], 'cost': 2100, 'vendor': '青浦维保站', 'date': '2026-06-06', 'nextMileage': 93000, 'nextDate': '2026-09-06', 'status': 'Completed'},
        {'id': 2, 'vehicleId': 2, 'type': 'Inspection', 'items': ['年检准备'], 'cost': 980, 'vendor': '苏州车检中心', 'date': '2026-06-14', 'nextMileage': 215000, 'nextDate': '2026-08-22', 'status': 'Scheduled'},
    ]


MOCK_RECORDS = [
    {'id': 1, 'vehicleId': 1, 'type': 'Routine', 'items': ['机油', '轮胎检查'], 'cost': 2100, 'vendor': '青浦维保站', 'date': '2026-06-06', 'nextMileage': 93000, 'nextDate': '2026-09-06', 'status': 'Completed'},
    {'id': 2, 'vehicleId': 2, 'type': 'Inspection', 'items': ['年检准备'], 'cost': 980, 'vendor': '苏州车检中心', 'date': '2026-06-14', 'nextMileage': 215000, 'nextDate': '2026-08-22', 'status': 'Scheduled'},
    {'id': 3, 'vehicleId': 1, 'type': 'Routine', 'items': ['刹车片更换', '刹车油'], 'cost': 3500, 'vendor': '青浦维保站', 'date': '2026-03-10', 'nextMileage': 90000, 'nextDate': '2026-07-10', 'status': 'Completed'},
    {'id': 4, 'vehicleId': 3, 'type': 'Routine', 'items': ['机油', '机滤', '空滤'], 'cost': 1800, 'vendor': '浦东维保中心', 'date': '2026-05-20', 'nextMileage': 65000, 'nextDate': '2026-08-20', 'status': 'Completed'},
    {'id': 5, 'vehicleId': 4, 'type': 'Repair', 'items': ['发动机检修'], 'cost': 8500, 'vendor': '嘉定修理厂', 'date': '2026-04-15', 'nextMileage': 120000, 'nextDate': '2026-10-15', 'status': 'Completed'},
]


def _get_vehicle_mileage(vehicle_id):
    vehicle = models.Vehicle.objects.filter(id=vehicle_id).first()
    if vehicle:
        return vehicle.mileage
    return 0


def _get_records_data(vehicle_id):
    records = models.MaintenanceRecord.objects.filter(vehicle_id=vehicle_id).order_by('-date')
    if records.exists():
        return [
            {
                'id': r.id,
                'vehicleId': r.vehicle_id,
                'type': r.maintenance_type,
                'items': r.items,
                'cost': r.cost,
                'vendor': r.vendor,
                'date': r.date.isoformat() if r.date else None,
                'nextMileage': r.next_mileage,
                'nextDate': r.next_date.isoformat() if r.next_date else None,
                'status': r.status,
            }
            for r in records
        ]
    return [r for r in MOCK_RECORDS if r['vehicleId'] == vehicle_id]


def _parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return None


def _is_upcoming(days_until, mileage_left):
    if days_until is not None and -365 <= days_until <= 30:
        return True
    if mileage_left is not None and -50000 <= mileage_left <= 3000:
        return True
    return False


def get_vehicle_maintenance_plan(vehicle_id):
    current_mileage = _get_vehicle_mileage(vehicle_id)
    today = date.today()
    records_data = _get_records_data(vehicle_id)

    upcoming_items = []
    nearest_next_date = None
    nearest_next_mileage = None

    for record in records_data:
        next_date_str = record.get('nextDate')
        next_mileage = record.get('nextMileage')
        items = record.get('items', [])
        m_type = record.get('type')

        next_date = _parse_date(next_date_str)

        days_until = (next_date - today).days if next_date else None
        mileage_left = (next_mileage - current_mileage) if next_mileage and current_mileage else None

        if _is_upcoming(days_until, mileage_left):
            upcoming_items.append({
                'type': m_type,
                'items': items,
                'nextDate': next_date_str,
                'nextMileage': next_mileage,
                'daysUntil': days_until,
                'mileageLeft': mileage_left,
            })

        if next_date:
            if nearest_next_date is None or next_date < nearest_next_date:
                nearest_next_date = next_date
        if next_mileage:
            if nearest_next_mileage is None or next_mileage < nearest_next_mileage:
                nearest_next_mileage = next_mileage

    upcoming_items.sort(key=lambda x: x['daysUntil'] if x['daysUntil'] is not None else 9999)

    return {
        'vehicleId': vehicle_id,
        'upcomingItems': upcoming_items,
        'nearestNextDate': nearest_next_date.isoformat() if nearest_next_date else None,
        'nearestNextMileage': nearest_next_mileage,
        'currentMileage': current_mileage,
    }
