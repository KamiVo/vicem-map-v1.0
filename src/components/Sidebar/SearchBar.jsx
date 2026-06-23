import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaStore } from 'react-icons/fa';

const SearchBar = ({ dealers, onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true);

      // 1. Tìm trong danh sách đại lý (local) — theo tên, địa chỉ, phường, chủ, SĐT
      const lowerQuery = query.toLowerCase();
      const localMatches = dealers.filter(d =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.address.toLowerCase().includes(lowerQuery) ||
        (d.ward && d.ward.toLowerCase().includes(lowerQuery)) ||
        (d.owner && d.owner.toLowerCase().includes(lowerQuery)) ||
        (d.phone && d.phone.includes(query.trim()))
      ).map(d => {
        let matchField = '';
        if (d.owner && d.owner.toLowerCase().includes(lowerQuery)) matchField = `Chủ: ${d.owner}`;
        else if (d.phone && d.phone.includes(query.trim())) matchField = `SĐT: ${d.phone}`;
        return { ...d, type: 'dealer', matchField };
      });

      // 2. Tìm qua ArcGIS Geocoding API (Chính xác hơn với số nhà ở Việt Nam)
      try {
        const searchQuery = query.toLowerCase().includes('đà nẵng') ? query : query + ' Đà Nẵng';
        const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${encodeURIComponent(searchQuery)}&outFields=Match_addr,Addr_type&maxLocations=5`);
        const apiData = await res.json();
        
        // Loại bỏ kết quả trùng lặp bằng Set
        const uniqueMatches = [];
        const seen = new Set();

        if (apiData.candidates) {
          apiData.candidates.forEach(item => {
            const addressStr = item.address;
            if (!seen.has(addressStr)) {
              seen.add(addressStr);
              uniqueMatches.push({
                type: 'location',
                id: item.location.x + '_' + item.location.y,
                name: addressStr.split(',')[0],
                address: addressStr,
                lat: item.location.y,
                lng: item.location.x,
                details: { road: addressStr }
              });
            }
          });
        }

        setResults([...localMatches, ...uniqueMatches]);
      } catch (err) {
        console.error("ArcGIS Search Error", err);
        setResults(localMatches); // Fallback to local only
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [query, dealers]);

  return (
    <div className="relative w-full z-[2000]">
      <div className="relative flex items-center w-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <div className="pl-4 text-gray-400"><FaSearch /></div>
        <input
          type="text"
          className="w-full px-3 py-3 outline-none text-sm font-medium text-gray-700 bg-transparent"
          placeholder="Tìm kiếm đại lý hoặc địa điểm..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
      </div>

      {showDropdown && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[350px] overflow-y-auto z-[2000]">
          {isSearching && <div className="p-4 text-center text-sm text-gray-500 font-medium">Đang tìm kiếm...</div>}
          {!isSearching && results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">Không tìm thấy kết quả phù hợp.</div>
          )}
          {!isSearching && results.map((res, idx) => (
            <div
              key={res.id || idx}
              onClick={() => {
                onSelectLocation(res);
                setShowDropdown(false);
                setQuery(res.name);
              }}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
            >
              <div className={`mt-0.5 p-2 rounded-full ${res.type === 'dealer' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                {res.type === 'dealer' ? <FaStore size={14} /> : <FaMapMarkerAlt size={14} />}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-gray-800 truncate">{res.name}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-1">{res.address}</p>
                {res.matchField && <p className="text-[10px] text-blue-500 font-semibold mt-0.5">{res.matchField}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
