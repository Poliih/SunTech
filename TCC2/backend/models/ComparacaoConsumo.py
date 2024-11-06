from . import db
import unicodedata
from decimal import Decimal

class ComparacaoConsumo(db.Model):
    __tablename__ = 'comparacao_consumo'
    
    mes = db.Column(db.Text, primary_key=True)  
    media_consumo = db.Column(db.Numeric(10, 10), nullable=True)  
    media_previsao = db.Column(db.Numeric(10, 10), nullable=True)  
    correlacao = db.Column(db.Numeric(10, 10), nullable=True)
    mae = db.Column(db.Numeric(10, 10), nullable=True)  
    rmse = db.Column(db.Numeric(10, 10), nullable=True)  
    r_squared = db.Column(db.Numeric(10, 10), nullable=True)  

    def to_dict_db(self):
        return {
            'mes': self.mes,
            'media_consumo': str(self.media_consumo) if self.media_consumo is not None else None,
            'media_previsao': str(self.media_previsao) if self.media_previsao is not None else None,
            'correlacao': str(self.correlacao) if self.correlacao is not None else None,
            'mae': str(self.mae) if self.mae is not None else None,
            'rmse': str(self.rmse) if self.rmse is not None else None,
            'r_squared': str(self.r_squared) if self.r_squared is not None else None,
        }

    @staticmethod
    def normalize_string(value):
        if value is None:
            return None
        # Remove acentuação e normaliza
        normalized_value = unicodedata.normalize('NFKD', value)
        return normalized_value.encode('ascii', 'ignore').decode('utf-8')
