import React, { useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { app, database } from '../../firebase-config';
import { makeStyles, useTheme } from '@material-ui/styles';
import { withRouter } from 'react-router-dom';
import MarkerManager from './MarkerManager';
import {NotificationManager} from 'react-notifications';
/* eslint-disable */
const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#eceff1' }]
  },
  {
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#cfd8dc' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'road.local',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'water',
    stylers: [{ color: '#b0bec5' }]
  }
];

function colorToBusMarker(color) {
  switch (color) {
    case 'FCE444':
      return '/images/dashboard/busmarker_yellow.png';
    case 'C4E86B':
      return '/images/dashboard/busmarker_lime.png';
    case '00C1DE':
      return '/images/dashboard/busmarker_teal.png';
    case 'FFAD00':
      return '/images/dashboard/busmarker_orange.png';
    case '0061C8':
      return '/images/dashboard/busmarker_indigo.png';
    case '8A8A8D':
      return '/images/dashboard/busmarker_caltrain.png';
    case 'EA1D76':
      return '/images/dashboard/busmarker_sf.png';
    default:
      console.log(`colorToBusMarker(${color}) not handled`);
      return '';
  }
}

function geocodeAddress(address, map, icon, title, maps) {
  const geocoder = new maps.Geocoder();
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === 'OK') {
      const marker = new maps.Marker({
        map: map,
        position: results[0].geometry.location,
        icon: icon,
        title: title,
        optimized: false
      });
    } else {
      console.log(
        'Geocode was not successful for the following reason: ' + status
      );
    }
  });
}

class Map extends React.Component {
  state = {
    markers: [

    ],
    bounds: null,
    center: null,
    zoom: 13,
    orderData: null
  };
  componentDidMount = async () => {
    let orderData = localStorage.getItem('gaeaOrder');
    if (!orderData) {
      this.props.history.push('/products');
    }
    orderData = JSON.parse(orderData);
    const mapRef = database.ref('map');
    const midpointRef = database.ref('midpoint');
    const midpointSnapshot = await midpointRef.once('value');
    const midpoint = midpointSnapshot.val();

    this.setState((prevState) => ({
      ...prevState,
      center: [midpoint.lat, midpoint.lng],
      orderData: orderData
    }));

  }


  handleApiLoaded = (map, maps, orderData, history) => {
    let done = false;
    console.log(maps);
    geocodeAddress(
      '1 Amphitheatre Pkwy, Mountain View, CA 94043',
      map,
      '/images/dashboard/gaea.png',
      'HQ',
      maps
    );
    const markerManager = new MarkerManager(map);
    const mapRef = database.ref('map');
    mapRef.on('value', (snapshot) => {
      const mapData = snapshot.val();
      map.fitBounds({
        east: mapData.northEastLng,
        north: mapData.northEastLat,
        south: mapData.southWestLat,
        west: mapData.southWestLng
      });

      markerManager.clear();
      mapData.markers.forEach(marker => {
        markerManager.add(
          {
            lat: marker.lat,
            lng: marker.lng
          },
          marker.iconPath,
          marker.name
        );
      });
      const timeRef = database.ref('current-time');
      timeRef.on('value', snapshot => {
        //console.log(snapshot.val().display);
      });
      const busLocationMarkers = {};
      const busRef = database.ref('bus-locations');
      busRef.on('value', snapshot => {
        const val = snapshot.val();
        //console.log('bus', orderData.address);
        for (let key in busLocationMarkers) {
          if (val === null || !(key in val)) {
            const marker = busLocationMarkers[key];
            marker.setMap(null);
            delete busLocationMarkers[key];
          }
        }
        for (let key in val) {
          const bus = val[key];
          for (let station of markerManager.stationsMarkers) {
            let stationLatLng = new maps.LatLng(station[1].lat, station[1].lng);
            let busLatLng = new maps.LatLng(bus.lat, bus.lng);
            var distance = maps.geometry.spherical.computeDistanceBetween(stationLatLng, busLatLng);
    
            //console.log('Distance is', distance);
            
            if (distance < 100 && !done) {
              //console.log('Trip on route', bus.route_id, 'arrived at', station[0]);
              if(station[0] === orderData.address){
                // Trigger Event here
                done = true;
                NotificationManager.success('Driver Reached the station, please meet him now', 'GO', 7000);
                history.push('/marketplace');
              }
            }
          }
          if (key in busLocationMarkers) {
            const marker = busLocationMarkers[key];
            marker.setPosition({
              lat: bus.lat,
              lng: bus.lng
            });
          } else {
            const url = colorToBusMarker(bus.route_color);
            const marker = new maps.Marker({
              position: {
                lat: bus.lat,
                lng: bus.lng
              },
              map: map,
              icon: {
                url,
                anchor: new maps.Point(30, 30) // Bus markers are 60x60 px
              },
              title: bus.route_name,
              optimized: false
            });
            busLocationMarkers[key] = marker;
          }
        }
      });
    });
  };

  render = () => {
    console.log(this.state.orderData);
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {this.state.center ?
          <GoogleMapReact

            bootstrapURLKeys={{
              key: 'AIzaSyAWBWFA0Yc2mVlahRENOsmmFSPNTHLfTdU',
              libraries: 'geometry'
            }}
            defaultCenter={this.state.center}
            defaultZoom={this.state.zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps, this.state.orderData, this.props.history)}
          >
          </GoogleMapReact>
          :
          'Loading'
        }

      </div>
    );
  };fix

}
export default withRouter(Map);