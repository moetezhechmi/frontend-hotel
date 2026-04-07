import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { LogOut, Coffee, Wifi, Phone, BellRing, ChevronRight, X, Minus, Plus, CheckCircle2, History, Clock, Check, ShoppingCart, Waves, Globe, Calendar, Home, Utensils, ClipboardList, WifiOff, Lock, User, Search, MapPin, Navigation } from 'lucide-react';


import { translations } from '../translations';
import * as db from '../utils/db';
import { transformImageUrl } from '../utils/cdn';
import API_BASE_URL, { VAPID_PUBLIC_KEY } from '../config';
import axios from 'axios';


const ClientHome = () => {
    const navigate = useNavigate();
    const [clientInfo, setClientInfo] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'room-service', 'demandes', 'history'
    const [cart, setCart] = useState([]);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [demandeNotes, setDemandeNotes] = useState('');
    const [myActivity, setMyActivity] = useState({ orders: [], services: [] });
    const [notifications, setNotifications] = useState([]);
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [lang, setLang] = useState('fr');
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activityCategory, setActivityCategory] = useState(null); // 'spa' or 'excursion'
    const [hotelActivities, setHotelActivities] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [isOfflineMode, setIsOfflineMode] = useState(localStorage.getItem('offlineMode') === 'true');
    const [isNetworkOffline, setIsNetworkOffline] = useState(!window.navigator.onLine);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [historyTypeFilter, setHistoryTypeFilter] = useState('all'); // 'all', 'order', 'service'
    const [historySearch, setHistorySearch] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setIsSubscribed(Notification.permission === 'granted');
        }
    }, []);

    const handleSubscribe = async () => {
        console.log('--- Tentative d\'activation des notifications ---');
        if (!('serviceWorker' in navigator)) {
            console.error('Service Worker non supporté par ce navigateur.');
            return;
        }
        if (!('PushManager' in window)) {
            console.error('PushManager non supporté par ce navigateur.');
            return;
        }
        
        try {
            console.log('Attente du Service Worker...');
            const registration = await navigator.serviceWorker.ready;
            console.log('Service Worker prêt ! Demande de permission...');

            const permission = await Notification.requestPermission();
            console.log('Résultat de la demande de permission:', permission);
            
            if (permission === 'granted') {
                console.log('Génération de l\'abonnement Push...');
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: VAPID_PUBLIC_KEY
                });
                
                console.log('Envoi de l\'abonnement au backend...');
                await axios.post(`${API_BASE_URL}/api/notifications/subscribe`, {
                    clientId: clientInfo.id,
                    subscription: subscription
                });
                
                setIsSubscribed(true);
                alert('Notifications activées avec succès !');
            } else {
                console.warn('La permission a été refusée par l\'utilisateur:', permission);
                alert('Permission refusée. Vérifiez les réglages de votre navigateur.');
            }
        } catch (err) {
            console.error('ERREUR DURANT L\'ACTIVATION PUSH:', err);
            alert('Erreur technique: ' + err.message);
        }
    };






    const languages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'ar', name: 'العربية', flag: '🇹🇳' },
    ];

    useEffect(() => {
        const savedLang = localStorage.getItem('clientLang');
        if (savedLang) {
            setLang(savedLang);
        } else {
            setLang('fr'); // Default to French
            localStorage.setItem('clientLang', 'fr');
        }
    }, []);

    // Listen for storage changes in case it's changed on login page or another tab
    useEffect(() => {
        const handleStorageChange = () => {
            const savedLang = localStorage.getItem('clientLang');
            if (savedLang) setLang(savedLang);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const changeLanguage = (l) => {
        setLang(l);
        localStorage.setItem('clientLang', l);
        setIsLangOpen(false);
    };

    const safeLang = translations[lang] ? lang : 'fr';
    const t = translations[safeLang].client;
    const itemsT = translations[safeLang].items;

    const [menuItems, setMenuItems] = useState([]);
    const [internalServicesList, setInternalServicesList] = useState([]);
    const [lieuxVisite, setLieuxVisite] = useState([]);

    const [selectedActivity, setSelectedActivity] = useState(null);
    const [selectedTarif, setSelectedTarif] = useState(null);
    const [activityNotes, setActivityNotes] = useState('');

    const fetchActivity = (cid) => {
        if (!cid) return;
        fetch(`${API_BASE_URL}/api/clients/${cid}/activity`)
            .then(r => r.json())
            .then(data => { 
                if (data.success) {
                    setMyActivity(data); 
                    
                    const params = new URLSearchParams(window.location.search);
                    const detailsId = params.get('detailsId');
                    const detailsType = params.get('detailsType');
                    if (detailsId && detailsType) {
                        const list = detailsType === 'order' ? data.orders : data.services;
                        const item = list.find(i => String(i.id) === detailsId);
                        if (item) {
                            setSelectedHistoryItem({ ...item, _type: detailsType });
                            window.history.replaceState({}, '', window.location.pathname);
                        }
                    }
                } 
            })
            .catch(console.error);
    };

    // Optimized Sync Helper (Using IndexedDB for High Volume)
    const syncWithCache = async (key, fetchUrl, setter) => {
        // 1. Initial Load from IndexedDB (Async & Large Capacity)
        try {
            const cachedValue = await db.getItem(`cache_${key}`);
            if (cachedValue) {
                setter(cachedValue);
            }
        } catch (e) {
            console.error(`DB read error for ${key}`, e);
        }

        // 2. Background Revalidate (with Jitter + ETag / Versioning check)
        const jitter = Math.floor(Math.random() * 2000); 
        setTimeout(async () => {
            try {
                // Professional Tip: Native browser fetch handles ETags/304 automatically
                // Here we just ensure we only update if the server gives new data.
                const res = await fetch(fetchUrl);
                const data = await res.json();
                if (data.success) {
                    // Extracting based on various keys we use in different endpoints
                    const freshData = data.items || data.services || data.activities || data.experiences || [];
                    
                    // Update state and persistent DB only if we have fresh data
                    setter(freshData);
                    await db.setItem(`cache_${key}`, freshData);
                }
            } catch (err) {
                console.warn(`Sync failed for ${key} (Offline mode)`, err);
            }
        }, jitter);
    };

    const fetchAllData = () => {
        syncWithCache('menu', `${API_BASE_URL}/api/menu`, setMenuItems);
        syncWithCache('internal_services', `${API_BASE_URL}/api/internal-services`, setInternalServicesList);
        syncWithCache('activities', `${API_BASE_URL}/api/activities`, setHotelActivities);
        syncWithCache('experiences', `${API_BASE_URL}/api/experiences`, setExperiences);
        syncWithCache('lieux_visite', `${API_BASE_URL}/api/lieux-visite`, setLieuxVisite);
        
        const cid = localStorage.getItem('clientId');
        if (cid && !isOfflineMode) fetchActivity(cid);
    };


    useEffect(() => {
        const cid = localStorage.getItem('clientId');
        const rnum = localStorage.getItem('chambre');
        const isOff = localStorage.getItem('offlineMode') === 'true';

        if (!cid && !isOff) {
            navigate('/client');
            return;
        }

        if (isOff) {
            setClientInfo({ id: 'offline', chambre: '000', guestName: 'DÃ©couverte' });
        } else {
            setClientInfo({ id: cid, chambre: rnum });
        }

        // Handle Deep Linking from Notifications
        const params = new URLSearchParams(window.location.search);
        const modalToOpen = params.get('modal');
        if (modalToOpen) {
            setActiveModal(modalToOpen);
        }

        // Professional Sync (Initial)
        fetchAllData();

        // Load Offline History First (UX instant response)
        db.getNotifs().then(setNotifications);


        const syncNotifications = async () => {
            if (!cid || isNetworkOffline) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/notifications?clientId=${cid}`);
                const data = await res.json();
                if (data.success) {
                    const dbLastNotifs = data.notifications.map(n => ({
                        id: n.id,
                        message: n.message,
                        title: n.title,
                        type: n.type,
                        refId: n.refId,
                        refType: n.refType,
                        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        timestamp: new Date(n.createdAt).getTime(),
                        read: true 
                    }));
                    
                    for (const n of dbLastNotifs) await db.saveNotif(n);
                    
                    const updated = await db.getNotifs();
                    setNotifications(updated);
                }
            } catch (err) { console.error("Sync Error:", err); }
        };

        // Socket setup
        const socket = io(`${API_BASE_URL}`);
        
        socket.on('connect', () => {
            setIsNetworkOffline(false);
            if (rnum) socket.emit('join_room', rnum); 
            syncNotifications();
            fetchAllData();
        });

        socket.on('disconnect', () => setIsNetworkOffline(true));
        socket.on('connect_error', () => setIsNetworkOffline(true));

        socket.on('status_changed', (data) => {
            const newNotif = {
                id: Date.now(),
                message: data.message,
                type: data.type,
                refId: data.id,
                refType: data.type,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
            db.saveNotif(newNotif); 
            if (cid) fetchActivity(cid);
        });

        socket.on('new_activity', (data) => {
            const newNotif = {
                id: Date.now(),
                message: data.message,
                title: data.title || 'Hari Club Hotel',
                type: data.type,
                refId: data.type === 'MARKETING' ? null : data.data?.id,
                refType: data.type === 'MARKETING' ? data.data?.refType : (data.type === 'ORDER' ? 'order' : 'service'),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
            db.saveNotif(newNotif); 
            if (cid && data.type !== 'MARKETING') fetchActivity(cid);
        });


        const handleOnline = () => {
            setIsNetworkOffline(false);
            if (localStorage.getItem('clientId')) setIsOfflineMode(false);
            syncNotifications();
            fetchAllData();
        };
        const handleOffline = () => {
            setIsNetworkOffline(true);
            setIsOfflineMode(true);
        };

        // Listen for push notifications forwarded by the Service Worker
        // This fires when the app is open and a Web-Push arrives (marketing)
        const handleSwMessage = (event) => {
            if (event.data?.type === 'PUSH_NOTIF') {
                const swNotif = event.data.notif;
                // Avoid duplicate: the socket 'new_activity' may already have added it
                setNotifications(prev => {
                    const exists = prev.some(n => n.id === swNotif.id);
                    if (exists) return prev;
                    return [swNotif, ...prev];
                });
                // Also persist in IndexedDB in case it wasn't already written
                db.saveNotif(swNotif);
            }
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleSwMessage);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            socket.disconnect();
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleSwMessage);
            }
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };

    }, [navigate]);



    useEffect(() => {
        if (activeModal === 'history' && clientInfo?.id && !isOfflineMode) {
            fetchActivity(clientInfo.id);
            setHistoryTypeFilter('all');
            setHistorySearch('');
        }
    }, [activeModal, clientInfo?.id, isOfflineMode]);

    const handleAddToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const handleRemoveFromCart = (id) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === id);
            if (!existing) return prev; // Safety check
            
            // Explicitly prevent qty < 0 (though filter removes at 1)
            if (existing.qty <= 1) return prev.filter(i => i.id !== id);
            
            return prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty - 1) } : i);
        });
    };


    const submitOrder = async () => {
        if (isOfflineMode || isNetworkOffline) {
            setShowLoginModal(true);
            return;
        }
        try {



            const res = await fetch(`${API_BASE_URL}/api/commandes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: clientInfo.id,
                    chambre: clientInfo.chambre,
                    items: cart,
                    total: cart.reduce((acc, curr) => acc + (parseFloat(curr?.prix || 0) * (curr?.qty || 0)), 0)

                })
            });
            if (res.ok) {
                setCart([]);
                setRequestSuccess(true);
                fetchActivity(clientInfo.id);
                setTimeout(() => { setRequestSuccess(false); setActiveModal(null); }, 2000);
            }
        } catch (err) {
            alert(t.alert_err_order);
        }
    };

    const [selectedService, setSelectedService] = useState(null);

    const submitDemande = async () => {
        if (isOfflineMode || isNetworkOffline) {
            setShowLoginModal(true);
            return;
        }
        if (!selectedService) return;



        try {
            const res = await fetch(`${API_BASE_URL}/api/demandes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: clientInfo.id,
                    chambre: clientInfo.chambre,
                    type: selectedService,
                    notes: demandeNotes
                })
            });
            if (res.ok) {
                setDemandeNotes('');
                setSelectedService(null);
                setRequestSuccess(true);
                fetchActivity(clientInfo.id);
                setTimeout(() => { setRequestSuccess(false); setActiveModal(null); }, 2000);
            }
        } catch (err) {
            alert(t.alert_err_req);
        }
    };

    const submitActivity = async () => {
        if (isOfflineMode || isNetworkOffline) {
            setShowLoginModal(true);
            return;
        }
        if (!selectedActivity) return;



        try {
            const res = await fetch(`${API_BASE_URL}/api/demandes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: clientInfo.id,
                    chambre: clientInfo.chambre,
                    type: "RÃ©servation: " + selectedActivity + (selectedTarif ? ` (${selectedTarif})` : ""),
                    notes: activityNotes
                })
            });
            if (res.ok) {
                setActivityNotes('');
                setSelectedActivity(null);
                setRequestSuccess(true);
                fetchActivity(clientInfo.id);
                setTimeout(() => { setRequestSuccess(false); setActiveModal(null); }, 2000);
            }
        } catch (err) {
            alert(t.alert_err_res);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('clientId');
        localStorage.removeItem('offlineMode');
        navigate('/client');
    };


    return (
        <div className="min-h-screen font-sans text-white pb-32" style={{ backgroundColor: '#040b28' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <header className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-40" style={{ backgroundColor: '#040b28' }}>
                <button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-white hover:text-[#FDB813] transition-colors p-1 -ml-1 rtl:-ml-0 rtl:-mr-1"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="text-xl font-bold tracking-[0.2em] uppercase">Hari Club</div>
                
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button 
                            onClick={() => {
                                navigate('/client/notifications');
                            }}
                            className="w-10 h-10 rounded-full bg-[#131e50] flex items-center justify-center border border-[#FDB813]/30 hover:border-[#FDB813] transition-all relative"
                        >
                            <BellRing className="h-5 w-5 text-white" />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 w-5 h-5 bg-[#FDB813] text-[#040b28] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#040b28]">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="w-10 h-10 rounded-full bg-[#131e50] flex items-center justify-center border border-[#FDB813]/30 hover:border-[#FDB813] transition-all"
                        >
                            <span className="text-xl">{languages.find(l => l.code === lang)?.flag || '🌐'}</span>
                        </button>

                        {isLangOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-3 w-48 bg-[#131e50] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <div className="py-2">
                                        {languages.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => changeLanguage(l.code)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5 ${lang === l.code ? 'text-[#FDB813] font-bold' : 'text-gray-300'}`}
                                            >
                                                <span className="text-xl">{l.flag}</span>
                                                <span>{l.name}</span>
                                                {lang === l.code && <Check className="h-4 w-4 ml-auto rtl:mr-auto rtl:ml-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Side Drawer */}
            {isDrawerOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    <div 
                        className={`fixed top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} h-full w-[280px] bg-[#040b28] z-[70] shadow-2xl transition-transform ${lang === 'ar' ? 'animate-slide-right' : 'animate-slide-left'} border-r rtl:border-r-0 rtl:border-l border-white/5 flex flex-col`}
                    >
                        <div className="p-6 flex justify-between items-center border-b border-white/5">
                            <div className="text-lg font-bold tracking-widest uppercase">{lang === 'fr' ? "Menu" : (lang === 'ar' ? "القائمة" : "Menu")}</div>
                            <button 
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="flex-1 py-6 px-4 space-y-2">
                            <button 
                                onClick={() => { setIsDrawerOpen(false); navigate('/client/services'); }}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors text-left rtl:text-right"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#FDB813]/10 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-[#FDB813]" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{lang === 'fr' ? "Accueil" : (lang === 'ar' ? "الرئيسية" : "Home")}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">{lang === 'fr' ? "Revenir au début" : (lang === 'ar' ? "العودة للبداية" : "Back to start")}</div>
                                </div>
                            </button>

                             <button 
                                onClick={() => { setIsDrawerOpen(false); navigate('/client/notifications'); }}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors text-left rtl:text-right"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#FDB813]/10 flex items-center justify-center">
                                    <BellRing className="h-5 w-5 text-[#FDB813]" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-sm">{lang === 'fr' ? "Messages" : (lang === 'ar' ? "الرسائل" : "Messages")}</div>
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <span className="w-5 h-5 bg-[#FDB813] text-[#040b28] text-[10px] font-black rounded-full flex items-center justify-center">
                                                {notifications.filter(n => !n.read).length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase">{lang === 'fr' ? "Notifications & Offres" : (lang === 'ar' ? "تنبيهات وعروض" : "Alerts & Offers")}</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => { setIsDrawerOpen(false); setActiveModal('history'); }}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors text-left rtl:text-right"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#FDB813]/10 flex items-center justify-center">
                                    <History className="h-5 w-5 text-[#FDB813]" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{t.activity_tracking}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">{lang === 'fr' ? "Suivi des commandes" : (lang === 'ar' ? "متابعة الطلبات" : "Order tracking")}</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => { setIsDrawerOpen(false); setActiveModal('programme'); }}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors text-left rtl:text-right"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#FDB813]/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-[#FDB813]" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{t.daily_program}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">{lang === 'fr' ? "Activités de l'hôtel" : (lang === 'ar' ? "أنشطة الفندق" : "Hotel activities")}</div>
                                </div>
                            </button>

                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-red-500/10 transition-colors text-left rtl:text-right text-red-400"
                            >
                                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <LogOut className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{lang === 'fr' ? "Déconnexion" : (lang === 'ar' ? "خروج" : "Logout")}</div>
                                    <div className="text-[10px] text-red-500/50 uppercase">{lang === 'fr' ? "Quitter l'application" : (lang === 'ar' ? "تسجيل الخروج" : "Leave app")}</div>
                                </div>
                            </button>
                        </div>

                        <div className="p-6 border-t border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full border border-[#FDB813]/50 overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Guest" alt="Guest" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">{t.chambre} {clientInfo?.chambre}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">{clientInfo?.guestName || ""}</div>
                                </div>
                            </div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-widest text-center">Hari Club v1.0</div>
                        </div>
                    </div>
                </>
            )}


            {/* Unified Premium 'Offline & Discovery' Footer */}
            {(isOfflineMode || isNetworkOffline) && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-[100] animate-slide-up">
                    <div className="bg-[#131e50]/95 backdrop-blur-2xl border border-[#FDB813]/30 rounded-3xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#FDB813]/10 flex items-center justify-center shrink-0">
                            {isNetworkOffline ? (
                                <WifiOff className="h-6 w-6 text-[#FDB813] animate-pulse" />
                            ) : (
                                <Globe className="h-6 w-6 text-[#FDB813]" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white leading-none mb-1">Mode Découverte Hari Club</h4>
                            <p className="text-[10px] text-gray-400 font-medium">Connectez-vous pour commander et réserver vos activités.</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-[#FDB813] text-[#040b28] px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                            {t.login_cta}
                        </button>
                    </div>
                </div>
            )}




            {/* Premium Login Modal (The "Better" way) */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLoginModal(false)} />
                    <div className="relative w-full max-w-sm bg-[#040b28] border border-white/10 rounded-[40px] p-8 text-center animate-bounce-in shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FDB813] to-transparent shadow-[0_0_15px_#FDB813]"></div>
                        
                        <div className="w-20 h-20 bg-[#FDB813]/10 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-[#FDB813] relative group">
                            <div className="absolute inset-0 bg-[#FDB813]/20 rounded-[28px] animate-ping opacity-20"></div>
                            <User className="h-10 w-10 relative z-10" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Accès Client Requis</h3>
                        <p className="text-sm text-gray-400 font-light leading-relaxed mb-8 px-2">
                            Pour commander du Room Service ou réserver vos activités, veuillez vous identifier avec votre numéro de chambre et votre code d'accès.
                        </p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={handleLogout}
                                className="w-full bg-[#FDB813] text-[#040b28] py-4 rounded-2xl font-bold uppercase tracking-[0.1em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(253,184,19,0.2)]"
                            >
                                Se Connecter Maintenant
                            </button>
                            <button 
                                onClick={() => setShowLoginModal(false)}
                                className="w-full bg-white/5 text-gray-400 py-3 rounded-2xl font-medium text-xs uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Continuer l'exploration
                            </button>
                        </div>
                    </div>
                </div>
            )}



            <main className={`px-6 ${isOfflineMode ? 'pt-32' : 'pt-24'} max-w-lg mx-auto`}>


                <div className="mb-10 text-center sm:text-left rtl:sm:text-right">
                    <span className="text-[10px] font-bold tracking-[0.1em] text-[#FDB813] uppercase block mb-3">{lang === 'fr' ? "L'art de vivre" : (lang === 'ar' ? "فنيات الحياة" : "The Art of Living")}</span>
                    <h2 className="text-3xl font-bold mb-4 leading-tight">{t.welcome}<br/>Hari Club</h2>
                    <p className="text-sm text-gray-300/80 font-light leading-relaxed">{t.subtitle}</p>
                    
                    {!isSubscribed && !isOfflineMode && (
                        <button 
                            onClick={handleSubscribe}
                            className="mt-6 flex items-center justify-center gap-3 bg-[#FDB813] text-[#040b28] px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-[#FDB813]/80 transition-all w-full"
                        >
                            <BellRing className="h-5 w-5" />
                            Activer les notifications 🔔
                        </button>
                    )}
                </div>

                <div 
                    onClick={() => setActiveModal('discovery')}
                    className="mb-6 p-6 rounded-2xl bg-[#131e50] border border-[#FDB813]/20 flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-xl group"
                >
                     <div className="flex items-center gap-5 w-full">
                        <div className="w-14 h-14 rounded-2xl bg-[#FDB813] flex items-center justify-center shrink-0 shadow-lg shadow-[#FDB813]/20 group-hover:scale-110 transition-transform">
                            <MapPin className="h-7 w-7 text-[#040b28]" />
                        </div>
                        <div className="text-left rtl:text-right">
                            <span className="text-[10px] font-black tracking-[0.15em] text-[#FDB813] uppercase block mb-1">Guide Local</span>
                            <h4 className="text-xl font-bold text-white leading-tight group-hover:text-[#FDB813] transition-colors">{lang === 'fr' ? "Découvrir la région" : (lang === 'ar' ? "اكتشف المنطقة" : "Discover the region")}</h4>
                            <p className="text-[10px] text-gray-400 font-medium mt-1 italic">{lang === 'fr' ? "Accès offline complet à nos adresses favorites" : "Full offline access to our favorite spots"}</p>
                        </div>
                     </div>
                     <ChevronRight className="h-6 w-6 text-[#FDB813]/50" />
                </div>

                <div 
                    onClick={() => setActiveModal('programme')}
                    className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-[#FDB813]/20 via-[#FDB813]/5 to-transparent border border-[#FDB813]/20 flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-xl group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#FDB813]/10 flex items-center justify-center text-[#FDB813] group-hover:scale-110 transition-transform">
                            <Calendar className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-white group-hover:text-[#FDB813] transition-colors">{t.daily_program}</h3>
                            <p className="text-xs text-gray-400 font-medium">Yoga, Restos, Animation...</p>
                        </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-[#FDB813]/50" />
                </div>

                <div className="mb-10">
                    <h3 className="text-xs font-bold tracking-[0.14em] text-gray-400 uppercase mb-5">{t.available_services}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setActiveModal('room-service')} className="flex flex-col items-center justify-center p-6 py-8 rounded-2xl transition-transform active:scale-95 shadow-md border border-white/5 bg-[#0a1445] hover:bg-[#0d1a5a]">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#FDB813]">
                                <svg className="w-6 h-6 text-[#040b28]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-center uppercase">{t.room_service}</span>
                        </button>
                        <button onClick={() => { setActiveModal('demandes'); setSelectedService('Ménage de chambre'); }} className="flex flex-col items-center justify-center p-6 py-8 rounded-2xl transition-transform active:scale-95 shadow-md border border-white/5 bg-[#0a1445] hover:bg-[#0d1a5a]">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#FDB813]">
                                <svg className="w-6 h-6 text-[#040b28]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-center uppercase">{t.service_req}</span>
                        </button>
                        <button onClick={() => { setActiveModal('activites'); setActivityCategory('spa'); setSelectedActivity(null); }} className="flex flex-col items-center justify-center p-6 py-8 rounded-2xl transition-transform active:scale-95 shadow-md border border-white/5 bg-[#0a1445] hover:bg-[#0d1a5a]">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#FDB813]">
                                <svg className="w-6 h-6 text-[#040b28]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-center uppercase">{lang === 'fr' ? "SPA & BIEN-ÊTRE" : (lang === 'ar' ? "السبا والرفاهية" : "SPA & WELLNESS")}</span>
                        </button>
                        <button onClick={() => { setActiveModal('activites'); setActivityCategory('excursion'); setSelectedActivity(null); }} className="flex flex-col items-center justify-center p-6 py-8 rounded-2xl transition-transform active:scale-95 shadow-md border border-white/5 bg-[#0a1445] hover:bg-[#0d1a5a]">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#FDB813]">
                                <Globe className="w-6 h-6 text-[#040b28]" />
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-center uppercase">{lang === 'fr' ? "EXCURSIONS" : (lang === 'ar' ? "الرحلات" : "EXCURSIONS")}</span>
                        </button>
                    </div>
                </div>

                <div className="mb-14">
                    <h3 className="text-xs font-bold tracking-[0.14em] text-gray-400 uppercase mb-5">{lang === 'fr' ? "Expériences Signature" : (lang === 'ar' ? "تجارب مميزة" : "Signature Experiences")}</h3>
                    {experiences.filter(e => e.categorie === 'signature').length > 0 ? (
                        experiences.filter(e => e.categorie === 'signature').map(exp => (
                            <div key={exp.id} className="relative rounded-2xl overflow-hidden h-44 mb-5 cursor-pointer shadow-lg outline outline-1 outline-white/5 group" onClick={() => { setActiveModal('activites'); setActivityCategory('signature'); setSelectedActivity(exp.nom); }}>
                                <img src={transformImageUrl(exp.image)} alt={exp.nom} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#040b28] via-[#040b28]/60 to-transparent"></div>
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <h4 className="text-2xl font-bold mb-1">{exp.nom}</h4>
                                    <p className="text-xs text-gray-300 font-light line-clamp-1">{exp.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden h-44 mb-5 cursor-pointer shadow-lg outline outline-1 outline-white/5 group" onClick={() => { setActiveModal('activites'); setActivityCategory('signature'); }}>
                            <img src="https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=300&fit=crop" alt="Dîner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#040b28] via-[#040b28]/60 to-transparent"></div>
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <h4 className="text-2xl font-bold mb-1">{lang === 'fr' ? "Dîner à la Plage" : (lang === 'ar' ? "عشاء على الشاطئ" : "Dinner at the Beach")}</h4>
                                <p className="text-xs text-gray-300 font-light line-clamp-1">{lang === 'fr' ? "Une expérience gastronomique sous les étoiles." : "A gourmet experience under the stars."}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center border-t border-white/10 pt-8 pb-10">
                    <div className="flex gap-6 text-[11px] font-bold tracking-widest text-[#FDB813] uppercase mb-5">
                        <button onClick={() => changeLanguage('fr')} className={`${lang === 'fr' ? 'text-white border-b-2 border-white' : 'text-gray-400'} pb-1`}>Français</button>
                        <button onClick={() => changeLanguage('en')} className={`${lang === 'en' ? 'text-white border-b-2 border-white' : 'text-gray-400'} pb-1`}>English</button>
                        <button onClick={() => changeLanguage('de')} className={`${lang === 'de' ? 'text-white border-b-2 border-white' : 'text-gray-400'} pb-1`}>Deutsch</button>
                        <button onClick={() => changeLanguage('ar')} className={`${lang === 'ar' ? 'text-white border-b-2 border-white' : 'text-gray-400'} pb-1`}>العربية</button>
                    </div>
                    <div className="text-[9px] tracking-[0.2em] text-gray-500 uppercase">{lang === 'fr' ? "Propulsé par Hari Club Smart Guest" : (lang === 'ar' ? "بواسطة هاري كلوب الذكي" : "Powered by Hari Club Smart Guest")}</div>
                </div>
            </main>

            {/* Floating Modern Navigation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
                <nav className="bg-[#131e50]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2.5 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <button 
                        onClick={() => setActiveModal(null)}
                        className={`p-3 rounded-2xl transition-all duration-300 relative group ${!activeModal ? 'text-[#FDB813] bg-[#FDB813]/10' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Home className="h-6 w-6" />
                        {!activeModal && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FDB813] rounded-full shadow-[0_0_8px_#FDB813]"></span>}
                    </button>

                    <button 
                        onClick={() => setActiveModal('room-service')}
                        className={`p-3 rounded-2xl transition-all duration-300 relative group ${activeModal === 'room-service' ? 'text-[#FDB813] bg-[#FDB813]/10' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Utensils className="h-6 w-6" />
                        {activeModal === 'room-service' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FDB813] rounded-full shadow-[0_0_8px_#FDB813]"></span>}
                    </button>

                    <button 
                        onClick={() => setActiveModal('demandes')}
                        className={`p-3 rounded-2xl transition-all duration-300 relative group ${activeModal === 'demandes' ? 'text-[#FDB813] bg-[#FDB813]/10' : 'text-gray-400 hover:text-white'}`}
                    >
                        <ClipboardList className="h-6 w-6" />
                        {activeModal === 'demandes' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FDB813] rounded-full shadow-[0_0_8px_#FDB813]"></span>}
                    </button>

                    <button 
                        onClick={() => setActiveModal('history')}
                        className={`p-3 rounded-2xl transition-all duration-300 relative group ${activeModal === 'history' ? 'text-[#FDB813] bg-[#FDB813]/10' : 'text-gray-400 hover:text-white'}`}
                    >
                        <History className="h-6 w-6" />
                        {activeModal === 'history' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FDB813] rounded-full shadow-[0_0_8px_#FDB813]"></span>}
                    </button>
                </nav>
            </div>

            {/* history Modal */}
            {activeModal === 'history' && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full sm:max-w-xl bg-surface-lowest rounded-t-3xl sm:rounded-2xl p-8 sm:p-10 animate-slide-up max-h-[90vh] overflow-y-auto shadow-[0_0px_40px_rgba(25,28,29,0.1)]">
                        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-8 sm:hidden" />
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="text-label-md uppercase tracking-[0.05em] text-on-surface/50 mb-1 block">Historique</span>
                                <h2 className="text-headline-sm font-medium text-primary leading-tight">{t.activity_tracking}</h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-2 sm:-mr-2 rtl:sm:-ml-2 rtl:sm:mr-0 bg-transparent hover:bg-surface-container rounded-full transition-colors text-on-surface/50">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Client History Filter Bar */}
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-2 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high">
                                    <button 
                                        onClick={() => setHistoryTypeFilter('all')}
                                        className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyTypeFilter === 'all' ? 'bg-[#FDB813] text-[#040b28]' : 'text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-high'}`}
                                    >
                                        {t.all}
                                    </button>
                                    <button 
                                        onClick={() => setHistoryTypeFilter('order')}
                                        className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyTypeFilter === 'order' ? 'bg-[#FDB813] text-[#040b28]' : 'text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-high'}`}
                                    >
                                        {t.orders}
                                    </button>
                                    <button 
                                        onClick={() => setHistoryTypeFilter('service')}
                                        className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyTypeFilter === 'service' ? 'bg-[#FDB813] text-[#040b28]' : 'text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-high'}`}
                                    >
                                        {t.services}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface/30" />
                                    <input 
                                        type="text" 
                                        placeholder={t.search}
                                        value={historySearch}
                                        onChange={e => setHistorySearch(e.target.value)}
                                        className="w-full bg-surface-container-low border border-surface-container-high rounded-xl pl-11 pr-5 rtl:pl-5 rtl:pr-11 py-3 text-sm text-on-surface placeholder:text-on-surface/30 outline-none focus:outline-primary/30 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2 custom-scrollbar">
                                {[
                                    ...(historyTypeFilter === 'all' || historyTypeFilter === 'order' ? myActivity.orders.map(o => ({...o, _type: 'order'})) : []),
                                    ...(historyTypeFilter === 'all' || historyTypeFilter === 'service' ? myActivity.services.map(s => ({...s, _type: 'service'})) : [])
                                ]
                                .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .filter(item => {
                                    if (!historySearch) return true;
                                    const search = historySearch.toLowerCase();
                                    if (item._type === 'order') {
                                        return item.items.some(i => i.nom.toLowerCase().includes(search));
                                    }
                                    return item.type.toLowerCase().includes(search) || (item.notes && item.notes.toLowerCase().includes(search));
                                })
                                .length === 0 ? (
                                    <div className="text-center py-20 opacity-40 italic font-light space-y-4">
                                        <History className="h-10 w-10 mx-auto opacity-20" />
                                        <p>{t.no_activity}</p>
                                    </div>
                                ) : (
                                    [
                                        ...(historyTypeFilter === 'all' || historyTypeFilter === 'order' ? myActivity.orders.map(o => ({...o, _type: 'order'})) : []),
                                        ...(historyTypeFilter === 'all' || historyTypeFilter === 'service' ? myActivity.services.map(s => ({...s, _type: 'service'})) : [])
                                    ]
                                    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .filter(item => {
                                        if (!historySearch) return true;
                                        const search = historySearch.toLowerCase();
                                        if (item._type === 'order') {
                                            return item.items.some(i => i.nom.toLowerCase().includes(search));
                                        }
                                        return item.type.toLowerCase().includes(search) || (item.notes && item.notes.toLowerCase().includes(search));
                                    })
                                    .map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => setSelectedHistoryItem(item)}
                                            className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-5 border border-surface-container-high hover:bg-surface-lowest transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-2"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${item._type === 'order' ? 'bg-[#FDB813]/10 text-[#FDB813]' : 'bg-tertiary/10 text-tertiary'}`}>
                                                {item._type === 'order' ? <ShoppingCart className="h-6 w-6" /> : <BellRing className="h-6 w-6" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-sm text-on-surface truncate max-w-[150px]">
                                                        {item._type === 'order' ? `${t.order} #${item.id}` : (item.type.startsWith('Réservation: ') ? item.type.replace('Réservation: ', '') : (itemsT[item.type] || item.type))}
                                                    </h4>
                                                    <span className="text-[10px] text-on-surface/30 font-medium uppercase">{new Date(item.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.statut === 'Livré' || item.statut === 'Terminé' ? 'bg-green-500' : 'bg-[#FDB813] animate-pulse'}`} />
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${item.statut === 'Livré' || item.statut === 'Terminé' ? 'text-green-500/80' : 'text-[#FDB813]/80'}`}>
                                                        {item.statut}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-on-surface/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}


            {/* Re-adding previous modals for Room Service and Demandes which were removed for brevity */}
            {activeModal === 'room-service' && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full sm:max-w-xl bg-surface-lowest rounded-t-3xl sm:rounded-2xl p-8 sm:p-10 animate-slide-up max-h-[90vh] flex flex-col shadow-[0_0px_40px_rgba(25,28,29,0.1)]">
                        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-8 sm:hidden shrink-0" />
                        <div className="flex justify-between items-start mb-8 shrink-0">
                            <div>
                                <span className="text-label-md uppercase tracking-[0.05em] text-secondary mb-1 block">Menu</span>
                                <h2 className="text-headline-sm font-medium text-primary leading-tight">{t.room_service}</h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-2 sm:-mr-2 rtl:sm:-ml-2 rtl:sm:mr-0 bg-transparent hover:bg-surface-container rounded-full transition-colors text-on-surface/50">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {requestSuccess ? (
                            <div className="py-12 text-center">
                                <div className="w-20 h-20 bg-secondary-container/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h3 className="text-headline-sm font-medium text-on-surface mb-2">{t.order_sent}</h3>
                                <p className="text-on-surface/60 font-light">{t.order_prep}</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6 mb-8 overflow-y-auto flex-1 pr-2 rtl:pr-0 rtl:pl-2 -mr-2 rtl:-mr-0 rtl:-ml-2">
                                    {!Array.isArray(menuItems) || menuItems.length === 0 ? (
                                        <div className="py-20 text-center opacity-40 italic">
                                            {lang === 'fr' ? "Le menu est temporairement indisponible." : "The menu is temporarily unavailable."}
                                        </div>
                                    ) : menuItems.map(item => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-low outline outline-1 outline-white/5">
                                                <img src={transformImageUrl(item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop')} alt={itemsT[item.nom] || item.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                                            </div>
                                            <div className="flex-1 flex flex-col py-1">
                                                <h4 className="font-bold text-base text-on-surface leading-snug">{itemsT[item.nom] || item.nom}</h4>
                                                <p className="text-sm text-on-surface/60 font-light mt-1 flex-1 line-clamp-2">{itemsT[item.description] || item.description}</p>
                                                <div className="flex justify-between items-end mt-2">
                                                    <p className="text-[#FDB813] font-bold text-lg">{item.prix} €</p>
                                                    <div className="flex items-center gap-3 bg-[#0a1445] border border-white/5 rounded-xl px-2 py-1 shadow-inner">
                                                        <button onClick={() => handleRemoveFromCart(item.id)} className="p-1.5 hover:text-[#FDB813] transition-colors text-white/40">
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="font-bold text-sm w-5 text-center text-white">{cart.find(i => i.id === item.id)?.qty || 0}</span>
                                                        <button onClick={() => handleAddToCart(item)} className="p-1.5 hover:text-[#FDB813] transition-colors text-white/40">
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {cart.length > 0 && (
                                    <div className="shrink-0 pt-6 mt-2 border-t border-surface-container-high">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-on-surface/60 font-medium tracking-wide uppercase text-sm">{t.total}</span>
                                            <span className="text-headline-sm font-bold text-[#FDB813]">{cart.reduce((acc, curr) => acc + (parseFloat(curr?.prix || 0) * (curr?.qty || 0)), 0)} €</span>

                                        </div>
                                        <button 
                                            onClick={submitOrder} 
                                            className={`w-full bg-primary text-on-primary py-4 rounded-xl font-medium hover:bg-primary-container transition-colors active:scale-[0.98] ${(isOfflineMode || isNetworkOffline) ? 'opacity-80' : ''} flex items-center justify-center gap-2`}
                                        >
                                            {(isOfflineMode || isNetworkOffline) && <Lock className="h-4 w-4" />}
                                            {t.confirm_order}
                                        </button>


                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeModal === 'demandes' && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full sm:max-w-xl bg-surface-lowest rounded-t-3xl sm:rounded-2xl p-8 sm:p-10 animate-slide-up shadow-[0_0px_40px_rgba(25,28,29,0.1)]">
                        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-8 sm:hidden" />
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="text-label-md uppercase tracking-[0.05em] text-primary/60 mb-1 block">Services Internes</span>
                                <h2 className="text-headline-sm font-medium text-primary leading-tight">{t.service_req}</h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-2 sm:-mr-2 rtl:sm:-ml-2 rtl:sm:mr-0 bg-transparent hover:bg-surface-container rounded-full transition-colors text-on-surface/50">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {requestSuccess ? (
                            <div className="py-12 text-center">
                                <div className="w-20 h-20 bg-tertiary-container/20 text-tertiary rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-up">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h3 className="text-headline-sm font-medium text-on-surface mb-2">{t.req_rcv}</h3>
                                <p className="text-on-surface/60 font-light">{t.staff_arriving}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {internalServicesList.length === 0 ? (
                                        <div className="col-span-2 py-10 text-center opacity-40 italic text-sm">
                                            {lang === 'fr' ? "Chargement des services..." : "Loading services..."}
                                        </div>
                                    ) : internalServicesList.map(service => (
                                        <button 
                                            key={service.id} 
                                            onClick={() => setSelectedService(service.nom)} 
                                            className={`p-5 rounded-xl border transition-colors text-center group bg-surface-container-low ${selectedService === service.nom ? 'border-primary outline outline-1 outline-primary bg-primary/5' : 'border-transparent hover:bg-surface-container'}`}
                                        >
                                            <span className="text-3xl block mb-3">{service.icone}</span>
                                            <span className={`text-[11px] font-bold uppercase tracking-tight ${selectedService === service.nom ? 'text-primary' : 'text-on-surface/80'}`}>{itemsT[service.nom] || service.nom}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="relative group">
                                    <textarea value={demandeNotes} onChange={e => setDemandeNotes(e.target.value)} placeholder={t.add_note} className="w-full bg-surface-container-highest text-on-surface placeholder:text-on-surface/40 rounded-t-lg rounded-b-none px-5 py-4 outline-none transition-all relative z-10 min-h-[100px] resize-none" />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-300 ease-out z-20"></div>
                                </div>
                                <button 
                                    onClick={submitDemande}
                                    className={`w-full bg-primary text-on-primary py-4 rounded-xl font-medium hover:bg-primary-container transition-colors mt-2 active:scale-[0.98] flex items-center justify-center gap-2 ${(isOfflineMode || isNetworkOffline) ? 'opacity-80' : ''}`}
                                >
                                    {(isOfflineMode || isNetworkOffline || !selectedService) && <Lock className="h-4 w-4" />}
                                    {t.request_service}
                                </button>


                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeModal === 'activites' && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full sm:max-w-xl bg-surface-lowest rounded-t-3xl sm:rounded-2xl p-8 sm:p-10 animate-slide-up max-h-[90vh] overflow-y-auto shadow-[0_0px_40px_rgba(25,28,29,0.1)]">
                        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-8 sm:hidden" />
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="text-label-md uppercase tracking-[0.05em] text-tertiary mb-1 block">Explorer</span>
                                <h2 className="text-headline-sm font-medium text-primary leading-tight">
                                    {activityCategory === 'spa' && (lang === 'fr' ? "SPA & Bien-être" : "SPA & Wellness")}
                                    {activityCategory === 'excursion' && (lang === 'fr' ? "Nos Excursions" : "Our Excursions")}
                                    {activityCategory === 'signature' && (lang === 'fr' ? "Expériences Signature" : "Signature Experiences")}
                                </h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-2 sm:-mr-2 rtl:sm:-ml-2 rtl:sm:mr-0 bg-transparent hover:bg-surface-container rounded-full transition-colors text-on-surface/50">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {requestSuccess ? (
                            <div className="py-12 text-center">
                                <div className="w-20 h-20 bg-tertiary-container/20 text-tertiary rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-up">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h3 className="text-headline-sm font-medium text-on-surface mb-2">{t.res_rcv}</h3>
                                <p className="text-on-surface/60 font-light">{t.res_contact}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col gap-4">
                                    {experiences.filter(a => a.categorie === activityCategory).map(activity => (
                                        <div key={activity.id} className="space-y-4">
                                            <button 
                                                onClick={() => {
                                                    if (selectedActivity === activity.nom) {
                                                        setSelectedActivity(null);
                                                        setSelectedTarif(null);
                                                    } else {
                                                        setSelectedActivity(activity.nom);
                                                        setSelectedTarif(null);
                                                    }
                                                }} 
                                                className={`w-full relative overflow-hidden rounded-xl border transition-all text-left rtl:text-right group min-h-[120px] flex items-center p-4 gap-5 bg-surface-lowest ${selectedActivity === activity.nom ? 'border-primary outline outline-1 outline-primary shadow-[0_0px_16px_rgba(0,6,102,0.1)]' : 'border-transparent shadow-[0_0px_24px_rgba(25,28,29,0.04)] hover:bg-surface-container-low'}`}
                                            >
                                                <img src={transformImageUrl(activity.image)} alt={activity.nom} className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity" />

                                                <div className="relative z-10 bg-surface-lowest p-3 rounded-xl shadow-sm">
                                                    <span className="text-3xl block">
                                                        {activity.typeActivity === 'quad' ? '🚜' : 
                                                         activity.typeActivity === 'jet_ski' ? '🌊' :
                                                         activity.typeActivity === 'ski' ? '⛷️' :
                                                         (activity.categorie === 'spa' ? '💆‍♀️' : '⛵')}
                                                    </span>
                                                </div>
                                                <div className="relative z-10 flex-1">
                                                    <h4 className={`text-lg font-bold mb-1 ${selectedActivity === activity.nom ? 'text-primary' : 'text-on-surface'}`}>{activity.nom}</h4>
                                                    <p className="text-sm text-on-surface/60 font-light line-clamp-2">{activity.description}</p>
                                                    {activity.prix && !activity.tarifs?.length && <p className="text-xs font-bold text-primary mt-1">{activity.prix}</p>}
                                                </div>
                                            </button>

                                            {selectedActivity === activity.nom && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6 p-2">
                                                    {/* Catalogue Photos */}
                                                    {activity.galerie && activity.galerie.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#FDB813]">Catalogue Photos</p>
                                                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                                {activity.galerie.map((img, i) => (
                                                                    <div key={i} className="w-40 h-28 shrink-0 rounded-lg overflow-hidden border border-white/10">
                                                                        <img src={transformImageUrl(img)} alt={`${activity.nom} ${i}`} className="w-full h-full object-cover" />

                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tarifs Multiples */}
                                                    {activity.tarifs && activity.tarifs.length > 0 && (
                                                        <div className="space-y-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#FDB813]">Choisir une option</p>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {activity.tarifs.map((t, idx) => (
                                                                    <button 
                                                                        key={idx}
                                                                        onClick={() => setSelectedTarif(`${t.label} - ${t.price}`)}
                                                                        className={`p-3 rounded-xl border text-center transition-all ${selectedTarif === `${t.label} - ${t.price}` ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-low border-white/5 text-on-surface/80 hover:bg-surface-container'}`}
                                                                    >
                                                                        <div className="text-xs font-bold uppercase tracking-tight">{t.label}</div>
                                                                        <div className="font-black mt-1">{t.price}</div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="relative group mt-4">
                                                        <textarea 
                                                            value={activityNotes} 
                                                            onChange={e => setActivityNotes(e.target.value)} 
                                                            placeholder={t.add_note_act} 
                                                            className="w-full bg-surface-container-highest text-on-surface placeholder:text-on-surface/40 rounded-xl px-5 py-4 outline-none transition-all min-h-[80px] resize-none" 
                                                        />
                                                    </div>

                                                    <button 
                                                        onClick={submitActivity}
                                                        className={`w-full bg-secondary text-on-primary py-4 rounded-xl font-bold hover:bg-secondary-container hover:text-black transition-colors active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${(isOfflineMode || isNetworkOffline) ? 'opacity-80' : ''}`}
                                                    >
                                                        {(isOfflineMode || isNetworkOffline || (activity.tarifs?.length && !selectedTarif)) && <Lock className="h-4 w-4" />}
                                                        {t.make_res}
                                                    </button>


                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {activeModal === 'programme' && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full sm:max-w-xl bg-surface-lowest rounded-t-3xl sm:rounded-2xl p-8 sm:p-10 animate-slide-up max-h-[90vh] overflow-y-auto shadow-[0_0px_40px_rgba(25,28,29,0.1)]">
                        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-8 sm:hidden shrink-0" />
                        <div className="flex justify-between items-start mb-8 shrink-0">
                            <div>
                                <span className="text-label-md uppercase tracking-[0.05em] text-primary/60 mb-1 block">Hari Club</span>
                                <h2 className="text-headline-sm font-medium text-primary leading-tight">{t.daily_program}</h2>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-2 sm:-mr-2 rtl:sm:-ml-2 rtl:sm:mr-0 bg-transparent hover:bg-surface-container rounded-full transition-colors text-on-surface/50">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {hotelActivities.length === 0 ? (
                                <p className="text-center py-10 text-on-surface/40 italic font-light">{t.no_activities}</p>
                            ) : (
                                hotelActivities.map((activity) => (
                                    <div key={activity.id} className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-5 border border-surface-container-low hover:border-primary/20 transition-all group">
                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <Clock className="h-4 w-4 mb-1" />
                                            <span className="text-xs font-bold font-mono tracking-tighter">{activity.heure}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">{activity.nom}</h4>
                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/10">{activity.categorie}</span>
                                            </div>
                                            <p className="text-xs text-on-surface/60 font-medium leading-relaxed mb-1">{activity.description}</p>
                                            <div className="text-[10px] text-primary/60 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary/50" />
                                                {activity.jours}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'discovery' && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full sm:max-w-xl bg-surface-lowest rounded-t-[40px] sm:rounded-3xl p-8 sm:p-10 animate-slide-up max-h-[90vh] overflow-y-auto shadow-[0_0px_60px_rgba(0,0,0,0.2)] scrollbar-hide">
                        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-8 sm:hidden shrink-0" />
                        
                        <div className="flex justify-between items-start mb-8 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#FDB813]/10 flex items-center justify-center text-[#FDB813]">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FDB813] mb-1 block">Explorer</span>
                                    <h2 className="text-2xl font-bold text-primary leading-tight">{lang === 'fr' ? "Guide Local" : (lang === 'ar' ? "دليل محلي" : "Local Guide")}</h2>
                                </div>
                            </div>
                            <button onClick={() => setActiveModal(null)} className="p-2 sm:-mr-2 rtl:sm:-ml-2 rtl:sm:mr-0 bg-surface-container-low hover:bg-surface-container rounded-full transition-colors text-on-surface/50">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pb-6">
                            {lieuxVisite.length === 0 ? (
                                <div className="text-center py-20 text-on-surface/40 italic font-light">{lang === 'fr' ? "Chargement des adresses..." : "Loading spots..."}</div>
                            ) : (
                                lieuxVisite.map((lieu) => (
                                    <div key={lieu.id} className="group bg-surface-container-lowest rounded-3xl overflow-hidden border border-surface-container-low hover:border-[#FDB813]/30 transition-all duration-500 shadow-sm hover:shadow-xl">
                                        <div className="relative h-48 overflow-hidden">
                                            <img src={transformImageUrl(lieu.image)} alt={lieu.nom} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                                                <span className="px-3 py-1.5 bg-[#040b28]/80 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest text-[#FDB813] border border-[#FDB813]/30 shadow-lg">
                                                    {lieu.categorie}
                                                </span>
                                            </div>
                                            {(lieu.latitude && lieu.longitude) && (
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${lieu.latitude},${lieu.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 w-12 h-12 bg-[#FDB813] text-[#040b28] rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                                                >
                                                    <Navigation className="h-6 w-6" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-xl text-on-surface group-hover:text-primary transition-colors">{lieu.nom}</h4>
                                            </div>
                                            <p className="text-sm text-on-surface/70 font-medium leading-relaxed mb-4 line-clamp-3 italic">"{lieu.description}"</p>
                                            
                                            <div className="flex items-center gap-3 py-3 border-t border-surface-container-low">
                                                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary/60">
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <span className="text-[11px] font-bold text-on-surface/50 uppercase tracking-wider">{lieu.adresse}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showNotifModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setShowNotifModal(false)} />
                    <div className="relative w-full sm:max-w-xl bg-surface-lowest rounded-t-3xl sm:rounded-2xl p-8 sm:p-10 animate-slide-up max-h-[90vh] overflow-y-auto shadow-[0_0px_40px_rgba(25,28,29,0.1)]">
                        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-8 sm:hidden shrink-0" />
                        <div className="flex justify-between items-start mb-8 shrink-0">
                            <div>
                                <span className="text-label-md uppercase tracking-[0.05em] text-tertiary mb-1 block">Historique</span>
                                <h2 className="text-headline-sm font-medium text-primary leading-tight">Notifications</h2>
                            </div>
                            <button onClick={() => setShowNotifModal(false)} className="p-2 sm:-mr-2 rtl:sm:-ml-2 rtl:sm:mr-0 bg-transparent hover:bg-surface-container rounded-full transition-colors text-on-surface/50">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {notifications.length === 0 ? (
                                <p className="text-center py-10 text-on-surface/40 italic font-light">Aucune notification pour le moment.</p>
                            ) : (
                                notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => {
                                            if (notif.refId && notif.refType) {
                                                const list = notif.refType === 'order' ? myActivity.orders : myActivity.services;
                                                const item = list.find(i => i.id === notif.refId);
                                                if (item) setSelectedHistoryItem({ ...item, _type: notif.refType });
                                                else setShowNotifModal(false); // Close if item somehow not found (unlikely)
                                            }
                                        }}
                                        className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-5 border border-surface-container-low hover:border-primary/20 transition-all group cursor-pointer"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <BellRing className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/40">{notif.time}</span>
                                            </div>
                                            <p className="text-sm text-on-surface font-medium leading-relaxed">{notif.message}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-on-surface/20 group-hover:text-primary" />
                                    </div>
                                ))

                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Activity Details Modal */}
            {selectedHistoryItem && (
                <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedHistoryItem(null)} />
                    <div className="relative w-full sm:max-w-md bg-[#040b28] border border-white/10 rounded-t-[40px] sm:rounded-[40px] p-8 sm:p-10 animate-bounce-in shadow-2xl overflow-hidden">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 sm:hidden" />
                        
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                {selectedHistoryItem._type === 'order' ? <ShoppingCart className="h-7 w-7" /> : <BellRing className="h-7 w-7" />}
                            </div>
                            <button onClick={() => setSelectedHistoryItem(null)} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FDB813] mb-2 block">{selectedHistoryItem._type === 'order' ? "Commande" : "Demande de Service"}</span>
                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                                {selectedHistoryItem._type === 'order' ? `Commande #${selectedHistoryItem.id}` : (selectedHistoryItem.type.startsWith('Réservation: ') ? selectedHistoryItem.type.replace('Réservation: ', '') : (itemsT[selectedHistoryItem.type] || selectedHistoryItem.type))}
                            </h3>
                            <div className="flex items-center gap-3 mt-4">
                                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedHistoryItem.statut === 'Livré' || selectedHistoryItem.statut === 'Terminé' ? 'bg-green-500/10 text-green-500' : 'bg-secondary/10 text-secondary border border-secondary/10'}`}>
                                    {selectedHistoryItem.statut}
                                </div>
                                <span className="text-white/30 text-[10px] font-medium tracking-wide">{new Date(selectedHistoryItem.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2 custom-scrollbar">
                            {selectedHistoryItem._type === 'order' ? (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Résumé des Articles</p>
                                    {selectedHistoryItem.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-sm">{itemsT[item.nom] || item.nom}</span>
                                                <span className="text-[10px] text-white/40 uppercase font-medium">Quantité : {item.qty}</span>
                                            </div>
                                            <span className="font-bold text-[#FDB813] text-sm">{item.prix} €</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-6">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Payé</span>
                                        <span className="text-xl font-black text-[#FDB813]">{selectedHistoryItem.total} €</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">Détails de la demande</p>
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <p className="text-sm text-white/80 font-light leading-relaxed italic">
                                            "{selectedHistoryItem.notes || "Aucune note particulière."}"
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Un membre du personnel est en route vers votre chambre.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => setSelectedHistoryItem(null)}
                            className="w-full bg-white/5 text-white/50 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] mt-8 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                        >
                            Fermer les détails
                        </button>
                    </div>
                </div>
            )}
        </div>

    );
};

export default ClientHome;
