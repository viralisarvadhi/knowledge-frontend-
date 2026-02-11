import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Solution } from '../types';

interface SolutionCardProps {
    solution: Solution;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Solution #{solution.id?.substring(0, 8)}</Text>
                <View style={styles.reuseBadge}>
                    <Text style={styles.reuseText}>♻️ {solution.reuseCount || 0}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Root Cause:</Text>
                <Text style={styles.text}>{solution.rootCause}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Fix Steps:</Text>
                <Text style={styles.text}>{solution.fixSteps}</Text>
            </View>

            {solution.preventionNotes && (
                <View style={styles.section}>
                    <Text style={styles.label}>Prevention:</Text>
                    <Text style={styles.text}>{solution.preventionNotes}</Text>
                </View>
            )}

            {solution.tags && solution.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {solution.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    reuseBadge: {
        backgroundColor: '#34C759',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    reuseText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
});

export default SolutionCard;
