from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey, Boolean, insert
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker, Session
from datetime import date

# 데이터베이스 엔진 생성 (SQLite 사용)
engine = create_engine('sqlite:///hamnae.db', echo=True)

# Base 클래스 생성
Base = declarative_base()

# User 테이블 정의
class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True, unique=True)
    name = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    tel = Column(String, nullable=True)
    join_date = Column(Date, nullable=False, default=date.today)
    level = Column(Integer, nullable=False, default=1)
    xp = Column(Integer, nullable=False, default=200)
    coin = Column(Integer, nullable=False, default=300)
    main_pet_id = Column(String, default="hamster", nullable=True)
    
    # 관계 정의
    purchased_pets = relationship("UserPet", back_populates="user")
    attendances = relationship('Attendance', order_by='Attendance.id', back_populates='user')
    pets = relationship('UserPet', back_populates='user')
    quests = relationship('UserQuest', back_populates='user')

# Attendance 테이블 정의
class Attendance(Base):
    __tablename__ = 'attendances'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.id'))
    attendance_date = Column(Date, index=True)
    streak = Column(Integer)
    
    user = relationship("User", back_populates="attendances")

# Pet 테이블 정의
class Pet(Base):
    __tablename__ = 'pets'
    
    pet_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    mbti = Column(String, nullable=False)
    description = Column(String)
    price = Column(Integer, nullable=True, default=None)  # 가격 컬럼 추가
    short_description = Column(String)  # 짧은 설명 컬럼 추가
    pet_image = Column(String)  # 이미지 컬럼 추가
    sort_order = Column(Integer, nullable=False)  # 정렬 순서 컬럼 추가
    model_path = Column(String)

# UserPet 테이블 정의
class UserPet(Base):
    __tablename__ = 'user_pet'
    
    user_id = Column(String, ForeignKey('users.id'), primary_key=True)
    pet_id = Column(String, ForeignKey('pets.pet_id'), primary_key=True)
    custom_name = Column(String, nullable=True)  # nullable 설정

    # 관계 정의
    pet = relationship("Pet")
    user = relationship("User", back_populates="purchased_pets")

# Quest 테이블 정의
class Quest(Base):
    __tablename__ = 'quests'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    points = Column(Integer, default=150, nullable=False)
    completed = Column(Boolean, default=False) 

# UserQuest 테이블 정의
class UserQuest(Base):
    __tablename__ = 'user_quests'
    
    user_id = Column(String, ForeignKey('users.id'), primary_key=True)
    quest_id = Column(Integer, ForeignKey('quests.id'), primary_key=True)
    completed = Column(Boolean, default=False)
    claimed_xp = Column(Boolean, default=False)
    
    user = relationship('User', back_populates='quests')
    quest = relationship('Quest')

# 데이터베이스 세션 설정
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(engine)
    # 데이터베이스 세션 생성
    with Session(engine) as session:
        # 기본 캐릭터를 선택 상태로 초기화
        session.execute(insert(UserPet).values(selected_character=0))
        session.execute(insert(UserPet).where(UserPet.pet_id == 'hamster').values(selected_character=1))
        session.commit()

# 데이터베이스 초기화 호출
if __name__ == "__main__":
    init_db()
