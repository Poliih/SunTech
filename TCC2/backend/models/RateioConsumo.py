from . import db


class RateioConsumo(db.Model):
    __tablename__ = 'rateio_consumo'
    
    mes = db.Column(db.Date, primary_key=True, nullable=False)
    uc = db.Column(db.String(255), primary_key=True, nullable=False)
    consumo = db.Column(db.Numeric(10, 2), nullable=True)
    rateio = db.Column(db.Numeric(5, 2), nullable=True)
    usina = db.Column(db.String(255), nullable=True)
    rateio_saldo = db.Column(db.Numeric(10, 2), nullable=True)
    mes_acaba_saldo = db.Column(db.Date, nullable=True)
    rateio_calculo = db.Column(db.Numeric(10, 2), nullable=True)  

    def to_dict(self):
        return {
            'mes': self.mes.strftime('%Y-%m-%d') if self.mes else None, 
            'uc': self.uc,
            'consumo': float(self.consumo) if self.consumo is not None else None,
            'rateio': float(self.rateio) if self.rateio is not None else None,
            'usina': self.usina,
            'rateio_saldo': float(self.rateio_saldo) if self.rateio_saldo is not None else None,
            'mes_acaba_saldo': self.mes_acaba_saldo.strftime('%Y-%m-%d') if self.mes_acaba_saldo else None,
            #rateio_calculo não é incluído
        }
