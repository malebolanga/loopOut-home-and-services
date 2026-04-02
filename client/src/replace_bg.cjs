const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx') || f.endsWith('.tsx'));
files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "min-h-screen bg-white" with "min-h-screen"
    let newContent = content.replace(/min-h-screen\s+bg-white/g, 'min-h-screen');
    
    // Also catch any "className='min-h-screen bg-white'" if they use single quotes
    newContent = newContent.replace(/className='min-h-screen\s+bg-white'/g, "className='min-h-screen'");
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated', file);
    }
});
