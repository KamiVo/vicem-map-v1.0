import wardCentroids from '../assets/ward_centroids.json';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Tính khoảng cách giữa 2 tọa độ (bằng km) theo công thức Haversine
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const fetchGeocode = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VicemMapApp/2.0' }
    });
    await sleep(1000); // Tôn trọng giới hạn 1 request/s
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (err) {
    console.error("Geocoding fetch error:", err);
    await sleep(1000);
    return null;
  }
};

const getCentroidFallback = (ward, district) => {
  const cleanWard = ward.replace(/(Phường|Xã)\s+/i, '').trim();
  const cleanDistrict = district.replace(/(Quận|Huyện)\s+/i, '').trim();
  
  // File JSON đã lưu ward dưới dạng original có dấu, hoặc ta có thể tìm gần đúng
  if (wardCentroids[cleanDistrict] && wardCentroids[cleanDistrict][cleanWard]) {
    return wardCentroids[cleanDistrict][cleanWard];
  }
  return { lat: 16.0544, lng: 108.2022 }; // Đà Nẵng Center
};

export const geocodeAddress = async (address, ward, district) => {
  const cleanWard = ward.replace(/(Phường|Xã)\s+/i, '').trim();
  const cleanDistrict = district.replace(/(Quận|Huyện)\s+/i, '').trim();
  const baseArea = `Phường ${cleanWard}, Quận ${cleanDistrict}, Đà Nẵng, Việt Nam`;
  
  // 1. Dò bằng API quốc tế
  const apiCoords = await fetchGeocode(`${address}, ${baseArea}`);
  
  // 2. Lấy tọa độ chuẩn tâm phường (Offline)
  const centroidCoords = getCentroidFallback(ward, district);

  if (apiCoords) {
     // 3. SO SÁNH: Nếu API trả về vị trí lệch khỏi Phường quá 2.5km (dấu hiệu API bị sai/nhầm địa chỉ cũ mới)
     // Ta lập tức BÁC BỎ kết quả API và ép nó về tâm Phường!
     const distance = getDistanceFromLatLonInKm(apiCoords.lat, apiCoords.lng, centroidCoords.lat, centroidCoords.lng);
     if (distance < 2.5) {
       return apiCoords; // Tin tưởng API vì nằm trong/gần phường
     } else {
       console.warn(`Geocoding bị lệch ${distance.toFixed(1)}km, ép về tâm phường ${ward}!`);
       return centroidCoords; 
     }
  }

  // 4. Nếu API sập hoặc không tìm ra số nhà, lập tức trả về tâm phường (Tốc độ ánh sáng)
  return centroidCoords;
};
