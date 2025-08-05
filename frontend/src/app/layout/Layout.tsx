import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex">
            <aside className="w-64 fixed inset-y-0 left-0 z-30 bg-white border-r shadow-sm">
                <Sidebar />
            </aside>
            <div className="flex flex-col flex-1 ml-64 min-h-screen bg-[#F9FAFB] overflow-x-hidden">
                <Topbar />
                <main className="flex-1 py-6">{children}</main>
            </div>
        </div>
    );
};

export default Layout;