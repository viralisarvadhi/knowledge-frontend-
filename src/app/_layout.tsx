import { useEffect } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { Provider } from 'react-redux';
import { store, useAppSelector } from '../store';
import { socketClient } from '../services/socket/socketClient';
import { registerForPushNotificationsAsync } from '../services/pushNotification';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from '../../widget-task-handler';

registerWidgetTaskHandler(widgetTaskHandler);

function RootLayoutNav() {
    const { token, user } = useAppSelector((state) => state.auth);
    const segments = useSegments();
    const router = useRouter();

    const rootNavigationState = useRootNavigationState();

    useEffect(() => {
        socketClient.setStore(store as any);
    }, []);

    useEffect(() => {
        if (token) {
            socketClient.connect(token);
            registerForPushNotificationsAsync();
        } else {
            socketClient.disconnect();
        }
    }, [token]);

    useEffect(() => {
        if (!rootNavigationState?.key) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inAdminGroup = segments[0] === '(admin)';

        // Wrap navigation in setTimeout to ensure component is fully mounted
        const timeoutId = setTimeout(() => {
            if (!token && !inAuthGroup) {
                // Redirect to login if not authenticated
                router.replace('/(auth)/login');
            } else if (token && inAuthGroup) {
                if (user?.role === 'admin') {
                    router.replace('/(admin)/dashboard');
                } else {
                    router.replace('/(tabs)/tickets');
                }
            } else if (token && user?.role !== 'admin' && inAdminGroup) {
                // Redirect non-admins away from admin routes
                router.replace('/(tabs)/tickets');
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [token, segments, user, rootNavigationState?.key]);

    return <Slot />;
}

export default function RootLayout() {
    return (
        <Provider store={store}>
            <RootLayoutNav />
        </Provider>
    );
}
