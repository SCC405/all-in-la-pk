export default function FiltroCategorias({ categorias, valor, alCambiar }) {
  return (
    <div className="filtro-categorias">
      <label className="filtro-categorias__etiqueta" htmlFor="filtro-categoria">
        Filtrar por categoría
      </label>
      <select
        className="filtro-categorias__selector"
        id="filtro-categoria"
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categorias.map((categoria) => (
          <option key={categoria._id} value={categoria._id}>
            {categoria.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
