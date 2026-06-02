import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapController = ({ centerCoords, zoomLevel = 15 }) => {
  const map = useMap(); // Lấy map instance từ context của react-leaflet

  useEffect(() => {
    if (centerCoords && centerCoords.length === 2) {
      map.flyTo(centerCoords, zoomLevel, {
        animate: true,
        duration: 1.5 // Thời gian bay (giây)
      });
    }
  }, [centerCoords, map, zoomLevel]);

  return null; // Không render HTML, chỉ xử lý logic bản đồ
};

export default MapController;
