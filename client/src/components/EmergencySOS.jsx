import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { AlertCircle, Loader2, X } from 'lucide-react';

export default function EmergencySOS() {
    const { currentUser } = useSelector((state) => state.user);
    const [isOpen, setIsOpen] = useState(false);
    const [isTriggering, setIsTriggering] = useState(false);
    const [triggered, setTriggered] = useState(false);
    const [error, setError] = useState(null);

    // Only show if user is logged in
    if (!currentUser) return null;

    const handleTrigger = () => {
        setIsTriggering(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("GPS not supported by your device.");
            setIsTriggering(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await fetch('/api/sos/trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        })
                    });
                    const data = await res.json();
                    
                    if (data.success === false) {
                        setError(data.message);
                    } else {
                        setTriggered(true);
                    }
                } catch (err) {
                    setError("Failed to reach emergency servers. Call 10111 immediately.");
                } finally {
                    setIsTriggering(false);
                }
            },
            (error) => {
                setError("Please allow GPS access for SOS to work.");
                setIsTriggering(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="fixed bottom-48 right-4 md:bottom-8 md:right-8 z-[9999]">
            {/* SOS Trigger Button */}
            {!isOpen && !triggered && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 md:w-16 md:h-16 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(225,29,72,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group"
                >
                    <AlertCircle className="w-6 h-6 md:w-8 md:h-8 animate-pulse text-white group-hover:animate-none" />
                </button>
            )}

            {/* SOS Confirmation Modal */}
            {isOpen && !triggered && (
                <div className="absolute bottom-0 right-0 w-80 md:w-96 bg-gray-950 rounded-[2.5rem] p-6 shadow-2xl border border-rose-900/50 transform translate-y-0 origin-bottom-right transition-all">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2">
                        <X size={20} />
                    </button>
                    
                    <div className="flex flex-col items-center text-center space-y-4 mt-4">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-2">
                            <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight">EMERGENCY PROTOCOL</h3>
                        <p className="text-sm text-gray-400">
                            Provide your live GPS to platform security and your emergency contacts. This action cannot be hidden.
                        </p>

                        <button 
                            onClick={handleTrigger}
                            disabled={isTriggering}
                            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-4 ${isTriggering ? 'bg-rose-900 text-rose-300' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]'}`}
                        >
                            {isTriggering ? (
                                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> ACQUIRING GPS SIGNAL</span>
                            ) : (
                                "SLIDE TO TRIGGER SOS"
                            )}
                        </button>
                        
                        {error && <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider">{error}</p>}
                    </div>
                </div>
            )}

            {/* Triggered Success State */}
            {triggered && (
                <div className="absolute bottom-0 right-0 w-80 md:w-96 bg-rose-600 rounded-[2.5rem] p-8 shadow-2xl transform translate-y-0 flex flex-col items-center text-center animate-pulse">
                    <MapPinIcon className="w-12 h-12 text-white mb-4" />
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">SOS DISPATCHED</h3>
                    <p className="text-rose-100 text-sm font-medium mb-6">
                        Remain calm. Your exact coordinates have been registered with security and your contacts.
                    </p>
                    <button 
                        onClick={() => { setTriggered(false); setIsOpen(false); }}
                        className="px-6 py-2 bg-black/20 hover:bg-black/40 rounded-full text-white text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        Dismiss Alert
                    </button>
                </div>
            )}
        </div>
    );
}
