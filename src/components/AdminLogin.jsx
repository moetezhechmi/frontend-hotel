import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`http://${window.location.hostname}:3001/api/admin/auth`, {
                username,
                password
            });

            if (response.data.success) {
                localStorage.setItem('adminToken', response.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden backdrop-blur-3xl">
            {/* Ambient gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-container/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary-container/10 blur-[120px] pointer-events-none" />
            
            <div className="max-w-md w-full bg-surface-lowest/5 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-surface-lowest/10 relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-full bg-surface-lowest/10 flex items-center justify-center mx-auto mb-6 shadow-inner border border-surface-lowest/20">
                        <ShieldCheck className="h-8 w-8 text-secondary" />
                    </div>
                    <h1 className="text-3xl font-black text-surface-lowest mb-2 tracking-widest uppercase">Hari Club</h1>
                    <p className="text-surface-lowest/60 tracking-wider">Portail d'Administration</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm text-center animate-pulse tracking-wide">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-5">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-surface-lowest/40 group-focus-within:text-secondary transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Identifiant Administrateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-14 pr-5 py-4 bg-primary/40 border-0 rounded-2xl text-surface-lowest placeholder-surface-lowest/30 outline-none focus:bg-primary/20 focus:ring-2 focus:ring-secondary/50 transition-all font-medium tracking-wide shadow-inner"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-surface-lowest/40 group-focus-within:text-secondary transition-colors" />
                            </div>
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-14 pr-5 py-4 bg-primary/40 border-0 rounded-2xl text-surface-lowest placeholder-surface-lowest/30 outline-none focus:bg-primary/20 focus:ring-2 focus:ring-secondary/50 transition-all font-medium tracking-wide shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-secondary text-primary py-4 rounded-2xl font-bold tracking-widest shadow-lg shadow-secondary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                        >
                            {loading ? 'Connexion...' : 'S\'authentifier'}
                            {!loading && <ArrowRight className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="mt-8 text-center text-xs font-medium tracking-widest uppercase text-surface-lowest/30">
                        Accès réservé au personnel autorisé
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
