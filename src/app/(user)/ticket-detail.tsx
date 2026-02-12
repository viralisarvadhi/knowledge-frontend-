import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { redeemTicket } from '../../features/tickets';
import { ImageViewerModal } from '../../components';
import { useTheme } from '../../context/ThemeContext';

const API_ROOT = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');

export default function TicketDetailScreen() {
    const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const { user } = useAppSelector((state) => state.auth);
    const { list: tickets, loading: ticketsLoading } = useAppSelector((state) => state.tickets);
    const ticket = tickets.find((t) => t.id === id);

    const { colors } = useTheme();
    const styles = getStyles(colors);

    const isOwner = ticket?.traineeId === user?.id;

    if (!ticket) {
        return (
            <View style={styles.center}>
                <Text style={{ color: colors.text }}>Ticket not found</Text>
            </View>
        );
    }

    const handleImagePress = (path: string) => {
        setSelectedImage(`${API_ROOT}${path}`);
        setModalVisible(true);
    };

    const handleWriteSolution = async () => {
        try {
            await dispatch(redeemTicket(ticket.id)).unwrap();
            router.push({
                pathname: '/(user)/write-solution',
                params: { ticketId: ticket.id, source }
            });
        } catch (err: any) {
            Alert.alert('Error', err || 'Failed to redeem ticket');
        }
    };

    const handleBack = () => {
        if (source) {
            // Navigate back to the source tab
            router.push(`/(tabs)/${source}`);
        } else if (router.canGoBack()) {
            router.back();
        } else {
            // Fallback to tickets tab
            router.push('/(tabs)/tickets');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ticket Details</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.label}>Title</Text>
                        <Text style={styles.titleText}>{ticket.title}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Description</Text>
                        <Text style={styles.descriptionText}>{ticket.description}</Text>
                    </View>

                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.label}>Attachments</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                                {ticket.attachments.map((path, index) => (
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

                    {ticket.solution && (
                        <View style={[styles.section, styles.solutionContainer]}>
                            {/* Header / Status Banner */}
                            <Text style={[styles.label, {
                                color: ticket.solution.status === 'approved' ? colors.success :
                                    ticket.solution.status === 'rejected' ? colors.danger : colors.primary
                            }]}>
                                {ticket.solution.status === 'approved' ? 'Solution Provided' :
                                    ticket.solution.status === 'rejected' ? 'Solution Rejected' : 'Solution Submitted, Awaiting Admin Approval'}
                            </Text>

                            {/* Content Visibility Rules */}
                            {ticket.solution.status === 'approved' ? (
                                <>
                                    <View style={styles.solutionSection}>
                                        <Text style={styles.solutionLabel}>Root Cause</Text>
                                        <Text style={styles.solutionText}>{ticket.solution.rootCause}</Text>
                                    </View>

                                    <View style={styles.solutionSection}>
                                        <Text style={styles.solutionLabel}>Fix Steps</Text>
                                        <Text style={styles.solutionText}>{ticket.solution.fixSteps}</Text>
                                    </View>

                                    {ticket.solution.preventionNotes && (
                                        <View style={styles.solutionSection}>
                                            <Text style={styles.solutionLabel}>Prevention Notes</Text>
                                            <Text style={styles.solutionText}>{ticket.solution.preventionNotes}</Text>
                                        </View>
                                    )}
                                </>
                            ) : ticket.solution.status === 'pending' ? (
                                <View style={styles.solutionSection}>
                                    <Text style={[styles.solutionText, { fontStyle: 'italic', color: colors.placeholder }]}>
                                        Solution details are hidden until approved by an administrator.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.solutionSection}>
                                    <Text style={[styles.solutionText, { fontStyle: 'italic', color: colors.danger }]}>
                                        Your solution was rejected. Please review and submit a new solution.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {ticket.status !== 'resolved' && (!ticket.solution || ticket.solution.status === 'rejected') && (
                        <TouchableOpacity
                            style={[styles.button, ticketsLoading && styles.buttonDisabled]}
                            onPress={handleWriteSolution}
                            disabled={ticketsLoading}
                        >
                            <Text style={styles.buttonText}>
                                {ticketsLoading ? 'Processing...' : 'Write Solution'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: colors.primary,
        fontSize: 16,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: colors.placeholder,
        textTransform: 'uppercase',
        marginBottom: 8,
        fontWeight: '600',
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: colors.text,
    },
    imageScroll: {
        marginTop: 8,
    },
    attachmentImage: {
        width: 250,
        height: 250,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: colors.border,
    },
    button: {
        backgroundColor: colors.success,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    solutionContainer: {
        backgroundColor: colors.inputBackground,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    solutionSection: {
        marginTop: 12,
    },
    solutionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.placeholder,
        marginBottom: 4,
    },
    solutionText: {
        fontSize: 16,
        color: colors.text,
    },
});
