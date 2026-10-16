// Relleno mientras el catálogo viaja (HU-34).
//
// Sustituye al «Cargando el catálogo…» de una línea. No es adorno: dibuja la
// forma que va a tener la página, así que cuando llegan los productos nada se
// mueve de sitio. Con el texto suelto, la página saltaba de una línea a una
// rejilla entera.
//
// Importa sobre todo en Render, donde el plan gratuito duerme los servicios y
// la primera petición puede tardar casi un minuto.
const CUANTOS = 8;

export default function EsqueletoCatalogo() {
  return (
    <section className="catalogo" aria-labelledby="titulo-catalogo">
      <div className="catalogo__encabezado">
        <div>
          <h1 className="catalogo__titulo" id="titulo-catalogo">
            Catálogo
          </h1>
          {/* El estado de carga se anuncia una vez, con texto, para quien no
              ve los bloques grises. */}
          <p className="catalogo__conteo" role="status">
            Cargando el catálogo…
          </p>
        </div>
      </div>

      {/* aria-hidden porque es decoración: lo que hay que anunciar ya lo dice
          la línea de arriba, y 8 tarjetas falsas solo serían ruido. */}
      <div className="catalogo__rejilla" aria-hidden="true">
        {Array.from({ length: CUANTOS }, (_, indice) => (
          <article className="producto producto--esqueleto" key={indice}>
            <div className="producto__imagen esqueleto" />
            <div className="producto__cuerpo">
              <p className="esqueleto esqueleto__linea esqueleto__linea--corta" />
              <p className="esqueleto esqueleto__linea" />
              <p className="esqueleto esqueleto__linea esqueleto__linea--media" />
              <div className="producto__pie">
                <p className="esqueleto esqueleto__linea esqueleto__linea--precio" />
              </div>
              <p className="esqueleto esqueleto__boton" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
