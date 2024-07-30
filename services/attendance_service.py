from datetime import date, timedelta
from sqlalchemy.orm import Session
from api.models import Attendance

def record_attendance(user_id: str, db: Session):
    today = date.today()
    
    # 오늘 날짜의 출석 기록 가져오기
    today_attendance = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.attendance_date == today
    ).first()
    
    #이미 출석 완료 했을 때
    if today_attendance:
        return today_attendance.streak
    
    # 어제의 출석 기록 가져오기
    yesterday = today - timedelta(days=1)
    previous_attendance = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.attendance_date == yesterday
    ).first()
    
    if previous_attendance:
        # 어제 출석 기록이 있는 경우 연속 출석을 증가
        streak = previous_attendance.streak + 1
    else:
        # 연속 출석이 끊긴 경우 연속 출석 초기화
        streak = 1
    
    # 기존 출석 기록 업데이트
    if previous_attendance:
        previous_attendance.attendance_date = today
        previous_attendance.streak = streak
        db.commit()
    else:
        # 이전 출석 기록이 없는 경우, 새로운 출석 기록을 생성
        new_attendance = Attendance(
            user_id=user_id,
            attendance_date=today,
            streak=streak
        )
        db.add(new_attendance)
        db.commit()
    
    return streak
