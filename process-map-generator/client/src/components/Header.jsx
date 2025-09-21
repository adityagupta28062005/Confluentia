import React from 'react';
import { Code, Award, Zap } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-purple-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Left side - Team Name */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-white bg-opacity-10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            <Code className="h-5 w-5 text-yellow-300" />
                            <span className="text-white font-bold text-lg">ByteCode</span>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-white bg-opacity-30"></div>
                        <div className="hidden sm:flex items-center space-x-1 text-blue-100">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-medium">Team</span>
                        </div>
                    </div>

                    {/* Center - App Title */}
                    <div className="flex-1 flex justify-center">
                        <div className="text-center">
                            <h1 className="text-white font-bold text-xl sm:text-2xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                Process Map Generator
                            </h1>
                            <p className="text-blue-200 text-xs sm:text-sm font-medium">
                                AI-Powered Business Process Automation
                            </p>
                        </div>
                    </div>

                    {/* Right side - Hackathon Name */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden sm:flex items-center space-x-1 text-blue-100">
                            <span className="text-sm font-medium">Confluentia</span>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-white bg-opacity-30"></div>
                        <div className="flex items-center space-x-2 bg-white bg-opacity-10 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                            <img
                                src="/confluentia-logo.png"
                                alt="Confluentia Logo"
                                className="h-12 w-auto"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'inline';
                                }}
                            />
                            <span className="text-white font-bold text-lg" style={{ display: 'none' }}>Confluentia</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated bottom border */}
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse"></div>
        </header>
    );
};

export default Header;