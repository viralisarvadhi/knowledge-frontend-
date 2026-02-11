import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ticket } from '../types';

interface TicketCardProps {
    ticket: Ticket;
    onPress: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPress }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return '#34C759';
            case 'in-progress':
                return '#FF9500';
            case 'resolved':
                return '#8E8E93';
            default:
                return '#000';
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                    {ticket.title}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                    <Text style={styles.statusText}>{ticket.status}</Text>
                </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>
                {ticket.description}
            </Text>
        </TouchableOpacity>
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
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
        color: '#000',
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
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});

export default TicketCard;
