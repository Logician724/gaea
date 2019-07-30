import React, { useState } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import { app, database } from '../../firebase-config';

const mapStyle = [
  {
    elementType: 'geometry',
    stylers: [{color: '#eceff1'}]
  },
  {
    elementType: 'labels',
    stylers: [{visibility: 'off'}]
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{visibility: 'on'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#cfd8dc'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{visibility: 'off'}]
  },
  {
    featureType: 'road.local',
    stylers: [{visibility: 'off'}]
  },
  {
    featureType: 'water',
    stylers: [{color: '#b0bec5'}]
  }
];

  
class mapContainer extends React.Component {
    state = {
      stations: [
        {
          position: { lat: 37.762391, lng: -122.439192 },
          name: 'Bla'
        },
        {
          position: { lat: 37.759703, lng: -122.428093 },
          name: 'Bla 2'
        },
        {
          position: { lat: 37.778519, lng: -122.405640 },
          name: 'Bla 2'
        }

      ]
    };

    componentDidMount = () => {
        console.log(this.props.google);
    //   const mapRef = database.ref('map');
    //   mapRef.on('value', snapshot => {

    //   })
    }

generateStations = (stations) => {
  return stations.map((station) => (
    <Marker
      name={station.name}
      position={station.position}
    />
  ))
}
render = () => (
  <Map
    google={this.props.google}
    style={mapStyle}
    zoom={14}
  >

    {this.generateStations(this.state.stations)}
    < InfoWindow >
      <div>
        <h1>Heyo</h1>
      </div>
    </InfoWindow>
  </Map >
);
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAWBWFA0Yc2mVlahRENOsmmFSPNTHLfTdU'
})(mapContainer);
