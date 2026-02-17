import { NavLink, Outlet } from 'react-router-dom';

const nav = [
  ['Dashboard', '/dashboard'],
  ['POS', '/pos'],
  ['Tables', '/tables'],
  ['Orders', '/orders'],
  ['Kitchen', '/kitchen'],
  ['Products', '/products'],
  ['Suppliers', '/suppliers'],
  ['Inventory', '/inventory'],
  ['Accounting', '/accounting'],
  ['Reports', '/reports'],
  ['Settings', '/settings'],
  ['Activity', '/activity']
] as const;

export function AppLayout() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <aside className="bg-brand-900 text-white p-4">
        <h1 className="font-bold text-xl">Restaurant Soft</h1>
        <nav className="mt-4 grid gap-1">
          {nav.map(([name, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${isActive ? 'bg-brand-500' : 'hover:bg-brand-700'}`
              }
            >
              {name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
