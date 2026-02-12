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
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../../store';
import { createTicket } from '../../features/tickets';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function CreateTicketScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await dispatch(createTicket({ title, description, attachments: images })).unwrap();
            Alert.alert('Success', 'Ticket created successfully');

            // Clear form
            setTitle('');
            setDescription('');
            setImages([]);

            router.back();
        } catch (err: any) {
            Alert.alert('Error', err);
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Create New Ticket</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Brief description of the issue"
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor={colors.placeholder}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Detailed description of the problem"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        placeholderTextColor={colors.placeholder}
                    />

                    <Text style={styles.label}>Attachments</Text>
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={20} color={colors.primary} />
                            <Text style={styles.pickerButtonText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
                            <Ionicons name="images-outline" size={20} color={colors.primary} />
                            <Text style={styles.pickerButtonText}>Gallery</Text>
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
                                        <Ionicons name="close" size={12} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity
                        style={[styles.button, (loading || isSubmitting) && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading || isSubmitting}
                    >
                        <Text style={styles.buttonText}>
                            {loading || isSubmitting ? 'Creating...' : 'Create Ticket'}
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
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 20,
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
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.inputBackground,
    },
    textArea: {
        height: 150,
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
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
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
