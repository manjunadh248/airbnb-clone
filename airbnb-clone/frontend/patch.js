const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:/airbnb-clone/frontend/src');
let changed = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Pattern 1: template literal  `http://127.0.0.1:8001...` -> `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}...`
    content = content.replace(/\`http:\/\/127\.0\.0\.1:8001/g, '\`${process.env.NEXT_PUBLIC_API_URL || \'http://127.0.0.1:8001\'}');
    
    // Pattern 2: single quotes 'http://127.0.0.1:8001...' -> `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}...`
    content = content.replace(/'http:\/\/127\.0\.0\.1:8001([^']*)'/g, '\`${process.env.NEXT_PUBLIC_API_URL || \'http://127.0.0.1:8001\'}$1\`');
    
    // Pattern 3: double quotes
    content = content.replace(/\"http:\/\/127\.0\.0\.1:8001([^\"]*)\"/g, '\`${process.env.NEXT_PUBLIC_API_URL || \'http://127.0.0.1:8001\'}$1\`');
    
    if (content !== fs.readFileSync(file, 'utf8')) {
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
        changed++;
    }
}
console.log('Total changed: ' + changed);
