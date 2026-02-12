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
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { searchSolutions, clearSearchResults } from '../../features/solutions';
import { Solution } from '../../types';

const API_ROOT = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');

import { ImageViewerModal } from '../../components';

export default function KnowledgeBaseScreen() {
    const [query, setQuery] = useState('');
    const dispatch = useAppDispatch();
    const { searchResults, loading } = useAppSelector((state) => state.solutions);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImagePress = (path: string) => {
        setSelectedImage(`${API_ROOT}${path}`);
        setModalVisible(true);
    };

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                dispatch(searchSolutions(query));
            } else {
                dispatch(clearSearchResults());
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [query, dispatch]);

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Knowledge Base</Text>
            </View>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search available solutions..."
                    placeholderTextColor="#999"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    clearButtonMode="while-editing"
                />
            </View>

            <FlatList
                data={searchResults}
                renderItem={renderSolution}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {query ? 'No solutions found' : 'Search for solutions'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {query ? 'Try different keywords' : 'Enter keywords to find relevant solutions'}
                        </Text>
                    </View>
                }
            />

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
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    searchButtonText: {
        fontSize: 24,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    solutionCard: {
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
    solutionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    solutionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    solutionSection: {
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    sectionText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tag: {
        backgroundColor: '#E5E5EA',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 12,
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
    imageScroll: {
        marginTop: 8,
        marginBottom: 8,
    },
    attachmentImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
    },
    contextContainer: {
        backgroundColor: '#F8F8FA',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    contextHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#007AFF',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    ticketTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    ticketDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});
