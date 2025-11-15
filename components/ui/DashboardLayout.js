"use client";
import { Menu, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 space-y-6">
        <h1 className="text-xl font-bold text-blue-700">NADRA System</h1>

        <nav className="space-y-3">
          <a className="block p-2 rounded hover:bg-blue-100" href="#">Dashboard</a>
          <a className="block p-2 rounded hover:bg-blue-100" href="#">Tickets</a>
          <a className="block p-2 rounded hover:bg-blue-100" href="#">Settings</a>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button className="flex items-center gap-2 p-2 px-4 bg-red-500 text-white rounded">
            <LogOut className="h-4 w-4" />
            <Link href="/">Logout</Link>
          </button>
        </div>

        {children}
      </main>

    </div>
  );
}
