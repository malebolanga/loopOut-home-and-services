const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'pages'),
    path.join(__dirname, 'components')
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx') || f.endsWith('.tsx'));
    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        let newContent = content.replace(/min-h-screen\s+bg-[a-zA-Z0-9-\[\]#]+/g, 'min-h-screen');
        newContent = newContent.replace(/className='min-h-screen\s+bg-[a-zA-Z0-9-\[\]#]+'/g, "className='min-h-screen'");
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log('Updated', file);
        }
    });
});
