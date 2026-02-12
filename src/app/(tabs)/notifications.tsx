import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../services/api/axiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

interface Notification {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    data: any;
}

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get('/notifications?limit=50');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            DeviceEventEmitter.emit('notifications_updated');
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axiosInstance.delete(`/notifications/${id}`);
                            setNotifications(prev => prev.filter(n => n.id !== id));
                            DeviceEventEmitter.emit('notifications_updated');
                        } catch (error) {
                            console.error('Failed to delete notification:', error);
                            Alert.alert('Error', 'Failed to delete notification');
                        }
                    }
                }
            ]
        );
    };

    const handlePress = async (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        if (notification.data?.ticketId) {
            router.push(`/(user)/ticket-detail?id=${notification.data.ticketId}&source=notifications`);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchNotifications().finally(() => setLoading(false));
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    }, []);

    const renderItem = ({ item }: { item: Notification }) => (
        <View style={[styles.card, !item.isRead && styles.unreadCard]}>
            <TouchableOpacity
                style={styles.contentTouchable}
                onPress={() => handlePress(item)}
            >
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="notifications"
                        size={20}
                        color={item.isRead ? colors.placeholder : colors.primary}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
                    <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                    <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                {!item.isRead && <View style={styles.dot} />}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteNotification(item.id)}
            >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications ({notifications.length})</Text>
            </View>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    listContent: {
        padding: 12,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        overflow: 'hidden',
    },
    unreadCard: {
        backgroundColor: colors.inputBackground,
    },
    contentTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        marginRight: 10,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
        color: colors.text,
    },
    unreadText: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    body: {
        fontSize: 12,
        color: colors.placeholder,
        marginBottom: 2,
    },
    date: {
        fontSize: 10,
        color: colors.placeholder,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: 8,
    },
    deleteButton: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
        backgroundColor: colors.card,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: colors.placeholder,
        fontSize: 14,
    }
});
