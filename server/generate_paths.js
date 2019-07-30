/*eslint-disable no-shadow-global, unknown-require, no-undef-expression*/
const mapsApiKey = require('./tracker_configuration.json').mapsApiKey;
const { GTFS } = require('./gtfs');
const gtfs = new GTFS();

const moment = require('moment');
const polyline = require('@mapbox/polyline');
const fs = require('fs');
const readline = require('readline');

const googleMaps = require('@google/maps')

let MapsClient = googleMaps.createClient({
    key: mapsApiKey,
    Promise: Promise
});

async function generate_paths() {
    try {
        var trips = await gtfs.getTripsOrderedByTime();
    } catch (err) {
        console.log('The Error is', err)
    }
    const tripsWithLocations = [];

    trips = trips.slice(0, 1)

    for (const trip of trips) {
        tripIndex = trips.indexOf(trip)

        logProgress(`Processing trip ${tripIndex + 1} of ${trips.length}\n`);
        const timeCursor = moment(
            `${trip.departure_date} ${trip.departure_time}`,
            'YYYYMMDD HH:mm:ss'
        );
        const tripPoints = [];

        try {
            var stopInfo = await gtfs.getStopInfoForTrip(trip.trip_id);
        } catch (err) {
            console.log("This is the stop info for trip: ", err)
        }

        const stops = [];
        stopInfo.forEach(stop => {
            stops.push({ lat: stop.lat, lng: stop.lng });
        });

        const request = { origin: stops[0], destination: stops[stops.length - 1] };

        if (stops.length > 2) {
            request['waypoints'] = stops.slice(1, -1);
        }
        let response = null
        try {
             response = await MapsClient.directions(request).asPromise();
        } catch (err) {
            console.log('request error', err);
        }

        console.log(response)

        if (response.json.status === 'OK') {
            const route = response.json.routes[0];
            route.legs.forEach(leg => {
                leg.steps.forEach(step => {
                    const durationInSeconds = step.duration.value;
                    const points = polyline.decode(step.polyline.points);
                    const secondsPerPoint = durationInSeconds / points.length;
                    points.forEach(point => {
                        tripPoints.push({
                            time: timeCursor.format('YYYYMMDD HH:mm:ss'),
                            location: { lat: point[0], lng: point[1] }
                        });
                        timeCursor.add(secondsPerPoint, 'seconds');
                    });
                });
            });
            tripsWithLocations.push({ trip: trip, points: tripPoints });
        } else {
            logProgress(' ERROR: ' + response.status);
            process.stdout.write('\n');
            process.exit(1);
        }
    }

    fs.writeFileSync('paths.json', JSON.stringify(tripsWithLocations));
    logProgress('Paths written successfully to paths.json.');
    process.stdout.write('\n');
}

function logProgress(str) {
    // A little bit of readline magic to not fill the screen with progress messages.
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
    process.stdout.write(str);
}

function foo() {
    try {
        generate_paths()
    } catch (err) {
        console.log('Paths Error', err)
    }
};

setTimeout(foo, 1000)
