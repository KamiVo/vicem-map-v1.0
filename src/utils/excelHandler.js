import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (dealers, fileName = "Vicem_Dealers.xlsx") => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Dealers');

  worksheet.columns = [
    { header: 'Tên đại lý', key: 'name', width: 30 },
    { header: 'Địa chỉ', key: 'address', width: 30 },
    { header: 'Phường/Xã', key: 'ward', width: 20 },
    { header: 'Quận/Huyện', key: 'district', width: 20 },
    { header: 'Số điện thoại', key: 'phone', width: 15 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Vĩ độ (Lat)', key: 'lat', width: 15 },
    { header: 'Kinh độ (Lng)', key: 'lng', width: 15 }
  ];

  dealers.forEach(d => {
    worksheet.addRow({
      name: d.name,
      address: d.address,
      ward: d.ward || "",
      district: d.district,
      phone: d.phone || "",
      status: d.status,
      lat: d.lat,
      lng: d.lng
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          return resolve([]);
        }

        const jsonData = [];
        const headers = [];
        
        // Extract headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value;
        });

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // skip header
          const rowData = {};
          row.eachCell((cell, colNumber) => {
             rowData[headers[colNumber]] = cell.value;
          });
          jsonData.push(rowData);
        });
        
        const mappedDealers = jsonData.map(row => ({
          name: row["Tên đại lý"] || row.name || "",
          address: row["Địa chỉ"] || row.address || "",
          ward: row["Phường/Xã"] || row.ward || "",
          district: row["Quận/Huyện"] || row.district || "",
          phone: row["Số điện thoại"] || row.phone || "",
          status: row["Trạng thái"] || row.status || "Chưa bán",
          lat: parseFloat(row["Vĩ độ (Lat)"] || row.lat),
          lng: parseFloat(row["Kinh độ (Lng)"] || row.lng)
        }));

        resolve(mappedDealers);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
