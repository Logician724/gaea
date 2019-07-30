const moment = require('moment');

const DATE_FORMAT = 'YYYYMMDD HH:mm:ss';

exports.TimeTable = class {
    constructor(timeRef, panelsRef, gtfs, panelConfig, googleMapsClient) {
        this.timeRef = timeRef;
        this.panelsRef = panelsRef;
        this.gtfs = gtfs;
        this.panelConfig = panelConfig;
        this.googleMapsClient = googleMapsClient;

        // Cache of Predicted Travel Times
        this.pttForTrip = {};
        // When we last issued a Predicted Travel Time request for a route.
        this.pttLookupTime = {};

        this.timeRef.on(
            'value',
            async (snapshot) => {
                const now = moment.utc(snapshot.val().moment);
                await this.publishTimeTables(now);
            },
            errorObject => {
                console.error('The read failed: ' + errorObject.code);
            }
        );
    }

    async publishTimeTables(now) {
        const panels = await Promise.all(this.panelConfig.map(async (panel) => {
            return {
                left: await Promise.all(panel.routesGroups[0].map(route_id => {
                    return this.tripsLookup(route_id, now);
                })),
                right: await Promise.all(panel.routesGroups[1].map(route_id => {
                    return this.tripsLookup(route_id, now);
                }))
            };
        }));

        
        this.panelsRef.set(JSON.parse(JSON.stringify(panels)));
    }

    async tripLookup(trip) {
        let stop_info = null
        try {
            stop_info = await this.gtfs.getStopInfoForTrip(trip.trip_id);
        } catch (err) {
            console.log('Trip lookup:', stop_info)
        }
        return { trip, stop_info };
    }

    haveDirectionsResponseCachedForTrip(trip) {
        return this.directionsResponseForTrip(trip) !== undefined;
    }

    directionsResponseForTrip(trip) {
        return this.pttForTrip[trip.trip_id];
    }

    async tripsLookup(route_id, now) {
        function round_moment(m) {
            if (m.second() > 30) {
                return m.add(1, 'minute').startOf('minute');
            }
            return m.startOf('minute');
        }

        const date = now.format('YYYYMMDD');
        const time = now.format('HH:mm:ss');

        let route = null
        let nextTrips = null
        try {
            route = await this.gtfs.getRouteById(route_id);
            nextTrips = await this.gtfs.getNextThreeTripsForRoute(route_id, date, time);
        } catch (err) {
            console.log('Error in trips lookup:', err)
        }

        nextTrips.forEach(trip => {
            this.cacheDirectionsResponseForTrip(trip);
        });

        const returnValue = { route, next_in_label: '', next_in: '' };

        if (nextTrips.length >= 1) {
            let next_trip = null
            try {
                next_trip = await this.tripLookup(nextTrips[0]);
            } catch (err) {
                console.log(err)
            }

            returnValue.next_trip = next_trip;
            if (
                this.haveDirectionsResponseCachedForTrip(returnValue.next_trip.trip)
            ) {
                const ptt = this.directionsResponseForTrip(returnValue.next_trip.trip);
                const time = moment.utc(
                    `${next_trip.stop_info[0].date} ${next_trip.stop_info[0].departure_time}`,
                    DATE_FORMAT
                );
                let index = 1;
                ptt.routes[0].legs.forEach(leg => {
                    const delta = leg.duration.value;
                    time.add(delta, 'seconds');
                    const time_display = round_moment(time).format('HH:mm:ss');
                    next_trip.stop_info[index].departure_time = time_display;
                    next_trip.stop_info[index].arrival_time = time_display;
                    // Assume we stop at each way point for three minutes
                    time.add(3, 'minutes');
                    index++;
                });
            }
            const next_trip_time_str = `${next_trip.stop_info[0].date} ${next_trip.stop_info[0].departure_time}`;
            const next_trip_time = moment.utc(next_trip_time_str, DATE_FORMAT);
            const next_trip_delta = next_trip_time.diff(now, 'minutes');
            if (next_trip_delta <= 120) {
                returnValue['leaving_in_label'] = 'Leaving in';
                returnValue['leaving_in'] = `${next_trip_delta} mins`;
                if (nextTrips.length >= 2) {
                    let trip_after = null
                    try {
                        trip_after = await this.tripLookup(nextTrips[1]);
                    } catch (err) {
                        console.log(err)
                    }

                    // In the mornings we have a bunch of overlapping trips on inbound routes
                    if (
                        trip_after.stop_info[0].date === next_trip.stop_info[0].date &&
                        trip_after.stop_info[0].departure_time ===
                        next_trip.stop_info[0].departure_time
                    ) {
                        let trip_after = null
                        try {
                            trip_after = await this.tripLookup(nextTrips[2]);
                        } catch (err) {
                            console.log(err)
                        }
                    }

                    const trip_after_time = moment.utc(
                        `${trip_after.stop_info[0].date} ${trip_after.stop_info[0].departure_time}`,
                        DATE_FORMAT
                    );
                    returnValue['next_in_label'] = 'Next in';
                    const trip_after_delta = trip_after_time.diff(now, 'minutes');
                    if (trip_after_delta <= 120) {
                        returnValue['next_in'] = `${trip_after_delta} min`;
                    } else {
                        returnValue[
                            'next_in'
                        ] = `${trip_after_time.diff(now, 'hours')} hrs`;
                    }
                }
            } else {
                returnValue['leaving_in_label'] = next_trip_time.format('MMM Do');
                returnValue['leaving_in'] = next_trip_time.format('h A');
            }
        }
        return returnValue;
    }

    async requestDirectionsForTrip(trip) {
        const trip_info = await this.tripLookup(trip);
        const stops = [];

        trip_info.stop_info.forEach(stop => {
            stops.push({ lat: stop.lat, lng: stop.lng });
        });
        const request = { origin: stops[0], destination: stops[stops.length - 1] };
        if (stops.length > 2) {
            request['waypoints'] = stops.slice(1, -1);
        }
        return request;
    }

    cacheDirectionsResponseForTrip(trip) {
        if (
            this.pttLookupTime[trip.trip_id] === undefined ||
            moment().diff(this.pttLookupTime[trip.trip_id], 'minutes') > 20 ||
            (this.pttForTrip[trip.trip_id] === undefined &&
                moment().diff(this.pttLookupTime[trip.trip_id], 'minutes') > 3)
        ) {
            this.pttLookupTime[trip.trip_id] = moment();
            const request = this.requestDirectionsForTrip(trip);
            if (
                this.pttLookupFailure == undefined ||
                moment().diff(this.pttLookupFailure, 'minutes') > 20
            ) {
                const initiatedAt = moment();
                // this.googleMapsClient
                //     .directions(request)
                //     .asPromise()
                //     .then(response => {
                //         this.pttForTrip[trip.trip_id] = response.json;
                //     })
                //     .catch(err => {
                //         this.pttLookupFailure = moment();
                //         console.error(
                //             `Google Maps Directions API request failed, initiated at ${initiatedAt.format('hh:mm a')}: ${err}`
                //         );
                //     });
            } else {
                console.log(
                    `Not looking up ${trip.trip_id}, rate limiting due to API error, at ${moment().format('hh:mm a')}`
                );
            }
        }
    }
};