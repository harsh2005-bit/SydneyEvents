import React, { useRef, useState } from 'react';
import { MapPin, Calendar, ExternalLink, Ticket, Music } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

const EventCard = ({ event, onTicketsClick }) => {
    const ref = useRef(null);
    const [imageError, setImageError] = useState(false);

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useMotionTemplate`calc(${mouseY} * -0.5deg)`;
    const rotateY = useMotionTemplate`calc(${mouseX} * 0.5deg)`;

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;
        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;
        x.set(xPct * 20); // Sensitivity
        y.set(yPct * 20);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date TBA';
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'EEE, d MMM • h:mm a') : dateString;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'new': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'updated': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'imported': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return null;
        }
    };

    const statusStyle = getStatusStyle(event.status);

    // Generate a consistent gradient based on the event title/category
    // This is 100% fail-safe compared to external image fetch
    const getGradientFallback = (title) => {
        const lowerTitle = (title || '').toLowerCase();
        
        if (lowerTitle.includes('music') || lowerTitle.includes('concert') || lowerTitle.includes('live')) 
            return { from: 'from-violet-600', to: 'to-indigo-900', icon: Music };
            
        if (lowerTitle.includes('business') || lowerTitle.includes('tech') || lowerTitle.includes('conference')) 
            return { from: 'from-slate-700', to: 'to-slate-900', icon: Ticket };
            
        if (lowerTitle.includes('party') || lowerTitle.includes('club') || lowerTitle.includes('night')) 
            return { from: 'from-pink-500', to: 'to-rose-600', icon: Ticket };
            
        if (lowerTitle.includes('art') || lowerTitle.includes('exhibition') || lowerTitle.includes('theatre')) 
            return { from: 'from-amber-700', to: 'to-orange-900', icon: Ticket };

        return { from: 'from-blue-600', to: 'to-slate-900', icon: Calendar }; // Default
    };

    const fallbackTheme = getGradientFallback(event.title);
    const FallbackIcon = fallbackTheme.icon;

    // STAGE 2: Unsplash Fallback URLs
    // Verified high-quality images that work reliably
    const getUnsplashFallback = (title) => {
        const library = {
            music: ['1470225620780-dba8ba36b745', '1501612791284-8852403a86cd', '1459749411177-273c11a83e0d', '1493225255756-d9584f8606e9'], 
            party: ['1492684223066-81342ee5ff30', '1514525253440-b393452e3728', '1530103862676-de3c977b056e'], 
            art: ['1460661618151-0c8a06313933', '1518998053901-5348d39691e1', '1536924940846-227afb31e215'], 
            business: ['1556761175-5973ac0f96fc', '1515187029135-18ee286d815b', '1591115763516-d6781ba53448'], 
            food: ['1414235077428-338989a2e8c0', '1504674900247-0877df9cc836', '1555939594-58d7cb561ad1'], 
            tech: ['1519389950476-291149576856', '1488590528505-98d2b5aba04b', '1531297461368-756316272af4'],
            default: ['1492684223066-81342ee5ff30', '1505373877841-8d43f4ad4323', '1513151241215-eaef52f4adf8'] 
        };
        
        const lowerTitle = (title || '').toLowerCase();
        let category = 'default';
        
        if (lowerTitle.includes('music') || lowerTitle.includes('concert') || lowerTitle.includes('band') || lowerTitle.includes('live')) category = 'music';
        else if (lowerTitle.includes('art') || lowerTitle.includes('exhibition') || lowerTitle.includes('museum')) category = 'art';
        else if (lowerTitle.includes('business') || lowerTitle.includes('conference') || lowerTitle.includes('networking')) category = 'business';
        else if (lowerTitle.includes('food') || lowerTitle.includes('drink') || lowerTitle.includes('wine')) category = 'food';
        else if (lowerTitle.includes('tech') || lowerTitle.includes('code')) category = 'tech';
        
        const index = (title || '').length % library[category].length;
        return `https://images.unsplash.com/photo-${library[category][index]}?w=800&q=80`;
    };

    // Fallback State Management
    // 'original' -> tries event.imageUrl
    // 'unsplash' -> tries getUnsplashFallback
    // 'gradient' -> renders CSS gradient
    const [imageState, setImageState] = useState(event.imageUrl ? 'original' : 'unsplash');

    const handleImageError = () => {
        if (imageState === 'original') setImageState('unsplash');
        else if (imageState === 'unsplash') setImageState('gradient');
    };

    return (
        <motion.div
            ref={ref}
            // ... (keep existing props and motion logic) ...
            style={{
                perspective: 1000,
                rotateX,
                rotateY,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full"
        >
            <motion.div 
                className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full transform-gpu"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {/* Image Section */}
                <div className="h-48 overflow-hidden relative bg-slate-200">
                    {imageState !== 'gradient' ? (
                         <motion.img 
                            key={imageState} // Force remount on state change
                            src={imageState === 'original' ? event.imageUrl : getUnsplashFallback(event.title)} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.7 }}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                        />
                    ) : (
                        // STAGE 3: WARNING FALLBACK (Explicit Error Message)
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-4 text-center space-y-2">
                            <Ticket className="w-8 h-8 opacity-50 mb-1" />
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Image Unavailable</p>
                            <p className="text-[9px] leading-tight opacity-50 max-w-[150px]">
                                Source ({event.sourceWebsite || 'External'}) prevents 3rd-party image loading.
                            </p>
                        </div>
                    )}
                    
                    {/* Overlay Gradient for Text readability if needed, mostly for style */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                    
                    {/* Status Badge */}
                    {statusStyle && event.status !== 'inactive' && (
                        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${statusStyle} z-10 box-border`}>
                            {event.status}
                        </div>
                    )}

                    {/* Source Badge */}
                    <div className="absolute top-3 right-3 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm border border-white/50">
                        {event.sourceWebsite || 'Source'}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow relative z-10 bg-white">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                        {event.title}
                    </h3>
                    
                    {/* Meta Details */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-700 font-medium">
                            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="truncate">{formatDate(event.date)}</span>
                        </div>
                        
                        {(event.venue || event.address) && (
                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate">{event.venue || event.address}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                        {event.description}
                    </p>
                    
                    {/* Action Button */}
                    <div className="mt-auto pt-4 border-t border-slate-50">
                        <motion.button 
                            onClick={() => onTicketsClick(event)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full relative overflow-hidden bg-slate-900 text-white py-3 rounded-xl transition-all shadow-md group-hover:shadow-lg group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-800"
                        >
                            <span className="relative z-10 flex items-center justify-center space-x-2 font-semibold text-sm">
                                <span>Get Tickets</span>
                                <ExternalLink className="w-4 h-4" />
                            </span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default EventCard;
