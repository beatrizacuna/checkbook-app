from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.config import Base

class CheckBook(Base):
    __tablename__ = 'checkbooks'

    id=Column(Integer, primary_key=True, index=True)
    bank_name=Column(String)
    min_range = Column(Integer)
    max_range = Column(Integer)

    checks = relationship("Check", back_populates="checkbook")

    def __init__(self, bank_name, min_range, max_range, checks=None):
        # Verificar que el rango cumple con las condiciones
        if min_range >= max_range:
            raise ValueError("El rango mínimo debe ser menor que el rango máximo.")
        elif (max_range - min_range) > 30:
            raise ValueError("La diferencia entre los rangos no debe exceder los 30 valores.")

        self.bank_name = bank_name
        self.min_range = min_range
        self.max_range = max_range

        if checks is not None:
            self.checks = [Check(**check_data) for check_data in checks]

class Check(Base):
    __tablename__ = 'checks'

    id=Column(Integer, primary_key=True, index=True)
    check_number = Column(Integer)
    checkbook_id=Column(Integer, ForeignKey("checkbooks.id"))

    checkbook = relationship("CheckBook", back_populates="checks")