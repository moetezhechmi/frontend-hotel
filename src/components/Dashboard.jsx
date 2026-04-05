import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Users, Search, BedDouble, SignalHigh, SignalLow, LogOut, UserPlus, X, ShoppingCart, Bell, Check, Clock, Calendar, Plus, Trash2, Image, Tag, Waves, Sparkles, Utensils, Coffee, Edit3, Save, History, Globe, MapPin } from 'lucide-react';
import { transformImageUrl } from '../utils/cdn';
import API_BASE_URL from '../config';


const Dashboard = () => {
    const [clients, setClients] = useState([]); // Connected clients
    const [allClients, setAllClients] = useState([]); // All database clients
    const [activeTab, setActiveTab] = useState('clients'); 
    const [roomFilter, setRoomFilter] = useState('all'); 
    const [orders, setOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [latestNotification, setLatestNotification] = useState(null);
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [chambres, setChambres] = useState([]);
    const [newClient, setNewClient] = useState({ nom: '', prenom: '', telephone: '', email: '', chambre_id: '', date_expiration: '' });
    const [newRoom, setNewRoom] = useState({ numero: '', capacite: '' });
    const [generatedCode, setGeneratedCode] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [activities, setActivities] = useState([]);
    const [showAddActivityModal, setShowAddActivityModal] = useState(false);
    const [newActivity, setNewActivity] = useState({ nom: '', description: '', heure: '', categorie: '', jours: 'Quotidien' });
    const [experiences, setExperiences] = useState([]);
    const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
    const [newExperience, setNewExperience] = useState({ nom: '', description: '', image: '', categorie: 'excursion', prix: '', typeActivity: 'default', tarifs: [], galerie: [] });
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [showAddMenuModal, setShowAddMenuModal] = useState(false);
    const [newMenuItem, setNewMenuItem] = useState({ nom: '', description: '', prix: '', categorie: 'Plat', image: '' });
    const [internalServicesList, setInternalServicesList] = useState([]);
    const [showAddInternalServiceModal, setShowAddInternalServiceModal] = useState(false);
    const [newInternalService, setNewInternalService] = useState({ nom: '', icone: '🧹', description: '' });
    
    // Lieux à visiter
    const [lieuxVisite, setLieuxVisite] = useState([]);
    const [showAddLieuModal, setShowAddLieuModal] = useState(false);
    const [newLieu, setNewLieu] = useState({ nom: '', description: '', image: '', latitude: '', longitude: '', adresse: '', categorie: 'Plage' });
    const [editingLieu, setEditingLieu] = useState(null);
    
    // Editing states
    const [editingRoom, setEditingRoom] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    const [editingActivity, setEditingActivity] = useState(null);
    const [editingExperience, setEditingExperience] = useState(null);
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const [editingInternalService, setEditingInternalService] = useState(null);
    
    // Search and Filters
    const [statusFilter, setStatusFilter] = useState('all'); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');
    const [activitySearchQuery, setActivitySearchQuery] = useState('');

    // Client History States
    const [showClientHistoryModal, setShowClientHistoryModal] = useState(false);
    const [selectedClientHistory, setSelectedClientHistory] = useState(null);
    const [clientActivities, setClientActivities] = useState({ orders: [], services: [] });
    const [historySearchQuery, setHistorySearchQuery] = useState('');
    const [historyTypeFilter, setHistoryTypeFilter] = useState('all'); // all, order, service
    const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
    const [uploadingImage, setUploadingImage] = useState(false);



    const navigate = useNavigate();

    const openClientHistory = async (client) => {
        setSelectedClientHistory(client);
        setShowClientHistoryModal(true);
        // Reset filters
        setHistorySearchQuery('');
        setHistoryTypeFilter('all');
        setHistoryStatusFilter('all');
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/clients/${client.id}/activity`);
            const data = await res.json();
            if (data.success) {
                setClientActivities(data);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        // Auth check
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/dashboard/login');
            return;
        }

        // Fetch chambres
        const fetchChambres = () => {
            fetch(API_BASE_URL + '/api/admin/chambres', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setChambres(data.chambres);
                })
                .catch(console.error);
        };

        // Fetch ALL clients from DB
        const fetchAllClients = () => {
            fetch(API_BASE_URL + '/api/admin/clients', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setAllClients(data.clients);
                })
                .catch(console.error);
        };

        const fetchRequests = () => {
            fetch(API_BASE_URL + '/api/admin/requests', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrders(data.orders);
                        setServices(data.services);
                    }
                })
                .catch(console.error);
        };

        const fetchActivities = () => {
            fetch(API_BASE_URL + '/api/activities')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setActivities(data.activities);
                })
                .catch(console.error);
        };

        const fetchExperiences = () => {
            fetch(API_BASE_URL + '/api/experiences')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setExperiences(data.experiences);
                })
                .catch(console.error);
        };

        const fetchMenu = () => {
            fetch(API_BASE_URL + '/api/admin/menu', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setMenuItems(data.items);
                })
                .catch(console.error);
        };

        const fetchInternalServices = () => {
            fetch(API_BASE_URL + '/api/admin/internal-services', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setInternalServicesList(data.services);
                })
                .catch(console.error);
        };

        const fetchLieuxVisite = () => {
            fetch(API_BASE_URL + '/api/lieux-visite')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setLieuxVisite(data.items);
                })
                .catch(console.error);
        };

        fetchChambres();
        fetchAllClients();
        fetchRequests();
        fetchActivities();
        fetchExperiences();
        fetchMenu();
        fetchInternalServices();
        fetchLieuxVisite();

        // Connect to WebSocket server
        const socket = io(API_BASE_URL + '');

        socket.on('active_clients_list', (data) => {
            setClients(data);
        });

        socket.emit('get_active_clients');

        socket.on('client_connected', (data) => {
            // Add client if not already shown as connected 
            // or update list
            setClients(prev => {
                const existing = prev.find(c => c.clientId === data.clientId);
                if (existing) return prev;
                return [data, ...prev];
            });

            setNotifications(prev => [{
                id: Date.now(),
                message: `Client connecté : ${data.prenom} ${data.nom} (Chambre ${data.chambre})`,
                type: 'CONNECTION',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false
            }, ...prev]);
        });

        socket.on('new_activity', (data) => {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});

            setNotifications(prev => [{
                id: Date.now(),
                message: data.message,
                type: data.type,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false
            }, ...prev]);

            if (data.type === 'ORDER') {
                setOrders(prev => [data.data, ...prev]);
            } else {
                setServices(prev => [data.data, ...prev]);
            }
            
            setLatestNotification(data.message);
            setTimeout(() => setLatestNotification(null), 5000);
        });

        return () => {
            socket.disconnect();
        };
    }, [navigate]);



    const handleAddClient = async (e) => {
        e.preventDefault();
        setSubmitError('');
        try {
            const url = editingClient
                ? `${API_BASE_URL}/api/admin/clients/${editingClient.id}`
                : API_BASE_URL + '/api/admin/clients';
            const method = editingClient ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newClient)
            });
            const data = await res.json();
            if (data.success) {
                if (!editingClient) setGeneratedCode(data.code_temporaire);
                setNewClient({ nom: '', prenom: '', telephone: '', email: '', chambre_id: '', date_expiration: '' });
                setEditingClient(null);
                if (editingClient) setShowAddClientModal(false);
                setLatestNotification(editingClient ? "Client modifiÃ© !" : "Client ajoutÃ© !");
                setTimeout(() => setLatestNotification(null), 3000);
                
                // Refresh data
                const clientsRes = await fetch(API_BASE_URL + '/api/admin/clients', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                }).then(r => r.json());
                if (clientsRes.success) setAllClients(clientsRes.clients);

            } else {
                setSubmitError(data.message || 'Erreur');
            }
        } catch (err) {
            setSubmitError('Erreur de connexion');
        }
    };


    const handleAddRoom = async (e) => {
        e.preventDefault();
        setSubmitError('');

        try {
            const url = editingRoom
                ? `${API_BASE_URL}/api/admin/chambres/${editingRoom.id}`
                : API_BASE_URL + '/api/admin/chambres';
            const method = editingRoom ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newRoom)
            });
            const data = await res.json();
            if (data.success) {
                const updated = await fetch(API_BASE_URL + '/api/admin/chambres', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                }).then(r => r.json());
                if (updated.success) setChambres(updated.chambres);
                setShowAddRoomModal(false);
                setNewRoom({ numero: '', capacite: '' });
                setEditingRoom(null);
                setLatestNotification(editingRoom ? "Chambre modifiÃ©e !" : "Chambre ajoutÃ©e avec succÃ¨s !");
                setTimeout(() => setLatestNotification(null), 3000);
            } else {
                setSubmitError(data.message || 'Erreur');
            }
        } catch (err) {
            setSubmitError('Erreur de connexion');
        }
    };


    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        setUploadingImage(true);
        try {
            const res = await fetch(API_BASE_URL + '/api/admin/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) return data.imageUrl;
            return null;
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const updateRequestStatut = async (type, id, statut) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/requests/${type}/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ statut })
            });
            if (res.ok) {
                // Refresh local data
                fetch(API_BASE_URL + '/api/admin/requests', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                })
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            setOrders(data.orders);
                            setServices(data.services);
                        }
                    });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        try {
            const url = editingMenuItem
                ? `${API_BASE_URL}/api/admin/menu/${editingMenuItem.id}`
                : API_BASE_URL + '/api/admin/menu';
            const method = editingMenuItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newMenuItem)
            });
            const data = await res.json();
            if (data.success) {
                if (editingMenuItem) {
                    setMenuItems(menuItems.map(item => item.id === editingMenuItem.id ? { ...item, ...newMenuItem } : item));
                } else {
                    setMenuItems([...menuItems, data.item]);
                }
                setShowAddMenuModal(false);
                setNewMenuItem({ nom: '', description: '', prix: '', categorie: 'Plat', image: '' });
                setEditingMenuItem(null);
                setLatestNotification(editingMenuItem ? "Plat modifiÃ© !" : "Plat ajoutÃ© !");
                setTimeout(() => setLatestNotification(null), 3000);
            }
        } catch (err) { console.error(err); }
    };


    const toggleMenuDispo = async (id, currentDispo) => {
        const res = await fetch(`${API_BASE_URL}/api/admin/menu/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ disponibilite: !currentDispo })
        });
        if (res.ok) {
            setMenuItems(menuItems.map(item => item.id === id ? { ...item, disponibilite: !currentDispo } : item));
        }
    };

    const deleteMenuItem = async (id) => {
        if (!window.confirm('Supprimer ce plat ?')) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/menu/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
            setMenuItems(menuItems.filter(item => item.id !== id));
        }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        try {
            const url = editingActivity
                ? `${API_BASE_URL}/api/admin/activities/${editingActivity.id}`
                : API_BASE_URL + '/api/admin/activities';
            const method = editingActivity ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newActivity)
            });
            const data = await res.json();
            if (data.success) {
                if (editingActivity) {
                    setActivities(activities.map(a => a.id === editingActivity.id ? { ...a, ...newActivity } : a));
                } else {
                    setActivities([...activities, data.activity]);
                }
                setShowAddActivityModal(false);
                setNewActivity({ nom: '', description: '', heure: '', categorie: '', jours: 'Quotidien' });
                setEditingActivity(null);
                setLatestNotification(editingActivity ? "ActivitÃ© modifiÃ©e !" : "ActivitÃ© ajoutÃ©e !");
                setTimeout(() => setLatestNotification(null), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };


    const handleDeleteActivity = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/activities/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (res.ok) {
                setActivities(activities.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddExperience = async (e) => {
        e.preventDefault();
        try {
            const url = editingExperience
                ? `${API_BASE_URL}/api/admin/experiences/${editingExperience.id}`
                : API_BASE_URL + '/api/admin/experiences';
            const method = editingExperience ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newExperience)
            });
            const data = await res.json();
            if (data.success) {
                if (editingExperience) {
                    setExperiences(experiences.map(e => e.id === editingExperience.id ? { ...e, ...newExperience } : e));
                } else {
                    setExperiences([...experiences, data.experience]);
                }
                setShowAddExperienceModal(false);
                setNewExperience({ nom: '', description: '', image: '', categorie: 'excursion', prix: '', typeActivity: 'default', tarifs: [], galerie: [] });
                setEditingExperience(null);
                setLatestNotification(editingExperience ? "ExpÃ©rience modifiÃ©e !" : "ExpÃ©rience ajoutÃ©e avec succÃ¨s !");
                setTimeout(() => setLatestNotification(null), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };


    const handleDeleteExperience = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/experiences/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (res.ok) {
                setExperiences(experiences.filter(e => e.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddInternalService = async (e) => {
        e.preventDefault();
        try {
            const url = editingInternalService
                ? `${API_BASE_URL}/api/admin/internal-services/${editingInternalService.id}`
                : API_BASE_URL + '/api/admin/internal-services';
            const method = editingInternalService ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newInternalService)
            });
            const data = await res.json();
            if (data.success) {
                if (editingInternalService) {
                    setInternalServicesList(prev => prev.map(s => s.id === editingInternalService.id ? { ...s, ...newInternalService } : s));
                } else {
                    setInternalServicesList(prev => [...prev, data.service]);
                }
                setShowAddInternalServiceModal(false);
                setNewInternalService({ nom: '', icone: 'ðŸ§¹', description: '' });
                setEditingInternalService(null);
                setLatestNotification(editingInternalService ? "Service modifiÃ© !" : "Service ajoutÃ© avec succÃ¨s !");
                setTimeout(() => setLatestNotification(null), 3000);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteRoom = async (id) => {
        if (!window.confirm('Supprimer cette chambre ?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/chambres/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) setChambres(prev => prev.filter(c => c.id !== id));
        } catch (err) { console.error(err); }
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm('Supprimer ce client ?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/clients/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) setAllClients(prev => prev.filter(c => c.id !== id));
        } catch (err) { console.error(err); }
    };

    const handleAddLieu = async (e) => {
        e.preventDefault();
        try {
            const url = editingLieu
                ? `${API_BASE_URL}/api/admin/lieux-visite/${editingLieu.id}`
                : API_BASE_URL + '/api/admin/lieux-visite';
            const method = editingLieu ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newLieu)
            });
            const data = await res.json();
            if (data.success) {
                if (editingLieu) {
                    setLieuxVisite(prev => prev.map(l => l.id === editingLieu.id ? { ...l, ...newLieu } : l));
                } else {
                    setLieuxVisite(prev => [...prev, data.item]);
                }
                setShowAddLieuModal(false);
                setNewLieu({ nom: '', description: '', image: '', latitude: '', longitude: '', adresse: '', categorie: 'Plage' });
                setEditingLieu(null);
                setLatestNotification(editingLieu ? "Lieu modifié !" : "Lieu ajouté avec succès !");
                setTimeout(() => setLatestNotification(null), 3000);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteLieu = async (id) => {
        if (!window.confirm('Supprimer ce lieu ?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/lieux-visite/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) setLieuxVisite(prev => prev.filter(l => l.id !== id));
        } catch (err) { console.error(err); }
    };


    const toggleInternalService = async (id, currentStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/internal-services/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ disponibilite: !currentStatus })
            });
            if (res.ok) {
                setInternalServicesList(prev => prev.map(s => s.id === id ? { ...s, disponibilite: !currentStatus } : s));
            }
        } catch (err) { console.error(err); }
    };

    const deleteInternalService = async (id) => {
        if (!window.confirm('Supprimer ce service ?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/internal-services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) {
                setInternalServicesList(prev => prev.filter(s => s.id !== id));
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen bg-surface-container font-sans flex text-on-surface">
            {/* Sidebar */}
            <aside className="w-64 bg-surface-lowest shadow-[1px_0_10px_rgba(0,0,0,0.03)] hidden md:block z-10 relative">
                <div className="h-20 flex items-center px-8">
                    <span className="text-xl font-black text-primary tracking-tight">HariDash</span>
                </div>
                <nav className="p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('clients')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'clients' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <SignalHigh className="h-5 w-5" />
                        <span>Live Dashboard</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('all_clients')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'all_clients' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <Users className="h-5 w-5" />
                        <span>Tous les Clients</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('rooms')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'rooms' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <BedDouble className="h-5 w-5" />
                        <span>Chambres</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('activities')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'activities' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <Calendar className="h-5 w-5" />
                        <span>Activités</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('experiences')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'experiences' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <Sparkles className="h-5 w-5 shrink-0" />
                        <span className="truncate">Expériences (Excursions/SPA)</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <div className="flex items-center gap-4 truncate">
                            <ShoppingCart className="h-5 w-5 shrink-0" />
                            <span className="truncate">Commandes & Services</span>
                        </div>
                        {(orders.filter(o => o.statut === 'En attente').length + services.filter(s => s.statut === 'En attente').length) > 0 && (
                            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-lg animate-pulse shadow-sm">
                                {orders.filter(o => o.statut === 'En attente').length + services.filter(s => s.statut === 'En attente').length}
                            </span>
                        )}
                    </button>

                    <button 
                        onClick={() => setActiveTab('menu')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'menu' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <Utensils className="h-5 w-5 shrink-0" />
                        <span className="truncate">Carte Room Service</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('internal_services')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'internal_services' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <Bell className="h-5 w-5 shrink-0" />
                        <span className="truncate">Services Internes (Ménage...)</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('lieux_visite')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'lieux_visite' ? 'bg-primary-container/20 text-primary' : 'text-on-surface/60 hover:bg-surface-container-low hover:text-on-surface'}`}
                    >
                        <Globe className="h-5 w-5 shrink-0" />
                        <span className="truncate">Découvrir la région</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative z-0">
                {/* Header */}
                <header className="h-20 bg-surface-lowest/80 backdrop-blur-xl flex items-center justify-between px-10 transition-all sticky top-0 z-20">
                    <h1 className="text-headline-sm font-medium text-on-surface">Vue d'ensemble</h1>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setShowNotifDropdown(!showNotifDropdown);
                                    if (!showNotifDropdown) {
                                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                    }
                                }}
                                className="relative text-on-surface/60 hover:text-primary transition-colors p-2.5 rounded-full hover:bg-surface-container-low"
                            >
                                <Bell className="h-6 w-6" />
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-tertiary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface-lowest">
                                        {notifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </button>

                            {showNotifDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                                    <div className="absolute right-0 mt-4 w-80 bg-surface-lowest rounded-2xl shadow-2xl border border-surface-container-low z-50 overflow-hidden animate-fade-in">
                                        <div className="px-5 py-4 border-b border-surface-container-low flex justify-between items-center bg-surface-container-low/30">
                                            <h3 className="font-bold text-sm text-on-surface">Notifications</h3>
                                            <button onClick={() => setNotifications([])} className="text-[10px] text-primary font-bold uppercase transition-opacity hover:opacity-70">Effacer</button>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="py-10 text-center text-on-surface/40 text-xs italic font-light">Aucune notification</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className="px-5 py-4 border-b border-surface-container-low/50 hover:bg-surface-container-low/20 transition-colors last:border-0 relative group">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-tertiary'}`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-on-surface leading-normal">{n.message}</p>
                                                                <span className="text-[10px] text-on-surface/40 mt-1 block font-medium uppercase tracking-wider">{n.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-11 pr-4 py-2.5 bg-surface-container-low border-0 text-sm rounded-full focus:bg-surface-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all w-64 placeholder:text-on-surface/40"
                            />
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('adminToken');
                                navigate('/dashboard/login');
                            }}
                            className="text-secondary/70 hover:text-secondary hover:bg-secondary-container/20 p-2.5 rounded-full transition-colors"
                            title="Déconnexion"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Notif */}

                {/* Dashboard Content */}
                <div className="p-10 flex-1 bg-surface-container overflow-y-auto">
                    {activeTab === 'clients' && (
                        <>
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-xl font-medium text-on-surface">Clients Actuellement en Ligne</h2>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setShowAddClientModal(true)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2 active:scale-95">
                                        <UserPlus className="h-4 w-4" />
                                        Ajouter un Client
                                    </button>
                                    <div className="bg-surface-lowest px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface/80 flex items-center gap-2 shadow-[0_0px_16px_rgba(25,28,29,0.02)]">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
                                        </span>
                                        En direct
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-lowest rounded-2xl shadow-[0_0px_24px_rgba(25,28,29,0.04)] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low/50">
                                        <tr>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Client</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Chambre</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Heure de connexion</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-low">
                                        {clients.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-16 text-center text-on-surface/40">
                                                    <SignalLow className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                                    <p className="font-light">Aucun client connectÃ© pour le moment.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            clients.map((client, idx) => (
                                                <tr 
                                                    key={idx} 
                                                    onClick={() => openClientHistory(client)}
                                                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-sm group-hover:scale-110 transition-transform">
                                                                {client.prenom[0]}{client.nom[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-on-surface flex items-center gap-2">
                                                                    {client.prenom} {client.nom}
                                                                    <History className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </p>
                                                                <p className="text-xs text-on-surface/50 sm:hidden block mt-0.5">Ch. {client.chambre}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-on-surface/80 font-medium">
                                                        {client.chambre}
                                                    </td>
                                                    <td className="px-6 py-5 text-on-surface/60 text-sm">
                                                        {new Date(client.time).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-tertiary-container/20 text-tertiary">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-tertiary"></span>
                                                            Connecté
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'all_clients' && (
                        <>
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-xl font-medium text-on-surface">Tous les Clients EnregistrÃ©s</h2>
                                <button onClick={() => setShowAddClientModal(true)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2 active:scale-95">
                                    <UserPlus className="h-4 w-4" />
                                    Ajouter un Client
                                </button>
                            </div>

                            <div className="bg-surface-lowest rounded-2xl shadow-[0_0px_24px_rgba(25,28,29,0.04)] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low/50">
                                        <tr>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Client</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Contact</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Chambre & Code</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Expiration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-low">
                                        {allClients.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-16 text-center text-on-surface/40">
                                                    <Users className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                                    <p className="font-light">Aucun client enregistré.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            allClients.map((client) => (
                                                <tr 
                                                    key={client.id} 
                                                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                                                    onClick={(e) => {
                                                        // Prevent modal opening if clicking on action buttons
                                                        if (e.target.closest('button')) return;
                                                        openClientHistory(client);
                                                    }}
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-sm group-hover:scale-110 transition-transform">
                                                                {client.prenom[0]}{client.nom[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-on-surface flex items-center gap-2">
                                                                    {client.prenom} {client.nom}
                                                                    <History className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </p>
                                                                <p className="text-xs text-primary font-semibold mt-0.5">{client.CodeAcces && client.CodeAcces.length > 0 ? `Code: ${client.CodeAcces[0].code_temporaire}` : 'Pas de code'}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <p className="text-sm text-on-surface/80">{client.email || 'Pas d\'email'}</p>
                                                        <p className="text-xs text-on-surface/50 mt-1">{client.telephone || 'Pas de tÃ©l'}</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high/30 text-on-surface/80 text-sm font-medium">
                                                            <BedDouble className="h-4 w-4" />
                                                            {client.CodeAcces && client.CodeAcces.length > 0 && client.CodeAcces[0].Chambre 
                                                                ? `Chambre ${client.CodeAcces[0].Chambre.numero}` 
                                                                : 'Non assignée'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => {
                                                                    setNewClient({ ...client, chambre_id: client.CodeAcces?.[0]?.chambre_id || '', date_expiration: client.CodeAcces?.[0]?.date_expiration?.slice(0, 16) || '' });
                                                                    setEditingClient(client);
                                                                    setShowAddClientModal(true);
                                                                }}
                                                                className="p-2 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteClient(client.id)}
                                                                className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-full transition-colors"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'rooms' && (
                        <>
                            <div className="mb-8 flex items-center justify-between">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-xl font-medium text-on-surface">Exploitation des Chambres</h2>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setRoomFilter('all')} className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${roomFilter === 'all' ? 'bg-on-surface text-surface-lowest' : 'bg-surface-lowest text-on-surface/60 hover:bg-surface-container-low shadow-sm'}`}>Toutes ({chambres.length})</button>
                                        <button onClick={() => setRoomFilter('vacant')} className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${roomFilter === 'vacant' ? 'bg-tertiary text-on-primary' : 'bg-surface-lowest text-tertiary hover:bg-tertiary-container/20 shadow-sm'}`}>Libres ({chambres.filter(c => !c.isOccupied).length})</button>
                                        <button onClick={() => setRoomFilter('occupied')} className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${roomFilter === 'occupied' ? 'bg-secondary text-black' : 'bg-surface-lowest text-secondary hover:bg-secondary-container/20 shadow-sm'}`}>Occupées ({chambres.filter(c => c.isOccupied).length})</button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setShowAddRoomModal(true)} className="bg-surface-lowest text-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container/20 shadow-sm transition-colors flex items-center gap-2">
                                        <BedDouble className="h-4 w-4" />
                                        Nouvelle Chambre
                                    </button>
                                    <button onClick={() => setShowAddClientModal(true)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2 active:scale-95">
                                        <UserPlus className="h-4 w-4" />
                                        Ajouter un Client
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {chambres.filter(c => roomFilter === 'all' || (roomFilter === 'vacant' && !c.isOccupied) || (roomFilter === 'occupied' && c.isOccupied)).map((chambre) => (
                                    <div key={chambre.id} className={`bg-surface-lowest relative overflow-hidden transition-all rounded-2xl p-6 shadow-[0_0px_24px_rgba(25,28,29,0.04)] outline outline-1 ${chambre.isOccupied ? 'outline-secondary-container bg-secondary-container/5' : 'outline-surface-container-high hover:shadow-md hover:bg-surface-container-low'}`}>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${chambre.isOccupied ? 'bg-secondary-container/30 text-secondary' : 'bg-primary-container/20 text-primary'}`}>
                                                <BedDouble className="h-6 w-6" />
                                            </div>
                                            <span className={`px-3 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest ${chambre.isOccupied ? 'bg-secondary-container/30 text-secondary' : 'bg-tertiary-container/30 text-tertiary'}`}>
                                                {chambre.isOccupied ? 'Occupée' : 'Libre'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-on-surface mb-1 shadow-sm">Chambre {chambre.numero}</h3>
                                        <p className="text-on-surface/50 text-sm mb-5 font-light">Capacité: {chambre.capacite} personnes</p>
                                        
                                        {chambre.isOccupied && chambre.CodeAcces && chambre.CodeAcces[0] && (
                                            <div className="mb-5 p-4 bg-surface-lowest outline outline-1 outline-secondary-container/50 rounded-xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                                <p className="text-[10px] text-on-surface/40 font-bold uppercase mb-1 tracking-wider relative z-10">Client Actuel</p>
                                                <p className="text-sm font-semibold text-on-surface relative z-10">{chambre.CodeAcces[0].Client.prenom} {chambre.CodeAcces[0].Client.nom}</p>
                                                <p className="text-[11px] text-secondary font-medium mt-1 relative z-10">Code: {chambre.CodeAcces[0].code_temporaire}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-surface-container-low">
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => {
                                                        setNewRoom({ numero: chambre.numero, capacite: chambre.capacite });
                                                        setEditingRoom(chambre);
                                                        setShowAddRoomModal(true);
                                                    }}
                                                    className="p-2 text-primary/60 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteRoom(chambre.id)}
                                                    className="p-2 text-error/60 hover:text-error transition-colors hover:bg-error/10 rounded-full"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            {!chambre.isOccupied ? (
                                                <button 
                                                    onClick={() => {
                                                        setNewClient({ ...newClient, chambre_id: chambre.id });
                                                        setShowAddClientModal(true);
                                                    }}
                                                    className="text-primary text-sm font-bold hover:text-primary-container transition-colors"
                                                >
                                                    Assigner Client
                                                </button>
                                            ) : (
                                                <span className="text-secondary text-xs font-bold tracking-widest uppercase">En cours</span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </>
                    )}

                    {activeTab === 'activities' && (
                        <>
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-xl font-medium text-on-surface">Programme des Activités</h2>
                                <button 
                                    onClick={() => setShowAddActivityModal(true)} 
                                    className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2 active:scale-95 shadow-lg shadow-primary/10"
                                >
                                    <Plus className="h-4 w-4" />
                                    Ajouter une Activité
                                </button>
                            </div>

                            {/* Activities Filter Bar */}
                            <div className="mb-6 bg-surface-lowest p-5 rounded-3xl shadow-sm border border-surface-container-high flex flex-col md:flex-row gap-5 items-center justify-between">
                                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                                    {['all', 'Sport', 'Restaurant', 'Animation'].map(cat => (
                                        <button 
                                            key={cat}
                                            onClick={() => setActivityCategoryFilter(cat)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activityCategoryFilter === cat ? 'bg-secondary text-on-secondary shadow-md' : 'bg-surface-container-low text-on-surface/40 hover:bg-surface-container'}`}
                                        >
                                            {cat === 'all' ? 'Toutes les catégories' : cat}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface/30" />
                                    <input 
                                        type="text" 
                                        placeholder="Rechercher une activité..." 
                                        value={activitySearchQuery}
                                        onChange={e => setActivitySearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-5 py-3 bg-surface-container-low rounded-2xl text-sm border border-transparent focus:border-secondary/20 outline-none transition-all placeholder:text-on-surface/20"
                                    />
                                </div>
                            </div>


                            <div className="bg-surface-lowest rounded-2xl shadow-[0_0px_24px_rgba(25,28,29,0.04)] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low/50">
                                        <tr>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Activité</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Heure</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Catégorie</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Jours</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-low">
                                        {activities
                                            .filter(a => activityCategoryFilter === 'all' || a.categorie === activityCategoryFilter)
                                            .filter(a => !activitySearchQuery || a.nom.toLowerCase().includes(activitySearchQuery.toLowerCase()))
                                            .length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-16 text-center text-on-surface/40">
                                                    <Calendar className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                                    <p className="font-light">Aucune activité ne correspond à vos critères.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            activities
                                                .filter(a => activityCategoryFilter === 'all' || a.categorie === activityCategoryFilter)
                                                .filter(a => !activitySearchQuery || a.nom.toLowerCase().includes(activitySearchQuery.toLowerCase()))
                                                .map((activity) => (

                                                <tr key={activity.id} className="hover:bg-surface-container-low/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <p className="font-medium text-on-surface">{activity.nom}</p>
                                                        <p className="text-xs text-on-surface/50">{activity.description}</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-on-surface/80 font-medium whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-primary" />
                                                            {activity.heure}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-secondary-container/20 text-secondary">
                                                            {activity.categorie}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-on-surface/60 text-sm">
                                                        {activity.jours}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={() => {
                                                                    setNewActivity({ ...activity });
                                                                    setEditingActivity(activity);
                                                                    setShowAddActivityModal(true);
                                                                }}
                                                                className="text-primary/60 hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteActivity(activity.id)}
                                                                className="text-error/60 hover:text-error p-2 rounded-full hover:bg-error/10 transition-colors"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'experiences' && (
                        <>
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-xl font-medium text-on-surface">Catalogue des Expériences (SPA & Excursions)</h2>
                                <button 
                                    onClick={() => setShowAddExperienceModal(true)} 
                                    className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2 active:scale-95"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nouvelle Expérience
                                </button>
                            </div>

                            <div className="bg-surface-lowest rounded-2xl shadow-[0_0px_24px_rgba(25,28,29,0.04)] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low/50">
                                        <tr>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Expérience</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Description</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Prix</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Catégorie</th>
                                            <th className="px-6 py-5 text-xs font-medium text-on-surface/50 uppercase tracking-[0.05em]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-low">
                                        {experiences.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-16 text-center text-on-surface/40">
                                                    <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-20" />
                                                    <p className="font-light">Aucune expÃ©rience rÃ©pertoriÃ©e.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            experiences.map((exp) => (
                                                <tr key={exp.id} className="hover:bg-surface-container-low/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-lg bg-surface-container-low overflow-hidden">
                                                                <img src={transformImageUrl(exp.image)} alt={exp.nom} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-on-surface">{exp.nom}</p>
                                                                <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">{exp.typeActivity !== 'default' ? exp.typeActivity : ''}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-[10px] font-light text-on-surface/60 max-w-[200px] truncate">
                                                        {exp.description}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            {exp.tarifs && exp.tarifs.length > 0 ? (
                                                                exp.tarifs.map((t, i) => (
                                                                    <span key={i} className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10">
                                                                        {t.label}: {t.price}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-sm font-bold text-primary">{exp.prix}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold ${exp.categorie === 'spa' ? 'bg-tertiary-container/20 text-tertiary' : 'bg-secondary-container/20 text-secondary'}`}>
                                                            {exp.categorie.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={() => {
                                                                    setNewExperience({ ...exp });
                                                                    setEditingExperience(exp);
                                                                    setShowAddExperienceModal(true);
                                                                }}
                                                                className="text-primary/60 hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteExperience(exp.id)}
                                                                className="text-error/60 hover:text-error p-2 rounded-full hover:bg-error/10 transition-colors"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}


                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Filtering Toolbar */}
                            <div className="bg-surface-lowest p-6 rounded-[32px] shadow-sm border border-surface-container-high flex flex-col md:flex-row gap-5 items-center justify-between">
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <SignalHigh className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-on-surface">Gestion Rapide</h3>
                                        <p className="text-[10px] text-on-surface/40 font-bold uppercase tracking-widest">Filtrer & Rechercher</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
                                    {['all', 'En attente', 'En cours', 'Livré', 'Terminé'].map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => setStatusFilter(s)}
                                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-low text-on-surface/50 hover:bg-surface-container'}`}
                                        >
                                            {s === 'all' ? 'Tous' : s}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface/30" />
                                    <input 
                                        type="text" 
                                        placeholder="Numéro de Chambre..." 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-5 py-3.5 bg-surface-container-low rounded-2xl text-sm border border-transparent focus:border-primary/20 outline-none transition-all placeholder:text-on-surface/20 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                                {/* Orders Column */}
                                <div>
                                    <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3">
                                        <ShoppingCart className="h-6 w-6 text-secondary" />
                                        Commandes Room Service
                                    </h2>
                                    <div className="space-y-4">
                                        {orders
                                            .filter(o => statusFilter === 'all' || o.statut === statusFilter || (statusFilter === 'Livré' && o.statut === 'Livré'))
                                            .filter(o => !searchQuery || String(o.chambre).includes(searchQuery))
                                            .length === 0 ? (
                                            <div className="bg-surface-lowest p-12 text-center rounded-3xl outline outline-1 outline-dashed outline-on-surface/20 text-on-surface/40">Aucune commande ne correspond.</div>
                                        ) : orders
                                            .filter(o => statusFilter === 'all' || o.statut === statusFilter || (statusFilter === 'Livré' && o.statut === 'Livré'))
                                            .filter(o => !searchQuery || String(o.chambre).includes(searchQuery))
                                            .map(order => (

                                            <div key={order.id} className={`bg-surface-lowest p-6 rounded-2xl shadow-[0_0px_24px_rgba(25,28,29,0.04)] outline outline-1 transition-all ${order.statut === 'En attente' ? 'outline-primary bg-primary/[0.02] scale-[1.02] shadow-xl' : 'outline-surface-container-high hover:bg-surface-container-lowest'}`}>
                                                {order.statut === 'En attente' && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Nouvelle Commande</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-5">
                                                    <div>
                                                        <span className="px-3 py-1 bg-surface-container-low text-[10px] font-bold rounded-lg text-on-surface/60 uppercase tracking-widest mb-2 inline-block">Chambre {order.chambre}</span>
                                                        <h4 className="font-bold text-on-surface text-lg">Commande #{order.id}</h4>
                                                        <p className="text-[11px] text-on-surface/40 font-medium tracking-wide uppercase">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${
                                                        order.statut === 'En attente' ? 'bg-secondary-container/20 text-secondary' : 
                                                        order.statut === 'En cours' ? 'bg-primary-container/20 text-primary' : 'bg-tertiary-container/20 text-tertiary'
                                                    }`}>
                                                        {order.statut}
                                                    </span>
                                                </div>
                                                <div className="space-y-3 mb-5">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex justify-between text-sm">
                                                            <span className="text-on-surface/70">{item.qty}x {item.nom}</span>
                                                            <span className="font-medium text-on-surface">{item.prix * item.qty} €</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-3 mt-3 border-t border-surface-container-low flex justify-between font-bold">
                                                        <span className="text-on-surface/70">Total</span>
                                                        <span className="text-primary text-xl">{order.total} €</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    {order.statut === 'En attente' && (
                                                        <button onClick={() => updateRequestStatut('order', order.id, 'En cours')} className="flex-1 bg-primary/10 text-primary py-3 rounded-xl text-xs font-bold hover:bg-primary-container transition uppercase tracking-widest">Accepter</button>
                                                    )}
                                                    {order.statut === 'En cours' && (
                                                        <button onClick={() => updateRequestStatut('order', order.id, 'Livré')} className="flex-1 bg-tertiary text-on-primary py-3 rounded-xl text-xs font-bold hover:bg-tertiary-container/80 transition flex items-center justify-center gap-2 uppercase tracking-widest">
                                                            <Check className="h-4 w-4" /> Terminer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Services Column */}
                                <div>
                                    <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3">
                                        <Bell className="h-6 w-6 text-primary" />
                                        Demandes & Réservations
                                    </h2>
                                    <div className="space-y-4">
                                        {services
                                            .filter(s => statusFilter === 'all' || s.statut === statusFilter || (statusFilter === 'Terminé' && s.statut === 'Terminé'))
                                            .filter(s => !searchQuery || String(s.chambre).includes(searchQuery))
                                            .length === 0 ? (
                                            <div className="bg-surface-lowest p-12 text-center rounded-3xl outline outline-1 outline-dashed outline-on-surface/20 text-on-surface/40">Aucune demande ne correspond.</div>
                                        ) : services
                                            .filter(s => statusFilter === 'all' || s.statut === statusFilter || (statusFilter === 'Terminé' && s.statut === 'Terminé'))
                                            .filter(s => !searchQuery || String(s.chambre).includes(searchQuery))
                                            .map(service => (

                                            <div key={service.id} className={`bg-surface-lowest p-6 rounded-2xl shadow-[0_0px_24px_rgba(25,28,29,0.04)] outline outline-1 transition-all ${service.statut === 'En attente' ? 'outline-primary bg-primary/[0.02] scale-[1.02] shadow-xl' : 'outline-surface-container-high hover:bg-surface-container-lowest'}`}>
                                                {service.statut === 'En attente' && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Nouvelle Demande</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="px-3 py-1 bg-surface-container-low text-[10px] font-bold rounded-lg text-primary uppercase mb-2 inline-block tracking-widest">Chambre {service.chambre}</span>
                                                        <h4 className="font-bold text-on-surface text-lg">{service.type}</h4>
                                                        <p className="text-[11px] text-on-surface/40 font-medium tracking-wide uppercase">{new Date(service.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                                                        service.statut === 'En attente' ? 'bg-secondary-container/20 text-secondary' : 
                                                        service.statut === 'En cours' ? 'bg-primary-container/20 text-primary' : 'bg-tertiary-container/20 text-tertiary'
                                                    }`}>
                                                        {service.statut}
                                                    </span>
                                                </div>
                                                {service.notes && (
                                                    <p className="bg-surface-container-low p-4 rounded-xl text-sm text-on-surface/70 font-light italic mb-5 leading-relaxed">"{service.notes}"</p>
                                                )}
                                                <div className="flex gap-3">
                                                    {service.statut === 'En attente' && (
                                                        <button onClick={() => updateRequestStatut('service', service.id, 'En cours')} className="flex-1 bg-primary text-on-primary py-3 rounded-xl text-xs font-bold hover:bg-primary-container transition uppercase tracking-widest">Prise en charge</button>
                                                    )}
                                                    {service.statut === 'En cours' && (
                                                        <button onClick={() => updateRequestStatut('service', service.id, 'Terminé')} className="flex-1 bg-tertiary text-on-primary py-3 rounded-xl text-xs font-bold hover:bg-tertiary-container/80 transition flex items-center justify-center gap-2 uppercase tracking-widest">
                                                            <Check className="h-4 w-4" /> Terminé
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'menu' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-medium text-on-surface">Carte Room Service</h2>
                                <button onClick={() => setShowAddMenuModal(true)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2 active:scale-95">
                                    <Plus className="h-4 w-4" />
                                    Ajouter un plat
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {menuItems.map(item => (
                                    <div key={item.id} className={`bg-surface-lowest rounded-2xl overflow-hidden border transition-all p-5 shadow-sm hover:shadow-md ${item.disponibilite ? 'border-surface-container-high' : 'opacity-60 border-error/20 bg-error/5'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 min-w-0">
                                                <div className="h-16 w-16 rounded-xl bg-surface-container-low shrink-0 overflow-hidden border border-surface-container-high">
                                                    {item.image ? (
                                                        <img src={transformImageUrl(item.image)} alt={item.nom} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Utensils className="h-6 w-6 text-on-surface/20" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{item.categorie}</span>
                                                        {!item.disponibilite && <span className="text-[10px] bg-error/10 text-error px-2 py-0.5 rounded font-bold uppercase">Épuisé</span>}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-on-surface truncate">{item.nom}</h3>
                                                    <p className="text-sm text-on-surface/50 mt-1 line-clamp-1">{item.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-primary">{item.prix}€</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-surface-container-low">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => toggleMenuDispo(item.id, item.disponibilite)}
                                                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${item.disponibilite ? 'text-error hover:bg-error/10' : 'text-primary hover:bg-primary/10'}`}
                                                >
                                                    {item.disponibilite ? 'Hors stock' : 'En stock'}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setNewMenuItem({ ...item });
                                                        setEditingMenuItem(item);
                                                        setShowAddMenuModal(true);
                                                    }}
                                                    className="p-2 text-primary/60 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-on-surface/20 hover:text-error transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    )}
                    {activeTab === 'internal_services' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-medium text-on-surface">Services Internes (Ménage, Linge, etc.)</h2>
                                <button onClick={() => setShowAddInternalServiceModal(true)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2 active:scale-95">
                                    <Plus className="h-4 w-4" />
                                    Ajouter un service
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {internalServicesList.map(service => (
                                    <div key={service.id} className={`bg-surface-lowest rounded-2xl overflow-hidden border transition-all p-6 shadow-sm hover:shadow-md flex flex-col items-center text-center ${service.disponibilite ? 'border-surface-container-high' : 'opacity-60 border-error/20 bg-error/5'}`}>
                                        <div className="text-4xl mb-4 bg-surface-container-low w-16 h-16 rounded-2xl flex items-center justify-center">
                                            {service.icone}
                                        </div>
                                        <h3 className="text-lg font-bold text-on-surface mb-2">{service.nom}</h3>
                                        <p className="text-sm text-on-surface/50 mb-6 flex-1 line-clamp-2">{service.description}</p>
                                        
                                        <div className="w-full flex items-center justify-between pt-4 border-t border-surface-container-low">
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => toggleInternalService(service.id, service.disponibilite)}
                                                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${service.disponibilite ? 'text-error hover:bg-error/10' : 'text-primary hover:bg-primary/10'}`}
                                                >
                                                    {service.disponibilite ? 'DÃ©sactiver' : 'Activer'}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setNewInternalService({ ...service });
                                                        setEditingInternalService(service);
                                                        setShowAddInternalServiceModal(true);
                                                    }}
                                                    className="p-2 text-primary/60 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <button onClick={() => deleteInternalService(service.id)} className="p-2 text-on-surface/20 hover:text-error transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    )}
                    {activeTab === 'lieux_visite' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-medium text-on-surface">Découvrir la région</h2>
                                <button onClick={() => setShowAddLieuModal(true)} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-container transition-colors flex items-center gap-2 active:scale-95 shadow-lg shadow-primary/10">
                                    <Plus className="h-4 w-4" />
                                    Ajouter un Lieu
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {lieuxVisite.length === 0 ? (
                                    <div className="col-span-full py-20 text-center opacity-40 italic">Aucun lieu n'a été ajouté encore.</div>
                                ) : lieuxVisite.map(lieu => (
                                    <div key={lieu.id} className="bg-surface-lowest rounded-[24px] overflow-hidden border border-surface-container-high transition-all hover:shadow-xl hover:border-primary/20 group">
                                        <div className="relative h-48 group">
                                            <img src={transformImageUrl(lieu.image)} alt={lieu.nom} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-[#0a1445] shadow-sm">
                                                    {lieu.categorie}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-on-surface mb-2">{lieu.nom}</h3>
                                            <p className="text-sm text-on-surface/50 mb-4 line-clamp-2 italic">"{lieu.description}"</p>
                                            
                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center gap-2 text-xs text-on-surface/60">
                                                    <Globe className="h-3.5 w-3.5 text-primary" />
                                                    <span className="truncate">{lieu.adresse}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-on-surface/60">
                                                    <SignalHigh className="h-3.5 w-3.5 text-tertiary" />
                                                    <span>Lat: {lieu.latitude} / Long: {lieu.longitude}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-surface-container-low">
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => {
                                                            setNewLieu({ ...lieu });
                                                            setEditingLieu(lieu);
                                                            setShowAddLieuModal(true);
                                                        }}
                                                        className="p-2.5 text-primary/60 hover:text-primary transition-colors hover:bg-primary/10 rounded-xl"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteLieu(lieu.id)}
                                                        className="p-2.5 text-error/60 hover:text-error transition-colors hover:bg-error/10 rounded-xl"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modals-container relative z-[60]">
                    {showAddLieuModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                            <div className="bg-surface-lowest rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                                <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-low">
                                    <h3 className="text-xl font-medium text-on-surface">
                                        {editingLieu ? 'Modifier le Lieu' : 'Nouveau Lieu à explorer'}
                                    </h3>
                                    <button onClick={() => { setShowAddLieuModal(false); setEditingLieu(null); setNewLieu({ nom: '', description: '', image: '', latitude: '', longitude: '', adresse: '', categorie: 'Plage' }); }} className="text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-low p-2 rounded-full transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-8 overflow-y-auto">
                                    <form onSubmit={handleAddLieu} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-2">Nom du lieu</label>
                                            <input required type="text" value={newLieu.nom} onChange={e => setNewLieu({...newLieu, nom: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" placeholder="ex: Plage de Sidi Bou Said" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-2">Catégorie</label>
                                                <select value={newLieu.categorie} onChange={e => setNewLieu({...newLieu, categorie: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none">
                                                    <option value="Plage">Plage</option>
                                                    <option value="Monument">Monument</option>
                                                    <option value="Restaurant">Restaurant</option>
                                                    <option value="Loisirs">Loisirs</option>
                                                    <option value="Autre">Autre</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-2">Adresse</label>
                                                <input required type="text" value={newLieu.adresse} onChange={e => setNewLieu({...newLieu, adresse: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" placeholder="Localisation courte" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-2">Latitude</label>
                                                <input type="number" step="any" value={newLieu.latitude} onChange={e => setNewLieu({...newLieu, latitude: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-2">Longitude</label>
                                                <input type="number" step="any" value={newLieu.longitude} onChange={e => setNewLieu({...newLieu, longitude: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-2">Image URL</label>
                                            <div className="flex gap-3">
                                                <input type="text" value={newLieu.image} onChange={e => setNewLieu({...newLieu, image: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none flex-1" placeholder="Lien de l'image ou upload..." />
                                                <div className="relative">
                                                     <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setUploadingImage(true);
                                                                const formData = new FormData();
                                                                formData.append('image', file);
                                                                const res = await fetch(API_BASE_URL + '/api/admin/upload', {
                                                                    method: 'POST',
                                                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
                                                                    body: formData
                                                                });
                                                                const data = await res.json();
                                                                if (data.success) setNewLieu({...newLieu, image: data.imageUrl});
                                                                setUploadingImage(false);
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <button type="button" className="bg-surface-container-high p-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                                                        {uploadingImage ? <SignalHigh className="w-5 h-5 animate-pulse" /> : <Image className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-2">Description</label>
                                            <textarea value={newLieu.description} onChange={e => setNewLieu({...newLieu, description: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none h-24 resize-none" placeholder="Quelques mots sur ce lieu..." />
                                        </div>
                                        <button type="submit" className="w-full bg-primary text-on-primary rounded-xl py-4 font-bold flex items-center justify-center gap-2">
                                            <Save className="w-4 h-4" />
                                            {editingLieu ? 'Sauvegarder' : 'Ajouter le lieu'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                    {showAddClientModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-surface-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                                <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-low">
                                    <h3 className="text-xl font-medium text-on-surface">
                                        {editingClient ? 'Modifier le Client' : 'Ajouter un Client'}
                                    </h3>
                                    <button onClick={() => { 
                                        setShowAddClientModal(false); 
                                        setGeneratedCode(null); 
                                        setEditingClient(null);
                                        setNewClient({ nom: '', prenom: '', telephone: '', email: '', chambre_id: '', date_expiration: '' });
                                    }} className="text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-low p-2 rounded-full transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto bg-surface-lowest">
                                    {submitError && (
                                        <div className="mb-6 bg-error/10 text-error text-sm px-5 py-4 rounded-xl">
                                            {submitError}
                                        </div>
                                    )}
                                    
                                    {generatedCode ? (
                                        <div className="text-center py-6">
                                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Check className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-xl font-bold text-on-surface mb-3">Client ajouté !</h4>
                                            <p className="text-on-surface/60 text-sm mb-6">Code généré :</p>
                                            <div className="bg-surface-container-low rounded-2xl py-4 shadow-inner">
                                                <span className="text-3xl font-mono font-bold tracking-[0.2em] text-primary">{generatedCode}</span>
                                            </div>
                                            <button onClick={() => { setShowAddClientModal(false); setGeneratedCode(null); }} className="mt-8 w-full bg-primary text-on-primary rounded-xl px-6 py-4 font-bold">Terminer</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleAddClient} className="space-y-5">
                                            <div className="grid grid-cols-2 gap-5">
                                                <input required type="text" placeholder="Prénom" value={newClient.prenom} onChange={e => setNewClient({ ...newClient, prenom: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                                <input required type="text" placeholder="Nom" value={newClient.nom} onChange={e => setNewClient({ ...newClient, nom: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                            </div>
                                            <input type="tel" placeholder="Téléphone" value={newClient.telephone} onChange={e => setNewClient({ ...newClient, telephone: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                            <select required value={newClient.chambre_id} onChange={e => setNewClient({ ...newClient, chambre_id: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none">
                                                <option value="">Chambre...</option>
                                                {chambres.filter(c => !c.isOccupied).map(c => <option key={c.id} value={c.id}>Chambre {c.numero}</option>)}
                                            </select>
                                            <input required type="datetime-local" value={newClient.date_expiration} onChange={e => setNewClient({ ...newClient, date_expiration: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                            <button type="submit" className="w-full bg-primary text-on-primary rounded-xl py-4 font-bold flex items-center justify-center gap-2">
                                                {editingClient ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                                {editingClient ? 'Enregistrer les modifications' : 'CrÃ©er Client'}
                                            </button>
                                        </form>

                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {showAddMenuModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-surface-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                                <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-low">
                                    <h3 className="text-xl font-medium text-on-surface">Nouveau Plat</h3>
                                    <button onClick={() => setShowAddMenuModal(false)} className="text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-low p-2 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                                </div>
                                <form onSubmit={handleAddMenuItem} className="p-8 space-y-5">
                                    <input required type="text" placeholder="Nom du plat" value={newMenuItem.nom} onChange={e => setNewMenuItem({...newMenuItem, nom: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                    <div className="grid grid-cols-2 gap-5">
                                        <input required type="number" step="0.01" placeholder="Prix (€)" value={newMenuItem.prix} onChange={e => setNewMenuItem({...newMenuItem, prix: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                        <select value={newMenuItem.categorie} onChange={e => setNewMenuItem({...newMenuItem, categorie: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none">
                                            <option value="Plat">Plat</option>
                                            <option value="Boisson">Boisson</option>
                                            <option value="Dessert">Dessert</option>
                                            <option value="Entrée">Entrée</option>
                                        </select>
                                    </div>
                                    <textarea required placeholder="Description" value={newMenuItem.description} onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none h-24 resize-none" />
                                    
                                    <div>
                                        <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Image du plat</label>
                                        <div className="flex gap-3 items-center">
                                            <div className="flex-1 relative group">
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const url = await handleFileUpload(file);
                                                            if (url) setNewMenuItem(prev => ({ ...prev, image: url }));
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="w-full px-5 py-3 bg-surface-container-low rounded-xl border-2 border-dashed border-surface-container-high group-hover:border-primary/40 transition-all flex items-center justify-center gap-3 text-sm text-on-surface/40 font-medium">
                                                    {uploadingImage ? (
                                                        <><span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span> Envoi en cours...</>
                                                    ) : (
                                                        <><Image className="h-4 w-4" /> Choisir ou déposer une image</>
                                                    )}
                                                </div>
                                            </div>
                                            {newMenuItem.image && (
                                                <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-surface-container-high group">
                                                    <img src={newMenuItem.image} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setNewMenuItem(prev => ({...prev, image: ''}))} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {newMenuItem.image && <p className="text-[10px] text-primary font-bold mt-2 truncate max-w-full italic">{newMenuItem.image}</p>}
                                    </div>

                                    <button type="submit" className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                        <Save className="h-4 w-4" />
                                        {editingMenuItem ? 'Enregistrer' : 'Ajouter le Plat'}
                                    </button>
                                </form>

                            </div>
                        </div>
                    )}

                    {showAddRoomModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-surface-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                                <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-low">
                                    <h3 className="text-xl font-medium text-on-surface">
                                        {editingRoom ? 'Modifier la Chambre' : 'Nouvelle Chambre'}
                                    </h3>
                                    <button onClick={() => {
                                        setShowAddRoomModal(false);
                                        setEditingRoom(null);
                                        setNewRoom({ numero: '', capacite: '' });
                                    }} className="text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-low p-2 rounded-full transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-8">
                                    <form onSubmit={handleAddRoom} className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Numéro de Chambre *</label>
                                            <input required type="text" placeholder="ex: 105" value={newRoom.numero} onChange={e => setNewRoom({ ...newRoom, numero: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface/30" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Capacité (personnes) *</label>
                                            <input required type="number" min="1" placeholder="ex: 2" value={newRoom.capacite} onChange={e => setNewRoom({ ...newRoom, capacite: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface/30" />
                                        </div>
                                        <div className="pt-4">
                                            <button type="submit" className="w-full bg-primary text-on-primary rounded-xl px-6 py-4 font-bold tracking-wider hover:bg-primary-container transition-colors active:scale-95 shadow-sm flex items-center justify-center gap-2">
                                                <Save className="h-4 w-4" />
                                                {editingRoom ? 'Enregistrer' : 'CrÃ©er la Chambre'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {showAddActivityModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-surface-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                                <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-low">
                                    <h3 className="text-xl font-medium text-on-surface">
                                        {editingActivity ? 'Modifier l\'ActivitÃ©' : 'Ajouter une ActivitÃ©'}
                                    </h3>
                                    <button onClick={() => {
                                        setShowAddActivityModal(false);
                                        setEditingActivity(null);
                                        setNewActivity({ nom: '', description: '', heure: '', categorie: '', jours: 'Quotidien' });
                                    }} className="text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-low p-2 rounded-full transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto bg-surface-lowest">
                                    <form onSubmit={handleAddActivity} className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Nom de l'activitÃ© *</label>
                                            <input required type="text" value={newActivity.nom} onChange={e => setNewActivity({ ...newActivity, nom: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface/30" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Description</label>
                                            <textarea value={newActivity.description} onChange={e => setNewActivity({ ...newActivity, description: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface/30 min-h-[80px]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Heure *</label>
                                                <input required type="time" value={newActivity.heure} onChange={e => setNewActivity({ ...newActivity, heure: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">CatÃ©gorie</label>
                                                <input type="text" placeholder="ex: Sport" value={newActivity.categorie} onChange={e => setNewActivity({ ...newActivity, categorie: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface/30" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Jours</label>
                                            <input type="text" placeholder="ex: Quotidien ou Lundi, Vendredi" value={newActivity.jours} onChange={e => setNewActivity({ ...newActivity, jours: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface/30" />
                                        </div>
                                        <div className="pt-4">
                                            <button type="submit" className="w-full bg-primary text-on-primary rounded-xl px-6 py-4 font-bold tracking-wider hover:bg-primary-container transition-colors active:scale-95 shadow-sm flex items-center justify-center gap-2">
                                                <Save className="h-4 w-4" />
                                                {editingActivity ? 'Enregistrer' : 'Ajouter l\'ActivitÃ©'}
                                            </button>
                                        </div>
                                    </form>

                                </div>
                            </div>
                        </div>
                    )}

                    {showAddExperienceModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-surface-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                                <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-low">
                                    <h3 className="text-xl font-medium text-on-surface">
                                        {editingExperience ? 'Modifier l\'ExpÃ©rience' : 'Nouvelle ExpÃ©rience'}
                                    </h3>
                                    <button onClick={() => {
                                        setShowAddExperienceModal(false);
                                        setEditingExperience(null);
                                        setNewExperience({ nom: '', description: '', image: '', categorie: 'excursion', prix: '', typeActivity: 'default', tarifs: [], galerie: [] });
                                    }} className="text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-low p-2 rounded-full transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto bg-surface-lowest">
                                    <form onSubmit={handleAddExperience} className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Titre de l'expÃ©rience *</label>
                                            <input required type="text" placeholder="Ex: Massage ThaÃ¯landais" value={newExperience.nom} onChange={e => setNewExperience({ ...newExperience, nom: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface/30" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Description *</label>
                                            <textarea required placeholder="Détails du service..." value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-on-surface/30 min-h-[100px]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Catégorie *</label>
                                                <select required value={newExperience.categorie} onChange={e => setNewExperience({ ...newExperience, categorie: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all appearance-none cursor-pointer">
                                                    <option value="excursion">Excursion</option>
                                                    <option value="spa">SPA & Bien-être</option>
                                                    <option value="signature">Signature (Privé)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Type d'activité</label>
                                                <select value={newExperience.typeActivity} onChange={e => setNewExperience({ ...newExperience, typeActivity: e.target.value })} className="w-full px-5 py-3 bg-surface-container-low border-0 text-on-surface rounded-xl focus:bg-surface-lowest focus:ring-2 focus:ring-primary/40 outline-none transition-all appearance-none cursor-pointer">
                                                    <option value="default">Par défaut</option>
                                                    <option value="quad">Quad</option>
                                                    <option value="ski">Ski</option>
                                                    <option value="jet_ski">Jet Ski</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60">Grille Tarifaire</label>
                                            {newExperience.tarifs.map((t, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input type="text" placeholder="Solo/Duo..." value={t.label} onChange={e => {
                                                        const nt = [...newExperience.tarifs];
                                                        nt[idx].label = e.target.value;
                                                        setNewExperience({...newExperience, tarifs: nt});
                                                    }} className="flex-1 px-4 py-2 bg-surface-container-low rounded-lg text-sm outline-none" />
                                                    <input type="text" placeholder="Prix (ex: 50€)" value={t.price} onChange={e => {
                                                        const nt = [...newExperience.tarifs];
                                                        nt[idx].price = e.target.value;
                                                        setNewExperience({...newExperience, tarifs: nt});
                                                    }} className="w-24 px-4 py-2 bg-surface-container-low rounded-lg text-sm outline-none" />
                                                    <button type="button" onClick={() => {
                                                        setNewExperience({...newExperience, tarifs: newExperience.tarifs.filter((_, i) => i !== idx)});
                                                    }} className="p-2 text-error hover:bg-error/10 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setNewExperience({...newExperience, tarifs: [...newExperience.tarifs, {label: '', price: ''}]})} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                                <Plus className="h-3 w-3" /> Ajouter un tarif
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Image principale *</label>
                                            <div className="flex gap-3 items-center">
                                                <div className="flex-1 relative group">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const url = await handleFileUpload(file);
                                                                if (url) setNewExperience(prev => ({ ...prev, image: url }));
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="w-full px-5 py-3 bg-surface-container-low rounded-xl border-2 border-dashed border-surface-container-high group-hover:border-primary/40 transition-all flex items-center justify-center gap-3 text-sm text-on-surface/40 font-medium">
                                                        {uploadingImage ? (
                                                            <><span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span> Envoi en cours...</>
                                                        ) : (
                                                            <><Image className="h-4 w-4" /> Sélectionner l'image de couverture</>
                                                        )}
                                                    </div>
                                                </div>
                                                {newExperience.image && (
                                                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-surface-container-high group">
                                                        <img src={newExperience.image} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => setNewExperience(prev => ({...prev, image: ''}))} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60">Galerie Photos</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {newExperience.galerie.map((url, idx) => (
                                                    <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-surface-container-high group">
                                                        <img src={url} alt={`galerie-${idx}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewExperience({...newExperience, galerie: newExperience.galerie.filter((_, i) => i !== idx)})}
                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="relative h-20 rounded-xl border-2 border-dashed border-surface-container-high hover:border-primary/40 transition-all flex items-center justify-center text-on-surface/30 hover:text-primary cursor-pointer group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        onChange={async (e) => {
                                                            const files = Array.from(e.target.files);
                                                            for (const file of files) {
                                                                const url = await handleFileUpload(file);
                                                                if (url) {
                                                                    setNewExperience(prev => ({...prev, galerie: [...prev.galerie, url]}));
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex flex-col items-center gap-1 pointer-events-none">
                                                        <Plus className="h-5 w-5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button type="submit" className="w-full bg-primary text-on-primary rounded-xl px-6 py-4 font-bold tracking-wider hover:bg-primary-container transition-colors active:scale-95 shadow-sm flex items-center justify-center gap-2 uppercase">
                                                <Save className="h-4 w-4" />
                                                {editingExperience ? 'Mettre à jour' : 'Publier l\'expérience'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}


                                             {showClientHistoryModal && selectedClientHistory && (
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-10">
                            <div className="bg-surface-container rounded-[40px] w-full max-w-5xl h-full flex flex-col overflow-hidden shadow-2xl border border-surface-container-high slide-up">
                                <div className="px-10 py-8 bg-surface-lowest flex items-center justify-between border-b border-surface-container-low">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                            {selectedClientHistory.prenom[0]}{selectedClientHistory.nom[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-on-surface">Suivi d'activité - {selectedClientHistory.prenom} {selectedClientHistory.nom}</h3>
                                            <p className="text-sm text-on-surface/40 font-bold uppercase tracking-widest mt-1">Historique complet des demandes et commandes</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowClientHistoryModal(false)} className="bg-surface-container-low text-on-surface hover:bg-surface-container-high p-3 rounded-2xl transition-all hover:rotate-90">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="p-10 flex-1 overflow-y-auto space-y-8 bg-surface-container/30">
                                    {/* History Filter Bar */}
                                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-lowest p-6 rounded-[32px] border border-surface-container-high shadow-sm">
                                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                                            <button 
                                                onClick={() => setHistoryTypeFilter('all')}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${historyTypeFilter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface/40 hover:bg-surface-container'}`}
                                            >
                                                Tout
                                            </button>
                                            <button 
                                                onClick={() => setHistoryTypeFilter('order')}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${historyTypeFilter === 'order' ? 'bg-secondary text-on-secondary' : 'bg-surface-container-low text-on-surface/40 hover:bg-surface-container'}`}
                                            >
                                                Commandes
                                            </button>
                                            <button 
                                                onClick={() => setHistoryTypeFilter('service')}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${historyTypeFilter === 'service' ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container-low text-on-surface/40 hover:bg-surface-container'}`}
                                            >
                                                Services
                                            </button>
                                        </div>

                                        <div className="relative w-full md:w-72">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface/30" />
                                            <input 
                                                type="text" 
                                                placeholder="Filtrer l'historique..." 
                                                value={historySearchQuery}
                                                onChange={e => setHistorySearchQuery(e.target.value)}
                                                className="w-full pl-11 pr-5 py-3.5 bg-surface-container-low rounded-2xl text-sm border-0 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-on-surface/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Combined Activity List */}
                                    <div className="space-y-4">
                                        {[
                                            ...clientActivities.orders.map(o => ({ ...o, uiType: 'order' })),
                                            ...clientActivities.services.map(s => ({ ...s, uiType: 'service' }))
                                        ]
                                        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .filter(item => historyTypeFilter === 'all' || item.uiType === historyTypeFilter)
                                        .filter(item => {
                                            if (!historySearchQuery) return true;
                                            const search = historySearchQuery.toLowerCase();
                                            if (item.uiType === 'order') {
                                                return item.items.some(i => i.name.toLowerCase().includes(search));
                                            }
                                            return item.type.toLowerCase().includes(search) || (item.notes && item.notes.toLowerCase().includes(search));
                                        })
                                        .length === 0 ? (
                                            <div className="bg-surface-lowest p-20 text-center rounded-[40px] border-2 border-dashed border-surface-container-high">
                                                <History className="h-16 w-16 mx-auto mb-6 text-on-surface/10" />
                                                <p className="text-xl font-bold text-on-surface/40">Aucune activité trouvée pour ces filtres.</p>
                                            </div>
                                        ) : (
                                            [
                                                ...clientActivities.orders.map(o => ({ ...o, uiType: 'order' })),
                                                ...clientActivities.services.map(s => ({ ...s, uiType: 'service' }))
                                            ]
                                            .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                                            .filter(item => historyTypeFilter === 'all' || item.uiType === historyTypeFilter)
                                            .filter(item => {
                                                if (!historySearchQuery) return true;
                                                const search = historySearchQuery.toLowerCase();
                                                if (item.uiType === 'order') {
                                                    return item.items.some(i => i.name.toLowerCase().includes(search));
                                                }
                                                return item.type.toLowerCase().includes(search) || (item.notes && item.notes.toLowerCase().includes(search));
                                            })
                                            .map((item, idx) => (
                                                <div key={idx} className={`bg-surface-lowest p-6 rounded-3xl border border-surface-container-high transition-all flex flex-col md:flex-row gap-6 items-start md:items-center ${item.statut === 'En attente' ? 'ring-2 ring-primary bg-primary/[0.02]' : ''}`}>
                                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${item.uiType === 'order' ? 'bg-secondary-container/20 text-secondary' : 'bg-tertiary-container/20 text-tertiary'}`}>
                                                        {item.uiType === 'order' ? <ShoppingCart className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                                                    </div>

                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-black uppercase tracking-widest text-on-surface/40">{item.uiType === 'order' ? 'Commande' : 'Demande Service'}</span>
                                                            <span className="h-1 w-1 bg-on-surface/20 rounded-full"></span>
                                                            <span className="text-xs font-bold text-primary">{new Date(item.createdAt).toLocaleString()}</span>
                                                        </div>
                                                        <h4 className="text-lg font-bold text-on-surface">
                                                            {item.uiType === 'order' 
                                                                ? `${item.items.length} articles (${item.total}â‚¬)` 
                                                                : item.type}
                                                        </h4>
                                                        {item.uiType === 'order' ? (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {item.items.map((it, i) => (
                                                                    <span key={i} className="px-3 py-1 bg-surface-container-low text-[10px] font-bold rounded-lg border border-surface-container-high">
                                                                        {it.qty}x {it.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : item.notes && (
                                                            <p className="text-sm text-on-surface/60 italic mt-1 bg-surface-container-low/50 p-3 rounded-xl border-l-4 border-tertiary">
                                                                "{item.notes}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="shrink-0 flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center w-full md:w-auto ${
                                                            item.statut === 'En attente' ? 'bg-primary text-on-primary animate-pulse' : 
                                                            item.statut === 'En cours' ? 'bg-secondary-container text-secondary' : 
                                                            'bg-surface-container-high text-on-surface/40'
                                                        }`}>
                                                            {item.statut}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showAddInternalServiceModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-surface-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                                <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-low">
                                    <h3 className="text-xl font-medium text-on-surface">
                                        {editingInternalService ? 'Modifier le Service' : 'Nouveau Service'}
                                    </h3>
                                    <button onClick={() => {
                                        setShowAddInternalServiceModal(false);
                                        setEditingInternalService(null);
                                        setNewInternalService({ nom: '', icone: 'ðŸ§¹', description: '' });
                                    }} className="text-on-surface/40 hover:text-on-surface/80 hover:bg-surface-container-low p-2 rounded-full transition-colors">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleAddInternalService} className="p-8 space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Nom du service</label>
                                        <input required type="text" placeholder="ex: Ménage complet" value={newInternalService.nom} onChange={e => setNewInternalService({...newInternalService, nom: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Icône (Emoji)</label>
                                        <input required type="text" placeholder="ex: 🧹" value={newInternalService.icone} onChange={e => setNewInternalService({...newInternalService, icone: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold tracking-widest uppercase text-on-surface/60 mb-2">Description (Optionnel)</label>
                                        <textarea placeholder="Description courte..." value={newInternalService.description} onChange={e => setNewInternalService({...newInternalService, description: e.target.value})} className="w-full px-5 py-3 bg-surface-container-low rounded-xl outline-none h-24 resize-none" />
                                    </div>
                                    <button type="submit" className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                        <Save className="h-4 w-4" />
                                        {editingInternalService ? 'Enregistrer' : 'Ajouter le Service'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};


export default Dashboard;
