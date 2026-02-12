import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { searchSolutions, clearSearchResults } from '../../features/solutions';
import { Solution } from '../../types';
import { ImageViewerModal } from '../../components';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../services/api/axiosInstance';

const API_ROOT = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');

export default function KnowledgeBaseScreen() {
    const [query, setQuery] = useState('');
    const [recentSolutions, setRecentSolutions] = useState<Solution[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const dispatch = useAppDispatch();
    const { searchResults, loading } = useAppSelector((state) => state.solutions);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const { colors } = useTheme();
    const styles = getStyles(colors);

    const handleImagePress = (path: string) => {
        setSelectedImage(`${API_ROOT}${path}`);
        setModalVisible(true);
    };

    // Load recent solutions on mount
    useEffect(() => {
        loadRecentSolutions();
    }, []);

    const loadRecentSolutions = async () => {
        try {
            setLoadingRecent(true);
            const response = await axiosInstance.get('/solutions/recent?limit=10');
            setRecentSolutions(response.data);
        } catch (error) {
            console.error('Failed to load recent solutions:', error);
        } finally {
            setLoadingRecent(false);
        }
    };

    // Debounced auto-search as user types
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                setHasSearched(true);
                dispatch(searchSolutions(query));
            } else {
                setHasSearched(false);
                dispatch(clearSearchResults());
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [query, dispatch]);

    const handleClearSearch = () => {
        setQuery('');
        setHasSearched(false);
        dispatch(clearSearchResults());
    };

    const renderSolution = ({ item }: { item: Solution }) => (
        <View style={styles.solutionCard}>
            <View style={styles.solutionHeader}>
                <Text style={styles.solutionTitle}>Solution #{item.id?.substring(0, 8)}</Text>
            </View>

            {/* Ticket Context */}
            {item.ticket && (
                <View style={styles.contextContainer}>
                    <Text style={styles.contextHeader}>Original Ticket</Text>
                    <Text style={styles.ticketTitle}>{item.ticket.title}</Text>
                    <Text style={styles.ticketDescription}>{item.ticket.description}</Text>

                    {item.ticket.attachments && item.ticket.attachments.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                            {item.ticket.attachments.map((path, index) => (
                                <TouchableOpacity key={index} onPress={() => handleImagePress(path)}>
                                    <Image
                                        source={{ uri: `${API_ROOT}${path}` }}
                                        style={styles.attachmentImage}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}

            {/* Solution Details */}
            <View style={styles.solutionSection}>
                <Text style={styles.sectionLabel}>Root Cause:</Text>
                <Text style={styles.sectionText}>{item.rootCause || 'Not provided'}</Text>
            </View>

            <View style={styles.solutionSection}>
                <Text style={styles.sectionLabel}>Fix Steps:</Text>
                <Text style={styles.sectionText}>{item.fixSteps || 'Not provided'}</Text>
            </View>

            {item.attachments && item.attachments.length > 0 && (
                <View style={styles.solutionSection}>
                    <Text style={styles.sectionLabel}>Solution Attachments:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                        {item.attachments.map((path, index) => (
                            <TouchableOpacity key={index} onPress={() => handleImagePress(path)}>
                                <Image
                                    source={{ uri: `${API_ROOT}${path}` }}
                                    style={styles.attachmentImage}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {item.preventionNotes && (
                <View style={styles.solutionSection}>
                    <Text style={styles.sectionLabel}>Prevention Notes:</Text>
                    <Text style={styles.sectionText}>{item.preventionNotes}</Text>
                </View>
            )}

            {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {item.tags.map((tag: string, index: number) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    // Determine what data to display
    const displayData = hasSearched ? searchResults : recentSolutions;
    const isLoading = hasSearched ? loading : loadingRecent;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Knowledge Base</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search available solutions..."
                    placeholderTextColor={colors.placeholder}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    clearButtonMode="while-editing"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                    </TouchableOpacity>
                )}
            </View>

            {!hasSearched && !loadingRecent && recentSolutions.length > 0 && (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>Recent Solutions</Text>
                    <Text style={styles.sectionHeaderSubtext}>Browse recently approved solutions</Text>
                </View>
            )}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading solutions...</Text>
                </View>
            ) : (
                <FlatList
                    data={displayData}
                    renderItem={renderSolution}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name={hasSearched ? "search-outline" : "library-outline"}
                                size={64}
                                color={colors.placeholder}
                            />
                            <Text style={styles.emptyText}>
                                {hasSearched ? 'No solutions found' : 'No solutions available'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {hasSearched ? 'Try different keywords' : 'Check back later for approved solutions'}
                            </Text>
                        </View>
                    }
                />
            )}

            <ImageViewerModal
                visible={modalVisible}
                imageUrl={selectedImage}
                onClose={() => setModalVisible(false)}
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
        padding: 16,
        paddingTop: 60,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.inputBackground,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    sectionHeader: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: colors.background,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    sectionHeaderSubtext: {
        fontSize: 14,
        color: colors.placeholder,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.placeholder,
    },
    listContent: {
        padding: 16,
    },
    solutionCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    solutionHeader: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    solutionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    contextContainer: {
        backgroundColor: colors.inputBackground,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    contextHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.placeholder,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    ticketTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    ticketDescription: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    imageScroll: {
        marginTop: 8,
    },
    attachmentImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: colors.border,
    },
    solutionSection: {
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.placeholder,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sectionText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    tag: {
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: colors.placeholder,
        textAlign: 'center',
    },
});
