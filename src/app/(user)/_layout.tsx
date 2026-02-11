import { Stack } from 'expo-router';
import React from 'react';

export default function UserLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="write-solution"
                options={{ title: 'Write Solution', presentation: 'modal' }}
            />
            <Stack.Screen
                name="ticket-detail"
                options={{ title: 'Ticket Details' }}
            />
        </Stack>
    );
}
