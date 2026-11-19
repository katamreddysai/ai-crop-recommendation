import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sprout, 
  MapPin, 
  CloudSun, 
  Droplet, 
  History, 
  HelpCircle, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  Database,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  FlaskConical,
  BookOpen
} from 'lucide-react';
import LandingPage from './LandingPage.jsx';

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Ideal requirements of crops for displaying comparison charts
const CROP_IDEALS = {
  "Rice": { n: 80, p: 40, k: 40, ph: 6.5, temp: 24, humidity: 82, rainfall: 220 },
  "Maize": { n: 80, p: 48, k: 20, ph: 6.2, temp: 22, humidity: 65, rainfall: 85 },
  "Chickpea": { n: 40, p: 68, k: 80, ph: 7.3, temp: 18, humidity: 16, rainfall: 80 },
  "Kidneybeans": { n: 20, p: 67, k: 20, ph: 5.7, temp: 20, humidity: 21, rainfall: 105 },
  "Pigeonpeas": { n: 20, p: 68, k: 20, ph: 5.8, temp: 28, humidity: 48, rainfall: 150 },
  "Mothbeans": { n: 20, p: 48, k: 20, ph: 6.8, temp: 28, humidity: 53, rainfall: 50 },
  "Mungbean": { n: 20, p: 48, k: 20, ph: 6.7, temp: 28, humidity: 85, rainfall: 48 },
  "Blackgram": { n: 40, p: 67, k: 20, ph: 7.2, temp: 30, humidity: 65, rainfall: 68 },
  "Lentil": { n: 20, p: 68, k: 19, ph: 6.9, temp: 19, humidity: 18, rainfall: 45 },
  "Pomegranate": { n: 20, p: 18, k: 40, ph: 6.4, temp: 22, humidity: 90, rainfall: 105 },
  "Banana": { n: 100, p: 82, k: 50, ph: 6.0, temp: 27, humidity: 80, rainfall: 100 },
  "Mango": { n: 30, p: 27, k: 30, ph: 5.7, temp: 31, humidity: 50, rainfall: 95 },
  "Grapes": { n: 23, p: 132, k: 200, ph: 6.0, temp: 24, humidity: 81, rainfall: 70 },
  "Watermelon": { n: 99, p: 18, k: 50, ph: 6.5, temp: 25, humidity: 85, rainfall: 50 },
  "Muskmelon": { n: 100, p: 17, k: 50, ph: 6.3, temp: 28, humidity: 92, rainfall: 23 },
  "Apple": { n: 20, p: 135, k: 200, ph: 5.9, temp: 22, humidity: 92, rainfall: 112 },
  "Orange": { n: 20, p: 16, k: 10, ph: 7.0, temp: 22, humidity: 92, rainfall: 110 },
  "Papaya": { n: 50, p: 50, k: 50, ph: 6.7, temp: 33, humidity: 92, rainfall: 240 },
  "Coconut": { n: 20, p: 16, k: 30, ph: 5.9, temp: 27, humidity: 96, rainfall: 220 },
  "Cotton": { n: 120, p: 46, k: 19, ph: 6.9, temp: 23, humidity: 80, rainfall: 80 },
  "Jute": { n: 80, p: 40, k: 40, ph: 6.7, temp: 24, humidity: 80, rainfall: 175 },
  "Coffee": { n: 100, p: 28, k: 30, ph: 6.8, temp: 26, humidity: 57, rainfall: 155 }
};

