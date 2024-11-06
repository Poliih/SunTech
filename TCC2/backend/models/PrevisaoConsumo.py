from . import db

class PrevisaoConsumo(db.Model):
    __tablename__ = 'previsao_consumo'
    
    Referencia = db.Column(db.String(4), nullable=False, primary_key=True)
    N_Cliente = db.Column(db.String(255), nullable=False, primary_key=True)
    Consumo_do_mes = db.Column(db.Numeric(10, 2), nullable=True)

    def to_dict(self):
        return {
            'Referencia': self.Referencia,
            'N_Cliente': self.N_Cliente,
            'Consumo_do_mes': str(self.Consumo_do_mes) if self.Consumo_do_mes is not None else None,
        }
