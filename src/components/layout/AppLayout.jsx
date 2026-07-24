export default function Layout({ header, sidebar, children }) {
  return (
    <div className="min-h-screen bg-slate-100">

      <header>
        {header}
      </header>

      <div className="flex h-[calc(100vh-64px)]">

        <aside className="hidden lg:block w-72 border-r bg-white overflow-y-auto">
          {sidebar}
        </aside>

        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>

      </div>

    </div>
  );
}