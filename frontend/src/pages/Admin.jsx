import AdminCategorias from '../components/AdminCategorias.jsx';

export default function Admin() {
  return (
    <div className="admin">
      <h1 className="admin__titulo">Administración</h1>
      <p className="admin__intro">
        Gestiona el catálogo de All In La PK sin salir de aquí.
      </p>

      <AdminCategorias />
    </div>
  );
}
