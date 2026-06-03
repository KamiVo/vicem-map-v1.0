const sleep = ms => new Promise(r => setTimeout(r, ms));

const fetchGeocode = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VicemMapApp/1.0' }
    });
    // Rate limit: 1 request per second according to Nominatim Policy
    await sleep(1000);
    
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

const extractHouseNumberAndStreet = (address) => {
  // Regex: Bắt số nhà ở đầu chuỗi (vd: "12", "12A", "12/4")
  const match = address.match(/^(\d+)[a-zA-Z]*(?:\/\d+)*(.*)/);
  if (match) {
    const numInt = parseInt(match[1], 10);
    const street = match[2].trim();
    // Bỏ qua các dấu phẩy hoặc chữ "đường" nếu có ở đầu street
    const cleanStreet = street.replace(/^[,|-]\s*/, '').trim();
    return { hasNumber: true, num: numInt, street: cleanStreet };
  }
  return { hasNumber: false, street: address };
};

export const geocodeAddress = async (address, ward, district) => {
  // Chuẩn hóa phường/quận
  const cleanWard = ward.replace(/(Phường|Xã)\s+/i, '').trim();
  const cleanDistrict = district.replace(/(Quận|Huyện)\s+/i, '').trim();
  
  const baseArea = `Phường ${cleanWard}, Quận ${cleanDistrict}, Đà Nẵng, Việt Nam`;
  
  // 1. Thử địa chỉ gốc xác thực nhất
  let coords = await fetchGeocode(`${address}, ${baseArea}`);
  if (coords) return coords;

  const parsed = extractHouseNumberAndStreet(address);
  
  if (parsed.hasNumber && !isNaN(parsed.num)) {
    // 2. Thử +2
    coords = await fetchGeocode(`${parsed.num + 2} ${parsed.street}, ${baseArea}`);
    if (coords) return coords;

    // 3. Thử -2
    if (parsed.num - 2 > 0) {
      coords = await fetchGeocode(`${parsed.num - 2} ${parsed.street}, ${baseArea}`);
      if (coords) return coords;
    }

    // 4. Thử +4
    coords = await fetchGeocode(`${parsed.num + 4} ${parsed.street}, ${baseArea}`);
    if (coords) return coords;

    // 5. Thử -4
    if (parsed.num - 4 > 0) {
      coords = await fetchGeocode(`${parsed.num - 4} ${parsed.street}, ${baseArea}`);
      if (coords) return coords;
    }
    
    // 6. Thử chỉ dùng tên đường
    if (parsed.street.length > 2) {
      coords = await fetchGeocode(`${parsed.street}, ${baseArea}`);
      if (coords) return coords;
    }
  }

  // 7. Thử lùi về cấp Phường + Quận
  coords = await fetchGeocode(`${baseArea}`);
  if (coords) return coords;

  // 8. Tệ nhất: Lùi về cấp Quận
  coords = await fetchGeocode(`Quận ${cleanDistrict}, Đà Nẵng, Việt Nam`);
  if (coords) return coords;

  // 9. Fallback mặc định trung tâm Đà Nẵng
  return { lat: 16.0544, lng: 108.2022 };
};
