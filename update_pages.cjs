const fs = require('fs');
const pages = [
  'client/src/pages/BarberPage.jsx',
  'client/src/pages/BeautyPage.jsx',
  'client/src/pages/ChefPage.jsx',
  'client/src/pages/PhotographyHelperPage.jsx',
  'client/src/pages/PrivateTutor.jsx',
  'client/src/pages/TattooPage.jsx'
];

for (const page of pages) {
  let content = fs.readFileSync(page, 'utf8');
  
  // Replace mapping
  content = content.replace(
    /const serviceOptions = \(helper\?\.serviceList && helper\.serviceList\.length > 0\)\s*\? helper\.serviceList\.map\(\(s, index\) => \(\{\s*id: s\.name,\s*name: s\.name,\s*price: s\.price,\s*icon: <FaCheckCircle className="text-rose-500" \/>\s*\}\)\)\s*: getServiceOptions\(helper\?\.type\);/g,
    `const serviceOptions = (helper?.serviceList && helper.serviceList.length > 0)
    ? helper.serviceList.map((s, index) => ({ 
        id: s.name, 
        name: s.name, 
        type: s.type,
        description: s.description,
        price: s.price,
        image: s.image,
        icon: <FaCheckCircle className="text-rose-500" /> 
      }))
    : getServiceOptions(helper?.type);`
  );

  // Replace UI
  content = content.replace(
    /className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer \${\n                          isSelected \n                            \? 'border-rose-500 bg-rose-50 shadow-sm' \n                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'\n                        }`}\n                      >\n                        <div className="flex items-center gap-3">\n                          <div className={`text-xl transition-colors \${isSelected \? 'text-rose-500' : 'text-gray-400'}`}>\n                            {service\.icon}\n                          <\/div>\n                          <span className={`font-medium transition-colors \${isSelected \? 'text-rose-700' : 'text-gray-900'}`}>\n                            {service\.name}\n                          <\/span>\n                        <\/div>/g,
    `className={\`flex items-start justify-between gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer \${
                          isSelected 
                            ? 'border-rose-500 bg-rose-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }\`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {service.image ? (
                            <img src={service.image} alt={service.name} className="w-12 h-12 object-cover rounded-lg border bg-white shrink-0 mt-0.5" />
                          ) : (
                            <div className={\`text-xl transition-colors \${isSelected ? 'text-rose-500' : 'text-gray-400'} shrink-0 mt-0.5\`}>
                              {service.icon}
                            </div>
                          )}
                          <div className="min-w-0">
                            {service.type && (
                              <span className={\`inline-block mb-1 rounded-full px-2 py-0.5 text-[10px] font-semibold \${
                                isSelected ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'
                              }\`}>
                                {service.type}
                              </span>
                            )}
                            <p className={\`font-medium transition-colors \${isSelected ? 'text-rose-700' : 'text-gray-900'}\`}>
                              {service.name}
                            </p>
                            {service.description && (
                              <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </div>`
  );
  
  fs.writeFileSync(page, content, 'utf8');
}
console.log('Done!');
