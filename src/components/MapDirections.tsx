import React, {useEffect, useState} from 'react';
import {StyleSheet, View, ActivityIndicator, Text} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

// TODO: Replace with your actual public access token from Mapbox
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_TOKEN || "";
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

/**
 * Simple React‑Native component that shows a Mapbox map and draws a driving route
 * between two hard‑coded coordinates. Replace the coordinates or expose them via
 * props / UI elements as needed.
 */
const MapDirections = () => {
  // Origin and destination (lon, lat) – you can make these dynamic later
  const origin = [-122.42, 37.78];
  const destination = [-122.45, 37.76];

  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build the Directions API URL; you could also proxy this through a server
  const buildDirectionsUrl = () => {
    const base = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
    return `${base}/${coords}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
  };

  const fetchRoute = async () => {
    try {
      const resp = await fetch(buildDirectionsUrl());
      const json = await resp.json();
      if (json.routes && json.routes.length > 0) {
        setRouteGeoJSON(json.routes[0].geometry);
      } else {
        setError('No route found');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, []);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera centerCoordinate={origin} zoomLevel={12} />
        {routeGeoJSON && (
          <MapboxGL.ShapeSource id="routeSource" shape={routeGeoJSON}>
            <MapboxGL.LineLayer
              id="routeLine"
              style={{lineColor: '#ff6600', lineWidth: 5}}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#ff6600" />
        </View>
      )}
      {error && (
        <View style={styles.overlay}>
          <Text style={styles.error}>Error: {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  error: {color: 'red', fontSize: 16},
});

export default MapDirections;
