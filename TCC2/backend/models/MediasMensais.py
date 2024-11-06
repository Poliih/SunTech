from . import db

class MediasMensais(db.Model):
    __tablename__ = 'medias_mensais'
    
    id = db.Column(db.Integer, primary_key=True)
    tabela = db.Column(db.String(255), nullable=False)
    mes = db.Column(db.Integer, nullable=False)
    media_mensal = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'tabela': self.tabela,
            'mes': self.mes,
            'media_mensal': self.media_mensal
        }