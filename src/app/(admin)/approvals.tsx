import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Image,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
    fetchPendingSolutions,
    approveSolution,
    rejectSolution,
    clearError,
} from '../../features/admin';

import { ImageViewerModal } from '../../components';

export default function ApprovalsScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { pendingSolutions, loading, error } = useAppSelector((state) => state.admin);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const handleImagePress = (path: string) => {
        setSelectedImage(`${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${path}`);
        setModalVisible(true);
    };

    useEffect(() => {
        dispatch(fetchPendingSolutions());
    }, []);

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
            dispatch(clearError());
        }
    }, [error]);

    const handleApprove = (id: string) => {
        Alert.alert(
            'Approve Solution',
            'Are you sure you want to approve this solution and award credits?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: () => dispatch(approveSolution(id)),
                },
            ]
        );
    };

    const handleReject = (id: string) => {
        Alert.alert(
            'Reject Solution',
            'Are you sure you want to reject this solution?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: () => dispatch(rejectSolution(id)),
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.ticketTitle}>{item.ticket?.title}</Text>
                    <Text style={styles.creatorName}>by {item.creator?.name}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>PENDING</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.label}>Ticket Description:</Text>
                <Text style={styles.value}>{item.ticket?.description}</Text>

                {item.ticket?.attachments && item.ticket.attachments.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.label}>Attachments:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                            {item.ticket.attachments.map((path: string, index: number) => (
                                <TouchableOpacity key={index} onPress={() => handleImagePress(path)}>
                                    <Image
                                        source={{ uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${path}` }}
                                        style={{ width: 100, height: 100, borderRadius: 8, marginRight: 8, backgroundColor: '#f0f0f0' }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: 1, backgroundColor: '#E5E5EA', marginVertical: 16 }} />

                <Text style={styles.label}>Root Cause:</Text>
                <Text style={styles.value}>{item.rootCause}</Text>

                <Text style={styles.label}>Fix Steps:</Text>
                <Text style={styles.value}>{item.fixSteps}</Text>

                {item.attachments && item.attachments.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.label}>Solution Attachments:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                            {item.attachments.map((path: string, index: number) => (
                                <TouchableOpacity key={index} onPress={() => handleImagePress(path)}>
                                    <Image
                                        source={{ uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${path}` }}
                                        style={{ width: 100, height: 100, borderRadius: 8, marginRight: 8, backgroundColor: '#f0f0f0' }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {item.preventionNotes && (
                    <>
                        <Text style={styles.label}>Prevention Notes:</Text>
                        <Text style={styles.value}>{item.preventionNotes}</Text>
                    </>
                )}
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item.id)}
                >
                    <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.actionText, styles.rejectText]}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(item.id)}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
                    <Text style={[styles.actionText, styles.approveText]}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Solution Approvals</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={pendingSolutions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => dispatch(fetchPendingSolutions())}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="checkmark-done-circle-outline" size={64} color="#C7C7CC" />
                            <Text style={styles.emptyText}>No solutions pending review</Text>
                        </View>
                    ) : null
                }
            />

            {loading && pendingSolutions.length === 0 && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FF3B30" />
                </View>
            )}

            <ImageViewerModal
                visible={modalVisible}
                imageUrl={selectedImage}
                onClose={() => setModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#FF3B30',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    backButton: {
        padding: 4,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
        paddingBottom: 8,
    },
    ticketTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    creatorName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardContent: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        textTransform: 'uppercase',
        marginTop: 8,
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
    },
    actionButton: {
        flex: 0.48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    rejectButton: {
        borderColor: '#FF3B30',
        backgroundColor: '#FFF5F5',
    },
    approveButton: {
        borderColor: '#34C759',
        backgroundColor: '#F5FFF9',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    rejectText: {
        color: '#FF3B30',
    },
    approveText: {
        color: '#34C759',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        color: '#8E8E93',
        textAlign: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
