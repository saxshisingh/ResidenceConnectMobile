/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../../features/home/screens/Home/HomeScreen';
import ChatScreen from '../../features/chat/screens/Chat/ChatScreen';
import ProfileScreen from '../../features/profile/screens/Profile/ProfileScreen';

import HomeIcon from '../../assets/Icons/icon home.svg';
import CommentIcon from '../../assets/Icons/comment.svg';
import HeartIcon from '../../assets/Icons/icon heart.svg';
import UserIcon from '../../assets/Icons/icon user.svg';
import CommunityBoard from '../../features/community/screens/CommunityBoard/CommunityBoard';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loadInbox } from '../../features/chat/state/chatSlice';

const Tab = createBottomTabNavigator();
const CHAT_BADGE_POLL_MS = 15000;

const createStyles = () =>
  StyleSheet.create({
    iconWrap: {
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -10,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#D92D20',
    },
    badgeText: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { colors, resolvedTheme } = useAppTheme();
  const styles = createStyles();
  const token = useAppSelector(state => state.auth.token);
  const totalUnread = useAppSelector(state =>
    (state.chat.inbox || []).reduce(
      (sum: number, item: any) => sum + Number(item?.unreadCount || 0),
      0,
    ),
  );
  const tabIconColor = resolvedTheme === 'dark' ? '#FFFFFF' : colors.textSecondary;
  const inactiveOpacity = resolvedTheme === 'dark' ? 0.72 : 0.4;

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadChat = () => {
      if (appState.current === 'active') {
        dispatch(loadInbox() as any);
      }
    };

    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      if (nextAppState === 'active') {
        loadChat();
      }
    });

    loadChat();
    const intervalId = setInterval(loadChat, CHAT_BADGE_POLL_MS);

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [dispatch, token]);

  return (
    <Tab.Navigator
      id="MainTabNavigator"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.tabBarBackground,
            }}
          />
        ),

        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 12,
          paddingTop: 2,
          paddingHorizontal: 25,

          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          shadowColor: 'transparent',
          backgroundColor: colors.tabBarBackground,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              width={26}
              height={26}
              color={tabIconColor}
              opacity={focused ? 1 : inactiveOpacity}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrap}>
              <CommentIcon
                width={26}
                height={26}
                color={tabIconColor}
                opacity={focused ? 1 : inactiveOpacity}
              />
              {totalUnread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Favorite"
        component={CommunityBoard}
        options={{
          tabBarIcon: ({ focused }) => (
            <HeartIcon
              width={26}
              height={26}
              color={tabIconColor}
              opacity={focused ? 1 : inactiveOpacity}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <UserIcon
              width={26}
              height={26}
              color={tabIconColor}
              opacity={focused ? 1 : inactiveOpacity}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}