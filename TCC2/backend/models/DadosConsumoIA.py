from . import db
import unicodedata

class DadosConsumoIA(db.Model):
    __tablename__ = 'dados_consumo_ia'
    
    mes_ref_previsao = db.Column(db.DateTime, primary_key=True) 
    uc = db.Column(db.Text, primary_key=True) 
    consumo_previsao = db.Column(db.Float, nullable=True)  

    def to_dict_db(self):
        """Converte os dados para o formato do banco de dados."""
        return {
            
            'mes_ref_previsao': self.mes_ref_previsao.strftime('%Y-%m-%d') if self.mes_ref_previsao else None,
            'uc': self.uc,
            'consumo_previsao': self.consumo_previsao if self.consumo_previsao is not None else None,
        }

    def to_dict_br(self):
        """Converte os dados para o formato brasileiro."""
        return {
            'uc': self.normalize_string(self.uc),
            
            'mes_ref_previsao': self.mes_ref_previsao.strftime('%d/%m/%Y') if self.mes_ref_previsao else None,
            'consumo_previsao': str(self.consumo_previsao).replace('.', ',') if self.consumo_previsao is not None else None,  
        }

    @staticmethod
    def normalize_string(value):
        """Remove acentuação e normaliza a string."""
        if value is None:
            return None
        normalized_value = unicodedata.normalize('NFKD', value)
        return normalized_value.encode('ascii', 'ignore').decode('utf-8')
