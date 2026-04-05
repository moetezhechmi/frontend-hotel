import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, DoorClosed, ArrowRight, Globe, Check, CloudOff, Wifi, Info } from 'lucide-react';
import { translations } from '../translations';
import { prefetchHotelData } from '../utils/sync';
import API_BASE_URL from '../config';


const Login = () => {
    const [numeroChambre, setNumeroChambre] = useState('');
    const [codeTemporaire, setCodeTemporaire] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [lang, setLang] = useState('fr');
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    const languages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'ar', name: 'العربية', flag: '🇹🇳' },
    ];

    const safeLang = translations[lang] ? lang : 'fr';
    const t = translations[safeLang].login;

    useEffect(() => {
        const savedLang = localStorage.getItem('clientLang');
        if (savedLang) {
            setLang(savedLang);
        } else {
            setLang('fr'); // Default to French
            localStorage.setItem('clientLang', 'fr');
        }

        // --- High Density Prefetching Strategy ---
        // (Silent prefetch while user is typing login info)
        prefetchHotelData().catch(err => console.log("Prefetching inactive (offline mode entry likely)"));
    }, []);


    const changeLanguage = (l) => {
        setLang(l);
        localStorage.setItem('clientLang', l);
        setIsLangOpen(false);
    };
    
    // Listen for storage changes in case it's changed elsewhere
    useEffect(() => {
        const handleStorageChange = () => {
            const savedLang = localStorage.getItem('clientLang');
            if (savedLang) setLang(savedLang);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!numeroChambre || !codeTemporaire) {
            setError(t.missing_fields);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth`, {
                numeroChambre,
                codeTemporaire
            });

            if (response.data.success) {
                // Store client info / session simply in localStorage for this prototype
                localStorage.setItem('clientId', response.data.client_id);
                localStorage.setItem('chambre', response.data.chambre);
                localStorage.removeItem('offlineMode'); // Clear offline mode if they just logged in!
                navigate('/client/services');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError(t.default_err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--color-primary-container),_var(--color-primary))] flex flex-col items-center justify-center p-6 relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* Ambient Background Blur to mimic depth */}
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[100px] pointer-events-none"></div>

            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white border border-white/20 hover:bg-white/20 transition-all shadow-lg group"
                >
                    <span className="text-lg">{languages.find(l => l.code === lang)?.flag || '🌐'}</span>
                    <svg className={`w-4 h-4 text-white/50 group-hover:text-white transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isLangOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                        <div className="absolute right-0 mt-3 w-48 bg-[#131e50] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                            <div className="py-2">
                                {languages.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => changeLanguage(l.code)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5 ${lang === l.code ? 'text-[#FCAB28] font-bold' : 'text-gray-300'}`}
                                    >
                                        <span className="text-xl">{l.flag}</span>
                                        <span>{l.name}</span>
                                        {lang === l.code && <Check className="h-4 w-4 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="z-10 w-full max-w-md bg-surface-lowest rounded-xl p-10 shadow-[0_0px_24px_rgba(25,28,29,0.04)] sm:p-12 transition-transform duration-500 ease-out translate-y-0">
                <div className="text-center mb-12">
                    <span className="block text-label-md uppercase tracking-[0.05em] text-secondary mb-3">Hari Club</span>
                    <h1 className="text-display-sm sm:text-display-md text-on-surface mb-3 tracking-tight font-medium">{t.welcome}</h1>
                    <p className="text-body-lg text-on-surface/60 font-light">{t.subtitle}</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-secondary-container/10 rounded-xl text-secondary text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <DoorClosed className="h-5 w-5 text-on-surface/40 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder={t.room_num}
                                value={numeroChambre}
                                onChange={(e) => setNumeroChambre(e.target.value)}
                                className="w-full pl-14 pr-5 py-4 bg-surface-container-highest text-on-surface placeholder:text-on-surface/40 rounded-t-lg rounded-b-none outline-none transition-all relative z-10"
                            />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-300 ease-out z-20"></div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-on-surface/40 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="password"
                                placeholder={t.temp_code}
                                value={codeTemporaire}
                                onChange={(e) => setCodeTemporaire(e.target.value)}
                                className="w-full pl-14 pr-5 py-4 bg-surface-container-highest text-on-surface placeholder:text-on-surface/40 rounded-t-lg rounded-b-none outline-none transition-all relative z-10"
                            />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-300 ease-out z-20"></div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-4 rounded-xl font-medium hover:bg-primary-container transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? t.verifying : t.submit}
                        {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>

                    <div className="pt-6 border-t border-surface-container-high">
                        <button
                            type="button"
                            onClick={() => {
                                localStorage.setItem('offlineMode', 'true');
                                navigate('/client/services');
                            }}
                            className="w-full flex items-center justify-center gap-3 bg-surface-container text-on-surface/60 py-3 rounded-xl text-sm font-medium hover:bg-surface-container-high transition-colors"
                        >
                            <CloudOff className="h-4 w-4" />
                            {t.discover_offline}
                        </button>
                    </div>
                </form>

                <div className="mt-8 flex justify-center">
                    {!isOnline ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error rounded-full text-xs font-bold animate-pulse">
                            <CloudOff className="h-3 w-3" />
                            {t.status_offline || "MODE HORS LIGNE"}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-tertiary-container/20 text-tertiary rounded-full text-xs font-bold">
                            <Wifi className="h-3 w-3" />
                            {t.status_online || "En ligne"}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default Login;
