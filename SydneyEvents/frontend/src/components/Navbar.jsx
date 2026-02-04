import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, LogOut, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        // Fetch current user status
        const checkUser = async () => {
            try {
                const res = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
                setUser(res.data);
            } catch (err) {
                // Not logged in or error
                setUser(null);
            }
        };
        checkUser();

        // Close menu on click outside
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-slate-800 tracking-tight">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <span>SydneyEvents</span>
                </Link>
                
                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">Events</Link>
                    
                    {user ? (
                        <div className="relative" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition focus:outline-none"
                            >
                                {user.photos && user.photos[0] ? (
                                    <img 
                                        src={user.photos[0].value} 
                                        alt={user.displayName} 
                                        className="w-8 h-8 rounded-full border border-slate-200"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                                <span className="hidden md:block">{user.displayName}</span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.1 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-50">
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                                            <p className="text-sm font-semibold text-slate-800 truncate">{user.emails ? user.emails[0].value : user.displayName}</p>
                                        </div>
                                        <Link 
                                            to="/dashboard" 
                                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition flex items-center space-x-2 w-full"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                        <a 
                                            href="http://localhost:5000/auth/logout" 
                                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center space-x-2 w-full text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <a 
                            href="http://localhost:5000/auth/google" 
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center space-x-2"
                        >
                            <User className="w-4 h-4" />
                            <span>Admin Login</span>
                        </a>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
