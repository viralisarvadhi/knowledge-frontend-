import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function NotFoundScreen() {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={styles.container}>
                <Text style={styles.title}>This screen doesn't exist.</Text>

                <Link href="/" asChild>
                    <TouchableOpacity style={styles.link}>
                        <Text style={styles.linkText}>Go to home screen!</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 14,
        color: colors.primary,
    },
});
