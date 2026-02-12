import { Tabs, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps, useState, useCallback, useMemo } from 'react';
import axiosInstance from '../../services/api/axiosInstance';

export default function TabLayout() {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            // We can re-use the getNotifications endpoint which returns unreadCount
            const response = await axiosInstance.get('/notifications?limit=1');
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUnreadCount();
        }, [])
    );

    // Real-time listener
    React.useEffect(() => {
        const { socketClient } = require('../../services/socket/socketClient');
        const { DeviceEventEmitter } = require('react-native');

        const socket = socketClient.getSocket();

        const handleNotification = () => {
            setUnreadCount(prev => prev + 1);
        };

        const handleRead = () => {
            fetchUnreadCount();
        };

        if (socket) {
            socket.on('notification_received', handleNotification);

            // Allow manual triggering of notification event for testing/consistency
            socket.on('notification_updated', handleRead);
        }

        const subscription = DeviceEventEmitter.addListener('notifications_updated', handleRead);

        return () => {
            if (socket) {
                socket.off('notification_received', handleNotification);
                socket.off('notification_updated', handleRead);
            }
            subscription.remove();
        };
    }, []);

    // Memoize the base screen options to prevent unnecessary re-renders of child tabs
    const screenOptions = useMemo(() => {
        return ({ route }: { route: { name: string } }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }: { focused: boolean, color: string, size: number }) => {
                let iconName: ComponentProps<typeof Ionicons>['name'];

                switch (route.name) {
                    case 'tickets':
                        iconName = focused ? 'file-tray-full' : 'file-tray-outline';
                        break;
                    case 'create-ticket':
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                        break;
                    case 'knowledge-base':
                        iconName = focused ? 'library' : 'library-outline';
                        break;
                    case 'profile':
                        iconName = focused ? 'person' : 'person-outline';
                        break;
                    case 'notifications':
                        iconName = focused ? 'notifications' : 'notifications-outline';
                        break;
                    default:
                        iconName = 'alert-circle';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
        });
    }, []);

    return (
        <Tabs screenOptions={screenOptions}>
            <Tabs.Screen
                name="tickets"
                options={{ title: 'Tickets' }}
            />
            <Tabs.Screen
                name="create-ticket"
                options={{ title: 'New Ticket' }}
            />
            <Tabs.Screen
                name="knowledge-base"
                options={{ title: 'Knowledge Base' }}
            />
            <Tabs.Screen
                name="profile"
                options={{ title: 'Profile' }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Updates',
                    // Only this part changes when unreadCount updates
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
