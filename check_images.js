const fs = require('fs');
const path = require('path');

const files = [
    'frontend/public/pwa-192x192.jpg',
    'frontend/public/pwa-512x512.jpg'
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const header = buffer.subarray(0, 4).toString('hex').toUpperCase();
        const isPng = header === '89504E47';
        const isJpeg = header.startsWith('FFD8FF');
        console.log(`${file}: Header=${header}, IsPNG=${isPng}, IsJPEG=${isJpeg}`);
    } else {
        console.log(`${file}: Not Found`);
    }
});
