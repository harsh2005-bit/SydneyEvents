import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import SubscriptionModal from '../components/SubscriptionModal';
import { Search, MapPin, CalendarX, AlertCircle, Loader2, Music, Beer, Palette, Briefcase, Heart, Tent, Mic2, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
        <div className="h-48 bg-slate-100 animate-pulse" />
        <div className="p-5 flex flex-col flex-grow space-y-4">
            <div className="h-6 bg-slate-100 rounded w-3/4 animate-pulse" />
            <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
            </div>
            <div className="space-y-2 flex-grow">
                <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse" />
            </div>
            <div className="h-10 bg-slate-100 rounded-xl w-full mt-auto animate-pulse" />
        </div>
    </div>
);

const CategoryItem = ({ icon: Icon, label, isActive }) => (
    <div className={`flex flex-col items-center space-y-3 group cursor-pointer min-w-[80px]`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border ${isActive ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 group-hover:bg-slate-50 group-hover:border-slate-300'}`}>
            <Icon className={`w-7 h-7 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
        </div>
        <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`}>{label}</span>
    </div>
);

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filters, setFilters] = useState({ keyword: '', city: 'Sydney' });
    const [activeCategory, setActiveCategory] = useState(null);



    useEffect(() => {
        fetchEvents();
    }, [filters]);


    
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.keyword) params.append('keyword', filters.keyword);
            if (filters.city) params.append('city', filters.city);
            
            const res = await axios.get('/api/events', { params });
            setEvents(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const categories = [
        { icon: Music, label: 'Music' },
        { icon: Beer, label: 'Nightlife' },
        { icon: Palette, label: 'Arts' },
        { icon: Tent, label: 'Holiday' },
        { icon: Heart, label: 'Dating' },
        { icon: Briefcase, label: 'Business' },
        { icon: Mic2, label: 'Comedy' },
        { icon: Film, label: 'Cinema' },
    ];

    return (
        <div className="space-y-12 pb-24 max-w-7xl mx-auto">
            
            {/* NEW HERO SECTION */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl mx-4 lg:mx-0 mt-6 h-[400px] md:h-[500px] flex items-center justify-center">
                <div className="absolute inset-0">
                    <img src="/hero_banner.png" alt="Live Music" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center space-y-6 px-4 max-w-4xl"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight uppercase drop-shadow-lg">
                        From <span className="text-[#ff5252]">Pop Ballads</span><br/> to <span className="text-[#7c4dff]">Emo Encores</span>
                    </h1>
                    <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors shadow-xl">
                        Get Into Live Music
                    </button>
                </motion.div>
            </div>

            {/* CATEGORY BAR */}
            <div className="flex overflow-x-auto pb-4 gap-8 justify-start lg:justify-center px-4 no-scrollbar scroll-smooth">
                {categories.map((cat, idx) => (
                    <CategoryItem key={idx} icon={cat.icon} label={cat.label} isActive={activeCategory === cat.label} />
                ))}
            </div>

            {/* ERROR BANNER */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl flex items-center justify-center space-x-3 text-sm font-medium mx-auto max-w-2xl"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Section - Centered and Floating */}
    {/* Filter Section - Centered and Floating */}
    <div className="flex flex-col items-center space-y-2 sticky top-4 z-40 w-full px-4 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto ring-1 ring-slate-900/5 w-full pointer-events-auto transition-all duration-300">
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors pointer-events-none"/>
                <input 
                    type="text" 
                    placeholder="Search events, venues..." 
                    className="w-full pl-12 pr-4 py-3 bg-transparent rounded-xl focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-700"
                    value={filters.keyword}
                    onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                />
            </div>
            <div className="w-full md:w-48 relative group border-l border-slate-200/50 md:pl-2">
                <MapPin className="absolute left-5 top-3.5 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors pointer-events-none"/>
                <select 
                    className="w-full pl-12 pr-10 py-3 bg-transparent rounded-xl focus:bg-white outline-none appearance-none transition-all text-slate-700 cursor-pointer"
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                >
                    <option value="Sydney">Sydney</option>
                    <option value="Melbourne">Melbourne</option>
                    <option value="Brisbane">Brisbane</option>
                </select>
            </div>
        </div>
        

    </div>

            {/* Main Content Area */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Fetching Sydney events...</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                    <SkeletonCard key={n} />
                                ))}
                            </div>
                        </motion.div>
                    ) : events.length === 0 && !error ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center justify-center py-24 text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                                <CalendarX className="w-10 h-10 text-slate-300" />
                            </div>
                            <div className="space-y-2 max-w-md mx-auto">
                                <h3 className="text-xl font-semibold text-slate-900">No events found</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    We couldn't find any events matching your search. 
                                    Try adjusting your filters or check back later.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="grid"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4"
                        >
                            {events.map(event => (
                                <motion.div key={event._id} variants={itemVariants}>
                                    <EventCard 
                                        event={event} 
                                        onTicketsClick={setSelectedEvent} 
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SubscriptionModal 
                isOpen={!!selectedEvent} 
                event={selectedEvent} 
                onClose={() => setSelectedEvent(null)} 
            />
        </div>
    );
};

export default Home;
