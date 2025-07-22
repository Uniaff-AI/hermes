import * as React from 'react';
import { Menu, Settings } from 'lucide-react';

const Topbar: React.FC = () => {
    return (
        <header className="h-16 w-full border-b bg-white px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <Menu className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                <h1 className="text-lg font-semibold text-gray-800">Hermes</h1>
            </div>
            <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
            </div>
        </header>
    );
};

export default Topbar;