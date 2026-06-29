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
            <div className="animate-fade-in">
                <div className={`mb-6 rounded-3xl border p-5 ${dark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className={`text-xs font-black uppercase tracking-[0.24em] ${dark ? 'text-rose-300' : 'text-rose-500'}`}>
                                Social proof
                            </p>
                            <p className={`mt-2 text-sm leading-6 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {mutuals.length === 1
                                    ? 'Someone you already know can help you feel more confident before booking.'
                                    : `${mutuals.length} people in your network are connected to this provider.`}
                            </p>
                        </div>
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${dark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-50 text-rose-500'}`}>
                            <FaUsers className="text-xl" />
                        </div>
                    </div>

                    <div className="mt-5 flex -space-x-3 overflow-hidden">
                        {mutuals.slice(0, 5).map((friend) => (
                            <Link key={friend._id} to={`/user/${friend._id}`} title={friend.username}>
                                <img
                                    className={`h-11 w-11 rounded-full object-cover ring-4 transition-transform hover:-translate-y-1 hover:scale-105 ${dark ? 'ring-slate-950' : 'ring-slate-50'}`}
                                    src={friend.avatar}
                                    alt={friend.username}
                                />
                            </Link>
                        ))}
                        {mutuals.length > 5 && (
                            <div className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-black ring-4 ${dark ? 'bg-white/10 text-white ring-slate-950' : 'bg-slate-900 text-white ring-slate-50'}`}>
                                +{mutuals.length - 5}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {mutuals.map((friend) => (
                    <Link key={friend._id} to={`/user/${friend._id}`} className={` flex min-w-0 items-center gap-4 rounded-2xl border p-4 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${dark ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-black/20' : 'border-slate-200 bg-white hover:border-rose-100 hover:bg-rose-50/40 hover:shadow-rose-500/10'}`}>
                        <div className="relative">
                            <img
                                className={`h-14 w-14 rounded-2xl object-cover ring-4 ${dark ? 'ring-slate-900 border-white/10' : 'ring-white border-gray-100'} border shadow-sm transition-transform group-hover:scale-105`}
                                src={friend.avatar}
                                alt={friend.username}
                            />
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-green-500"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-black ${dark ? 'text-white' : 'text-slate-950'}`}>{friend.username}</p>
                            <p className={`mt-1 truncate text-xs font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{friend.phone || 'Connected profile'}</p>
                        </div>
                        <div className={`ml-auto rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${dark ? 'bg-white/10 text-rose-200 group-hover:bg-rose-500/20' : 'bg-slate-100 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-600'}`}>
                            Mutual
                        </div>
                    </Link>
                ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`mt-4 p-4 rounded-2xl border ${dark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} animate-fade-in`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 ${dark ? 'bg-rose-500/20' : 'bg-[#E61E4D]/10'} rounded-lg`}>
                    <FaUsers className={`${dark ? 'text-rose-400' : 'text-[#E61E4D]'} text-sm`} />
                </div>
                <h4 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-800'}`}>Mutual Connections</h4>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                    {mutuals.slice(0, 3).map((friend) => (
                        <Link key={friend._id} to={`/user/${friend._id}`} title={friend.username}>
                            <img
                                className={`inline-block h-8 w-8 rounded-full ring-2 ${dark ? 'ring-slate-900' : 'ring-white'} hover:scale-110 transition-transform`}
                                src={friend.avatar}
                                alt={friend.username}
                            />
                        </Link>
                    ))}
                    {mutuals.length > 3 && (
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${dark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-600'} border-2 ${dark ? 'border-slate-900' : 'border-white'} text-[10px] font-bold`}>
                            +{mutuals.length - 3}
                        </div>
                    )}
                </div>

                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'} leading-relaxed`}>
                    <Link to={`/user/${mutuals[0]._id}`} className={`font-semibold hover:underline ${dark ? 'text-white' : 'text-gray-700'}`}>
                        {mutuals[0].username}
                    </Link>
                    {mutuals.length > 1 ? ` and ${mutuals.length - 1} other${mutuals.length > 2 ? 's' : ''} you know ${mutuals.length > 2 ? 'are' : 'is'} connected to this host.` : " is connected to this host."}
                </p>
            </div>
        </div>
    );
}
