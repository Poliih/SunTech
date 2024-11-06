from . import db

# Modelo para a tabela 'dados_geracao'
class DadosGeracao(db.Model):
    __tablename__ = 'dados_geracao'
    
    usina = db.Column(db.String(255), primary_key=True) 
    mes_ref = db.Column(db.Date, primary_key=True)  
    geracao = db.Column(db.Numeric(10, 2), nullable=False)

    def to_dict(self):
        return {
            'usina': self.usina,
            'mes_ref': self.mes_ref.isoformat(),  
            'geracao': float(self.geracao)  
        }
