import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLayout() {
    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerStyle: {
                    backgroundColor: colors.card,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    color: colors.text,
                },
            }}
        >
            <Stack.Screen name="dashboard" options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="users" options={{ title: 'Users Management' }} />
            <Stack.Screen name="tickets/[status]" options={{ title: 'Tickets List' }} />
            <Stack.Screen name="approvals" options={{ title: 'Solution Approvals' }} />
        </Stack>
    );
}
