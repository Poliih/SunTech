import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Menu from './components/menu/Menu';
import Dashboard from './components/pages/dashboard/Dashboard';
import Dados from './components/pages/dados/Dados'; 
import Rateio from './components/pages/rateio/Rateio'; 
import Importar from './components/pages/importar/Importar'; 
import EditarDados from './components/pages/EditarDados/EditarDados'; 
import './App.css';
import TableDetails from './components/shapes/Table/TableDetails';

function App() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuExpandido, setMenuExpandido] = useState(false);

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
    setMenuExpandido(!menuExpandido); 
  };

  return (
    <Router>
      <div className={`container ${menuAberto ? 'menu-aberto' : 'menu-fechado'}`}>
        <Menu
          menuAberto={menuAberto}
          toggleMenu={toggleMenu}
        />
        <main className={`content ${menuExpandido ? 'menu-expandido' : ''}`}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dados" element={<Dados />} />
            <Route path="/rateio" element={<Rateio />} />
            <Route path="/importar" element={<Importar />} />
            <Route path="/" element={<TableDetails />} />
            <Route path="/editar/:empresa/:uc/:mes_ref" element={<EditarDados />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
