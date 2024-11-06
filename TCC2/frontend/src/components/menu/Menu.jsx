import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faCog, faChartPie, faDatabase, faBrain, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Menu.css';

const Menu = ({ menuAberto, toggleMenu }) => {
  return (
    <nav className={`menu ${menuAberto ? 'aberto' : ''}`}>
      <div className="icones-menu">
        <button 
          className={`botao-recolher ${menuAberto ? 'aberto' : ''}`} 
          onClick={toggleMenu} 
          aria-label="Toggle Menu"
        >
          <FontAwesomeIcon 
            icon={faAngleRight} 
            className={`icone-seta ${menuAberto ? 'girando' : ''}`} 
          />
        </button>
        <ul className="icones">
          <li className={`icone-chart ${menuAberto ? 'expandido' : ''}`}>
            <Link to="/dashboard">
              <FontAwesomeIcon icon={faChartPie} />
              {menuAberto && <span className="nome-menu">Dashboard</span>}
            </Link>
          </li>
          <li className={`icone-database ${menuAberto ? 'expandido' : ''}`}>
            <Link to="/dados">
              <FontAwesomeIcon icon={faDatabase} />
              {menuAberto && <span className="nome-menu">Dados</span>}
            </Link>
          </li>
          <li className={`icone-brain ${menuAberto ? 'expandido' : ''}`}>
            <Link to="/rateio">
              <FontAwesomeIcon icon={faBrain} />
              {menuAberto && <span className="nome-menu">Rateio</span>}
            </Link>
          </li>
          <li className={`icone-import ${menuAberto ? 'expandido' : ''}`}>
            <Link to="/importar">
              <FontAwesomeIcon icon={faFileImport} />
              {menuAberto && <span className="nome-menu">Importar</span>}
            </Link>
          </li>
        </ul>
      </div>
      
    </nav>
  );
};

export default Menu;
