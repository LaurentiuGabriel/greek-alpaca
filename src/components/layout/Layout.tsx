import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
