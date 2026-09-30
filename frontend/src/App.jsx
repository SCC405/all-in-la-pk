import Catalogo from './pages/Catalogo.jsx';
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

          <CarritoResumen />
        </div>
      </header>

      <main className="app__contenido">
        <Catalogo />
      </main>

      <footer className="pie">
        <p>All In La PK · Proyecto de aula</p>
      </footer>
    </div>
  );
}
