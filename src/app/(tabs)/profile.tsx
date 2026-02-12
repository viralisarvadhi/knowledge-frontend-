import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Image, Alert, ActivityIndicator, Switch, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../store';
import { logout, updateUser, getMe } from '../../features/auth';
import { fetchTickets } from '../../features/tickets';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '../../services/api/axiosInstance';
import { useTheme } from '../../context/ThemeContext';

// Avatar upload service
const uploadAvatar = async (uri: string) => {
    const formData = new FormData();
    formData.append('avatar', {
        uri,
        name: `avatar_${Date.now()}.jpg`,
        type: 'image/jpeg',
    } as any);

    const response = await axiosInstance.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export default function ProfileScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { list: tickets, loading: ticketsLoading } = useAppSelector((state) => state.tickets);
    const [refreshing, setRefreshing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'created' | 'resolved'>('created');
    const [showAllCreated, setShowAllCreated] = useState(false);
    const [showAllRedeemed, setShowAllRedeemed] = useState(false);

    const { theme, toggleTheme, colors } = useTheme();
    const styles = getStyles(colors);

    useEffect(() => {
        dispatch(fetchTickets());
    }, []);

    const handlePickAvatar = () => {
        const options = [
            {
                text: 'Camera',
                onPress: openCamera,
            },
            {
                text: 'Gallery',
                onPress: openGallery,
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ] as import('react-native').AlertButton[];

        if (user?.avatar) {
            options.unshift({
                text: 'Remove Photo',
                onPress: handleRemoveAvatar,
                style: 'destructive',
            });
        }

        Alert.alert(
            'Change Profile Picture',
            'Choose an option',
            options
        );
    };

    const handleRemoveAvatar = async () => {
        setUploading(true);
        try {
            const response = await axiosInstance.delete('/users/avatar');
            dispatch(updateUser(response.data.user));
            Alert.alert('Success', 'Profile picture removed');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to remove avatar');
        } finally {
            setUploading(false);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const response = await uploadAvatar(uri);
            dispatch(updateUser(response.user));
            Alert.alert('Success', 'Profile picture updated successfully');
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const openGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const openCamera = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert('Permission to access camera is required!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            dispatch(getMe()),
            dispatch(fetchTickets())
        ]);
        setRefreshing(false);
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            dispatch(getMe());
            dispatch(fetchTickets());
        }, [dispatch])
    );

    const handleLogout = () => {
        dispatch(logout());
    };

    const createdTickets = tickets.filter(t => t.traineeId === user?.id);
    const redeemedTickets = tickets.filter(t => t.redeemedBy === user?.id);

    const createdCount = createdTickets.length;
    const resolvedCount = redeemedTickets.length;

    const displayedCreatedTickets = showAllCreated ? createdTickets : createdTickets.slice(0, 5);
    const displayedRedeemedTickets = showAllRedeemed ? redeemedTickets : redeemedTickets.slice(0, 5);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
        >
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {user?.avatar ? (
                        <Image
                            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${user.avatar}` }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.editAvatarButton} onPress={handlePickAvatar} disabled={uploading}>
                        {uploading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="camera" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
                <View style={styles.creditsContainer}>
                    <Ionicons name="ribbon-outline" size={20} color="#FFD700" />
                    <Text style={styles.creditsText}>{user?.totalCredits || 0} Credits</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.totalCredits || 0}</Text>
                    <Text style={styles.statLabel}>Credits</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{createdCount}</Text>
                    <Text style={styles.statLabel}>Created</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{resolvedCount}</Text>
                    <Text style={styles.statLabel}>Redeemed</Text>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.themeRow}>
                    <View style={styles.themeLeft}>
                        <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.text} />
                        <Text style={styles.themeText}>dark mode</Text>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? '#fff' : '#f4f3f4'}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'created' && styles.activeTab]}
                        onPress={() => setActiveTab('created')}
                    >
                        <Text style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
                            Created ({createdCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'resolved' && styles.activeTab]}
                        onPress={() => setActiveTab('resolved')}
                    >
                        <Text style={[styles.tabText, activeTab === 'resolved' && styles.activeTabText]}>
                            My Work ({resolvedCount})
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'created' ? (
                    <>
                        {displayedCreatedTickets.map(ticket => (
                            <TouchableOpacity
                                key={ticket.id}
                                style={[styles.ticketItem, ticket.deletedAt && { opacity: 0.6 }]}
                                onPress={() => !ticket.deletedAt && router.push(`/(user)/ticket-detail?id=${ticket.id}&source=profile`)}
                                disabled={!!ticket.deletedAt}
                            >
                                <View style={styles.ticketHeader}>
                                    <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                                    {ticket.deletedAt ? (
                                        <View style={[styles.statusBadge, { backgroundColor: '#FF3B30' }]}>
                                            <Text style={styles.statusText}>Deleted by Admin</Text>
                                        </View>
                                    ) : (
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                                            <Text style={styles.statusText}>{ticket.status}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.ticketDate}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        ))}
                        {createdCount > 5 && (
                            <TouchableOpacity
                                style={styles.showMoreButton}
                                onPress={() => setShowAllCreated(!showAllCreated)}
                            >
                                <Text style={styles.showMoreText}>
                                    {showAllCreated ? 'Show Less' : `Show More (${createdCount - 5} others)`}
                                </Text>
                                <Ionicons name={showAllCreated ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <>
                        {displayedRedeemedTickets.map(ticket => (
                            <TouchableOpacity
                                key={ticket.id}
                                style={styles.ticketItem}
                                onPress={() => router.push(`/(user)/ticket-detail?id=${ticket.id}&source=profile`)}
                            >
                                <View style={styles.ticketHeader}>
                                    <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                                    {ticket.solution ? (
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: getApprovalColor(ticket.solution.status) }
                                        ]}>
                                            <Text style={styles.statusText}>
                                                {ticket.solution.status === 'pending' ? 'Pending Approval' : ticket.solution.status}
                                            </Text>
                                        </View>
                                    ) : (
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                                            <Text style={styles.statusText}>{ticket.status}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.ticketDate}>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</Text>
                            </TouchableOpacity>
                        ))}
                        {resolvedCount > 5 && (
                            <TouchableOpacity
                                style={styles.showMoreButton}
                                onPress={() => setShowAllRedeemed(!showAllRedeemed)}
                            >
                                <Text style={styles.showMoreText}>
                                    {showAllRedeemed ? 'Show Less' : `Show More (${resolvedCount - 5} others)`}
                                </Text>
                                <Ionicons name={showAllRedeemed ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Actions</Text>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                    <Text style={[styles.menuText, { color: '#FF3B30' }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'open': return '#FF9500';
        case 'in-progress': return '#007AFF';
        case 'resolved': return '#34C759';
        default: return '#8E8E93';
    }
};

const getApprovalColor = (status: string | undefined) => {
    switch (status) {
        case 'approved': return '#34C759';
        case 'rejected': return '#FF3B30';
        default: return '#007AFF';
    }
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.card,
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.card,
    },
    avatarText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        color: colors.text,
    },
    role: {
        fontSize: 14,
        color: colors.placeholder,
        marginBottom: 8,
        fontWeight: '600',
    },
    creditsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        padding: 8,
        backgroundColor: colors.inputBackground, // Use safe background
        borderRadius: 8,
    },
    creditsText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FBC02D',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        marginTop: 20,
        padding: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.placeholder,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
        height: '80%',
        alignSelf: 'center',
    },
    section: {
        marginTop: 20,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.placeholder,
        padding: 16,
        paddingBottom: 8,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    menuText: {
        fontSize: 16,
        marginLeft: 12,
        color: colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.placeholder,
    },
    activeTabText: {
        color: colors.primary,
    },
    ticketItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
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
        color: colors.text,
    },
    ticketDate: {
        fontSize: 12,
        color: colors.placeholder,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    showMoreText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    themeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeText: {
        fontSize: 16,
        marginLeft: 12,
        color: colors.text,
    },
});
