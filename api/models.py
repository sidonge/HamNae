from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import date


# 데이터베이스 엔진 생성 (SQLite 사용)
engine = create_engine('sqlite:///users.db', echo=True)

# Base 클래스 생성
Base = declarative_base()

# Users 테이블 정의
class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True, unique=True)
    name = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    tel = Column(String, nullable=True)
    join_date = Column(Date, nullable=False, default=date.today())
    xp = Column(Integer, nullable=False, default=200)

# Attendance 테이블 정의
class Attendance(Base):
    __tablename__ = 'attendances'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.id'))
    attendance_date = Column(Date, index=True)
    streak = Column(Integer)
    
    # 관계 정의
    user = relationship("User", back_populates="attendances")

# User 테이블과 Attendance 테이블 간의 관계 설정
User.attendances = relationship('Attendance', order_by=Attendance.id, back_populates='user')

# 테이블 생성
Base.metadata.create_all(engine)

# 세션 생성
Session = sessionmaker(bind=engine)
session = Session()
