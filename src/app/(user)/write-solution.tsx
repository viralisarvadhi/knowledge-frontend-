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

export default function WriteSolutionScreen() {
    const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
    const [rootCause, setRootCause] = useState('');
    const [fixSteps, setFixSteps] = useState('');
    const [preventionNotes, setPreventionNotes] = useState('');
    const [tags, setTags] = useState(''); // Comma separated string for UI
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading } = useAppSelector((state) => state.tickets);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
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
            Alert.alert('Success', 'Solution submitted successfully');
            router.back();
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
                        value={rootCause}
                        onChangeText={setRootCause}
                        multiline
                        numberOfLines={4}
                    />

                    <Text style={styles.label}>Fix Steps *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Steps taken to resolve"
                        value={fixSteps}
                        onChangeText={setFixSteps}
                        multiline
                        numberOfLines={6}
                    />

                    <Text style={styles.label}>Prevention Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="How to prevent recurrence"
                        value={preventionNotes}
                        onChangeText={setPreventionNotes}
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>Tags</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Comma separated tags (e.g., network, login, bug)"
                        value={tags}
                        onChangeText={setTags}
                    />

                    <Text style={styles.label}>Attachments</Text>
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
                            <Text style={styles.pickerButtonText}>📷 Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
                            <Text style={styles.pickerButtonText}>🖼️ Pick from Gallery</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
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
        borderColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    pickerButtonText: {
        color: '#007AFF',
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
        backgroundColor: '#eee',
    },
    removeBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FF3B30',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    removeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#007AFF',
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
