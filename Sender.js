import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import { getAuth } from "firebase/auth";
import { db } from './firebase'; // Ensure firebase is correctly configured
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';
const auth = getAuth();

const Sender = () => {
  const [uniqueId, setUniqueId] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          Alert.alert("Authentication Error", "You must be signed in.");
          return;
        }

        let storedId = await AsyncStorage.getItem('uniqueId');

        if (!storedId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            storedId = userDoc.data().uniqueId;
          } else {
            storedId = generateUniqueId();
            await setDoc(doc(db, 'users', userId), { uniqueId: storedId });
          }
          await AsyncStorage.setItem('uniqueId', storedId);
        }

        setUniqueId(storedId);
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        setIsSharing(hasStarted);
      } catch (error) {
        console.error("⚠️ Error initializing user:", error);
      }
    };

    initializeUser();
    registerTask();
  }, []);

  const generateUniqueId = () => Math.random().toString(36).substring(2, 15);

  const requestPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Please enable location permissions.');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert('Background Permission Denied', 'Enable background location access.');
      return false;
    }

    return true;
  };

  const shareLocation = async () => {
    try {
      if (!(await requestPermissions())) return;

      const { coords } = await Location.getCurrentPositionAsync({});
      console.log('📍 Current Location:', coords);

      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Authentication Error", "You must be signed in.");
        return;
      }

      await setDoc(doc(db, 'locations', uniqueId), {
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date(),
        userId: userId,
      });

      console.log('✅ Firestore Write Successful for ID:', uniqueId);
      await startLocationUpdates();
    } catch (error) {
      console.error('🔥 Error in shareLocation:', error);
    }
  };

  const startLocationUpdates = async () => {
    console.log('⚙️ Starting location updates...');
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    
    if (!hasStarted) {
      try {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 120000, // Every 2 minutes
          distanceInterval: 0,
          deferredUpdatesDistance: 0,
          deferredUpdatesInterval: 0,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Location Sharing Active',
            notificationBody: 'Your location is being shared in the background.',
          },
        });

        setIsSharing(true);
        console.log('🚀 Background location updates started');
      } catch (error) {
        console.error('🔥 Error starting location updates:', error);
      }
    } else {
      console.log('⚠️ Location updates already running');
    }
  };

  const stopSharingLocation = async () => {
    try {
      const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (isTracking) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log('✅ Background location updates stopped');
      }

      await AsyncStorage.removeItem('uniqueId');
      setUniqueId('');
      setIsSharing(false);

      await setDoc(doc(db, 'locations', uniqueId), {
        latitude: null,
        longitude: null,
        timestamp: new Date(),
      });

      Alert.alert('Location Sharing Stopped', 'Your location updates have been disabled.');
    } catch (error) {
      console.error('❌ Error stopping location updates:', error);
    }
  };

  const registerTask = () => {
    if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
      TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
        if (error) {
          console.error('Location Task Error:', error);
          return;
        }
        if (data) {
          const { locations } = data;
          if (!locations || locations.length === 0) return;

          const { latitude, longitude } = locations[0].coords;
          console.log('🌍 Background Location Update:', latitude, longitude);

          const storedId = await AsyncStorage.getItem('uniqueId');
          if (storedId) {
            await setDoc(doc(db, 'locations', storedId), {
              latitude,
              longitude,
              timestamp: new Date(),
            });
          }
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      {!isSharing ? (
        <Button title="Share Location" onPress={shareLocation} />
      ) : (
        <Button title="Stop Sharing" onPress={stopSharingLocation} color="red" />
      )}
      {uniqueId ? <Text>Your Unique ID: {uniqueId}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
});

export default Sender;
