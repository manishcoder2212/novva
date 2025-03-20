import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './Home'; // New HomeScreen to choose Sender/Receiver
import Sender from './Sender';
import Receiver from './Receiver';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { defineBackgroundTask } from './locationTask'; // Separate file for TaskManager

// Define the background task b
defineBackgroundTask();

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Signin">
        <Stack.Screen name='Signin' component={SignIn}/>
        <Stack.Screen name='Signup' component={SignUp}/>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Sender" component={Sender} />
        <Stack.Screen name="Receiver" component={Receiver} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
