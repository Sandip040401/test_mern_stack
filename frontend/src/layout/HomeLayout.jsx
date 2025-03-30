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
            <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center">
              <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
              <h3 className="text-gray-700 text-lg font-medium">
                Backend is deployed on Render, so it might take a moment to load.
              </h3>
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