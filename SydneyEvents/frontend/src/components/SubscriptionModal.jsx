import React, { useState } from 'react';
import axios from 'axios';
import { X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubscriptionModal = ({ isOpen, onClose, event }) => {
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/events/subscribe', {
                email,
                eventId: event._id,
                sourceUrl: event.originalUrl
            });
            // Redirect
            window.location.href = event.originalUrl;
        } catch (error) {
            alert('Error subscribing: ' + error.response?.data?.message || error.message);
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && event && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key="backdrop"
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition bg-slate-100/50 p-1 rounded-full hover:bg-slate-100">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Get Tickets</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            You are being redirected to <span className="font-semibold text-slate-700">{event.sourceWebsite}</span>. 
                            Enter your email to proceed securely.
                        </p>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                            
                            <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <input 
                                    type="checkbox" 
                                    id="consent" 
                                    required 
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <label htmlFor="consent" className="text-xs text-slate-500 leading-snug">
                                    I consent to receive updates about this event and other Sydney happenings.
                                </label>
                            </div>

                            <motion.button 
                                type="submit" 
                                disabled={!consent || loading}
                                whileHover={!(!consent || loading) ? { scale: 1.02 } : {}}
                                whileTap={!(!consent || loading) ? { scale: 0.98 } : {}}
                                className={`w-full py-3.5 rounded-xl transition font-semibold text-sm shadow-lg shadow-blue-500/10
                                    ${!consent || loading 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                                        : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:shadow-xl hover:shadow-slate-500/20'
                                    }`}
                            >
                                {loading ? 'Processing...' : 'Continue to Tickets'}
                            </motion.button>
                            <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-medium">Powered by SydneyEvents</p>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SubscriptionModal;
