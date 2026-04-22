import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const Layout = () => (
  <div className="min-h-screen flex flex-col bg-gradient-subtle">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} JIIT SCOUT — Smart Campus Navigation
    </footer>
  </div>
);