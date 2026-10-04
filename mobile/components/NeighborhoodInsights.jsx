import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AcademicCapIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  InformationCircleIcon,
  MapPinIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  PaintBrushIcon,
  BuildingOffice2Icon,
  SparklesIcon,
  ClockIcon,
  ShoppingCartIcon,
  StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * NeighborhoodInsights - Provides tactical AI-driven localized data for a specific area.
 * Includes schools, crime stats, transportation, and matric results as requested.
 */
const NeighborhoodInsights = ({ location }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('education');

  useEffect(() => {
    if (location) {
      fetchInsights(location);
    }
  }, [location]);

  const fetchInsights = async (loc) => {
    setLoading(true);
    // In a real app, this would call a backend protected by OpenAI or a local knowledge base.
    // Simulating a high-fidelity AI response based on the Tembisa example.
     setTimeout(() => {
       const cityData = {
         'tembisa': {
           history: "Established in 1957, Tembisa is a massive township north of Kempton Park. Its name means 'Hope' or 'Promise'.",
           schools: [
             { name: "Tembisa Secondary", type: "Public", matricPass: "92%", distance: "0.8km" },
             { name: "Phomolong Secondary", type: "Public", matricPass: "88%", distance: "1.2km" }
           ],
           malls: ["Phumulani Mall", "Tembisa Plaza", "Birch Acres Mall"],
           crimeStatus: "Moderate Activity - Sector 4 Improvement",
           transport: ["Gautrain Bus Link", "Taxi Hubs", "Metrorail"]
         },
         'soweto': {
           history: "Soweto (South Western Townships) is the soul of South Africa's struggle for freedom and home to Vilakazi Street.",
           schools: [
             { name: "Orlando West Secondary", type: "Public", matricPass: "85%", distance: "1.5km" },
             { name: "Morris Isaacson High", type: "Historic", matricPass: "82%", distance: "2.1km" }
           ],
           malls: ["Maponya Mall", "Jabulani Mall", "Diepkloof Square"],
           crimeStatus: "Stable - High Police Presence in Tourist Zones",
           transport: ["Rea Vaya BRT", "Metrorail", "Major Taxi Corridors"]
         },
         'mamelodi': {
           history: "Mamelodi, known as 'Mother of Melodies', is a vibrant township in the City of Tshwane.",
           schools: [
             { name: "Mamelodi High School", type: "Public", matricPass: "89%", distance: "1.1km" },
             { name: "Vlakfontein High", type: "Technical", matricPass: "84%", distance: "1.8km" }
           ],
           malls: ["Mamelodi Crossing", "Denlyn Mall", "Tshwane Regional Mall"],
           crimeStatus: "Moderate - Community Policing Active",
           transport: ["Tshwane Bus Service", "Local Taxis", "Metrorail"]
         },
         'alexandra': {
           history: "Alexandra (Alex) is one of the oldest townships in South Africa, located near Sandton.",
           schools: [
             { name: "Alex High School", type: "Public", matricPass: "78%", distance: "0.5km" },
             { name: "Minerva High", type: "Public", matricPass: "81%", distance: "0.9km" }
           ],
           malls: ["Alex Mall", "Pan Africa Mall"],
           crimeStatus: "Active - Increased Security Patrols",
           transport: ["Gautrain Bus", "Putco", "Sandton Taxi Link"]
         }
       };

       const lowerLoc = loc.toLowerCase();
       const dataKey = Object.keys(cityData).find(k => lowerLoc.includes(k)) || 'tembisa';
       const selected = cityData[dataKey];

       const mockData = {
         name: loc,
         education: {
           schools: selected.schools,
           summary: `${loc} features a network of established public and secondary institutions with competitive academic performance.`
         },
         security: {
           status: selected.crimeStatus,
           stats: "12% decrease in residential incidents reported in the last cycle. Community policing active.",
           policeStations: ["Branch SAPS", "Rabasotho Police Station"],
           safetyTips: "Premium vetted stays recommended for new residents."
         },
         transport: {
           options: selected.transport,
           connectivity: "High. Direct links to major economic hubs within 20-30 minutes.",
           activeRoutes: "Major primary transport corridors."
         },
         metrics: {
           properties: "Avg. Rent R4,800 | Avg. Sale R1.4M",
           services: "Top types: Logistics, Retail, Catering",
           helpers: "120+ Local Experts | Avg. Rating 4.8",
           events: "5 Major Community Events this month"
         },
         lifestyle: {
           malls: selected.malls,
           amenities: ["Public Libraries", "Heritage Sites", "Recreation Parks"]
         },
         spotlight: [
           { type: 'Service', name: 'Elite Car Detailing', rating: 4.9, img: 'https://images.pexels.com/photos/3354675/pexels-photo-3354675.jpeg?auto=compress&cs=tinysrgb&w=800', price: 'R150', desc: 'Professional car care in the heart of the community.' },
           { type: 'Property', name: 'Modern Studio Suite', rating: 4.8, img: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', price: 'R4,200', desc: 'Secure, modern living with high-speed fiber.' },
         ],
         culture: {
           history: selected.history,
           languages: ["isiZulu", "Sepedi", "Setswana", "isiXhosa"],
           vibe: "Energetic, Community-Centric, Urban Pulse"
         }
       };
       setData(mockData);
       setLoading(false);
     }, 1500);
   };

  if (!location) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[3.5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden mb-12"
    >
      {/* Search HUD Header */}
      <div className="bg-gray-950 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-rose-500/10 to-transparent blur-3xl" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 p-1 bg-white/5 rounded-full w-fit">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Neighborhood Intelligence</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter">
              Discovering <span className="text-rose-500">{location}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Confidence Score</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">98.4%</span>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <MagnifyingGlassIcon className="w-6 h-6 text-white" />
             </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
             <span className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Scanning Neural Networks...</span>
          </div>
        ) : data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 space-y-3">
              <InsightTab 
                icon={<AcademicCapIcon className="w-5 h-5" />}
                label="Education & Creche"
                active={activeTab === 'education'}
                onClick={() => setActiveTab('education')}
                color="text-blue-500"
              />
              <InsightTab 
                icon={<ShieldCheckIcon className="w-5 h-5" />}
                label="Safety & Security"
                active={activeTab === 'security'}
                onClick={() => setActiveTab('security')}
                color="text-emerald-500"
              />
              <InsightTab 
                icon={<TruckIcon className="w-5 h-5" />}
                label="Transportation"
                active={activeTab === 'transport'}
                onClick={() => setActiveTab('transport')}
                color="text-orange-500"
              />
              <InsightTab 
                icon={<ChartBarIcon className="w-5 h-5" />}
                label="Community Insights"
                active={activeTab === 'metrics'}
                onClick={() => setActiveTab('metrics')}
                color="text-indigo-500"
              />
              <InsightTab 
                icon={<PaintBrushIcon className="w-5 h-5" />}
                label="Culture & History"
                active={activeTab === 'culture'}
                onClick={() => setActiveTab('culture')}
                color="text-rose-500"
              />
              <InsightTab 
                icon={<StarIconOutline className="w-5 h-5" />}
                label="Area Spotlight"
                active={activeTab === 'spotlight'}
                onClick={() => setActiveTab('spotlight')}
                color="text-yellow-500"
              />
              <InsightTab 
                icon={<ShoppingCartIcon className="w-5 h-5" />}
                label="Lifestyle & Shopping"
                active={activeTab === 'lifestyle'}
                onClick={() => setActiveTab('lifestyle')}
                color="text-amber-600"
              />
            </div>

            {/* Content Area */}
            <div className="lg:col-span-8 bg-gray-50/50 rounded-[2.5rem] p-6 lg:p-8 border border-gray-100">
               <AnimatePresence mode="wait">
                  {activeTab === 'education' && (
                    <motion.div
                      key="education"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                       <div className="flex items-center gap-3 mb-2">
                          <AcademicCapIcon className="w-6 h-6 text-blue-500" />
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">Academic Landscape</h3>
                       </div>
                       <p className="text-sm text-gray-500 font-medium leading-relaxed italic">{data.education.summary}</p>
                       <div className="grid grid-cols-1 gap-4">
                          {data.education.schools.map((school, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center group hover:border-blue-500/20 transition-all shadow-sm">
                               <div>
                                  <h4 className="font-bold text-gray-900">{school.name}</h4>
                                  <div className="flex items-center gap-3 mt-1">
                                     <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{school.type}</span>
                                     {school.matricPass && <span className="text-[10px] text-emerald-600 font-black">Pass Rate: {school.matricPass}</span>}
                                     {school.ageGroup && <span className="text-[10px] text-blue-600 font-black">{school.ageGroup}</span>}
                                  </div>
                               </div>
                               <div className="text-right">
                                  <span className="text-xs font-bold text-rose-500">{school.distance}</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'security' && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                       <div className="flex items-center gap-3">
                          <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">Safety Index</h3>
                       </div>
                       <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                          <div>
                             <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">Status</p>
                             <p className="text-2xl font-black text-emerald-950 italic">{data.security.status}</p>
                          </div>
                          <ShieldCheckIcon className="w-12 h-12 text-emerald-500/20" />
                       </div>
                       <p className="text-sm text-gray-600 leading-relaxed font-medium">{data.security.stats}</p>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">SAPS Presence</p>
                          <div className="flex gap-3">
                             {data.security.policeStations.map((station, i) => (
                               <span key={i} className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-xs font-bold text-gray-700">{station}</span>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'transport' && (
                    <motion.div
                      key="transport"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                       <div className="flex items-center gap-3">
                          <TruckIcon className="w-6 h-6 text-orange-500" />
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">Mobility & Access</h3>
                       </div>
                       <p className="text-sm text-gray-600 leading-relaxed font-medium">{data.transport.connectivity}</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {data.transport.options.map((opt, i) => (
                            <div key={i} className="p-4 bg-white rounded-2xl flex items-center gap-3 border border-gray-100 italic">
                               <div className="w-2 h-2 rounded-full bg-orange-500" />
                               <span className="text-sm font-bold text-gray-700">{opt}</span>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'metrics' && (
                    <motion.div
                      key="metrics"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                       <div className="flex items-center gap-3">
                          <ChartBarIcon className="w-6 h-6 text-indigo-500" />
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">Community Intelligence</h3>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <MetricCard 
                            icon={<AcademicCapIcon className="w-4 h-4 text-rose-500" />}
                            label="Matric Pass" 
                            val={data.education.schools[0]?.matricPass || "85%"} 
                          />
                          <MetricCard 
                            icon={<ShieldCheckIcon className="w-4 h-4 text-emerald-500" />}
                            label="Crime Index" 
                            val={data.security.status} 
                          />
                          <MetricCard 
                            icon={<ShoppingCartIcon className="w-4 h-4 text-amber-500" />}
                            label="Shopping Hubs" 
                            val={data.lifestyle.malls.length + " Major Malls"} 
                          />
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <MetricCard 
                            icon={<BuildingOffice2Icon className="w-4 h-4 text-rose-500" />}
                            label="Properties" 
                            val={data.metrics.properties} 
                          />
                          <MetricCard 
                            icon={<WrenchIcon className="w-4 h-4 text-blue-500" />}
                            label="Services" 
                            val={data.metrics.services} 
                          />
                          <MetricCard 
                            icon={<UserIcon className="w-4 h-4 text-amber-500" />}
                            label="Helpers" 
                            val={data.metrics.helpers} 
                          />
                          <MetricCard 
                            icon={<SparklesIcon className="w-4 h-4 text-purple-500" />}
                            label="Events" 
                            val={data.metrics.events} 
                          />
                       </div>
                       <div className="p-4 bg-indigo-50 rounded-2xl flex gap-4">
                          <InformationCircleIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                          <p className="text-xs text-indigo-700 leading-normal font-medium">Data compiled from live listings on loopOut and regional market reports for {location}.</p>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'culture' && (
                    <motion.div
                      key="culture"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                       <div className="flex items-center gap-3">
                          <PaintBrushIcon className="w-6 h-6 text-rose-500" />
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">Roots & Heritage</h3>
                       </div>
                       
                       <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                          <div className="flex items-center gap-2 mb-3">
                             <ClockIcon className="w-4 h-4 text-rose-600" />
                             <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Historical Timeline</span>
                          </div>
                          <p className="text-sm text-rose-950 leading-relaxed font-medium italic">
                            "{data.culture.history}"
                          </p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                               Linguistic Diversity
                            </p>
                            <div className="flex flex-wrap gap-2">
                               {data.culture.languages.map((lang, i) => (
                                 <span key={i} className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-xs font-bold text-gray-700 shadow-sm">{lang}</span>
                               ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <SparklesIcon className="w-3.5 h-3.5" />
                               Atmosphere
                            </p>
                            <p className="text-sm font-bold text-gray-900 leading-snug">{data.culture.vibe}</p>
                          </div>
                       </div>
                    </motion.div>
                  )}

                   {activeTab === 'spotlight' && (
                     <motion.div
                       key="spotlight"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="space-y-6"
                     >
                        <div className="flex items-center gap-3">
                           <StarIconOutline className="w-6 h-6 text-yellow-500" />
                           <h3 className="text-xl font-black text-gray-900 tracking-tight">Best of {location}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {data.spotlight.map((item, i) => (
                              <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 flex gap-4 p-4 hover:shadow-xl transition-all cursor-pointer group">
                                 <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                                 </div>
                                 <div className="flex flex-col justify-between py-1 min-w-0">
                                    <div>
                                       <div className="flex items-center gap-2 mb-1">
                                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-950 text-white rounded-full">{item.type}</span>
                                          <div className="flex items-center gap-1">
                                             <StarIconSolid className="w-3 h-3 text-yellow-500" />
                                             <span className="text-[10px] font-black">{item.rating}</span>
                                          </div>
                                       </div>
                                       <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                                       <p className="text-[10px] text-gray-500 line-clamp-1">{item.desc}</p>
                                    </div>
                                    <span className="text-xs font-black text-rose-500">{item.price}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </motion.div>
                  )}

                  {activeTab === 'lifestyle' && (
                    <motion.div
                      key="lifestyle"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                       <div className="flex items-center gap-3">
                          <ShoppingCartIcon className="w-6 h-6 text-amber-600" />
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">Shopping & Leisure</h3>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-4">
                          {data.lifestyle.malls.map((mall, i) => (
                             <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                      <BuildingOffice2Icon className="w-5 h-5" />
                                   </div>
                                   <span className="font-bold text-gray-900">{mall}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Hub</span>
                             </div>
                          ))}
                       </div>

                       <div className="p-6 bg-gray-900 rounded-[2rem] text-white">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Local Amenities</p>
                          <div className="flex flex-wrap gap-2">
                             {data.lifestyle.amenities.map((item, i) => (
                               <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/80">{item}</span>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MetricCard = ({ icon, label, val }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-gray-100 flex flex-col shadow-sm hover:shadow-md transition-shadow">
     <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
     </div>
     <span className="text-sm font-black text-gray-900 italic">{val}</span>
  </div>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const WrenchIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.83-5.83m-4.75 4.75-3-3m3 3 1.125-1.125m1.875-1.875-1.125 1.125m-2.25 2.25-1.125 1.125m4.875-4.875 1.125-1.125m-2.25 2.25-1.125 1.125m-1.875 1.875h.008v.008H10.5v-.008Zm0-6H10.5v.008H10.5V9.75Zm6 6h.008v.008H16.5v-.008Zm0-6H16.5v.008H16.5V9.75Z" />
  </svg>
);

const InsightTab = ({ icon, label, active, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all duration-300 group ${
      active ? 'bg-gray-950 text-white shadow-2xl' : 'hover:bg-gray-50 text-gray-500'
    }`}
  >
     <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${active ? color : 'text-gray-400 group-hover:text-gray-900'}`}>
           {icon}
        </div>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
     </div>
     <ChevronRightIcon className={`w-4 h-4 transition-transform ${active ? 'rotate-90 text-white' : 'text-gray-300'}`} />
  </button>
);

export default NeighborhoodInsights;
