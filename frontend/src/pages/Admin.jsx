import { useState } from 'react';
import AdminCategorias from '../components/AdminCategorias.jsx';
import AdminProductos from '../components/AdminProductos.jsx';

export default function Admin() {
  // La página es la dueña de la lista de categorías porque los dos paneles la
  // necesitan: uno la edita y el otro la ofrece en su selector.
  const [categorias, setCategorias] = useState([]);

  return (
    <div className="admin">
      <h1 className="admin__titulo">Administración</h1>
      <p className="admin__intro">
        Gestiona el catálogo de All In La PK sin salir de aquí.
      </p>

      <div className="admin__paneles">
        <AdminCategorias onCategorias={setCategorias} />
        <AdminProductos categorias={categorias} />
      </div>
    </div>
  );
}
