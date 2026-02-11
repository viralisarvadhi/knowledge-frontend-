import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchUserStats, fetchTicketStats, fetchPendingSolutions } from '../../features/admin';
import { logout } from '../../features/auth';

export default function AdminDashboard() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { userStats, ticketStats, pendingSolutions, loading } = useAppSelector((state) => state.admin);
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        dispatch(fetchUserStats());
        dispatch(fetchTicketStats());
        dispatch(fetchPendingSolutions());
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.headerLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadStats} />
                }
            >
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
                    <Text style={styles.roleText}>Administrator</Text>
                </View>

                <Text style={styles.sectionTitle}>User Statistics</Text>
                <View style={styles.statsCard}>
                    <TouchableOpacity style={styles.statRow} onPress={() => router.push('/(admin)/users')}>
                        <Text style={styles.statLabel}>Total Users:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.statValue}>{userStats?.totalUsers || 0}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Trainees:</Text>
                        <Text style={styles.statValue}>{userStats?.trainees || 0}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Admins:</Text>
                        <Text style={styles.statValue}>{userStats?.admins || 0}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Ticket Statistics</Text>
                <View style={styles.statsCard}>
                    <TouchableOpacity style={styles.statRow} onPress={() => router.push('/(admin)/tickets/all' as any)}>
                        <Text style={styles.statLabel}>Total Tickets:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.statValue}>{ticketStats?.totalTickets || 0}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statRow} onPress={() => router.push('/(admin)/tickets/open' as any)}>
                        <Text style={styles.statLabel}>Open:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.statValue, styles.openStat]}>{ticketStats?.open || 0}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statRow} onPress={() => router.push('/(admin)/tickets/in-progress' as any)}>
                        <Text style={styles.statLabel}>In Progress:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.statValue, styles.progressStat]}>{ticketStats?.inProgress || 0}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statRow} onPress={() => router.push('/(admin)/tickets/resolved' as any)}>
                        <Text style={styles.statLabel}>Resolved:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.statValue, styles.resolvedStat]}>{ticketStats?.resolved || 0}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Pending Approvals</Text>
                <View style={styles.statsCard}>
                    <TouchableOpacity style={styles.statRow} onPress={() => router.push('/(admin)/approvals')}>
                        <Text style={styles.statLabel}>Solutions to Review:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.statValue, pendingSolutions.length > 0 ? styles.alertStat : {}]}>
                                {pendingSolutions.length}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutButtonText}>Logout from Admin Panel</Text>
                </TouchableOpacity>
            </ScrollView>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerLogout: {
        padding: 4,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    welcomeCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#000',
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    statLabel: {
        fontSize: 16,
        color: '#666',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    openStat: {
        color: '#34C759',
    },
    progressStat: {
        color: '#FF9500',
    },
    resolvedStat: {
        color: '#8E8E93',
    },
    alertStat: {
        color: '#FF3B30',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FF3B30',
        marginTop: 8,
    },
    logoutButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
});
