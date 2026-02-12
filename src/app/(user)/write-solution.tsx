import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../../store';
import { resolveTicket } from '../../features/tickets';
import { useTheme } from '../../context/ThemeContext';

export default function WriteSolutionScreen() {
    const { ticketId, source } = useLocalSearchParams<{ ticketId: string; source?: string }>();
    const [rootCause, setRootCause] = useState('');
    const [fixSteps, setFixSteps] = useState('');
    const [preventionNotes, setPreventionNotes] = useState('');
    const [tags, setTags] = useState('');
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading } = useAppSelector((state) => state.tickets);
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets]);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Camera permission is required to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 1,
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!rootCause || !fixSteps) {
            Alert.alert('Error', 'Root Cause and Fix Steps are required');
            return;
        }

        const solutionData = {
            rootCause,
            fixSteps,
            preventionNotes,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            attachments: images,
        };

        try {
            await dispatch(resolveTicket({ ticketId, solutionData })).unwrap();
            Alert.alert('Success', 'Solution submitted successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Navigate back to the source tab
                        if (source) {
                            router.dismissAll();
                            router.push(`/(tabs)/${source}`);
                        } else if (router.canDismiss()) {
                            router.dismissAll();
                        } else {
                            router.back();
                            router.back();
                        }
                    }
                }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.label}>Root Cause *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What caused the issue?"
                        placeholderTextColor={colors.placeholder}
                        value={rootCause}
                        onChangeText={setRootCause}
                        multiline
                        numberOfLines={4}
                    />

                    <Text style={styles.label}>Fix Steps *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Steps taken to resolve"
                        placeholderTextColor={colors.placeholder}
                        value={fixSteps}
                        onChangeText={setFixSteps}
                        multiline
                        numberOfLines={6}
                    />

                    <Text style={styles.label}>Prevention Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="How to prevent recurrence"
                        placeholderTextColor={colors.placeholder}
                        value={preventionNotes}
                        onChangeText={setPreventionNotes}
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>Tags</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="tags (e.g., network, login, bug)"
                        placeholderTextColor={colors.placeholder}
                        value={tags}
                        onChangeText={setTags}
                    />

                    <Text style={styles.label}>Attachments</Text>
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
                            <Text style={styles.pickerButtonText}>📷 Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
                            <Text style={styles.pickerButtonText}>🖼️  Gallery</Text>
                        </TouchableOpacity>
                    </View>

                    {images.length > 0 && (
                        <ScrollView horizontal style={styles.previewScroll} showsHorizontalScrollIndicator={false}>
                            {images.map((img, index) => (
                                <View key={index} style={styles.previewItem}>
                                    <Image source={{ uri: img.uri }} style={styles.previewImage} />
                                    <TouchableOpacity
                                        style={styles.removeBadge}
                                        onPress={() => removeImage(index)}
                                    >
                                        <Text style={styles.removeText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Submitting...' : 'Submit Solution'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: colors.text,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.inputBackground,
    },
    textArea: {
        textAlignVertical: 'top',
        minHeight: 100,
    },
    imagePickerContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    pickerButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    pickerButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    previewScroll: {
        marginBottom: 20,
    },
    previewItem: {
        marginRight: 10,
        position: 'relative',
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: colors.border,
    },
    removeBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: colors.danger,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.card,
    },
    removeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
