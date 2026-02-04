import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MoreHorizontal, Search, Check, RefreshCw, XCircle, Info, Filter, ArrowUpRight, Calendar, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filters, setFilters] = useState({ 
        status: '', 
        keyword: '', 
        city: 'Sydney',
        startDate: '',
        endDate: ''
    });

    // Enable credentials for Auth check
    axios.defaults.withCredentials = true;

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [filters]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/events', {
                params: filters
            });
            setEvents(res.data);
        } catch (error) {
            if(error.response && error.response.status === 401) {
                // Not logged in
                window.location.href = '/auth/google';
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (id) => {
        try {
            const res = await axios.put(`/api/admin/events/${id}/import`, {
                notes: 'Manual import via dashboard'
            });
            setEvents(events.map(e => e._id === id ? res.data : e));
            setSelectedEvent(res.data);
        } catch (error) {
            alert('Failed to import');
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'new': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'imported': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'updated': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'inactive': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 p-4 max-w-[1600px] mx-auto">
            {/* Main Table Area */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 flex flex-col overflow-hidden ring-1 ring-slate-900/5"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col gap-4 bg-white/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Event Management</h2>
                            <p className="text-slate-500 text-sm mt-1">Manage and curate crawled events</p>
                        </div>
                         <button 
                            onClick={() => fetchEvents()}
                            className="p-2.5 text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative group flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search title, venue..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm placeholder:text-slate-400"
                                value={filters.keyword}
                                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                            />
                        </div>

                        {/* City */}
                         <div className="relative min-w-[140px]">
                            <MapPin className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <select 
                                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:border-blue-300 transition-colors shadow-sm"
                                value={filters.city}
                                onChange={(e) => setFilters({...filters, city: e.target.value})}
                            >
                                <option value="Sydney">Sydney</option>
                                <option value="Melbourne">Melbourne</option>
                                <option value="Brisbane">Brisbane</option>
                                <option value="">All Cities</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="relative min-w-[140px]">
                            <Filter className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <select 
                                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:border-blue-300 transition-colors shadow-sm"
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                            >
                                <option value="">All Status</option>
                                <option value="new">New</option>
                                <option value="updated">Updated</option>
                                <option value="imported">Imported</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Discovered:</span>
                            <input 
                                type="date" 
                                className="text-sm text-slate-600 outline-none bg-transparent"
                                value={filters.startDate}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            />
                            <span className="text-slate-300">-</span>
                            <input 
                                type="date" 
                                className="text-sm text-slate-600 outline-none bg-transparent"
                                value={filters.endDate}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            />
                        </div>

                    </div>
                </div>

                {/* Table */}
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-2xl">Status</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Venue</th>
                                <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {events.map((event, idx) => (
                                <motion.tr 
                                    key={event._id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`group hover:bg-blue-50/30 cursor-pointer transition-colors duration-200 ${selectedEvent?._id === event._id ? 'bg-blue-50/80' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(event.status)} shadow-sm`}>
                                            {event.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-700 group-hover:text-blue-600 transition-colors max-w-[250px]">
                                        <div className="truncate">{event.title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {event.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div className="flex items-center gap-2 max-w-[150px]">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{event.venue}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {event.status !== 'imported' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleImport(event._id); }}
                                                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
                                            >
                                                Import
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {events.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Info className="w-10 h-10 mb-2 opacity-50" />
                            <p>No events found matching your criteria</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Side Preview Panel */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: 400 }}
                        exit={{ opacity: 0, x: 20, width: 0 }}
                        className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col ring-1 ring-slate-900/5"
                    >
                        {/* Panel Header - Sticky Image */}
                        <div className="relative h-48 shrink-0 bg-slate-100 block">
                             {selectedEvent.imageUrl ? (
                                <img src={selectedEvent.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Info className="w-12 h-12" />
                                </div>
                            )}
                            <button 
                                onClick={() => setSelectedEvent(null)} 
                                className="absolute top-4 right-4 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                            >
                                <XCircle className="w-6 h-6"/>
                            </button>
                            <div className="absolute bottom-4 left-4">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border bg-white/90 backdrop-blur ${getStatusColor(selectedEvent.status)}`}>
                                    {selectedEvent.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Scrolling Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedEvent.title}</h3>
                                <a 
                                    href={selectedEvent.originalUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 mt-2"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    {new URL(selectedEvent.originalUrl).hostname}
                                    <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm">
                                <div className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                                    <Calendar className="w-5 h-5 text-indigo-500 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-slate-900">Date & Time</div>
                                        <div className="text-slate-500">{selectedEvent.date}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                                    <MapPin className="w-5 h-5 text-rose-500 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-slate-900">Location</div>
                                        <div className="text-slate-500">{selectedEvent.venue}</div>
                                        {selectedEvent.address && <div className="text-slate-400 text-xs mt-0.5">{selectedEvent.address}</div>}
                                    </div>
                                </div>
                            </div>
 
                            {selectedEvent.description && (
                                <div className="prose prose-sm prose-slate max-w-none">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {selectedEvent.description.length > 300 
                                            ? selectedEvent.description.substring(0, 300) + '...' 
                                            : selectedEvent.description}
                                    </p>
                                </div>
                            )}

                             <div className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100">
                                Scraped at: {new Date(selectedEvent.lastScraped).toLocaleString()}
                            </div>
                        </div>

                         {/* Sticky Footer Actions */}
                        <div className="p-4 border-t border-slate-100 bg-white/50 backdrop-blur-md">
                            {selectedEvent.status !== 'imported' ? (
                                <button 
                                    onClick={() => handleImport(selectedEvent._id)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Approve & Import Event
                                </button>
                            ) : (
                                <button disabled className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                                    Already Imported
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
