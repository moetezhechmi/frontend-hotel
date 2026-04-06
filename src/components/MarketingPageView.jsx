import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, Sparkles, MapPin, Calendar, Clock, X } from 'lucide-react';
import API_BASE_URL from '../config';

const MarketingPageView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/pages/${slug}`);
                const data = await res.json();
                if (data.success) {
                    setPage(data.page);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#040b28] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#FDB813] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!page) {
        return (
            <div className="min-h-screen bg-[#040b28] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="h-10 w-10 text-gray-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Offre introuvable</h1>
                <p className="text-gray-400 mb-8">Cette page n'existe plus ou a expiré.</p>
                <button 
                    onClick={() => navigate('/client/services')}
                    className="px-8 py-3 bg-[#FDB813] text-[#040b28] rounded-xl font-bold"
                >
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040b28] text-white">
            {/* Hero Image */}
            <div className="relative h-[40vh] w-full">
                <img 
                    src={page.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'} 
                    alt={page.titre}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040b28] via-transparent to-black/40"></div>
                
                <button 
                    onClick={() => navigate('/client/services')}
                    className="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-black/40 transition-all"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                {/* X close button — fixed, always visible while scrolling */}
                <button
                    onClick={() => navigate('/client/services')}
                    className="fixed top-5 right-5 z-50 w-11 h-11 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-xl hover:bg-red-500/80 hover:border-red-400/50 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                    <X className="h-5 w-5 text-white" />
                </button>

                <div className="absolute bottom-8 left-6 right-6">
                    <h1 className="text-3xl font-black tracking-tight leading-tight mb-2 drop-shadow-xl">
                        {page.titre}
                    </h1>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-6 py-8">
                <div 
                    className="prose prose-invert max-w-none text-gray-300 leading-relaxed marketing-content"
                    dangerouslySetInnerHTML={{ __html: page.contenu }}
                />

                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[#FDB813]/20 to-transparent border border-[#FDB813]/20">
                    <h3 className="text-lg font-bold text-[#FDB813] mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Profitez de cette offre
                    </h3>
                    <p className="text-sm text-gray-300 mb-6">
                        Présentez cette page à la réception ou au service concerné pour bénéficier des avantages exclusifs.
                    </p>
                    <button 
                        onClick={() => window.print()}
                        className="w-full py-4 bg-[#FDB813] text-[#040b28] rounded-xl font-black text-sm uppercase tracking-wider"
                    >
                        Réserver maintenant
                    </button>
                </div>
            </div>

            {/* Footer space */}
            <div className="h-20"></div>

            <style dangerouslySetInnerHTML={{ __html: `
                .marketing-content h2 { color: #FDB813; font-weight: 800; font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; }
                .marketing-content p { margin-bottom: 1.2rem; }
                .marketing-content ul { list-style: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; }
                .marketing-content li { margin-bottom: 0.5rem; }
                .marketing-content strong { color: white; }
            `}} />
        </div>
    );
};

export default MarketingPageView;
