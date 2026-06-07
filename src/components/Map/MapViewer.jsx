import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, LayersControl, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
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
const MapEvents = ({ onAddDealerByClick, selectedLocation }) => {
  const map = useMap();
  
  useMapEvents({
    contextmenu(e) {
      if (onAddDealerByClick) {
        onAddDealerByClick(e.latlng);
      }
    }
  });

  useEffect(() => {
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [selectedLocation, map]);

  return null;
};

// Tạo Custom Icon cho Đại lý
const getDealerIcon = (status, isSelected) => {
  const isSold = status === 'Đã bán';
  const colorClass = isSold ? 'text-emerald-600' : 'text-rose-600';
  const bgClass = isSold ? 'bg-emerald-100' : 'bg-rose-100';
  const borderClass = isSold ? 'border-emerald-500' : 'border-rose-500';
  const sizeClass = isSelected ? 'w-10 h-10 border-[3px] shadow-2xl scale-110' : 'w-8 h-8 border-[2.5px] shadow-lg';

  const iconHtml = `
    <div class="relative flex items-center justify-center ${sizeClass} rounded-full ${bgClass} ${borderClass} transform transition-all duration-300 hover:scale-125 z-10">
      <svg class="w-1/2 h-1/2 ${colorClass}" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      ${isSelected ? `<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>` : ''}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-none',
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 40] : [16, 32]
  });
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

const MapViewer = ({ dealers, showGeoJSON, filters, onAddDealerByClick, selectedLocation, onSelectLocation, onOpenDashboard }) => {
  const [geoData, setGeoData] = useState(null);
  
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
    color: '#3b82f6',
    weight: 1.5,
    fillColor: '#60a5fa',
    fillOpacity: 0.1,
    dashArray: '4'
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
          color: '#2563eb',
          fillOpacity: 0.25,
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
        if (onAddDealerByClick) onAddDealerByClick(e.latlng);
      }
    });
  };

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, { radius: 0, opacity: 0 }); // Ẩn hoàn toàn các point markers
  };

  // Logic hiển thị Marker
  const isFiltered = filters.district !== '' || filters.ward !== '';
  let markersToRender = [];

  if (isFiltered) {
    markersToRender = dealers;
  } else if (selectedLocation && selectedLocation.type === 'dealer') {
    // Nếu không có filter nhưng đang chọn 1 đại lý, chỉ hiện đại lý đó
    markersToRender = dealers.filter(d => d.id === selectedLocation.id);
  }

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
      >
        <ZoomControl position="topright" />
        <MapEvents onAddDealerByClick={onAddDealerByClick} selectedLocation={selectedLocation} />
        
        <LayersControl position="topright">
          <BaseLayer checked name="Bản đồ Đường phố (OSM)">
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
          <BaseLayer name="Bản đồ Trắng/Đen (CartoDB)">
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
              <Popup offset={[0, -20]} className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{dealer.name}</h3>
                  <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">{dealer.address}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenDashboard) onOpenDashboard(dealer);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

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