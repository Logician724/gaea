class MarkerManager {
  constructor(map) {
    this.map = map;
    this.markers = [];
    this.stationsMarkers = [];
  }
  
  add(location, icon, title) {
    const marker = new window.google.maps.Marker({
      position: location,
      map: this.map,
      icon: icon,
      title: title,
      optimized: false
    });
    if (icon.split('/')[3] === 'placemarker.png') {
      this.stationsMarkers.push([title, location]);
    }
    this.markers.push(marker);
  }
  
  clear() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers.length = 0;
  }
}

export default MarkerManager;