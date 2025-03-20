import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Receiver = () => {
  const [uniqueId, setUniqueId] = useState('');
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState(null);

  const startTracking = () => {
    if (!uniqueId) return;

    console.log('Starting location tracking for:', uniqueId);

    const unsub = onSnapshot(doc(db, 'locations', uniqueId), (docSnap) => {
      if (docSnap.exists()) {
        setLocation(docSnap.data());
      } else {
        setLocation(null);
        console.log('No such document!');
      }
    });

    setUnsubscribe(() => unsub);
    setTracking(true);
  };

  const stopTracking = () => {
    if (unsubscribe) {
      console.log('Stopped listening for:', uniqueId);
      unsubscribe();
      setUnsubscribe(null);
    }
    setTracking(false);
    setLocation(null);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter Unique ID"
        value={uniqueId}
        onChangeText={setUniqueId}
        style={styles.input}
      />
      {!tracking ? (
        <Button title="Track Location" onPress={startTracking} disabled={!uniqueId} />
      ) : (
        <Button title="Stop Tracking" onPress={stopTracking} color="red" />
      )}
      {location ? (
        <MapView
          style={styles.map}
          provider="google"
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Live Location"
          />
        </MapView>
      ) : (
        <Text>No location updates yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 },
  map: { width: '100%', height: 300 },
});

export default Receiver;
