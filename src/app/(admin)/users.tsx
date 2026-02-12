import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchUsers, deleteUser } from '../../features/admin';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Skeleton from '../../components/Skeleton';
import { User } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export default function UsersListScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { usersList, loading } = useAppSelector((state) => state.admin);
    const [searchQuery, setSearchQuery] = useState('');
    const { colors } = useTheme();
    const styles = getStyles(colors);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        dispatch(fetchUsers());
    };

    const handleDelete = (user: User) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(deleteUser(user.id))
                            .unwrap()
                            .then(() => {
                                Alert.alert('Success', 'User deleted successfully');
                            })
                            .catch((err) => {
                                Alert.alert('Error', err);
                            });
                    },
                },
            ]
        );
    };

    const filteredUsers = usersList.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderSkeleton = () => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={14} style={{ marginBottom: 12 }} />
                <Skeleton width={80} height={16} borderRadius={8} />
            </View>
            <View style={styles.userStats}>
                <View style={[styles.statRow, { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Skeleton width={40} height={25} />
                    <Skeleton width={40} height={25} style={{ marginLeft: 16 }} />
                    <Skeleton width={40} height={25} style={{ marginLeft: 16 }} />
                </View>
            </View>
        </View>
    );

    const renderUser = ({ item }: { item: User }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <View style={[styles.roleBadge, item.role === 'admin' ? styles.adminBadge : styles.traineeBadge]}>
                            <Text style={[styles.roleText, item.role === 'admin' ? styles.adminText : styles.traineeText]}>{item.role.toUpperCase()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 8 }}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.userStats}>
                <View style={styles.statRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Created</Text>
                        <Text style={styles.statValue}>{(item as any).ticketsCreated || 0}</Text>
                    </View>
                    <View style={[styles.statItem, { marginLeft: 16 }]}>
                        <Text style={styles.statLabel}>Resolved</Text>
                        <Text style={styles.statValue}>{(item as any).ticketsResolved || 0}</Text>
                    </View>
                    <View style={[styles.statItem, { marginLeft: 16 }]}>
                        <Text style={styles.statLabel}>Credits</Text>
                        <Text style={[styles.statValue, { color: '#FF9500' }]}>{item.totalCredits || 0}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Users</Text>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        placeholderTextColor={colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <FlatList
                data={loading && usersList.length === 0 ? [1, 2, 3, 4, 5] as any : filteredUsers}
                renderItem={loading && usersList.length === 0 ? renderSkeleton : renderUser}
                keyExtractor={(item, index) => loading && usersList.length === 0 ? index.toString() : (item as User).id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadUsers} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    !loading && filteredUsers.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? `No users matching "${searchQuery}"` : 'No users found'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: '#FF3B30',
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingHorizontal: 12,
        borderRadius: 10,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    backButton: {
        paddingRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    listContent: {
        padding: 16,
    },
    userCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        marginBottom: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: colors.text,
    },
    userEmail: {
        fontSize: 14,
        color: colors.placeholder,
        marginBottom: 8,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    adminBadge: {
        backgroundColor: '#FFE5E5',
    },
    traineeBadge: {
        backgroundColor: '#E5F9FF',
    },
    roleText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    adminText: {
        color: '#FF3B30',
    },
    traineeText: {
        color: '#007AFF',
    },
    userStats: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        fontSize: 10,
        color: colors.placeholder,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.placeholder,
    }
});
