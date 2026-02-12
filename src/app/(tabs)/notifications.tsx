import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../services/api/axiosInstance';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

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

    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get('/notifications?limit=50');
            setNotifications(response.data.notifications);
            // Also update badge count when we fetch (since we might have just read them by opening the screen?)
            // Actually, we usually mark all as read only if we implement a "mark all read" feature.
            // For now, we only mark as read on click.
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            // Update local state
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
            router.push(`/(user)/ticket-detail?id=${notification.data.ticketId}`);
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
                        size={20} // Reduced size
                        color={item.isRead ? '#8E8E93' : '#007AFF'}
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />} // Reduced separator
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        alignItems: 'center',
        // Removed padding hack, using SafeAreaView
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 12, // Reduced list padding
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8, // Slightly tighter radius
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        overflow: 'hidden',
    },
    unreadCard: {
        backgroundColor: '#F0F8FF',
    },
    contentTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12, // Reduced card padding
    },
    iconContainer: {
        marginRight: 10,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14, // Compact font
        fontWeight: '600',
        marginBottom: 2,
        color: '#000',
    },
    unreadText: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
    body: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    date: {
        fontSize: 10,
        color: '#999',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
        marginLeft: 8,
    },
    deleteButton: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#f0f0f0', // Separator for delete button
        backgroundColor: '#FAFAFA',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
    }
});
