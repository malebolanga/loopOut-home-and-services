import fs from 'fs';

const filePath = 'c:\\loopOut-home-and-services\\client\\src\\components\\EventItem.jsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { BookOpen }') && !content.includes(', BookOpen }')) {
    content = content.replace('import { motion } from "framer-motion";', 'import { motion } from "framer-motion";\nimport { BookOpen } from "lucide-react";');
}

fs.writeFileSync(filePath, content);
console.log('Successfully updated EventItem.jsx imports');
