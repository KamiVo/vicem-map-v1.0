import fs from 'fs';

const geojson = JSON.parse(fs.readFileSync('./public/danang_v1_0.geojson', 'utf-8'));
const danangAdmin = JSON.parse(fs.readFileSync('./src/assets/danang_admin.json', 'utf-8'));

// Flatten all valid wards
const validWards = new Set(danangAdmin.map(w => w.toLowerCase()));

const getPolygonCentroid = (coordinates) => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  // coordinates is usually [[[lng, lat], [lng, lat], ...]]
  
  const processRing = (ring) => {
    for (const [lng, lat] of ring) {
      if (lng < minX) minX = lng;
      if (lng > maxX) maxX = lng;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
    }
  };

  if (typeof coordinates[0][0] === 'number') {
    // LineString or similar, though boundary is usually Polygon
    processRing(coordinates);
  } else if (typeof coordinates[0][0][0] === 'number') {
    // Polygon
    coordinates.forEach(processRing);
  } else {
    // MultiPolygon
    coordinates.forEach(polygon => polygon.forEach(processRing));
  }
  
  return { lat: (minY + maxY) / 2, lng: (minX + maxX) / 2 };
};

const centroids = {};
let matched = 0;

for (const feature of geojson.features) {
  const props = feature.properties;
  if (!props) continue;
  
  // Try to find the name of the ward
  let name = props.name || '';
  if (!name && props['@relations']) {
    for (const rel of props['@relations']) {
      if (rel.reltags && rel.reltags.name) {
        name = rel.reltags.name;
        break;
      }
    }
  }

  if (name && (props.admin_level === "8" || name.includes("Phường") || name.includes("Xã"))) {
    const cleanName = name.replace(/(Phường|Xã)\s+/i, '').trim();
    const cleanNameLower = cleanName.toLowerCase();
    
    if (validWards.has(cleanNameLower)) {
      const ward = danangAdmin.find(w => w.toLowerCase() === cleanNameLower);
      
      // Compute centroid
      if (feature.geometry) {
         let lat, lng;
         if (feature.geometry.type === 'Point') {
           lng = feature.geometry.coordinates[0];
           lat = feature.geometry.coordinates[1];
         } else {
           const center = getPolygonCentroid(feature.geometry.coordinates);
           lat = center.lat;
           lng = center.lng;
         }
         
         // Only set if not already set, or prefer Polygon over Point
         if (!centroids[ward] || feature.geometry.type !== 'Point') {
           centroids[ward] = { lat, lng };
           matched++;
         }
      }
    }
  }
}

console.log(`Matched ${matched} wards.`);
fs.writeFileSync('./src/assets/ward_centroids.json', JSON.stringify(centroids, null, 2));
