import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToExcel, importFromExcel } from './excelHandler';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

// Mock ExcelJS
vi.mock('exceljs', () => {
  const eachCellHeader = vi.fn((callback) => {
    callback({ value: 'Tên đại lý' }, 1);
    callback({ value: 'Quận/Huyện' }, 2);
    callback({ value: 'Phường/Xã' }, 3);
    callback({ value: 'Số điện thoại' }, 4);
    callback({ value: 'Trạng thái' }, 5);
    callback({ value: 'Vĩ độ (Lat)' }, 6);
    callback({ value: 'Kinh độ (Lng)' }, 7);
  });

  const eachCellRow2 = vi.fn((callback) => {
    callback({ value: 'Dealer A' }, 1);
    callback({ value: 'Hải Châu' }, 2);
    callback({ value: 'Thạch Thang' }, 3);
    callback({ value: '0123' }, 4);
    callback({ value: 'Đã bán' }, 5);
    callback({ value: 16.0 }, 6);
    callback({ value: 108.0 }, 7);
  });

  const eachCellRow3 = vi.fn((callback) => {
    callback({ value: 'Dealer B' }, 1);
    callback({ value: 'Thanh Khê' }, 2);
    callback({ value: '' }, 3);
    callback({ value: '0456' }, 4);
    callback({ value: 'Chưa bán' }, 5);
    callback({ value: 16.1 }, 6);
    callback({ value: 108.1 }, 7);
  });

  const worksheetMock = {
    columns: [],
    addRow: vi.fn(),
    getRow: vi.fn((rowNum) => {
      if (rowNum === 1) return { eachCell: eachCellHeader };
      return { eachCell: vi.fn() };
    }),
    eachRow: vi.fn((callback) => {
      callback({ eachCell: eachCellHeader }, 1);
      callback({ eachCell: eachCellRow2 }, 2);
      callback({ eachCell: eachCellRow3 }, 3);
    })
  };

  const workbookMock = {
    addWorksheet: vi.fn(() => worksheetMock),
    worksheets: [worksheetMock],
    xlsx: {
      writeBuffer: vi.fn(async () => new ArrayBuffer(8)),
      load: vi.fn(async () => {})
    }
  };

  return {
    default: {
      Workbook: class {
        constructor() {
          return workbookMock;
        }
      }
    }
  };
});

describe('Excel Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exportToExcel should format data and call exceljs methods', async () => {
    const mockData = [
      { id: '1', name: 'Test Dealer 1', district: 'Hải Châu', ward: 'Bình Thuận', address: '123 ABC', phone: '090123', status: 'Đã bán', lat: 16.0, lng: 108.0 }
    ];

    await exportToExcel(mockData, 'Test_File');

    const wb = new ExcelJS.Workbook(); // returns the mocked instance
    expect(wb.addWorksheet).toHaveBeenCalledWith('Dealers');
    expect(wb.xlsx.writeBuffer).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  it('importFromExcel should read file and map data to correct dealer schema', async () => {
    // Create a dummy File object
    const file = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Mock FileReader behavior
    // Mock FileReader behavior
    const readAsArrayBufferSpy = vi.fn();
    class MockFileReader {
      readAsArrayBuffer(file) {
        readAsArrayBufferSpy(file);
        this.onload({ target: { result: new ArrayBuffer(8) } });
      }
      readAsBinaryString(file) {
        readAsArrayBufferSpy(file);
        this.onload({ target: { result: "dummy binary data" } });
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const result = await importFromExcel(file);

    expect(readAsArrayBufferSpy).toHaveBeenCalledWith(file);
    expect(result).toHaveLength(2);
    
    // Check if the keys are properly mapped
    expect(result[0]).toEqual({
      name: 'Dealer A',
      district: 'Hải Châu',
      ward: 'Thạch Thang',
      address: '',
      phone: '0123',
      status: 'Đã bán',
      lat: 16.0,
      lng: 108.0
    });

    expect(result[1]).toEqual({
      name: 'Dealer B',
      district: 'Thanh Khê',
      ward: '',
      address: '',
      phone: '0456',
      status: 'Chưa bán',
      lat: 16.1,
      lng: 108.1
    });

    // Cleanup mock
    vi.unstubAllGlobals();
  });
});
