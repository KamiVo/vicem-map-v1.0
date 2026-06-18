import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, GeoJSON, LayersControl, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

// Custom Control để Reset View
const ResetViewControl = ({ center, zoom }) => {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-right mb-4 mr-4 pointer-events-auto">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          map.flyTo(center, zoom, { animate: true, duration: 1.5 });
        }}
        className="bg-white/90 backdrop-blur shadow-md hover:bg-gray-50 text-gray-700 font-bold p-2.5 rounded-xl border border-gray-200 transition-all z-[1000] flex items-center justify-center gap-2 text-sm"
      >
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Đặt lại tầm nhìn
      </button>
    </div>
  );
};

// Map Events
const MapEvents = ({ onAddDealerByClick, selectedLocation, setZoomLevel, isAdmin }) => {
  const map = useMap();
  
  useMapEvents({
    contextmenu(e) {
      if (isAdmin && onAddDealerByClick) {
        onAddDealerByClick(e.latlng);
      }
    },
    zoomend() {
      setZoomLevel(map.getZoom());
    }
  });

  useEffect(() => {
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [selectedLocation, map]);

  return null;
};

// --- TỐI ƯU HÓA O(1) CHO KHỞI TẠO ICON ---
// Caching lại các đối tượng icon đã tạo để không bắt Leaflet phải parse lại chuỗi HTML.
const iconCache = new Map();

const getDealerIcon = (status, isSelected) => {
  const cacheKey = `${status}_${isSelected}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  let colorClass, bgClass, borderClass;

  if (status === 'Đại lý tốt') {
    colorClass = 'text-emerald-600';
    bgClass = 'bg-emerald-100';
    borderClass = 'border-emerald-500';
  } else if (status === 'Đại lý chưa bán') {
    colorClass = 'text-rose-600';
    bgClass = 'bg-rose-100';
    borderClass = 'border-rose-500';
  } else if (status === 'Đại lý rủi ro') {
    colorClass = 'text-amber-600';
    bgClass = 'bg-amber-100';
    borderClass = 'border-amber-500';
  } else {
    colorClass = 'text-slate-800';
    bgClass = 'bg-slate-200';
    borderClass = 'border-slate-800';
  }

  const sizeClass = isSelected ? 'w-10 h-10 border-[3px] shadow-2xl scale-110' : 'w-8 h-8 border-[2.5px] shadow-lg';

  const iconHtml = `
    <div class="relative flex items-center justify-center ${sizeClass} rounded-full ${bgClass} ${borderClass} transform transition-all duration-300 hover:scale-125 z-10">
      <svg class="w-[55%] h-[55%] ${colorClass}" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
      </svg>
      ${isSelected ? `<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>` : ''}
    </div>
  `;

  const icon = L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-none',
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 40] : [16, 32]
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

const getLocationIcon = () => {
  const iconHtml = `
    <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-[2.5px] bg-blue-100 border-blue-500 shadow-lg transform transition-all duration-300">
      <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      <span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>
    </div>
  `;
  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

const MapViewer = ({ dealers, showGeoJSON, filters, onAddDealerByClick, onEditDealer, onDeleteDealer, selectedLocation, onSelectLocation, onOpenDashboard, isAdmin }) => {
  const [geoData, setGeoData] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  
  // Tọa độ trung tâm mặc định Đà Nẵng
  const daNangCenter = [16.0544, 108.2022];
  const defaultZoom = 12;

  useEffect(() => {
    if (showGeoJSON && !geoData) {
      // Gọi file ranh giới từ thư mục public/
      fetch('/danang.geojson')
        .then(response => response.json())
        .then(data => setGeoData(data))
        .catch(err => console.error("Lỗi tải GeoJSON", err));
    }
  }, [showGeoJSON, geoData]);

  const geoJsonStyle = {
    color: '#0ea5e9',
    weight: 2,
    fillColor: '#e0f2fe',
    fillOpacity: 0.1,
    dashArray: '4 6',
    className: 'glowing-geojson'
  };

  const getFeatureName = (feature) => {
    if (feature.properties?.name) return feature.properties.name;
    if (feature.properties?.['@relations']) {
      for (const rel of feature.properties['@relations']) {
        if (rel.reltags?.name) return rel.reltags.name;
      }
    }
    return null;
  };

  // Tương tác hover trên GeoJSON
  const onEachFeature = (feature, layer) => {
    const name = getFeatureName(feature);
    if (name) {
      layer.bindTooltip(`<div class="font-bold text-blue-900 text-xs px-1">${name}</div>`, {
        direction: 'center',
        className: 'bg-white/80 border-none shadow-md backdrop-blur-sm rounded',
        sticky: true // Đi theo con trỏ chuột
      });
    }

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          weight: 3,
          color: '#0284c7',
          fillOpacity: 0.2,
          dashArray: ''
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          target.bringToFront();
        }
      },
      mouseout: (e) => {
        e.target.setStyle(geoJsonStyle);
      },
      contextmenu: (e) => {
        // Truyền contextmenu xuyên qua lớp GeoJSON
        if (isAdmin && onAddDealerByClick) onAddDealerByClick(e.latlng);
      }
    });
  };

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, { radius: 0, opacity: 0 }); // Ẩn hoàn toàn các point markers
  };

  // Tối ưu hóa: Đưa logic tính toán mảng hiển thị vào useMemo (O(1) cached)
  const markersToRender = React.useMemo(() => {
    return dealers; // Lọc đã được thực hiện ở App.jsx. Luôn hiển thị tất cả các dealer đã lọc.
  }, [dealers]);

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <MapContainer 
        center={daNangCenter} 
        zoom={defaultZoom} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false} // Tắt default để tùy biến lại vị trí
        maxBounds={[[8.0, 102.0], [24.0, 110.0]]} // Giới hạn chỉ cuộn được trong khu vực Việt Nam
        maxBoundsViscosity={1.0}
        minZoom={10} // Đã tăng từ 6 lên 10 để KHÔNG thể zoom out ra ngoài quá xa khu vực miền Trung
        maxZoom={20} // Tăng mức zoom cận cảnh
        wheelPxPerZoomLevel={120} // Giảm độ nhạy cuộn chuột
        zoomSnap={0.5}
        zoomDelta={0.5}
      >
        <ZoomControl position="topright" />
        <MapEvents 
          onAddDealerByClick={onAddDealerByClick} 
          selectedLocation={selectedLocation} 
          setZoomLevel={setZoomLevel}
          isAdmin={isAdmin}
        />
        
        <LayersControl position="topright">
          <BaseLayer name="Bản đồ Đường phố (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
              maxZoom={20}
              maxNativeZoom={19}
            />
          </BaseLayer>
          <BaseLayer name="Bản đồ Vệ tinh (Esri)">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              noWrap={true}
              maxZoom={20}
              maxNativeZoom={19}
            />
          </BaseLayer>
          <BaseLayer checked name="Bản đồ Hiện đại (CartoDB)">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              noWrap={true}
              maxZoom={20}
              maxNativeZoom={19}
            />
          </BaseLayer>
        </LayersControl>

        {showGeoJSON && geoData && (
          <GeoJSON 
            data={geoData} 
            style={geoJsonStyle} 
            pointToLayer={pointToLayer}
            onEachFeature={onEachFeature}
          />
        )}

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {markersToRender.map((dealer) => {
            if (!dealer.lat || !dealer.lng) return null;
          const isSelected = selectedLocation && selectedLocation.id === dealer.id;
          return (
            <Marker 
              key={dealer.id || Math.random().toString()} 
              position={[dealer.lat, dealer.lng]}
              icon={getDealerIcon(dealer.status, isSelected)}
              eventHandlers={{ 
                click: () => onSelectLocation({ ...dealer, type: 'dealer' }) 
              }}
            >
              {zoomLevel >= 14 && (
                <Tooltip direction="top" offset={[0, -15]} opacity={1} permanent className="bg-white/90 backdrop-blur border border-white/50 shadow-md font-bold text-xs uppercase tracking-wider text-blue-900 rounded-lg px-2.5 py-1 transition-opacity">
                  {dealer.name}
                </Tooltip>
              )}
              <Popup offset={[0, -20]} className="custom-popup">
                <div className="p-2 min-w-[260px]">
                  <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 text-sm mb-3 leading-tight drop-shadow-sm">{dealer.name}</h3>
                  <div className="text-xs md:text-sm text-gray-600 mb-4 space-y-2 font-medium">
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> <span className="font-bold text-gray-800">Chủ:</span> {dealer.owner || 'Chưa cập nhật'}</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> <span className="font-bold text-gray-800">Số điện thoại:</span> {dealer.phone || 'Chưa cập nhật'}</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> <span className="font-bold text-gray-800">Năm thành lập:</span> {dealer.establishedYear || 'Chưa cập nhật'} {dealer.founder ? `(${dealer.founder})` : ''}</p>
                    <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> <span className="font-bold text-gray-800">Tình trạng đất:</span> {dealer.landStatus || 'Đang thuê'}</p>
                    <p className="flex items-start gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0"></span> <span className="font-bold text-gray-800 shrink-0">Địa chỉ:</span> <span className="line-clamp-2">{dealer.address}{dealer.ward ? `, ${dealer.ward}` : ''}, Quận {dealer.district}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (onOpenDashboard) onOpenDashboard(dealer); }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                    >
                      Xem chi tiết
                    </button>
                    {isAdmin && onEditDealer && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEditDealer(dealer); }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        Sửa
                      </button>
                    )}
                    {isAdmin && onDeleteDealer && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteDealer(dealer.id); }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        </MarkerClusterGroup>

        {selectedLocation && selectedLocation.type === 'location' && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={getLocationIcon()}
          />
        )}

        <ResetViewControl center={daNangCenter} zoom={defaultZoom} />
      </MapContainer>
    </div>
  );
};

export default MapViewer;