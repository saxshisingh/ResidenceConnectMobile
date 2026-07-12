
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchParkingSlots } from '../../state/parkingSlice';
import ThemedLoader from '../../../../components/ThemedLoader';

export default function ParkingEntry({ navigation }: any) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user);

  useFocusEffect(
    useCallback(() => {
      const residentId = user?.data?.residentId;
      if (!residentId) {
        navigation.replace('ParkingDetails');
        return;
      }

      let active = true;
      dispatch(fetchParkingSlots(residentId))
        .unwrap()
        .then(() => {
          if (!active) return;
          navigation.replace('ParkingDetails');
        })
        .catch(() => {
          if (active) {
            navigation.replace('ParkingDetails');
          }
        });

      return () => {
        active = false;
      };
    }, [dispatch, navigation, user?.data?.residentId])
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedLoader size="large" />
    </View>
  );
}
