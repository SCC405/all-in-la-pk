import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Admin from './pages/Admin.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Compra from './pages/Compra.jsx';
import CompraConfirmada from './pages/CompraConfirmada.jsx';
import CarritoResumen from './components/CarritoResumen.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="cabecera">
        <div className="cabecera__contenido">
          <div className="cabecera__marca">
            <span className="cabecera__palo" aria-hidden="true">♠</span>
            <div>
              <p className="cabecera__nombre">All In La PK</p>
              <p className="cabecera__lema">Artículos y accesorios de póker</p>
            </div>
          </div>
          <div className="cabecera__acciones">
            <Navbar />
            <CarritoResumen />
          </div>
        </div>
      </header>

      <main className="app__contenido">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/compra" element={<Compra />} />
          <Route path="/compra/confirmacion" element={<CompraConfirmada />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="pie">
        <p>All In La PK · Proyecto de aula</p>
      </footer>
    </div>
  );
}
