import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VehicleDetails from '../screens/Vehicles/VehicleDetails';
import AddEditVehicle from '../screens/Vehicles/AddEditVehicle';
import VehicleEntry from '../screens/Vehicles/VehicleEntry';
import VehicleInfo from '../screens/Vehicles/VehicleInfo';

const Stack = createNativeStackNavigator();

export default function VehicleStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
  <Stack.Screen name="VehicleEntry" component={VehicleEntry} />
  <Stack.Screen name="VehicleInfo" component={VehicleInfo} />
  <Stack.Screen name="VehicleDetails" component={VehicleDetails} />
  <Stack.Screen name="AddEditVehicleDetail" component={AddEditVehicle} />
</Stack.Navigator>
  );
}
