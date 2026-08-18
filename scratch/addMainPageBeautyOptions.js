import fs from 'fs';
import path from 'path';

const filePath = path.resolve('c:/loopOut-home-and-services/client/src/pages/BeautyPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add interactive Glam Style Builder on main page (after line 2410 / Services section)
const oldMainServicesEnd = `                </div>
              </div>
            )}

            {/* Reviews Summary */}`;

const newMainServicesEnd = `                </div>
              </div>
            )}

            {/* Interactive Beauty & Glam Customizer on Main Page */}
            <div className="pb-8 border-b border-gray-200">
              <div className="rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-pink-50/80 via-rose-50/40 to-white p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-pink-200">
                      💄
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">Customize Your Glam Experience</h3>
                      <p className="text-xs text-pink-700 font-medium">Select your occasion, glam finish & styles below — prefilled for your WhatsApp booking</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                    Glam Builder
                  </span>
                </div>

                {/* 1. Occasion */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-black text-gray-900 uppercase tracking-wider">
                      ✨ 1. Select Occasion
                    </label>
                    {bookingData.beautyOccasion && (
                      <span className="text-xs font-bold text-pink-600 bg-pink-100/90 px-2.5 py-0.5 rounded-full">
                        {bookingData.beautyOccasion}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'Bridal / Wedding', emoji: '👰', label: 'Bridal / Wedding' },
                      { id: 'Matric Farewell / Dance', emoji: '💃', label: 'Matric Dance' },
                      { id: 'Birthday Celebration', emoji: '🎂', label: 'Birthday' },
                      { id: 'Photoshoot / Media', emoji: '📸', label: 'Photoshoot' },
                      { id: 'Gala / Red Carpet Event', emoji: '🥂', label: 'Gala / Event' },
                      { id: 'Baby / Bridal Shower', emoji: '💐', label: 'Shower' },
                      { id: 'Date Night / Night Out', emoji: '🕯️', label: 'Night Out' },
                      { id: 'Everyday / Casual Glam', emoji: '✨', label: 'Everyday Glam' }
                    ].map(occ => {
                      const isSelected = bookingData.beautyOccasion === occ.id;
                      return (
                        <button
                          key={occ.id}
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, beautyOccasion: occ.id }))}
                          className={\`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold border-2 transition-all text-left shadow-sm \${
                            isSelected
                              ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-200 scale-[1.02]'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50/50'
                          }\`}
                        >
                          <span className="text-base">{occ.emoji}</span>
                          <span className="truncate">{occ.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Look Finish & Style */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-black text-gray-900 uppercase tracking-wider">
                      🌟 2. Desired Look Finish & Coverage
                    </label>
                    {bookingData.glamFinish && (
                      <span className="text-xs font-bold text-pink-600 bg-pink-100/90 px-2.5 py-0.5 rounded-full">
                        {bookingData.glamFinish}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'Full Matte / Airbrush', icon: '🎨', label: 'Full Matte / Airbrush' },
                      { id: 'Dewy / Glass Skin Glow', icon: '✨', label: 'Dewy / Glass Skin Glow' },
                      { id: 'Soft Velvet Natural', icon: '🌸', label: 'Soft Velvet Natural' },
                      { id: 'Ultra Long-Wear Waterproof', icon: '🛡️', label: 'Long-Wear Waterproof' },
                      { id: 'Bold Cut-Crease & Glitter', icon: '💎', label: 'Bold Cut-Crease & Glitter' },
                      { id: 'Clean Girl Minimalist', icon: '🌿', label: 'Clean Girl Minimalist' }
                    ].map(finish => {
                      const isSelected = bookingData.glamFinish === finish.id;
                      return (
                        <button
                          key={finish.id}
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, glamFinish: finish.id }))}
                          className={\`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold border-2 transition-all text-left shadow-sm \${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200 scale-[1.02]'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50/50'
                          }\`}
                        >
                          <span className="text-base">{finish.icon}</span>
                          <span className="truncate">{finish.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Party Size & Lashes in 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Party Size */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-black text-gray-900 uppercase tracking-wider">
                        👥 3. Party Size
                      </label>
                      {bookingData.peopleCount && (
                        <span className="text-[11px] font-bold text-pink-600">
                          {bookingData.peopleCount}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: '1 Person (Solo)', label: 'Solo (1)', icon: '👤' },
                        { id: '2 People (Duo)', label: 'Duo (2)', icon: '👥' },
                        { id: '3-4 People (Group)', label: 'Group (3-4)', icon: '✨' },
                        { id: '5+ People (Bridal/Party)', label: 'Party (5+)', icon: '👑' }
                      ].map(party => {
                        const isSelected = bookingData.peopleCount === party.id;
                        return (
                          <button
                            key={party.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, peopleCount: party.id }))}
                            className={\`flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border-2 transition-all justify-center \${
                              isSelected
                                ? 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-200'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                            }\`}
                          >
                            <span>{party.icon}</span>
                            <span className="truncate">{party.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lashes Preference */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-black text-gray-900 uppercase tracking-wider">
                        👁️ 4. Lashes Preference
                      </label>
                      {bookingData.lashPreference && (
                        <span className="text-[11px] font-bold text-pink-600 truncate max-w-[120px]">
                          {bookingData.lashPreference}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'Dramatic 3D/Mink Lashes', label: 'Dramatic 3D' },
                        { id: 'Soft Wispy / Cluster Lashes', label: 'Soft Wispy' },
                        { id: 'Natural Strip Lashes', label: 'Natural Strip' },
                        { id: 'No Lashes (Mascara Only)', label: 'No Lashes' }
                      ].map(lash => {
                        const isSelected = bookingData.lashPreference === lash.id;
                        return (
                          <button
                            key={lash.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, lashPreference: lash.id }))}
                            className={\`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center truncate \${
                              isSelected
                                ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-200'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                            }\`}
                          >
                            {lash.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Booking Button */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-pink-100/60 p-4 rounded-2xl border border-pink-200">
                  <div>
                    <p className="text-xs font-black text-gray-900">Ready to secure your booking?</p>
                    <p className="text-[11px] text-pink-800">All selections above will be formatted into your WhatsApp reservation message.</p>
                  </div>
                  <button
                    type="button"
                    onClick={openBookingFormOverlay}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap"
                  >
                    Proceed to WhatsApp Booking →
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Summary */}`;

if (content.includes(oldMainServicesEnd)) {
  content = content.replace(oldMainServicesEnd, newMainServicesEnd);
  console.log('Added interactive Glam Builder to main page');
} else {
  console.log('Main page services end not found');
}

// 2. Enhance right sidebar Booking Card (adding occasion and glam finish selectors)
const oldSidebarInputs = `                  <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                    <label className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1.5">Personnel Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      placeholder="Full Designation"
                      className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none placeholder-gray-300"
                    />
                  </div>
                </div>`;

const newSidebarInputs = `                  <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                    <label className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1.5">Personnel Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleBookingChange}
                      placeholder="Your Full Name"
                      className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none placeholder-gray-300"
                    />
                  </div>

                  {/* Beauty Occasion Dropdown */}
                  <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-100 hover:border-pink-300 transition-all">
                    <label className="block text-[9px] font-black text-pink-900 uppercase tracking-widest mb-1.5">✨ Occasion</label>
                    <select
                      name="beautyOccasion"
                      value={bookingData.beautyOccasion || ''}
                      onChange={(e) => setBookingData(prev => ({ ...prev, beautyOccasion: e.target.value }))}
                      className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none cursor-pointer"
                    >
                      <option value="">Select Occasion...</option>
                      <option value="Bridal / Wedding">👰 Bridal / Wedding</option>
                      <option value="Matric Farewell / Dance">💃 Matric Dance</option>
                      <option value="Birthday Celebration">🎂 Birthday</option>
                      <option value="Photoshoot / Media">📸 Photoshoot / Media</option>
                      <option value="Gala / Red Carpet Event">🥂 Gala / Red Carpet</option>
                      <option value="Baby / Bridal Shower">💐 Baby / Bridal Shower</option>
                      <option value="Date Night / Night Out">🕯️ Date Night / Night Out</option>
                      <option value="Everyday / Casual Glam">✨ Everyday Glam</option>
                    </select>
                  </div>

                  {/* Glam Finish & Look */}
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 hover:border-purple-300 transition-all">
                    <label className="block text-[9px] font-black text-purple-900 uppercase tracking-widest mb-1.5">🌟 Glam Finish & Style</label>
                    <select
                      name="glamFinish"
                      value={bookingData.glamFinish || ''}
                      onChange={(e) => setBookingData(prev => ({ ...prev, glamFinish: e.target.value }))}
                      className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none cursor-pointer"
                    >
                      <option value="">Select Glam Finish...</option>
                      <option value="Full Matte / Airbrush">🎨 Full Matte / Airbrush</option>
                      <option value="Dewy / Glass Skin Glow">✨ Dewy / Glass Skin Glow</option>
                      <option value="Soft Velvet Natural">🌸 Soft Velvet Natural</option>
                      <option value="Ultra Long-Wear Waterproof">🛡️ Long-Wear Waterproof</option>
                      <option value="Bold Cut-Crease & Glitter">💎 Bold Cut-Crease & Glitter</option>
                      <option value="Clean Girl Minimalist">🌿 Clean Girl Minimalist</option>
                    </select>
                  </div>
                </div>`;

if (content.includes(oldSidebarInputs)) {
  content = content.replace(oldSidebarInputs, newSidebarInputs);
  console.log('Enhanced right sidebar booking card');
} else {
  console.log('Sidebar inputs not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully saved BeautyPage.jsx with main page glam builder and sidebar options');
