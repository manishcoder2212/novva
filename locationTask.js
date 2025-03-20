import * as TaskManager from 'expo-task-manager';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as Permissions from 'expo-permissions';


const LOCATION_TASK = 'LOCATION_TASK';

export const requestLocationPermissions = async () => {
  const { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    console.error('Location permission not granted');
    return false;
  }
  return true;
}
export const defineBackgroundTask = async () => {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    return;
  }

  if (!TaskManager.isTaskDefined(LOCATION_TASK)) {
    TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
      if (error) {
        console.error('Background Location Task Error:', error);
        return;
      }

      if (data) {
        const { locations } = data;
        const { latitude, longitude } = locations[0].coords;
        console.log('Background location update:', latitude, longitude);

        // Store location in Firestore
        const id = 'your_unique_id'; // Update this to dynamically get the sender's ID
        await setDoc(doc(db, 'locations', id), {
          latitude,
          longitude,
          timestamp: new Date(),
        }, { merge: true });
      }
    });
  }
};