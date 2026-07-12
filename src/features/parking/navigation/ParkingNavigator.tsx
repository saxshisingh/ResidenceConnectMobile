import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ParkingDetails from '../screens/Parking/ParkingDetails';
import AddEditParkingDetiails from '../screens/Parking/AddEditParkingDetiails';
import ParkingEntry from '../screens/Parking/ParkingEntry';
import ParkingInfo from '../screens/Parking/ParkingInfo';

const Stack = createNativeStackNavigator();

export default function ParkingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="ParkingEntry" component={ParkingEntry} />
      <Stack.Screen name="ParkingInfo" component={ParkingInfo} />
      <Stack.Screen name="ParkingDetails" component={ParkingDetails} />
      <Stack.Screen
        name="AddParkingDetail"
        component={AddEditParkingDetiails}
      />
    </Stack.Navigator>
  );
}

