import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { AlertCircle, Loader2, X, Phone, MessageSquareText, ExternalLink } from 'lucide-react';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export default function EmergencySOS() {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const [isOpen, setIsOpen] = useState(false);
    const [isTriggering, setIsTriggering] = useState(false);
    const [triggered, setTriggered] = useState(false);
    const [error, setError] = useState(null);
    const [alertData, setAlertData] = useState(null);
    const [isClosingAlert, setIsClosingAlert] = useState(false);

    // This panic tool is intended for service providers.
    if (!currentUser || currentUser.offeringType !== 'services') return null;

    const handleCloseAlert = async () => {
        if (!alertData?.alert?.id) return;
        setIsClosingAlert(true);
        setError(null);
        try {
            const response = await authenticatedFetch(`/api/sos/${alertData.alert.id}/close`, { method: 'POST' });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success) throw new Error(data.message || 'Could not close the panic alert.');
            setTriggered(false);
            setIsOpen(false);
            setAlertData(null);
        } catch (closeError) {
            setError(closeError.message || 'Could not close the panic alert.');
        } finally {
            setIsClosingAlert(false);
        }
    };

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
                    const res = await authenticatedFetch('/api/sos/trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                        })
                    });
                    const data = await res.json().catch(() => ({}));
                    
                    if (!res.ok || data.success === false) {
                        setError(data.message || 'Could not record your panic alert.');
                    } else {
                        setAlertData(data);
                        setTriggered(true);
                    }
                } catch (err) {
                    setError("The alert could not reach LoopOut. Call your saved emergency contact or local emergency services directly.");
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
                    type="button"
                    aria-label="Open service provider panic alert"
                    title="Panic alert"
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 md:w-16 md:h-16 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(225,29,72,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group"
                >
                    <AlertCircle className="w-6 h-6 md:w-8 md:h-8 animate-pulse text-white group-hover:animate-none" />
                </button>
            )}

            {/* SOS Confirmation Modal */}
            {isOpen && !triggered && (
                <div className="absolute bottom-0 right-0 w-[min(22rem,calc(100vw-2rem))] bg-gray-950 rounded-[2rem] p-5 shadow-2xl border border-rose-900/50 transform translate-y-0 origin-bottom-right transition-all">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2">
                        <X size={20} />
                    </button>
                    
                    <div className="flex flex-col items-center text-center space-y-4 mt-4">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-2">
                            <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight">EMERGENCY PROTOCOL</h3>
                        <p className="text-sm text-gray-400">Record your GPS location with LoopOut and prepare a message containing your alert code and map pin. You choose when to text each trusted contact.</p>

                        {(!currentUser?.contacts || currentUser.contacts.length === 0) && (
                            <div className="bg-rose-950/50 border border-rose-500/30 rounded-xl p-3 w-full text-left mt-2">
                                <p className="text-xs text-rose-200">
                                    <span className="font-bold text-rose-400">No trusted contacts are saved.</span> The alert can still record your map pin, but LoopOut will not contact emergency services for you.
                                </p>
                                <button 
                                    onClick={() => { setIsOpen(false); navigate('/settings'); }}
                                    className="text-[10px] font-black uppercase tracking-widest text-rose-400 mt-2 hover:text-white"
                                >
                                    Add Contacts in Settings →
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={handleTrigger}
                            disabled={isTriggering}
                            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-4 ${isTriggering ? 'bg-rose-900 text-rose-300' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]'}`}
                        >
                            {isTriggering ? (
                                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> ACQUIRING GPS SIGNAL</span>
                            ) : (
                            "RECORD PANIC ALERT"
                            )}
                        </button>
                        
                        {error && <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider">{error}</p>}
                    </div>
                </div>
            )}

            {/* Triggered Success State */}
            {triggered && (
                <div role="status" className="absolute bottom-0 right-0 w-[min(22rem,calc(100vw-2rem))] max-h-[75vh] overflow-y-auto bg-rose-700 rounded-[2rem] p-5 shadow-2xl text-white">
                    <MapPinIcon className="w-10 h-10 text-white mb-3" />
                    <h3 className="text-xl font-black tracking-tight">ALERT RECORDED</h3>
                    <p className="mt-1 text-sm text-rose-100">LoopOut saved your GPS location. Your trusted contacts have not been contacted automatically.</p>
                    <div className="mt-4 rounded-xl border border-white/20 bg-black/15 p-3 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-100">Panic alert code</p>
                        <p className="mt-1 font-mono text-lg font-black tracking-widest">{alertData?.alert?.code || 'Code unavailable'}</p>
                    </div>
                    {alertData?.mapUrl && <a href={alertData.mapUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-rose-700"><MapPinIcon className="h-4 w-4" />Open my map pin<ExternalLink className="h-3.5 w-3.5" /></a>}
                    {Array.isArray(alertData?.contacts) && alertData.contacts.length > 0 ? (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-bold text-rose-100">Share alert with your trusted contacts</p>
                            {alertData.contacts.map((contact, index) => {
                                const digits = String(contact.phone || '').replace(/[^\d+]/g, '');
                                const shareText = `LoopOut panic alert ${alertData?.alert?.code || ''}. ${currentUser.username || 'A service provider'} needs help. Current location: ${alertData?.mapUrl || ''}`;
                                return <div key={`${digits}-${index}`} className="flex items-center justify-between gap-2 rounded-xl bg-white/10 p-2.5"><div className="min-w-0"><p className="truncate text-xs font-bold">{contact.name || 'Trusted contact'}</p><p className="text-[10px] text-rose-100">{contact.phone}</p></div><div className="flex shrink-0 gap-1.5"><a href={`sms:${digits}?body=${encodeURIComponent(shareText)}`} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-2 text-[10px] font-bold text-rose-700"><MessageSquareText size={13} />Text</a><a href={`tel:${digits}`} className="inline-flex items-center gap-1 rounded-lg border border-white/30 px-2.5 py-2 text-[10px] font-bold text-white"><Phone size={13} />Call</a></div></div>;
                            })}
                        </div>
                    ) : <p className="mt-3 rounded-xl bg-black/15 p-3 text-xs text-rose-100">No trusted contacts were saved. Add one in Safety Settings. Call your local emergency services directly if you need immediate help.</p>}
                    {error && <p role="alert" className="mt-3 rounded-lg bg-black/20 p-2 text-xs">{error}</p>}
                    <button type="button" disabled={isClosingAlert} onClick={handleCloseAlert} className="mt-4 w-full rounded-xl bg-black/25 px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black/35 disabled:opacity-60">{isClosingAlert ? 'Closing alert…' : 'I’m safe · close alert'}</button>
                </div>
            )}
        </div>
    );
}
