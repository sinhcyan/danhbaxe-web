import React, { ReactNode } from 'react';
import Footer from './Footer';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="relative flex flex-col min-h-screen">
            <main className="pb-24 flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
