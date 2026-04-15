import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUsers } from 'react-icons/fa';

export default function MutualFriends({ targetUserId, dark = false }) {
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
                        <img
                            key={friend._id}
                            className={`inline-block h-8 w-8 rounded-full ring-2 ${dark ? 'ring-slate-900' : 'ring-white'}`}
                            src={friend.avatar}
                            alt={friend.username}
                            title={friend.username}
                        />
                    ))}
                    {mutuals.length > 3 && (
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${dark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-600'} border-2 ${dark ? 'border-slate-900' : 'border-white'} text-[10px] font-bold`}>
                            +{mutuals.length - 3}
                        </div>
                    )}
                </div>
                
                <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'} leading-relaxed`}>
                    <span className={`font-semibold ${dark ? 'text-white' : 'text-gray-700'}`}>
                        {mutuals[0].username}
                    </span>
                    {mutuals.length > 1 ? ` and ${mutuals.length - 1} other${mutuals.length > 2 ? 's' : ''} you know ${mutuals.length > 2 ? 'are' : 'is'} connected to this host.` : " is connected to this host."}
                </p>
            </div>
        </div>
    );
}
