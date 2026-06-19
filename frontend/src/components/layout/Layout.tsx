import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            Ticket Analyzer
          </Link>
          <nav className="nav">
            <Link to="/">Dashboard</Link>
            <Link to="/tickets">All Tickets</Link>
            <Link to="/submit">Submit Ticket</Link>
          </nav>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
    </div>
  );
}
