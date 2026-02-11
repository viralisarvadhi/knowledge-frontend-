import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps } from 'react';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: ComponentProps<typeof Ionicons>['name'];

                    if (route.name === 'tickets') {
                        iconName = focused ? 'file-tray-full' : 'file-tray-outline';
                    } else if (route.name === 'create-ticket') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'knowledge-base') {
                        iconName = focused ? 'library' : 'library-outline';
                    } else if (route.name === 'profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'notifications') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else {
                        iconName = 'alert-circle';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tabs.Screen
                name="tickets"
                options={{
                    title: 'Tickets',
                }}
            />
            <Tabs.Screen
                name="create-ticket"
                options={{
                    title: 'New Ticket',
                }}
            />
            <Tabs.Screen
                name="knowledge-base"
                options={{
                    title: 'Knowledge Base',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Updates',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
