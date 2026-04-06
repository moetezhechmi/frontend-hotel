import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Calendar, Info, Clock, ExternalLink, ChevronRight, BellRing, ShoppingCart } from 'lucide-react';
import API_BASE_URL from '../config';
import * as db from '../utils/db';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientInfo, setClientInfo] = useState(null);

    useEffect(() => {
        const cid = localStorage.getItem('clientId');
        const rnum = localStorage.getItem('chambre');
        
        if (cid) {
            setClientInfo({ id: cid, chambre: rnum });
            fetchNotifications(cid);
        } else {
            navigate('/client');
        }
    }, [navigate]);

    const fetchNotifications = async (clientId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications?clientId=${clientId}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                
                // Mark all as read in local storage cache
                const cachedNotifs = await db.getNotifs();
                const updated = cachedNotifs.map(n => ({ ...n, read: true }));
                for (const n of updated) await db.saveNotif(n);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 60) return `Il y a ${diffInMins} min`;
        if (diffInHours < 24) return `Il y a ${diffInHours} h`;
        return `Il y a ${diffInDays} j`;
    };

    return (
        <div className="min-h-screen bg-[#040b28] text-white font-sans selection:bg-[#FDB813]/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#040b28]/80 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between">
                <button 
                    onClick={() => navigate('/client/services')}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-bold tracking-tight">Centre de Notifications</h1>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="pt-28 pb-10 px-6 max-w-lg mx-auto">
                {/* Hero Section */}
                <div className="mb-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FDB813] to-[#ff9900] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-[0_15px_35px_rgba(253,184,19,0.35)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <BellRing className="h-10 w-10 text-[#040b28] relative animate-shake" />
                    </div>
                    <h2 className="text-3xl font-black mb-3">Vos Messages</h2>
                    <p className="text-gray-400 font-light text-sm">Retrouvez toutes les annonces et exclusivités du Hari Club.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-[#FDB813] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-[#FDB813] uppercase tracking-widest">Chargement...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-12 text-center flex flex-col items-center gap-6 slide-up">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
                            <Info className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2">Aucun message</h3>
                            <p className="text-gray-500 text-sm font-light">Vous n'avez reçu aucune notification pour le moment.</p>
                        </div>
                        <button 
                            onClick={() => navigate('/client/services')}
                            className="bg-[#FDB813] text-[#040b28] px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif, idx) => (
                            <div 
                                key={notif.id} 
                                className="bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-[28px] p-6 transition-all duration-300 slide-up group cursor-pointer"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:from-[#FDB813]/20 group-hover:to-[#FDB813]/10 transition-colors">
                                        {notif.type === 'ORDER' ? <ShoppingCart className="h-5 w-5 text-gray-300 group-hover:text-[#FDB813]" /> : <Bell className="h-5 w-5 text-gray-300 group-hover:text-[#FDB813]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FDB813]">
                                                {notif.title || 'Hari Club'}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">
                                                {getTimeAgo(notif.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-white/90 leading-snug mb-2 group-hover:text-white transition-colors">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-[10px] font-medium">{formatDate(notif.createdAt)}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-[#FDB813] transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Tip */}
                <div className="mt-12 p-8 bg-gradient-to-br from-[#FDB813]/10 to-transparent rounded-[32px] border border-[#FDB813]/10 text-center">
                    <p className="text-xs text-gray-300 font-light leading-relaxed">
                        Ces messages sont conservés pendant 7 jours pour vous permettre de ne rien manquer de votre séjour.
                    </p>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .animate-shake {
                    animation: shake 2.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0) rotate(-2deg); }
                    20%, 80% { transform: translate3d(2px, 0, 0) rotate(4deg); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0) rotate(-6deg); }
                    40%, 60% { transform: translate3d(4px, 0, 0) rotate(6deg); }
                }
                .slide-up {
                    animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}} />
        </div>
    );
};

export default Notifications;
