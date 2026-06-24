import { useQuery } from '@tanstack/react-query';
import { 
  fetchDealerById, 
  fetchSalesData, 
  fetchProducts, 
  fetchAllSalesYears 
} from '../services/firebase';

// Lấy thông tin cơ bản của đại lý
export const useDealerData = (dealerId) => {
  return useQuery({
    queryKey: ['dealer', dealerId],
    queryFn: () => fetchDealerById(dealerId),
    enabled: !!dealerId, // Chỉ chạy khi có dealerId
    staleTime: 1000 * 60 * 10, // Giữ data trong 10 phút
  });
};

// Lấy các năm có dữ liệu sản lượng của đại lý
export const useDealerSalesYears = (dealerId) => {
  return useQuery({
    queryKey: ['dealer', dealerId, 'salesYears'],
    queryFn: async () => {
      const yearsData = await fetchAllSalesYears(dealerId);
      const currentYear = new Date().getFullYear();
      const years = yearsData.map(y => Number(y.year));
      if (!years.includes(currentYear)) years.push(currentYear);
      return years.sort((a, b) => b - a); // Mới nhất lên đầu
    },
    enabled: !!dealerId,
  });
};

// Lấy dữ liệu sản lượng theo năm của đại lý
export const useDealerSales = (dealerId, year) => {
  return useQuery({
    queryKey: ['dealer', dealerId, 'sales', year],
    queryFn: () => fetchSalesData(dealerId, year),
    enabled: !!dealerId && !!year,
  });
};

// Lấy danh sách sản phẩm của đại lý
export const useDealerProducts = (dealerId) => {
  return useQuery({
    queryKey: ['dealer', dealerId, 'products'],
    queryFn: () => fetchProducts(dealerId),
    enabled: !!dealerId,
  });
};
