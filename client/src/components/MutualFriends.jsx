import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';

export default function MutualFriends({ targetUserId, dark = false, detailed = false }) {
    const { currentUser } = useSelector((state) => state.user);
    const [mutuals, setMutuals] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMutuals = async () => {
            if (!currentUser || !targetUserId || currentUser._id === targetUserId) return;
            try {
                setLoading(true);
                const res = await fetch(`/api/user/mutual/${targetUserId}`);
                const data = await res.json();
                if (res.ok) {
                    setMutuals(data);
                }
            } catch (err) {
                console.error('Error fetching mutual friends:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMutuals();
    }, [targetUserId, currentUser]);

    if (!currentUser || mutuals.length === 0 || currentUser._id === targetUserId) return null;

    if (detailed) {
        return (
            <div className="animate-fade-in mt-8">
                <div className={`mb-6 p-6 sm:p-8 rounded-[2rem] ${dark ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10' : 'bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100/50'} shadow-sm relative overflow-hidden`}>
                    <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none">
                        <FaUsers className="text-[12rem] text-rose-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/20">
                                <FaUsers className="text-xl" />
                            </div>
                            <h3 className={`text-2xl font-black tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>
                                Familiar Faces
                            </h3>
                        </div>
                        <p className={`mt-2 text-sm md:text-base font-medium leading-relaxed max-w-lg ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {mutuals.length === 1
                                ? `Hey! We noticed that ${mutuals[0].username} is connected here. You can reach out to your friend for a quick reference before booking.`
                                : `Awesome! ${mutuals.length} people in your network already know them. A trusted connection makes all the difference when booking.`}
                        </p>
                    </div>

                    <div className="mt-8 flex -space-x-4 overflow-hidden p-2">
                        {mutuals.slice(0, 5).map((friend) => (
                            <Link key={friend._id} to={`/user/${friend._id}`} title={friend.username}>
                                <img
                                    className={`h-14 w-14 rounded-full object-cover ring-4 transition-transform hover:-translate-y-2 hover:scale-110 shadow-lg ${dark ? 'ring-slate-800' : 'ring-rose-50'}`}
                                    src={friend.avatar}
                                    alt={friend.username}
                                />
                            </Link>
                        ))}
                        {mutuals.length > 5 && (
                            <div className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-black ring-4 shadow-lg z-10 ${dark ? 'bg-slate-700 text-white ring-slate-800' : 'bg-white text-rose-600 ring-rose-50'}`}>
                                +{mutuals.length - 5}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mutuals.map((friend) => (
                    <Link key={friend._id} to={`/user/${friend._id}`} className={`group flex min-w-0 items-center gap-4 rounded-3xl border p-4 no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${dark ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-black/40' : 'border-slate-100 bg-white hover:border-rose-200 hover:shadow-rose-500/20'}`}>
                        <div className="relative">
                            <img
                                className={`h-16 w-16 rounded-2xl object-cover ring-4 ${dark ? 'ring-slate-900 border-white/10' : 'ring-white border-slate-50'} shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                                src={friend.avatar}
                                alt={friend.username}
                            />
                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`truncate text-base font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900 group-hover:text-rose-600 transition-colors'}`}>{friend.username}</p>
                            <p className={`mt-0.5 truncate text-xs font-bold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{friend.phone || 'In your network'}</p>
                        </div>
                    </Link>
                ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`mt-4 p-4 rounded-3xl border transition-all hover:shadow-md cursor-pointer ${dark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gradient-to-r from-rose-50/50 to-transparent border-rose-100/50 hover:border-rose-200'} animate-fade-in`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${dark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-600'}`}>
                        <FaUsers className="text-sm" />
                    </div>
                    <h4 className={`text-sm font-black tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>Shared Connections</h4>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-100 px-2 py-1 rounded-full">Trust Signal</div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden shrink-0">
                    {mutuals.slice(0, 3).map((friend) => (
                        <Link key={friend._id} to={`/user/${friend._id}`} title={friend.username}>
                            <img
                                className={`inline-block h-8 w-8 rounded-full object-cover ring-2 shadow-sm transition-transform hover:scale-110 hover:z-10 relative ${dark ? 'ring-slate-900' : 'ring-white'}`}
                                src={friend.avatar}
                                alt={friend.username}
                            />
                        </Link>
                    ))}
                    {mutuals.length > 3 && (
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full shadow-sm ${dark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'} border-2 ${dark ? 'border-slate-900' : 'border-white'} text-[10px] font-black z-10 relative`}>
                            +{mutuals.length - 3}
                        </div>
                    )}
                </div>

                <p className={`text-xs font-medium leading-snug ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Link to={`/user/${mutuals[0]._id}`} className={`font-bold hover:underline ${dark ? 'text-white' : 'text-slate-900'}`}>
                        {mutuals[0].username}
                    </Link>
                    {mutuals.length > 1 ? ` and ${mutuals.length - 1} other${mutuals.length > 2 ? 's' : ''} you know ${mutuals.length > 2 ? 'are' : 'is'} connected here.` : " is also connected here."}
                </p>
            </div>
        </div>
    );
}
