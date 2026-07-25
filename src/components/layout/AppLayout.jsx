export default function Layout({ header, sidebar, children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      <header>
        {header}
      </header>

      <div className="flex flex-1 overflow-hidden">

        <aside className="hidden lg:block w-72 border-r bg-white overflow-y-auto">
          {sidebar}
        </aside>

        <main className="flex-1 overflow-y-auto px-2 py-3 lg:px-4 lg:py-4">
          {children}
        </main>

      </div>

    </div>
  );
}