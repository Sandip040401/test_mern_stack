import { Outlet } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

export const HomeLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [serverOnline, setServerOnline] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;
    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                await axios.get(`${API_URL}/health`); // Replace with your actual API endpoint
                setServerOnline(true);
            } catch (error) {
                setServerOnline(false);
            }
        };

        checkServerStatus();
    }, []);

    if (serverOnline === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                <h3 className="text-black">Backend is deployed in render so it might take some time to load</h3>
            </div>
        );
    }

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