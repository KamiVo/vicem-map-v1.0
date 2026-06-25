const PROJECT_ID = "webcemet-v1-0";

const wards = [
  "Hải Châu", "Hòa Cường", "Thanh Khê", "An Khê", "An Hải", 
  "Sơn Trà", "Ngũ Hành Sơn", "Hòa Khánh", "Hải Vân", 
  "Liên Chiểu", "Cẩm Lệ", "Hòa Xuân", "Hòa Tiến", "Hòa Vang"
];

const statuses = ['Đại lý tốt', 'Chưa bán', 'Tháng này chưa lấy', 'Rủi ro', 'Trọng điểm', 'Không chào bán', 'Đặc biệt'];
const fundingSources = ['Nguồn riêng', 'Nguồn chung'];

function randomLat() { return 15.95 + Math.random() * 0.15; }
function randomLng() { return 108.10 + Math.random() * 0.15; }

const dealers = [];
for (let i = 1; i <= 50; i++) {
  const ward = wards[Math.floor(Math.random() * wards.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const fundingSource = fundingSources[Math.floor(Math.random() * fundingSources.length)];

  const chartData = [];
  let totalSales = 0;
  for (let m = 1; m <= 12; m++) {
    const val = Math.floor(Math.random() * 50) + 10;
    chartData.push({ month: "T" + m, value: val });
    totalSales += val;
  }

  const products = [
    { id: "p1", name: "Xi măng VICEM Đa Dụng", stock: Math.floor(Math.random()*500), stockUnit: "Bao", price: 85000, priceUnit: "Bao" },
    { id: "p2", name: "Xi măng VICEM Xây Trát", stock: Math.floor(Math.random()*300), stockUnit: "Bao", price: 75000, priceUnit: "Bao" },
    { id: "p3", name: "Xi măng VICEM PCB40", stock: Math.floor(Math.random()*400), stockUnit: "Bao", price: 90000, priceUnit: "Bao" },
  ];

  dealers.push({
    name: `Đại lý VLXD ${Math.random().toString(36).substring(2, 6).toUpperCase()} - Cửa hàng ${i}`,
    address: `${Math.floor(Math.random() * 200) + 1} Đường Nguyễn Văn Linh`,
    ward: ward,
    lat: randomLat(),
    lng: randomLng(),
    phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    owner: `Chủ đại lý ${i}`,
    establishedYear: 2010 + Math.floor(Math.random() * 14),
    founder: `Người sáng lập ${i}`,
    landStatus: Math.random() > 0.5 ? "Sở hữu" : "Đang thuê",
    status: status,
    fundingSource: fundingSource,
    chartData: chartData,
    products: products,
    createdAt: new Date().toISOString()
  });
}

function toFirestoreFormat(obj) {
  if (typeof obj === 'string') return { stringValue: obj };
  if (typeof obj === 'number') return { doubleValue: obj };
  if (typeof obj === 'boolean') return { booleanValue: obj };
  if (Array.isArray(obj)) return { arrayValue: { values: obj.map(toFirestoreFormat) } };
  if (typeof obj === 'object' && obj !== null) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
      fields[k] = toFirestoreFormat(v);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

async function seed() {
  console.log("Bắt đầu đẩy dữ liệu...");
  let successCount = 0;
  for (const dealer of dealers) {
    const firestoreDoc = { fields: {} };
    for (const [k, v] of Object.entries(dealer)) {
      firestoreDoc.fields[k] = toFirestoreFormat(v);
    }

    try {
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/dealers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firestoreDoc)
      });
      
      if (res.ok) {
        successCount++;
        process.stdout.write(".");
      } else {
        console.error("\nLỗi:", await res.text());
      }
    } catch(err) {
      console.error("\nLỗi:", err.message);
    }
  }
  console.log(`\nĐã seed thành công ${successCount}/50 đại lý.`);
}

seed();
