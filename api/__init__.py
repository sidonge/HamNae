from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Pet, Quest

# 데이터베이스 엔진 및 세션 설정
DATABASE_URL = 'sqlite:///hamnae.db'
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

def insert_default_pets(session):
    # 기본 펫 데이터 정의
    pets = [
        Pet(pet_id='hamster', name='햄깅이', mbti='ISTP', description='햄깅이는 잠이 많은 햄스터예요. 따뜻한 마음씨를 가져서 남을 도와주는 것에 누구보다 진심이랍니다.'),
        Pet(pet_id='rabbit', name='토깽이', mbti='ESFP', description='A friendly and playful rabbit.', price=300),
        Pet(pet_id='bear', name='곰식이', mbti='INFJ', description='A strong and gentle bear.')
    ]

    for pet in pets:
        if not session.query(Pet).filter_by(pet_id=pet.pet_id).first():
            session.add(pet)

    session.commit()

def insert_default_quests(session):
    # 기본 퀘스트 데이터 정의
    quests = [
        "water_cleared_stamp",
        "clean_cleared_stamp",
        "cooking_cleared_stamp",
        "wash_cleared_stamp",
        "bed_cleared_stamp",
        "pills_cleared_stamp",
        "talk_cleared_stamp",
        "walk_cleared_stamp",
    ]
    
    for quest_name in quests:
        if not session.query(Quest).filter_by(name=quest_name).first():
            quest = Quest(name=quest_name)
            session.add(quest)

    session.commit()

def init_db():
    # 데이터베이스 테이블 생성
    Base.metadata.create_all(engine)
    # 세션 생성
    with SessionLocal() as session:
        # 기본 펫 데이터 삽입
        insert_default_pets(session)
        # 기본 퀘스트 데이터 삽입
        insert_default_quests(session)

# 패키지 초기화 시 데이터베이스 설정
init_db()