const getExplanation = (result, formData) => {
  if (!result) return "";
  const crop = result.recommended_crop.toLowerCase();
  const feat = result.estimated_features;
  const isTest = formData.soil_test.use_test;
  
  let explanation = `The model recommended ${result.recommended_crop} based on your local environmental profile in ${formData.location} for the ${formData.season} season. `;
  
  if (crop === 'rice') {
    explanation += `Rice is optimal because it requires water-rich environments; your ${formData.irrigation ? 'irrigation availability' : 'high seasonal rainfall'} provides the high water volume (estimated ${feat.rainfall.toFixed(0)}mm index) needed for rice fields. `;
  } else if (crop === 'maize') {
    explanation += `Maize is a sturdy crop suited for the warm ${formData.season} season (average temperature ${feat.temperature.toFixed(1)}°C) with moderate water requirements. `;
  } else if (crop === 'chickpea' || crop === 'lentil') {
    explanation += `Pulses like ${result.recommended_crop} thrive in the cooler winter Rabi season (average temperature ${feat.temperature.toFixed(1)}°C) and require dry, well-aerated soil structures. `;
  } else if (crop === 'watermelon' || crop === 'muskmelon') {
    explanation += `Melons require high temperatures (average temperature ${feat.temperature.toFixed(1)}°C) and lower moisture/rainfall during ripening, making the dry, warm season ideal. `;
  } else if (crop === 'cotton') {
    explanation += `Cotton thrives in warm climates in clayey or black soils. Your soil type (${formData.soil_type}) matches its root anchoring requirements, and the climate is warm enough (${feat.temperature.toFixed(1)}°C) to support cotton boll development. `;
  } else if (crop === 'jute') {
    explanation += `Jute (the golden fiber) requires hot and highly humid climates. Your location has a temperature of ${feat.temperature.toFixed(1)}°C and high humidity (${feat.humidity.toFixed(0)}%), which are the primary catalysts for fiber growth. `;
  } else {
    explanation += `This crop fits the N-P-K nutrient profiles (N: ${feat.n.toFixed(0)}, P: ${feat.p.toFixed(0)}, K: ${feat.k.toFixed(0)}) and soil pH (${feat.ph.toFixed(1)}) synthesized for your soil. `;
  }
  
  if (formData.previous_crop.toLowerCase() === 'legumes' && !isTest) {
    explanation += `Since your previous crop was a legume, your soil has a natural nitrogen replenishment boost, making it an ideal time to grow crops that benefit from nitrogen-rich soil. `;
  }
  
  return explanation;
};

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'app'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [options, setOptions] = useState({ seasons: [], soil_types: [], previous_crops: [] });
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    farmer_name: '',
    location: '',
    season: '',
    soil_type: '',
    irrigation: false,
    previous_crop: '',
    soil_test: {
      use_test: false,
      n: '',
      p: '',
      k: '',
      ph: ''
    }
  });

  // Mock stats for dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalRecommendations: 0,
    topCrop: 'Rice',
    locationsCount: 0,
    soilTestsCount: 0
  });

  // Fetch API configurations & prediction history
  useEffect(() => {
    fetchOptions();
    fetchHistory();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/options`);
      setOptions(res.data);
      // Pre-select first options
      if (res.data.seasons.length > 0) {
        setFormData(prev => ({
          ...prev,
          season: res.data.seasons[0],
          soil_type: res.data.soil_types[0],
          previous_crop: res.data.previous_crops[0]
        }));
      }
    } catch (err) {
      console.error("Failed to load options from backend", err);
      // Setup default hardcoded fallbacks
      setOptions({
        seasons: ["Kharif", "Rabi", "Zaid"],
        soil_types: ["Black", "Red", "Alluvial", "Sandy", "Clayey", "Loamy"],
        previous_crops: ["Legumes", "Rice/Wheat", "Sugarcane", "Maize", "None/Fallow"]
      });
      setFormData(prev => ({
        ...prev,
        season: "Kharif",
        soil_type: "Black",
        previous_crop: "Legumes"
      }));
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/history`);
      setHistory(res.data);
      updateStats(res.data);
    } catch (err) {
      console.error("Failed to load search history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const updateStats = (historyList) => {
    if (historyList.length === 0) return;
    
    // Count crop distributions
    const crops = historyList.map(h => h.recommended_crop);
    const cropCounts = crops.reduce((acc, c) => ({ ...acc, [c]: (acc[c] || 0) + 1 }), {});
    const topCrop = Object.keys(cropCounts).reduce((a, b) => cropCounts[a] > cropCounts[b] ? a : b, 'Rice');
    
    // Count locations
    const locations = new Set(historyList.map(h => h.location.toLowerCase().trim()));
    // Count soil test usage
    const testsCount = historyList.filter(h => h.soil_test_used).length;

    setDashboardStats({
      totalRecommendations: historyList.length,
      topCrop: topCrop,
      locationsCount: locations.size,
      soilTestsCount: testsCount
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSoilTestChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      soil_test: {
        ...prev.soil_test,
        [field]: value
      }
    }));
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      alert("Please enter a valid farming location.");
      return;
    }

    setFormLoading(true);
    // Package JSON request body matching Pydantic schema
    const payload = {
      farmer_name: formData.farmer_name.trim() || null,
      location: formData.location,
      season: formData.season,
      soil_type: formData.soil_type,
      irrigation: formData.irrigation,
      previous_crop: formData.previous_crop,
      soil_test_info: formData.soil_test.use_test ? {
        n: formData.soil_test.n !== '' ? parseInt(formData.soil_test.n) : null,
        p: formData.soil_test.p !== '' ? parseInt(formData.soil_test.p) : null,
        k: formData.soil_test.k !== '' ? parseInt(formData.soil_test.k) : null,
        ph: formData.soil_test.ph !== '' ? parseFloat(formData.soil_test.ph) : null
      } : null
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/recommend`, payload);
      setRecommendationResult(res.data);
      setActiveTab('result');
      // Refresh prediction log history
      fetchHistory();
    } catch (err) {
      console.error("Inference request failed", err);
      alert("Failed to connect to backend server. Make sure the FastAPI service is running.");
    } finally {
      setFormLoading(false);
    }
  };

  // Helper component to display beautiful comparison bars
  const ComparisonBar = ({ label, measured, ideal, maxRange, unit }) => {
    const percentMeasured = Math.min(100, (measured / maxRange) * 100);
    const percentIdeal = Math.min(100, (ideal / maxRange) * 100);

    return (
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
          <span>{label}</span>
          <span>Measured/Est: <b className="text-navy-900">{measured} {unit}</b> vs Ideal: <b className="text-primary-600">{ideal} {unit}</b></span>
        </div>
        <div className="relative h-4 w-full bg-navy-100 rounded-full overflow-hidden border border-navy-200/70">
          {/* Estimated / Measured Bar */}
          <div 
            style={{ width: `${percentMeasured}%` }} 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-navy-500 to-navy-700 rounded-full"
          />
          {/* Ideal target range point */}
          <div 
            style={{ left: `calc(${percentIdeal}% - 2px)` }} 
            className="absolute top-0 h-full w-1 bg-primary-600 z-10"
            title={`Ideal Range: ${ideal} ${unit}`}
          />
          {/* Ideal Range overlay zone */}
          <div 
            style={{ left: `calc(${percentIdeal}% - 8px)`, width: '16px' }} 
            className="absolute top-0 h-full bg-primary-500/30 blur-[1px] z-0"
          />
        </div>
      </div>
    );
  };

  // ----- Navigation between the landing page and the dashboard -----
  const openDashboard = () => {
    setView('app');
    setActiveTab('dashboard');
    window.scrollTo({ top: 0 });
  };

  const backToLanding = () => {
    setView('landing');
    window.scrollTo({ top: 0 });
  };

  if (view === 'landing') {
    return <LandingPage onOpenDashboard={openDashboard} />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-gradient-to-b from-navy-950 to-navy-900 text-navy-100 flex flex-col justify-between border-r border-navy-800/70 shrink-0">
        <div>
          {/* Title Header */}
          <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="bg-gradient-crop p-2.5 rounded-2xl text-white shadow-glow-green animate-float">
              <Sprout size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-white">AgroRecommend</h1>
              <span className="text-xs text-primary-400 font-semibold">AI Smart Farm Companion</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : 'text-navy-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Database size={18} />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('form')} 
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'form' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : 'text-navy-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Sprout size={18} />
              Get Recommendation
            </button>
            {recommendationResult && (
              <button 
                onClick={() => setActiveTab('result')} 
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'result' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : 'text-navy-300 hover:bg-white/5 hover:text-white'}`}
              >
                <TrendingUp size={18} />
                Recommendation Result
              </button>
            )}
            <button 
              onClick={() => setActiveTab('history')} 
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'history' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : 'text-navy-300 hover:bg-white/5 hover:text-white'}`}
            >
              <History size={18} />
              Search Records
            </button>
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-6 border-t border-white/10 bg-navy-950/60">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-primary-300">
              C
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-100">College Mini Project</p>
              <p className="text-[10px] text-navy-400">AI Crop recommendation</p>
            </div>
          </div>
          <p className="text-[10px] text-navy-500">© 2026 AgroRecommend Platform</p>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#f5f8fc]">
        
        {/* Top Header Bar */}
        <header className="h-16 px-6 lg:px-8 border-b border-navy-100 bg-white/85 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-navy-100 text-navy-700 uppercase tracking-wider">
              Live Status
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600">
              <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse inline-block" />
              Connected
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Redirect back to the landing page */}
            <button
              onClick={backToLanding}
              title="Back to Home page"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-navy-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <Sprout size={15} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button 
              onClick={fetchHistory}
              title="Refresh Search Logs" 
              className="p-2 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-colors"
            >
              <RefreshCw size={18} />
            </button>
            <div className="h-8 w-px bg-navy-100" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shadow-inner">
                🌾
              </div>
              <span className="text-sm font-bold text-navy-800 hidden sm:inline">Active Farmer Portal</span>
            </div>
          </div>
        </header>

        {/* Dynamic Pages Container */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          {/* =========================================================================
              TAB: DASHBOARD
              ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Dashboard Intro */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">Welcome, Farmer Friend!</h2>
                  <p className="text-sm text-slate-500 mt-1">Select crop recommendations customized to your local weather, season, and soil properties.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('form')}
                  className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-all duration-200 group self-start"
                >
                  Get Recommendation 
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="p-3.5 bg-primary-100 text-primary-700 rounded-2xl shadow-inner">
                    <Sprout size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">Predictions Made</span>
                    <span className="text-2xl font-black text-navy-900">{dashboardStats.totalRecommendations}</span>
                  </div>
                </div>

                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="p-3.5 bg-navy-100 text-navy-700 rounded-2xl shadow-inner">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">Top Crop Model</span>
                    <span className="text-2xl font-black text-navy-900 capitalize">{dashboardStats.topCrop}</span>
                  </div>
                </div>

                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="p-3.5 bg-primary-100 text-primary-700 rounded-2xl shadow-inner">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">Districts Scanned</span>
                    <span className="text-2xl font-black text-navy-900">{dashboardStats.locationsCount === 0 ? 0 : dashboardStats.locationsCount}</span>
                  </div>
                </div>

                <div className="glass-card p-6 flex items-center gap-4">
                  <div className="p-3.5 bg-navy-100 text-navy-700 rounded-2xl shadow-inner">
                    <FlaskConical size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block mb-0.5">Exact Soil Tests</span>
                    <span className="text-2xl font-black text-navy-900">{dashboardStats.soilTestsCount}</span>
                  </div>
                </div>
              </div>

              {/* Agronomic Calendar and Tips section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Weather Climatological Info */}
                <div className="glass-panel p-6 lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudSun className="text-primary-600" size={20} />
                    <h3 className="font-extrabold text-navy-900">Seasonal Climate Guides (India)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
                      <span className="text-[10px] uppercase font-bold text-navy-600 tracking-wider">Summer Season</span>
                      <h4 className="font-bold text-navy-900 text-sm mt-0.5">Zaid Season (May - June)</h4>
                      <p className="text-xs text-slate-500 mt-2">Characteristics: Hot dry climate, low humidity.</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-semibold text-slate-600">Watermelon</span>
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-semibold text-slate-600">Muskmelon</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-green-50/70 border border-green-100">
                      <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Monsoon Season</span>
                      <h4 className="font-bold text-navy-900 text-sm mt-0.5">Kharif Season (July - Oct)</h4>
                      <p className="text-xs text-slate-500 mt-2">Characteristics: High rainfall, humid, warm temperatures.</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-semibold text-slate-600">Rice</span>
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-semibold text-slate-600">Maize</span>
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-semibold text-slate-600">Jute</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-navy-100/60 border border-navy-200/70">
                      <span className="text-[10px] uppercase font-bold text-navy-700 tracking-wider">Winter Season</span>
                      <h4 className="font-bold text-navy-900 text-sm mt-0.5">Rabi Season (Nov - Apr)</h4>
                      <p className="text-xs text-slate-500 mt-2">Characteristics: Cool climate, low precipitation, dry soil.</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-semibold text-slate-600">Chickpea</span>
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-semibold text-slate-600">Lentil</span>
                        <span className="text-[10px] bg-white border px-2 py-0.5 rounded font-semibold text-slate-600">Wheat</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational Tips card */}
                <div className="glass-panel p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="text-primary-600" size={20} />
                    <h3 className="font-extrabold text-navy-900">Agronomy Insights</h3>
                  </div>
                  <ul className="space-y-3.5 text-xs text-slate-600">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">💡</span>
                      <span><b>Legume Power:</b> Growing legumes (peas, groundnuts) in the previous season fixes atmospheric nitrogen, reducing this season's chemical fertilizer costs.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">💡</span>
                      <span><b>pH Balance:</b> Most crops prefer slightly acidic to neutral soil (pH 6.0 - 7.0). Black soils are naturally slightly alkaline; choose crops like cotton that handle it.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">💡</span>
                      <span><b>Smart Irrigation:</b> With drip irrigation enabled, you can cultivate higher-water crops (like maize or banana) even during winter Rabi seasons.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Recent search history list snippet */}
              <div className="glass-panel p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-navy-900">Recent Search Logs</h3>
                  <button 
                    onClick={() => setActiveTab('history')} 
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    View All Logs
                  </button>
                </div>

                {historyLoading ? (
                  <div className="text-center py-6 text-slate-400 text-xs">Loading search data...</div>
                ) : history.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">No records found. Submit a request to see logs.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Location</th>
                          <th className="py-2.5 px-3">Soil Type</th>
                          <th className="py-2.5 px-3">Season</th>
                          <th className="py-2.5 px-3">Recommended Crop</th>
                          <th className="py-2.5 px-3 text-right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-600 font-medium">
                        {history.slice(0, 5).map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3 text-slate-400">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3 font-semibold text-navy-800">{log.location}</td>
                            <td className="py-3 px-3">{log.soil_type}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.season === 'Kharif' ? 'bg-primary-100 text-primary-700' : log.season === 'Rabi' ? 'bg-navy-100 text-navy-700' : 'bg-navy-50 text-navy-600 border border-navy-200'}`}>
                                {log.season}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-primary-700 capitalize">{log.recommended_crop}</td>
                            <td className="py-3 px-3 text-right font-black text-navy-800">{(log.confidence * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: RECOMMENDATION FORM (WIZARD MOCKUP)
              ========================================================================= */}
          {activeTab === 'form' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">Smart Crop recommendation Engine</h2>
                <p className="text-sm text-slate-500 mt-1">Please enter your basic agricultural settings. We will estimate soil and weather values automatically.</p>
              </div>

              <form onSubmit={handleSubmitRecommendation} className="glass-panel p-6 sm:p-8 space-y-6 shadow-lg border-white/50 relative overflow-hidden">
                
                {/* Header graphic */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-navy-900 via-primary-500 to-primary-400" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Farmer Name */}
                  <div>
                    <label htmlFor="farmer_name" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Farmer Name <span className="text-[10px] text-slate-400 font-medium">(Optional)</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        id="farmer_name"
                        placeholder="e.g. Ramesh Kumar"
                        value={formData.farmer_name}
                        onChange={(e) => handleInputChange('farmer_name', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Farming Location / Town <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        id="location"
                        placeholder="e.g. Pune, Maharashtra"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Season */}
                  <div>
                    <label htmlFor="season" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Target Planting Season <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <select 
                        id="season"
                        value={formData.season}
                        onChange={(e) => handleInputChange('season', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-semibold text-navy-800 appearance-none"
                      >
                        {options.seasons.map(s => <option key={s} value={s}>{s} Season</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Previous Crop */}
                  <div>
                    <label htmlFor="previous_crop" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Previously Cultivated Crop <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <History size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <select 
                        id="previous_crop"
                        value={formData.previous_crop}
                        onChange={(e) => handleInputChange('previous_crop', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-semibold text-navy-800 appearance-none"
                      >
                        {options.previous_crops.map(pc => <option key={pc} value={pc}>{pc}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Soil Type Cards Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Soil Texture Class <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {options.soil_types.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleInputChange('soil_type', type)}
                        className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-24 group ${formData.soil_type === type ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.soil_type === type ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'}`}>
                          Soil type
                        </span>
                        <span className="font-extrabold text-sm text-navy-800 leading-tight">
                          {type} Soil
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Irrigation toggle */}
                <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60 flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-navy-100 text-navy-700 rounded-xl">
                      <Droplet size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-navy-800">Irrigation Facility Available?</h4>
                      <p className="text-xs text-slate-400 font-medium">Toggle on if you have access to tube-wells, canals, or drip irrigation lines.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('irrigation', !formData.irrigation)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${formData.irrigation ? 'bg-primary-600 justify-end' : 'bg-slate-300 justify-start'}`}
                  >
                    <span className="h-4 w-4 bg-white rounded-full shadow-md transition-transform" />
                  </button>
                </div>

                {/* Advanced Soil Health Card Input toggle */}
                <div className="border-t border-slate-200/60 pt-5">
                  <button
                    type="button"
                    onClick={() => handleSoilTestChange('use_test', !formData.soil_test.use_test)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-navy-900 transition-colors uppercase tracking-wider"
                  >
                    <FlaskConical size={16} className={formData.soil_test.use_test ? "text-primary-600" : "text-slate-400"} />
                    <span>[Optional] I have a Soil Health Card (Custom soil values)</span>
                    {formData.soil_test.use_test ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {formData.soil_test.use_test && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 p-4 rounded-2xl bg-primary-50/30 border border-primary-100/50 animate-float-short">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nitrogen (N)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 80"
                          value={formData.soil_test.n}
                          onChange={(e) => handleSoilTestChange('n', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-white focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phosphorus (P)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 45"
                          value={formData.soil_test.p}
                          onChange={(e) => handleSoilTestChange('p', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-white focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Potassium (K)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 50"
                          value={formData.soil_test.k}
                          onChange={(e) => handleSoilTestChange('k', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-white focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Soil pH</label>
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 6.5"
                          value={formData.soil_test.ph}
                          onChange={(e) => handleSoilTestChange('ph', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-white focus:border-primary-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-xl shadow-primary-600/10 transition-all flex items-center justify-center gap-2.5 disabled:bg-primary-300"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Analyzing weather databases & soil chemistry models...
                    </>
                  ) : (
                    <>
                      <Sprout size={18} />
                      Determine Recommended Crop
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB: RECOMMENDATION RESULT
              ========================================================================= */}
          {activeTab === 'result' && recommendationResult && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Header result banner */}
              <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg border-primary-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500" />
                
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-crop flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-green-500/10 animate-float">
                    🌾
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-primary-600 tracking-widest block mb-0.5">Recommended Crop</span>
                    <h2 className="text-3xl font-black text-navy-900 leading-none mb-2">{recommendationResult.recommended_crop}</h2>
                    <p className="text-xs text-slate-400 font-medium">Model Probability / Suitability: <b className="text-navy-900 font-black">{(recommendationResult.confidence * 100).toFixed(1)}%</b></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveTab('form')}
                    className="px-5 py-3 border border-slate-200 hover:border-slate-300 bg-white text-navy-800 rounded-xl text-xs font-bold transition-all"
                  >
                    Run Another Prediction
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual crop guide details */}
                <div className="glass-panel p-6 lg:col-span-2 space-y-6">
                  
                  {/* Why this crop? Card */}
                  <div>
                    <h3 className="font-extrabold text-navy-900 text-sm mb-2 flex items-center gap-1.5">
                      <HelpCircle size={16} className="text-primary-600" /> Why this crop?
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-primary-50/20 p-4 rounded-xl border border-primary-100/20">
                      {getExplanation(recommendationResult, formData)}
                    </p>
                  </div>

                  {/* Top 3 Recommendations Suitability Card */}
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/20">
                    <h4 className="font-extrabold text-navy-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <TrendingUp size={16} className="text-primary-600" /> Top 3 Recommended Crops
                    </h4>
                    <div className="space-y-3">
                      {recommendationResult.top_recommendations && recommendationResult.top_recommendations.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-xs text-navy-800 capitalize">{item.crop}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-slate-200/50 h-2 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                style={{ width: `${(item.probability * 100)}%` }} 
                                className="bg-primary-600 h-full rounded-full"
                              />
                            </div>
                            <span className="font-black text-xs text-navy-900">{(item.probability * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About the crop card */}
                  <div>
                    <h3 className="font-extrabold text-navy-900 text-sm mb-2 flex items-center gap-1.5">
                      <Sprout size={16} className="text-primary-600" /> About the Crop
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {recommendationResult.crop_details.about}
                    </p>
                  </div>

                  {/* Growth duration / Market values */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Growth Duration</span>
                      <span className="font-extrabold text-navy-800 text-sm">{recommendationResult.crop_details.growth_duration}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Market Demand</span>
                      <span className="font-extrabold text-primary-700 text-sm flex items-center gap-1.5">
                        <TrendingUp size={16} />
                        {recommendationResult.crop_details.market_demand}
                      </span>
                    </div>
                  </div>

                  {/* Cultivation Guides */}
                  <div>
                    <h3 className="font-extrabold text-navy-900 text-sm mb-2 flex items-center gap-1.5">
                      <BookOpen size={16} className="text-primary-600" /> Sowing & Cultivation Guidelines
                    </h3>
                    <div className="p-4 rounded-xl bg-primary-50/20 border border-primary-100/30">
                      <h4 className="font-bold text-xs text-primary-800 mb-1.5">Farmer Tips:</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {recommendationResult.crop_details.planting_tips}
                      </p>
                    </div>
                  </div>

                  {/* Mandatory AI Disclaimer text */}
                  <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex gap-3 text-xs text-yellow-800 leading-relaxed shadow-sm">
                    <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block mb-1">AI Decision-Support System Notice</span>
                      <span><b>Important:</b> This is an AI-based decision-support recommendation. Farmers should consider soil testing, local agricultural advice, water availability, weather conditions and market conditions before making a final decision.</span>
                    </div>
                  </div>

                </div>

                {/* Synthesis Features & Soil Charts */}
                <div className="glass-panel p-6 space-y-6">
                  <div>
                    <h3 className="font-extrabold text-navy-900 text-sm mb-1.5 flex items-center gap-1.5">
                      <FlaskConical size={16} className="text-primary-600" /> Technical Data Layer
                    </h3>
                    <div className="mb-4">
                      {formData.soil_test.use_test ? (
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary-100 text-primary-800 border border-primary-200">
                          🧪 Laboratory Soil Test Value
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-navy-100 text-navy-800 border border-navy-200">
                          📡 Estimated from available regional/environmental data
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comparisons */}
                  <div className="space-y-4">
                    {(() => {
                      const cropName = recommendationResult.recommended_crop;
                      const ideals = CROP_IDEALS[cropName] || { n: 80, p: 40, k: 40, ph: 6.5, temp: 25, humidity: 80, rainfall: 150 };
                      const feat = recommendationResult.estimated_features;

                      return (
                        <>
                          <ComparisonBar label="Nitrogen (N)" measured={feat.n} ideal={ideals.n} maxRange={150} unit="mg/kg" />
                          <ComparisonBar label="Phosphorus (P)" measured={feat.p} ideal={ideals.p} maxRange={150} unit="mg/kg" />
                          <ComparisonBar label="Potassium (K)" measured={feat.k} ideal={ideals.k} maxRange={250} unit="mg/kg" />
                          <ComparisonBar label="Soil pH" measured={feat.ph} ideal={ideals.ph} maxRange={14} unit="" />
                          <ComparisonBar label="Temperature" measured={feat.temperature.toFixed(1)} ideal={ideals.temp} maxRange={45} unit="°C" />
                          <ComparisonBar label="Humidity" measured={feat.humidity.toFixed(1)} ideal={ideals.humidity} maxRange={100} unit="%" />
                          <ComparisonBar label="Effective Rainfall Index" measured={feat.rainfall.toFixed(1)} ideal={ideals.rainfall} maxRange={300} unit="points" />
                        </>
                      );
                    })()}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: HISTORY LOGS
              ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-navy-900 tracking-tight">Recommendation History</h2>
                <p className="text-sm text-slate-500 mt-1">Review the historical recommendations generated for farmers in this database.</p>
              </div>

              {/* Data Table */}
              <div className="glass-panel p-6 shadow-md overflow-hidden">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <RefreshCw className="animate-spin" size={24} />
                    <span className="text-xs">Fetching history logs...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No recommendations found in database. Fill out the form to create new searches.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4">Farmer</th>
                          <th className="py-3.5 px-4">Location</th>
                          <th className="py-3.5 px-4">Soil Type</th>
                          <th className="py-3.5 px-4">Season</th>
                          <th className="py-3.5 px-4">Calculated Features (N-P-K-pH)</th>
                          <th className="py-3.5 px-4 font-black text-navy-800">Recommended Crop</th>
                          <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                        {history.map((log) => (
                          <React.Fragment key={log.id}>
                            <tr className="hover:bg-slate-50/40 transition-colors">
                              <td className="py-4 px-4 text-slate-400">
                                {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-4 px-4 font-semibold text-navy-800">
                                {log.farmer_name || <span className="text-slate-400 font-normal">Anonymous</span>}
                              </td>
                              <td className="py-4 px-4 font-bold text-navy-900">{log.location}</td>
                              <td className="py-4 px-4">{log.soil_type}</td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.season === 'Kharif' ? 'bg-primary-100 text-primary-700' : log.season === 'Rabi' ? 'bg-navy-100 text-navy-700' : 'bg-navy-50 text-navy-600 border border-navy-200'}`}>
                                  {log.season}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">
                                {log.calculated_n}N - {log.calculated_p}P - {log.calculated_k}K (pH {log.calculated_ph})
                              </td>
                              <td className="py-4 px-4 font-extrabold text-primary-700 capitalize text-sm">{log.recommended_crop}</td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => setExpandedHistoryId(expandedHistoryId === log.id ? null : log.id)}
                                  className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-navy-800"
                                >
                                  {expandedHistoryId === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                              </td>
                            </tr>
                            
                            {/* Expanded Details Row */}
                            {expandedHistoryId === log.id && (
                              <tr>
                                <td colSpan="8" className="bg-slate-50/50 p-4 border-b border-slate-100">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                    <div className="space-y-1.5">
                                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Farmer Context</p>
                                      <p><b>Irrigation:</b> {log.irrigation ? "Available (Tube-well/Canal)" : "Rain-fed only"}</p>
                                      <p><b>Previous Crop:</b> {log.previous_crop}</p>
                                      <p><b>Soil Test Used:</b> {log.soil_test_used ? "Yes (Laboratory Soil Health Card)" : "No (Estimated from regional/environmental data)"}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Climate Parameters</p>
                                      <p><b>Temperature:</b> {log.calculated_temp.toFixed(1)} °C</p>
                                      <p><b>Humidity:</b> {log.calculated_humidity.toFixed(1)} %</p>
                                      <p><b>Effective Rainfall:</b> {log.calculated_rainfall.toFixed(1)} mm</p>
                                    </div>
                                    <div className="space-y-1.5">
                                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Prediction Analytics</p>
                                      <p><b>Model Algorithm:</b> Random Forest Classifier</p>
                                      <p><b>Confidence Rating:</b> {(log.confidence * 100).toFixed(1)}%</p>
                                      {log.top_recommendations && log.top_recommendations.length > 0 && (
                                        <p>
                                          <b>Top 3 Candidates:</b>{' '}
                                          {log.top_recommendations.map(r => `${r.crop} (${(r.probability * 100).toFixed(1)}%)`).join(', ')}
                                        </p>
                                      )}
                                      <p><b>Decision Timestamp:</b> {new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
