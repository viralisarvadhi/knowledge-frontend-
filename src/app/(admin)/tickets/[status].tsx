import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../../store';
import { fetchTickets, deleteTicket } from '../../../features/tickets';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '../../../components/Skeleton';
import { Ticket } from '../../../types';

export default function AdminTicketListScreen() {
    const { status } = useLocalSearchParams<{ status: string }>(); // 'all', 'open', 'in-progress', 'resolved'
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { list, loading } = useAppSelector((state) => state.tickets);
    const [selectedTag, setSelectedTag] = useState('All');

    useEffect(() => {
        dispatch(fetchTickets());
    }, [dispatch]);

    // Extract unique tags from all tickets
    const availableTags = ['All', ...Array.from(new Set(list.flatMap(t => t.tags || [])))];

    const filteredTickets = list.filter(t => {
        // Filter out deleted tickets
        if (t.deletedAt) return false;

        const matchesStatus = status === 'all' || t.status === status;
        const matchesTag = selectedTag === 'All' || (t.tags && t.tags.includes(selectedTag));
        return matchesStatus && matchesTag;
    });

    const getTitle = () => {
        switch (status) {
            case 'open': return 'Open Tickets';
            case 'in-progress': return 'In Progress';
            case 'resolved': return 'Resolved Tickets';
            default: return 'All Tickets';
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'open': return '#34C759';
            case 'in-progress': return '#FF9500';
            case 'resolved': return '#8E8E93';
            default: return '#000';
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Ticket',
            'Are you sure you want to delete this ticket? The creator will still see it in their profile.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => dispatch(deleteTicket(id)),
                },
            ]
        );
    };

    const renderSkeleton = () => (
        <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
                <Skeleton width="60%" height={20} />
                <Skeleton width={80} height={24} borderRadius={12} />
            </View>
            <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
            <Skeleton width="70%" height={14} style={{ marginTop: 6, marginBottom: 12 }} />

            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <Skeleton width={50} height={18} borderRadius={4} style={{ marginRight: 6 }} />
                <Skeleton width={50} height={18} borderRadius={4} style={{ marginRight: 6 }} />
            </View>

            <View style={[styles.detailsContainer, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F2F2F7' }]}>
                <Skeleton width="50%" height={12} style={{ marginBottom: 4 }} />
                <Skeleton width="40%" height={12} />
            </View>
        </View>
    );

    const renderTicket = ({ item }: { item: Ticket }) => (
        <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle} numberOfLines={1}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.ticketDescription} numberOfLines={2}>{item.description}</Text>

            {item.tags && item.tags.length > 0 && (
                <View style={styles.cardTags}>
                    {item.tags.map((tag, idx) => (
                        <View key={idx} style={styles.cardTagBadge}>
                            <Text style={styles.cardTagText}>#{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>Created by: {item.trainee?.name || item.trainee?.email || 'Unknown'}</Text>
                {item.redeemedBy && (
                    <Text style={styles.detailText}>Redeemed by: {item.redeemer?.name || item.redeemer?.email || 'Unknown'}</Text>
                )}
            </View>

            {/* Admin Actions */}
            <View style={styles.actionContainer}>
                {/* Delete Button */}
                {item.status !== 'resolved' && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item.id)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{getTitle()}</Text>
                </View>

                {availableTags.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tagScroll}
                    >
                        {availableTags.map(tag => (
                            <TouchableOpacity
                                key={tag}
                                style={[
                                    styles.tagBadge,
                                    selectedTag === tag && styles.selectedTagBadge
                                ]}
                                onPress={() => setSelectedTag(tag)}
                            >
                                <Text style={[
                                    styles.tagText,
                                    selectedTag === tag && styles.selectedTagText
                                ]}>
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
            <FlatList
                data={loading && list.length === 0 ? [1, 2, 3, 4, 5] as any : filteredTickets}
                renderItem={loading && list.length === 0 ? renderSkeleton : renderTicket}
                keyExtractor={(item, index) => loading && list.length === 0 ? index.toString() : (item as Ticket).id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchTickets())} />
                }
                ListEmptyComponent={
                    !loading && filteredTickets.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {selectedTag !== 'All'
                                    ? `No ${status === 'all' ? '' : status} tickets with tag "${selectedTag}"`
                                    : `No ${status === 'all' ? '' : status} tickets found`
                                }
                            </Text>
                        </View>
                    ) : null
                }
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
        backgroundColor: '#fff',
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    tagScroll: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    tagBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        marginRight: 8,
    },
    selectedTagBadge: {
        backgroundColor: '#007AFF',
    },
    tagText: {
        fontSize: 14,
        color: '#8E8E93',
    },
    selectedTagText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    backButton: {
        paddingRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    ticketCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ticketTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    ticketDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    cardTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    cardTagBadge: {
        backgroundColor: '#E5F1FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    cardTagText: {
        fontSize: 12,
        color: '#007AFF',
    },
    detailsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 8,
    },
    detailText: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
    },
    actionContainer: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginLeft: 8,
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
});
