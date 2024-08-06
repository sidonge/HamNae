from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Pet, Quest

# 데이터베이스 엔진 및 세션 설정
DATABASE_URL = 'sqlite:///hamnae.db'
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)

def insert_default_pets(session):
    # 기본 펫 데이터 정의
    # Pet 객체 생성
    pets = [
    Pet(
        pet_id='hamster',
        name='햄깅이',
        mbti='ISTP',
        description='햄깅이는 잠이 많은 햄스터예요. 따뜻한 마음씨를 가져서 남을 도와주는 것에 누구보다 진심이랍니다.',
        short_description='낯을 조금 가린다.',
        pet_image='햄스터.png',
        sort_order=1
    ),
    Pet(
        pet_id='rabbit',
        name='교수님',
        mbti='ESFP',
        description="교수님은 지혜로운 토끼로 많은 지식을 가지고 있어요.",
        price=200,
        short_description='소심하지만 상냥하다.',
        pet_image='토끼.png',
        sort_order=3
    ),
    Pet(
        pet_id='bear',
        name='곰식이',
        mbti='INFJ',
        description='동식이는 진중하고 과묵한 곰이에요.',
        short_description='생각이 많고 사려깊다.',
        pet_image='곰.png',
        sort_order=2
    )
]


    for pet in pets:
        if not session.query(Pet).filter_by(pet_id=pet.pet_id).first():
            session.add(pet)

    session.commit()

def insert_default_quests(session):
    # 기본 퀘스트 데이터 정의
    quests = [
        "water",
        "clean",
        "cooking",
        "wash",
        "bed",
        "pills",
        "talk",
        "walk",
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
