import fs from 'fs';

const csv = fs.readFileSync('./public/VNM_adm.csv', 'utf8');
const lines = csv.split('\n');

const danangAdmin = {};

lines.forEach((line, index) => {
  if (index === 0 || !line.trim()) return;
  // Parse CSV line (handle quotes if any, though VNM_adm.csv usually doesn't have complex quotes for names)
  const parts = line.split(',');
  if (parts.length < 12) return;
  
  const province = parts[7]; // NAME_2 (Đà Nẵng)
  const district = parts[9]; // NAME_3
  const ward = parts[11];    // NAME_4

  if (province.includes('N?ng') || province.includes('Nẵng')) {
    const dName = district.replace('?', 'a').replace('?', 'e'); // basic fix just to see structure
    if (!danangAdmin[district]) {
      danangAdmin[district] = [];
    }
    danangAdmin[district].push(ward);
  }
});

fs.writeFileSync('./danang_admin.json', JSON.stringify(danangAdmin, null, 2), 'utf-8');
console.log("Xong");
