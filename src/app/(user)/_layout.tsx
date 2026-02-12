import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function UserLayout() {
    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.card,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    color: colors.text,
                },
            }}
        >
            <Stack.Screen
                name="write-solution"
                options={{ title: 'Write Solution', presentation: 'modal' }}
            />
            <Stack.Screen
                name="ticket-detail"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}
