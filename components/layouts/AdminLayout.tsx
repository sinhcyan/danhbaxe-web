import React, { ReactNode } from 'react';

interface AdminLayoutProps {
    sidebar: ReactNode;
    header: ReactNode;
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ sidebar, header, children }) => {
    return (
        <div className="min-h-screen flex p-4 md:p-6 gap-6">
            {sidebar}
            <div className="flex-1 glass-heavy rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
                {header}
                <main className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
