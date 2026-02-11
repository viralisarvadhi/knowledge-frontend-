import React from 'react';
import { Modal, View, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageViewerModalProps {
    visible: boolean;
    imageUrl: string | null;
    onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ visible, imageUrl, onClose }) => {
    if (!imageUrl) return null;

    // Handle full URL construction if needed, or assume caller provides it. 
    // Given the app structure, caller usually constructs the full URL.

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <SafeAreaView style={styles.safeArea}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={36} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 50, // Adjust for status bar if SafeAreaView doesn't handle it perfectly on all devices, or rely on SafeAreaView
        right: 20,
        zIndex: 1,
        padding: 8,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
