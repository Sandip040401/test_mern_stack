import { Outlet } from "react-router-dom";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

export const HomeLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="w-full h-screen flex overflow-hidden">
            {/* Sidebar */}
            <div className={`h-full fixed top-0 left-0 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"}`}>
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
