import Link from 'next/link';
import * as React from 'react';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-2xl">MyApp</div>
                <div className="space-x-4">
                    <Link href="/">
                        <a className="text-gray-300 hover:text-white">Home</a>
                    </Link>
                    <Link href="/dashboard">
                        <a className="text-gray-300 hover:text-white">Dashboard</a>
                    </Link>
                    <Link href="/settings">
                        <a className="text-gray-300 hover:text-white">Settings</a>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;