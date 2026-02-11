import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTickets, redeemTicket, deleteTicket } from '../../features/tickets';
import { Ticket } from '../../types';

export default function TicketsScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { list: tickets, loading } = useAppSelector((state) => state.tickets);
    const { user } = useAppSelector((state) => state.auth);

    const handleRedeem = (id: string) => {
        router.push({ pathname: '/(user)/ticket-detail', params: { id } });
    };

    const handleContinueSolving = (ticketId: string) => {
        router.push({ pathname: '/(user)/write-solution', params: { ticketId } });
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

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = () => {
        dispatch(fetchTickets());
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#FF9500'; // Orange
            case 'in-progress': return '#007AFF'; // Blue
            case 'resolved': return '#34C759'; // Green
            default: return '#000';
        }
    };

    const renderTicket = ({ item }: { item: Ticket }) => {
        const isOwner = item.traineeId === user?.id;
        const isAssigned = item.redeemedBy === user?.id;
        const hasPendingSolution = item.status === 'in-progress' && item.solution?.status === 'pending';
        const isAdmin = user?.role === 'admin';

        return (
            <View style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                    <Text style={styles.ticketTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                        {isOwner && (
                            <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
                                <Text style={styles.badgeText}>My Ticket</Text>
                            </View>
                        )}
                        {isAssigned && item.status !== 'resolved' && (
                            <View style={[styles.badge, { backgroundColor: '#5856D6' }]}>
                                <Text style={styles.badgeText}>Assigned</Text>
                            </View>
                        )}
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={styles.statusText}>
                                {item.status === 'in-progress' && item.solution?.status === 'pending'
                                    ? 'In Progress' // Explicitly show "In Progress" for pending approval
                                    : item.status}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.ticketDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.actionContainer}>
                    {item.status === 'open' && !isOwner && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.redeemButton]}
                            onPress={() => handleRedeem(item.id)}
                        >
                            <Text style={styles.actionButtonText}>Redeem</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'in-progress' && isAssigned && !hasPendingSolution && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.solveButton]}
                            onPress={() => handleContinueSolving(item.id)}
                        >
                            <Text style={styles.actionButtonText}>Continue Solving</Text>
                        </TouchableOpacity>
                    )}

                    {isAdmin && item.status !== 'resolved' && !item.deletedAt && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDelete(item.id)}
                        >
                            <Text style={styles.actionButtonText}>Delete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tickets</Text>
            </View>

            <FlatList
                data={tickets.filter(ticket => {
                    // Filter out deleted tickets
                    if (ticket.deletedAt) return false;

                    if (ticket.status !== 'resolved') return true;
                    // "Show resolved tickets only if resolved within the last 30 minutes"
                    // "Use resolved_at if present, otherwise fallback to updated_at"
                    const resolutionTime = (ticket as any).resolvedAt || ticket.updatedAt;
                    if (!resolutionTime) return true;
                    const diff = new Date().getTime() - new Date(resolutionTime).getTime();
                    const thirtyMinutes = 30 * 60 * 1000;
                    return diff < thirtyMinutes;
                })}
                renderItem={renderTicket}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadTickets} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tickets yet</Text>
                        <Text style={styles.emptySubtext}>Create your first ticket to get started</Text>
                    </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    ticketCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },
    actionContainer: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 8,
    },
    redeemButton: {
        backgroundColor: '#007AFF',
    },
    solveButton: {
        backgroundColor: '#34C759',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
});
