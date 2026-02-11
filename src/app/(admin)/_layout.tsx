import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="users" options={{ title: 'Users Management' }} />
            <Stack.Screen name="tickets/[status]" options={{ title: 'Tickets List' }} />
            <Stack.Screen name="approvals" options={{ title: 'Solution Approvals' }} />
        </Stack>
    );
}
