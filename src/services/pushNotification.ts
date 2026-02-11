import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import axiosInstance from './api/axiosInstance';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            Alert.alert('Error', 'Failed to get push token for push notification!');
            return;
        }

        // Ensure project ID is available
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.expoConfig?.slug || 'knowledge-base';

        try {
            token = (await Notifications.getDevicePushTokenAsync()).data;
            console.log('Device Push Token:', token);

            // Send to backend
            await axiosInstance.post('/notifications/register-token', {
                token,
                platform: Platform.OS
            });

        } catch (e) {
            console.error('Error getting push token', e);
        }
    } else {
        Alert.alert('Notice', 'Must use physical device for Push Notifications');
    }

    return token;
}
