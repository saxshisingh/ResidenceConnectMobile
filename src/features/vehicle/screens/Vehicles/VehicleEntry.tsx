/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchVehicles } from '../../state/vehicleSlice';
import ThemedLoader from '../../../../components/ThemedLoader';

export default function VehicleEntry({ navigation }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user);
  const residentId = user?.data?.residentId;


  useFocusEffect(
    useCallback(() => {
      if (!residentId) {
        navigation.replace('VehicleInfo');
        return;
      }

      let active = true;
      dispatch(fetchVehicles(residentId))
        .unwrap()
        .then((data: any[]) => {
          if (!active) return;
          if (data.length > 0) {
            navigation.replace('VehicleDetails');
          } else {
            navigation.replace('VehicleInfo');
          }
        })
        .catch(() => {
          if (active) {
            navigation.replace('VehicleInfo');
          }
        });

      return () => {
        active = false;
      };
    }, [dispatch, navigation, residentId])
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedLoader size="large" />
    </View>
  );
}


