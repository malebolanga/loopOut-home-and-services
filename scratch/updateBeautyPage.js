import fs from 'fs';
import path from 'path';

const filePath = path.resolve('c:/loopOut-home-and-services/client/src/pages/BeautyPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update initial state for bookingData
const oldState = `    // Beauty & Glam specific fields
    beautyCategory: '',
    beautyOccasion: '',
    skinHairNotes: '',
    serviceLocationType: 'client_home'
  });`;

const newState = `    // Beauty & Glam specific fields
    beautyCategory: '',
    beautyOccasion: '',
    glamFinish: '',
    peopleCount: '1 Person (Solo)',
    lashPreference: '',
    nailStyle: '',
    hairStyle: '',
    touchUpKit: 'Standard Appointment',
    skinHairNotes: '',
    serviceLocationType: 'client_home'
  });`;

if (content.includes(oldState)) {
  content = content.replace(oldState, newState);
  console.log('Updated bookingData state');
} else {
  console.log('bookingData state already updated or not found');
}

// 2. Update generateWhatsAppMessage
const oldMessage = `    // Add service-specific details (Beauty & Glam)
    message += \`\\n💄 *BEAUTY & GLAM DETAILS:*\\n\`;
    if (bookingData.beautyOccasion) message += \`✨ *Occasion:* \${bookingData.beautyOccasion}\\n\`;
    if (bookingData.beautyCategory) message += \`💅 *Style / Category:* \${bookingData.beautyCategory}\\n\`;
    if (bookingData.skinHairNotes) message += \`📝 *Skin / Hair Notes & Allergies:* \${bookingData.skinHairNotes}\\n\`;`;

const newMessage = `    // Add service-specific details (Beauty & Glam)
    message += \`\\n💄 *BEAUTY & GLAM DETAILS:*\\n\`;
    if (bookingData.beautyOccasion) message += \`✨ *Occasion:* \${bookingData.beautyOccasion}\\n\`;
    if (bookingData.beautyCategory) message += \`💅 *Glam Category / Focus:* \${bookingData.beautyCategory}\\n\`;
    if (bookingData.glamFinish) message += \`🌟 *Look Finish & Style:* \${bookingData.glamFinish}\\n\`;
    if (bookingData.peopleCount) message += \`👥 *Number of People / Party:* \${bookingData.peopleCount}\\n\`;
    if (bookingData.lashPreference) message += \`👁️ *Lashes Preference:* \${bookingData.lashPreference}\\n\`;
    if (bookingData.hairStyle) message += \`💇‍♀️ *Hair Styling / Prep:* \${bookingData.hairStyle}\\n\`;
    if (bookingData.nailStyle) message += \`💅 *Nails & Shape:* \${bookingData.nailStyle}\\n\`;
    if (bookingData.touchUpKit) message += \`🎁 *Touch-Up Kit:* \${bookingData.touchUpKit}\\n\`;
    if (bookingData.skinHairNotes) message += \`📝 *Skin / Hair Notes & Allergies:* \${bookingData.skinHairNotes}\\n\`;`;

if (content.includes(oldMessage)) {
  content = content.replace(oldMessage, newMessage);
  console.log('Updated WhatsApp message generator');
} else {
  console.log('WhatsApp message generator not matched');
}

// 3. Update Modal UI
const oldModalBlock = `                  {/* Beauty, Glam & Aesthetics Specific Details */}
                  <div className="rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50/80 via-rose-50/40 to-white p-5 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xl shadow-md shadow-pink-200">
                          💄
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider">Beauty & Glam Details</h4>
                          <p className="text-xs text-pink-700 font-medium">Select your occasion, glam style & skin/hair notes</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                        Beauty & Aesthetics
                      </span>
                    </div>

                    {/* Occasion Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          ✨ What is the Occasion?
                        </label>
                        {bookingData.beautyOccasion && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            Selected: {bookingData.beautyOccasion}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                              className={\`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left \${
                                isSelected
                                  ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-200'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              <span>{occ.emoji}</span>
                              <span className="truncate">{occ.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Beauty Service Focus / Style */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          💅 Primary Glam / Aesthetic Focus
                        </label>
                        {bookingData.beautyCategory && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            Selected: {bookingData.beautyCategory}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Full Glam Makeup',
                          'Soft Glam / Natural',
                          'Acrylic / Gel Nails',
                          'Hair Styling & Braids',
                          'Lash Extensions & Tint',
                          'Facial Skincare / Peel'
                        ].map(cat => {
                          const isSelected = bookingData.beautyCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, beautyCategory: cat }))}
                              className={\`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center \${
                                isSelected
                                  ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skin & Hair Notes */}
                    <div>
                      <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                        📝 Skin / Hair Notes, Sensitivities & Preferences
                      </label>
                      <textarea
                        name="skinHairNotes"
                        value={bookingData.skinHairNotes || ''}
                        onChange={handleBookingChange}
                        rows="2"
                        placeholder="e.g., Sensitive skin / eczema, bringing own foundation, 26-inch braiding hair..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-xs font-medium bg-white"
                      />
                    </div>
                  </div>`;

const newModalBlock = `                  {/* Beauty, Glam & Aesthetics Specific Details */}
                  <div className="rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-white p-5 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center text-xl shadow-md shadow-pink-200">
                          💄
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider">Beauty, Glam & Aesthetics Options</h4>
                          <p className="text-xs text-pink-700 font-medium">Select your custom glam preferences for WhatsApp booking</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                        Glam Setup
                      </span>
                    </div>

                    {/* Occasion Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          ✨ What is the Occasion?
                        </label>
                        {bookingData.beautyOccasion && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            Selected: {bookingData.beautyOccasion}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                              className={\`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left \${
                                isSelected
                                  ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-200 scale-[1.02]'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              <span>{occ.emoji}</span>
                              <span className="truncate">{occ.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Beauty Service Focus / Category */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          💅 Primary Glam / Service Focus
                        </label>
                        {bookingData.beautyCategory && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            Selected: {bookingData.beautyCategory}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Full Glam Makeup',
                          'Soft Glam / Natural',
                          'Acrylic / Gel Nails',
                          'Hair Styling & Braids',
                          'Lash Extensions & Tint',
                          'Facial Skincare / Peel'
                        ].map(cat => {
                          const isSelected = bookingData.beautyCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, beautyCategory: cat }))}
                              className={\`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center \${
                                isSelected
                                  ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200 scale-[1.02]'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Look Finish & Coverage Style */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          🌟 Desired Look Finish & Coverage
                        </label>
                        {bookingData.glamFinish && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            Selected: {bookingData.glamFinish}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                              className={\`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-left \${
                                isSelected
                                  ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200 scale-[1.02]'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              <span>{finish.icon}</span>
                              <span className="truncate">{finish.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Party Size & Number of People */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          👥 Number of People / Party Size
                        </label>
                        {bookingData.peopleCount && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            {bookingData.peopleCount}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: '1 Person (Solo)', label: '1 Person (Solo)', icon: '👤' },
                          { id: '2 People (Duo)', label: '2 People (Duo)', icon: '👥' },
                          { id: '3-4 People (Group)', label: '3-4 People (Group)', icon: '✨' },
                          { id: '5+ People (Bridal/Party)', label: '5+ People (Bridal/Party)', icon: '👑' }
                        ].map(party => {
                          const isSelected = bookingData.peopleCount === party.id;
                          return (
                            <button
                              key={party.id}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, peopleCount: party.id }))}
                              className={\`flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center justify-center \${
                                isSelected
                                  ? 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-200 scale-[1.02]'
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
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          👁️ Lashes Style Preference
                        </label>
                        {bookingData.lashPreference && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            Selected: {bookingData.lashPreference}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'Dramatic 3D/Mink Lashes', label: 'Dramatic 3D/Mink Lashes' },
                          { id: 'Soft Wispy / Cluster Lashes', label: 'Soft Wispy / Clusters' },
                          { id: 'Natural Strip Lashes', label: 'Natural Strip Lashes' },
                          { id: 'Bringing My Own Lashes', label: 'Bringing My Own Lashes' },
                          { id: 'No Lashes (Mascara Only)', label: 'No Lashes (Mascara Only)' }
                        ].map(lash => {
                          const isSelected = bookingData.lashPreference === lash.id;
                          return (
                            <button
                              key={lash.id}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, lashPreference: lash.id }))}
                              className={\`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center \${
                                isSelected
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-200 scale-[1.02]'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              {lash.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hair Prep & Styling */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          💇‍♀️ Hair Prep / Styling Requirement
                        </label>
                        {bookingData.hairStyle && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            Selected: {bookingData.hairStyle}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Wig Install & Customization',
                          'Braids & Cornrows',
                          'Silk Press & Curls',
                          'Sew-In / Weave Install',
                          'Updo / Bridal Bun',
                          'No Hair Service Needed'
                        ].map(hair => {
                          const isSelected = bookingData.hairStyle === hair;
                          return (
                            <button
                              key={hair}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, hairStyle: hair }))}
                              className={\`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center \${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              {hair}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Nails & Shape */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          💅 Nails & Length Preference
                        </label>
                        {bookingData.nailStyle && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            Selected: {bookingData.nailStyle}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          'Short Natural / Plain Gel',
                          'Medium Almond / Oval',
                          'Long Coffin / Stiletto',
                          'Custom 3D Art & Gems',
                          'Classic French Tip',
                          'Not Doing Nails'
                        ].map(nail => {
                          const isSelected = bookingData.nailStyle === nail;
                          return (
                            <button
                              key={nail}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, nailStyle: nail }))}
                              className={\`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center \${
                                isSelected
                                  ? 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-200 scale-[1.02]'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              {nail}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Touch-Up Kit & Aftercare */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-800 uppercase tracking-wider">
                          🎁 Emergency Touch-Up Kit
                        </label>
                        {bookingData.touchUpKit && (
                          <span className="text-xs font-bold text-pink-600 bg-pink-100/80 px-2 py-0.5 rounded-md">
                            {bookingData.touchUpKit}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: 'Yes - Include Mini Touch-Up Kit (Lipstick & Blotting Powder)', label: '💄 Yes - Include Touch-Up Kit' },
                          { id: 'Standard Appointment (No Kit)', label: '✨ Standard Appointment' }
                        ].map(kit => {
                          const isSelected = bookingData.touchUpKit === kit.id;
                          return (
                            <button
                              key={kit.id}
                              type="button"
                              onClick={() => setBookingData(prev => ({ ...prev, touchUpKit: kit.id }))}
                              className={\`p-2.5 rounded-xl text-xs font-bold border-2 transition-all text-center \${
                                isSelected
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200 scale-[1.02]'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                              }\`}
                            >
                              {kit.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skin & Hair Notes */}
                    <div>
                      <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-1.5">
                        📝 Skin / Hair Notes, Sensitivities & Allergies
                      </label>
                      <textarea
                        name="skinHairNotes"
                        value={bookingData.skinHairNotes || ''}
                        onChange={handleBookingChange}
                        rows="2"
                        placeholder="e.g., Sensitive skin / eczema, bringing own foundation, preferred lash glue brand, 26-inch braiding hair..."
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-xs font-medium bg-white"
                      />
                    </div>
                  </div>`;

if (content.includes(oldModalBlock)) {
  content = content.replace(oldModalBlock, newModalBlock);
  console.log('Updated Modal UI block');
} else {
  console.log('Modal UI block not matched');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Saved BeautyPage.jsx successfully');
