import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = path.join(__dirname, 'client/src/components');

const items = ['ListingItem.jsx', 'ServiceItem.jsx', 'HelperItem.jsx'];

for (const file of items) {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix the incorrect import injection
    content = content.replace(/import \{\s*BookOpen,Link/g, "import { Link");
    content = content.replace(/import \{\n  BookOpen,Link/g, "import { Link");
    
    // Some files might not import Link. ServiceItem and HelperItem:
    // import { Link, useNavigate } from "react-router-dom";
    content = content.replace(/import \{\n  BookOpen,Link,\s*/g, "import { Link, ");
    content = content.replace(/import \{\s*BookOpen,Link,\s*/g, "import { Link, ");

    // For any stray BookOpen, just inside an import that isn't lucide-react
    if (content.includes("BookOpen,Link")) {
       content = content.replace("BookOpen,Link", "Link");
    }

    // Now safely add BookOpen from lucide-react just after framer-motion or wherever
    if (!content.includes("import { BookOpen }")) {
       content = content.replace(/import \{ motion \} from "framer-motion";/, 'import { motion } from "framer-motion";\nimport { BookOpen } from "lucide-react";');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[FIXED IMPORTS] ${file}`);
  }
}
