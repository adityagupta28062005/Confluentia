import React from 'react';
import { Github, Code, Heart, Zap, Award, Users } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Team Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Code className="h-6 w-6 text-yellow-400" />
                            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                Team ByteCode
                            </h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Innovative developers passionate about automating business processes through
                            cutting-edge AI technology and intuitive design.
                        </p>
                        <div className="flex items-center space-x-2 text-blue-300">
                            <Users className="h-4 w-4" />
                            <span className="text-sm font-medium">Building the future of process automation</span>
                        </div>
                    </div>

                    {/* Project Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Zap className="h-6 w-6 text-blue-400" />
                            <h3 className="text-xl font-bold text-white">
                                Process Map Generator
                            </h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Transform your business documents into interactive BPMN process maps with
                            AI-powered risk identification and control assessment.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-blue-600 bg-opacity-50 px-2 py-1 rounded text-xs font-medium">
                                AI/ML
                            </span>
                            <span className="bg-green-600 bg-opacity-50 px-2 py-1 rounded text-xs font-medium">
                                BPMN
                            </span>
                            <span className="bg-purple-600 bg-opacity-50 px-2 py-1 rounded text-xs font-medium">
                                React
                            </span>
                            <span className="bg-orange-600 bg-opacity-50 px-2 py-1 rounded text-xs font-medium">
                                Node.js
                            </span>
                        </div>
                    </div>

                    {/* Hackathon Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Award className="h-6 w-6 text-orange-400" />
                            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                Confluentia Hackathon
                            </h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Participating in the prestigious Confluentia hackathon, showcasing innovation
                            in business process automation and digital transformation.
                        </p>
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 text-white">
                                <span className="font-semibold">Powered by Tredence</span>
                            </div>
                            <p className="text-orange-100 text-sm mt-1">
                                Driving innovation in enterprise solutions
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-2 text-gray-400">
                            <span className="text-sm">
                                © 2025 Team ByteCode. Made with
                            </span>
                            <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                            <span className="text-sm">
                                for Confluentia Hackathon
                            </span>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-1 text-gray-400 text-sm">
                                <span>Powered by</span>
                                <Zap className="h-4 w-4 text-yellow-400" />
                                <span className="font-medium text-blue-300">AI & Innovation</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-400 text-sm">
                                <span>Powered by</span>
                                <span className="font-bold text-orange-400">Tredence</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated accent */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
        </footer>
    );
};

export default Footer;