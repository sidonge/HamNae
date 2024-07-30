from datetime import date, timedelta
from sqlalchemy.orm import Session
from api.models import Attendance

def record_attendance(user_id: str, db: Session):
    today = date.today()
    
    # 사용자의 최근 출석 기록을 가져옵니다.
    last_attendance = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.attendance_date == today
    ).first()
    
    if last_attendance:
        # 오늘 이미 출석을 찍었으므로, 아무 작업도 하지 않습니다.
        return last_attendance.streak
    
    # 어제의 출석 기록을 가져옵니다.
    yesterday = today - timedelta(days=1)
    previous_attendance = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.attendance_date == yesterday
    ).first()
    
    # 연속 출석을 계산합니다.
    streak = 1  # 기본값 1일 출석
    if previous_attendance:
        streak = previous_attendance.streak + 1
    
    # 새로운 출석 기록을 생성합니다.
    new_attendance = Attendance(
        user_id=user_id,
        attendance_date=today,
        streak=streak
    )
    db.add(new_attendance)
    db.commit()
    
    return streak