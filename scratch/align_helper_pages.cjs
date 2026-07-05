const fs = require('fs');
const path = require('path');

const files = [
  'PhotographyHelperPage.jsx',
  'BeautyPage.jsx',
  'BarberPage.jsx',
  'TattooPage.jsx',
  'ChefPage.jsx'
];

const target = `                  {/* Location Option */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service location</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="locationOption"
                          value="comeToYou"
                          checked={bookingData.locationOption === 'comeToYou'}
                          onChange={handleBookingChange}
                          className="mr-2"
                        />
                        Come to me
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="locationOption"
                          value="goToThem"
                          checked={bookingData.locationOption === 'goToThem'}
                          onChange={handleBookingChange}
                          className="mr-2"
                        />
                        Go to them
                      </label>
                    </div>
                  </div>`;

const replacement = `                  {/* Location Option */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service location</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="locationOption"
                          value="comeToYou"
                          checked={bookingData.locationOption === 'comeToYou'}
                          onChange={handleBookingChange}
                          className="accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">Come to me</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="locationOption"
                          value="goToThem"
                          checked={bookingData.locationOption === 'goToThem'}
                          onChange={handleBookingChange}
                          className="accent-rose-500"
                        />
                        <span className="text-sm text-gray-700">Go to them</span>
                      </label>
                    </div>
                  </div>`;

files.forEach(f => {
  const p = path.join(__dirname, '../client/src/pages', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Normalize both files to LF to avoid matching issues, then replace, then write
    const contentLF = content.replace(/\r\n/g, '\n');
    const targetLF = target.replace(/\r\n/g, '\n');
    const replacementLF = replacement.replace(/\r\n/g, '\n');
    
    if (contentLF.includes(targetLF)) {
      const updated = contentLF.replace(targetLF, replacementLF);
      fs.writeFileSync(p, updated, 'utf8');
      console.log(`${f}: replacement successful`);
    } else {
      console.log(`${f}: target not found`);
    }
  } else {
    console.log(`${f}: file does not exist at ${p}`);
  }
});
