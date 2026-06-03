import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock các thư viện và component phụ thuộc
vi.mock('./services/firebase', () => ({
  fetchDealersFromDB: vi.fn(() => Promise.resolve([
    { id: '1', name: 'Đại lý Test 1', address: 'Địa chỉ 1', district: 'Hải Châu', ward: 'Bình Hiên', status: 'Đã bán', lat: 16.0, lng: 108.0 },
    { id: '2', name: 'Đại lý Test 2', address: 'Địa chỉ 2', district: 'Sơn Trà', ward: 'Phước Mỹ', status: 'Chưa bán', lat: 16.1, lng: 108.1 },
  ])),
  batchAddDealersToDB: vi.fn(),
}));

vi.mock('./components/Map/MapViewer', () => ({
  default: ({ dealers, showGeoJSON }) => (
    <div data-testid="map-viewer">
      Mocked Map. Dealers count: {dealers.length}. GeoJSON: {showGeoJSON ? 'ON' : 'OFF'}
    </div>
  )
}));

describe('App Component', () => {
  it('renders the App and loads initial mock data', async () => {
    render(<App />);
    
    // Kiểm tra tiêu đề có xuất hiện không
    expect(screen.getByText('VICEM ĐÀ NẴNG')).toBeInTheDocument();

    // Chờ dữ liệu mock được render vào MapViewer (đợi text count: 2 xuất hiện)
    const mapViewer = await screen.findByText(/Dealers count: 2/i);
    expect(mapViewer).toBeInTheDocument();
  });

  it('filters dealers by search term', async () => {
    render(<App />);
    
    // Đợi render xong data
    await screen.findByText(/Dealers count: 2/i);

    const searchInput = screen.getByPlaceholderText('Tìm kiếm đại lý hoặc địa điểm...');
    fireEvent.change(searchInput, { target: { value: 'Test 1' } });

    // Trong UI mới, việc gõ vào ô tìm kiếm sẽ hiện dropdown chứa dealer, 
    // click vào dropdown thì mới gán selectedLocation và render ra Map là 1 marker.
    // Nếu chỉ gõ thì Map vẫn hiện 2 marker.
    expect(screen.getByTestId('map-viewer')).toHaveTextContent('Dealers count: 2');
  });

  it('filters dealers by district', async () => {
    render(<App />);
    await screen.findByText(/Dealers count: 2/i);

    const selectDistrict = screen.getAllByRole('combobox')[0]; // dropdown district is first
    fireEvent.change(selectDistrict, { target: { value: 'Sơn Trà' } });

    // Chỉ có 1 đại lý ở Sơn Trà
    expect(screen.getByTestId('map-viewer')).toHaveTextContent('Dealers count: 1');
  });

  it('filters dealers by ward', async () => {
    render(<App />);
    await screen.findByText(/Dealers count: 2/i);

    // First select district to enable ward dropdown
    const selectDistrict = screen.getAllByRole('combobox')[0];
    fireEvent.change(selectDistrict, { target: { value: 'Hải Châu' } });

    // Then select ward
    const wardSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(wardSelect, { target: { value: 'Bình Hiên' } });

    // Cần 1 đại lý khớp (Đại lý Test 1 mocked with ward = 'Bình Hiên')
    expect(screen.getByTestId('map-viewer')).toHaveTextContent('Dealers count: 1');
  });

  it('toggles GeoJSON visibility', async () => {
    render(<App />);
    await screen.findByText(/Dealers count: 2/i);

    // Mặc định là OFF
    expect(screen.getByTestId('map-viewer')).toHaveTextContent('GeoJSON: OFF');

    // Click checkbox
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    // Trở thành ON
    expect(screen.getByTestId('map-viewer')).toHaveTextContent('GeoJSON: ON');
  });
});
