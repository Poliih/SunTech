from . import db
import unicodedata
from decimal import Decimal

class DadosConsumo(db.Model):
    __tablename__ = 'dados_consumo'
    
    usina = db.Column(db.String(255), primary_key=True)  
    uc = db.Column(db.String(255), primary_key=True)  
    mes_ref = db.Column(db.Date, primary_key=True)  
    consumo = db.Column(db.Numeric(10, 2), nullable=True)  
    injetado = db.Column(db.Numeric(10, 2), nullable=True)  
    saldo = db.Column(db.Numeric(10, 2), nullable=True)  
    Tipo_de_Instalacao = db.Column(db.String(255), nullable=True)  
    Custo_de_Disponibilidade = db.Column(db.Integer, nullable=True)  

    def to_dict_db(self):
        return {
            'usina': self.usina,
            'uc': self.uc,
            'mes_ref': self.mes_ref.strftime('%Y-%m-%d') if self.mes_ref else None,  
            'consumo': float(self.consumo) if self.consumo is not None else None,  
            'injetado': float(self.injetado) if self.injetado is not None else None,  
            'saldo': float(self.saldo) if self.saldo is not None else None,  
            'Tipo_de_Instalacao': self.Tipo_de_Instalacao,
            'Custo_de_Disponibilidade': self.Custo_de_Disponibilidade,
        }

    def to_dict_br(self):
        return {
            'usina': self.normalize_string(self.usina),
            'uc': self.normalize_string(self.uc),
            'mes_ref': self.mes_ref.strftime('%d/%m/%Y') if self.mes_ref else None,
            'consumo': f"{self.consumo:.2f}".replace('.', ',') if self.consumo is not None else None,
            'injetado': f"{self.injetado:.2f}".replace('.', ',') if self.injetado is not None else None,
            'saldo': f"{self.saldo:.2f}".replace('.', ',') if self.saldo is not None else None,
            'Tipo_de_Instalacao': self.normalize_string(self.Tipo_de_Instalacao),
            'Custo_de_Disponibilidade': self.Custo_de_Disponibilidade,
        }

    @staticmethod
    def normalize_string(value):
        if value is None:
            return None
        normalized_value = unicodedata.normalize('NFKD', value)
        return normalized_value.encode('ascii', 'ignore').decode('utf-8')

    @classmethod
    def update_record(cls, usina, uc, mes_ref, **kwargs):
        """
        Atualiza um registro específico da UC com os dados fornecidos.
        
        Args:
            usina (str): Nome da usina.
            uc (str): Unidade consumidora.
            mes_ref (datetime.date): Data de referência do mês.
            kwargs: Dados a serem atualizados.
        
        Returns:
            bool: True se a atualização foi bem-sucedida, False caso contrário.
        """
        record = cls.query.filter_by(usina=usina, uc=uc, mes_ref=mes_ref).first()
        if record:
            for key, value in kwargs.items():
                if hasattr(record, key):
                    setattr(record, key, value)
            db.session.commit()
            print("Registro atualizado com sucesso.")
            return True
        else:
            print("Registro não encontrado.")
            return False

    @classmethod
    def delete_with_confirmation(cls, usina, uc, mes_ref=None):
        """
        Pergunta ao usuário se deseja excluir todos os dados de uma UC ou apenas um registro específico.
        
        Args:
            usina (str): Nome da usina.
            uc (str): Unidade consumidora.
            mes_ref (datetime.date, optional): Data de referência do mês (se None, todos os registros da UC serão excluídos).
        
        Returns:
            bool: True se a exclusão foi bem-sucedida, False caso contrário.
        """
        if mes_ref:
            confirm = input(f"Você deseja excluir o registro da UC '{uc}' para a data {mes_ref}? (s/n): ").strip().lower()
            if confirm == 's':
                record = cls.query.filter_by(usina=usina, uc=uc, mes_ref=mes_ref).first()
                if record:
                    db.session.delete(record)
                    db.session.commit()
                    print("Registro excluído com sucesso.")
                    return True
                else:
                    print("Registro não encontrado.")
                    return False
        else:
            confirm = input(f"Você deseja excluir todos os dados da UC '{uc}'? (s/n): ").strip().lower()
            if confirm == 's':
                records = cls.query.filter_by(usina=usina, uc=uc).all()
                if records:
                    for record in records:
                        db.session.delete(record)
                    db.session.commit()
                    print("Todos os registros da UC foram excluídos com sucesso.")
                    return True
                else:
                    print("Nenhum registro encontrado para exclusão.")
                    return False
        
        print("Exclusão cancelada.")
        return False
