"use client";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-lg p-6 space-y-6
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <h1 className="text-xl font-bold text-blue-700 mt-12 lg:mt-0">NADRA System</h1>

        <nav className="space-y-3">
          <a className="block p-2 rounded hover:bg-blue-100" href="#">Dashboard</a>
          <a className="block p-2 rounded hover:bg-blue-100" href="#">Tickets</a>
          <a className="block p-2 rounded hover:bg-blue-100" href="#">Settings</a>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 w-full lg:w-auto">

        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4 lg:p-6 flex justify-between items-center">
          <h2 className="text-xl lg:text-2xl font-bold ml-16 lg:ml-0">{title}</h2>
          <button className="flex items-center gap-2 p-2 px-3 lg:px-4 bg-red-500 text-white rounded text-sm lg:text-base">
            <LogOut className="h-4 w-4" />
            <Link href="/">Logout</Link>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
