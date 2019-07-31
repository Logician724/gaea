/*eslint-disable unknown-require */
const trackerConfig = require('./tracker_configuration.json');

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const panelConfig = require('./panels_config.json');
const generatedPaths = require('./paths.json');
const googleMapsClient = require('@google/maps').createClient({
    key: trackerConfig.mapsApiKey,
    Promise: Promise
});

let express = require('express');
let app = express();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: trackerConfig.databaseURL
});

// Database references
const busLocationsRef = admin.database().ref('bus-locations');
const mapRef = admin.database().ref('map');
const panelsRef = admin.database().ref('panels');
const timeRef = admin.database().ref('current-time');

// Library classes
const { BusSimulator } = require('./bus_simulator.js');
const { GTFS } = require('./gtfs.js');
const { PanelChanger } = require('./panel_changer.js')
const { HeartBeat } = require('./heart_beat.js');
const { TimeTable } = require('./time_table.js');

const gtfs = new GTFS();

let heartbeat = null;
let panelChanger = null;

function foo() {
    //console.log('GTFS is:', gtfs)
    heartbeat = new HeartBeat(timeRef, trackerConfig.simulation);
    panelChanger = new PanelChanger(mapRef, panelConfig);
    new TimeTable(timeRef, panelsRef, gtfs, panelConfig, googleMapsClient);
    if (trackerConfig.simulation) {
        new BusSimulator(timeRef, gtfs, busLocationsRef, generatedPaths);
    }
    console.log('Simulation Ready')
}

setTimeout(foo, 1000);

app.get('/startHeartbeat', (req, res) => {
    return res.status(200).send({msg: 'It is working!!!'});
});
app.get('/startHeartbeat', (req, res) => {
    heartbeat.startHeartbeat()
    panelChanger.startChanger()
    console.log('Simulation Started');
    res.sendStatus(200)
});

app.get('/stopHeartbeat', (req, res) => {
    heartbeat.stopHeartbeat()
    panelChanger.pauseChanger()
    console.log('Simulation Stopped');
    res.sendStatus(200)
});

app.get('/resetHeartbeat', (req, res)=>{
    heartbeat.resetHeartbeat()
    panelChanger.resetChanger()
    console.log('Simulation Reset')
    res.sendStatus(200)
});

var server = app.listen(3000, () => {
    const port = server.address().port
    console.log(`Simulation server running on ${port}`)
});