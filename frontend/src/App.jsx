import EstadoConexion from './components/EstadoConexion.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app__encabezado">
        <span className="app__palo">♠</span>
        <h1 className="app__titulo">All In La PK</h1>
        <p className="app__lema">Tienda en línea de artículos de póker</p>
      </header>

      <main className="app__contenido">
        <EstadoConexion />
        <p className="app__nota">
          Frontend configurado (HU-07). El catálogo llega en HU-08 y los estilos SCSS en HU-16.
        </p>
      </main>
    </div>
  );
}
