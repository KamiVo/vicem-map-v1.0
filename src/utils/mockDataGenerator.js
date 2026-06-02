export const generateMockDealers = (count = 1000) => {
  const districts = ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang'];
  const prefixes = ['Đại lý', 'Cửa hàng VLXD', 'Nhà phân phối', 'Công ty TNHH', 'Showroom'];
  const statuses = ['Đã bán', 'Chưa bán'];
  
  const mockData = [];

  for (let i = 0; i < count; i++) {
    // Tọa độ ngẫu nhiên trong khoảng Đà Nẵng
    // Lat: 15.95 -> 16.15
    // Lng: 108.10 -> 108.30
    const lat = 15.95 + Math.random() * 0.2;
    const lng = 108.10 + Math.random() * 0.2;
    
    const district = districts[Math.floor(Math.random() * districts.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const status = statuses[Math.random() > 0.3 ? 0 : 1]; // 70% Đã bán, 30% Chưa bán
    
    mockData.push({
      name: `${prefix} Test Auto ${i + 1}`,
      address: `Số ${Math.floor(Math.random() * 500) + 1} Đường Test, Đà Nẵng`,
      district: district,
      ward: `Phường Test ${Math.floor(Math.random() * 10) + 1}`,
      phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      status: status,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6))
    });
  }

  return mockData;
};
