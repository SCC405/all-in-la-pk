# Cómo trabajamos en All In La PK

Guía corta para que Nicolay Baquero y Santiago Cifuentes trabajemos sin pisarnos el código.

---

## 1. Ramas

```
main                      ← versión estable, solo recibe merges desde develop
└── develop               ← rama de integración, aquí se juntan todas las historias
    ├── feature/HU-03-crud-categorias
    ├── feature/HU-08-catalogo
    └── feature/HU-14-admin-productos
```

- **`main`** — Nunca se trabaja directamente aquí. Solo llega código probado desde `develop`.
- **`develop`** — Rama base de todo el desarrollo. De aquí sales y aquí vuelves.
- **`feature/HU-XX-nombre-corto`** — Una rama por historia de usuario. Una sola.

Si encuentras un error en algo ya integrado, usa `fix/descripcion-corta`.

## 2. Flujo de una historia de usuario

```
Feature  →  Pull Request  →  develop  →  Pruebas  →  main
```

Paso a paso:

```bash
# 1. Parte siempre de develop actualizado
git checkout develop
git pull origin develop

# 2. Crea tu rama con el número de tu historia
git checkout -b feature/HU-03-crud-categorias

# 3. Trabaja y haz commits pequeños
git add .
git commit -m "feat(categorias): agregar endpoint POST /api/categorias"

# 4. Sube tu rama
git push -u origin feature/HU-03-crud-categorias

# 5. Abre el Pull Request hacia develop desde GitHub
```

El PR lo revisa el otro integrante. Cuando esté aprobado, se hace merge a `develop`
y **el issue de la historia se cierra solo** si el PR dice `Closes #N`.

## 3. Convención de commits

Formato: `tipo(ámbito): descripción en minúscula`

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un error |
| `style` | Estilos SCSS o formato, sin cambiar lógica |
| `refactor` | Reorganizar código sin cambiar comportamiento |
| `docs` | Documentación, README, Swagger |
| `chore` | Configuración, dependencias, scripts |
| `test` | Pruebas |

Ámbitos frecuentes: `categorias`, `productos`, `catalogo`, `carrito`, `admin`, `api`,
`seguridad`, `estilos`, `deploy`.

Ejemplos:

```
feat(productos): crear modelo de producto con validacion de precio y stock
fix(carrito): corregir total al eliminar el ultimo producto
docs(api): documentar endpoints de categorias en Swagger
chore(frontend): configurar sass y estructura de estilos
```

## 4. Antes de abrir un Pull Request

- [ ] Tu rama parte de `develop` y ya integraste los últimos cambios (`git pull origin develop`).
- [ ] El proyecto arranca sin errores (`npm run dev` en backend y/o frontend).
- [ ] Cumpliste **todos** los criterios de aceptación del issue.
- [ ] No subiste el archivo `.env` ni credenciales de MongoDB Atlas.
- [ ] El PR referencia su issue con `Closes #N`.

## 5. Regla de oro sobre `.env`

La cadena de conexión de MongoDB Atlas y cualquier secreto van **solo** en `.env`,
que está en `.gitignore`. Si necesitas agregar una variable nueva, agrégala también
a `backend/.env.example` **sin el valor real**, para que el otro sepa que existe.

Si alguna vez subes un secreto por accidente: avisa de inmediato y rota la credencial
en MongoDB Atlas. Borrarlo en un commit posterior **no** lo elimina del historial.

## 6. Resolver conflictos

Si al hacer `git pull origin develop` hay conflicto:

```bash
git pull origin develop      # aparecen los conflictos
# abre los archivos marcados, decide qué se queda
git add <archivo-resuelto>
git commit
git push
```

Ante la duda, hablarlo antes de sobrescribir trabajo del otro.

## 7. Issues

Cada historia de usuario (HU-01 … HU-27) es un issue con su descripción, criterios de
aceptación, subtareas, dependencias, puntos, sprint y responsable.

- Mueve tu issue a **In Progress** en el tablero cuando empieces.
- Marca las subtareas con `[x]` a medida que avances.
- No lo cierres a mano: que lo cierre el merge del PR.
