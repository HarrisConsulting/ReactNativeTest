import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Animated,
    Easing,
} from 'react-native';
import { useAuth } from '../../auth/hooks';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

interface AuthStackParamList extends ParamListBase {
    Login: { returnTo?: string };
    Verification: { email: string; returnTo?: string };
    Profile: undefined;
    Game: undefined;
    PreferenceOnboardingStep2: undefined;
    PreferenceOnboardingStep3: undefined;
}

type OnboardingCompleteScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PreferenceOnboardingStep3'>;

interface OnboardingCompleteScreenProps {
    navigation: OnboardingCompleteScreenNavigationProp;
}

const OnboardingCompleteScreen: React.FC<OnboardingCompleteScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    React.useEffect(() => {
        // Animate in the completion screen
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    const getDisplayName = (): string => {
        if (!user) return 'User';
        if (user.preferredName?.trim()) return user.preferredName;
        return user.email.split('@')[0];
    };

    const getPreferenceSummary = () => {
        const gamePrefs = user?.preferences?.gamePreferences;
        if (!gamePrefs) return 'Ready to explore!';

        const totalGames = (gamePrefs.strategyBoardGames?.length || 0) +
            (gamePrefs.puzzleGames?.length || 0) +
            (gamePrefs.arcadeGames?.length || 0) +
            (gamePrefs.actionGames?.length || 0) +
            (gamePrefs.sportsGames?.length || 0);

        if (totalGames === 0) return 'Ready to explore!';
        if (totalGames === 1) return `1 game selected`;
        return `${totalGames} games selected`;
    };

    const handleStartExploring = () => {
        navigation.navigate('Game');
    };

    const handleGoToProfile = () => {
        navigation.navigate('Profile');
    };

    const handleBackToHome = () => {
        // Navigate back to the main app - this would typically go to a Home screen
        // For now, we'll go to the Profile since that's our main authenticated screen
        navigation.navigate('Profile');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '100%' }]} />
                    </View>
                    <Text style={styles.progressText}>Step 3 of 3 - Complete!</Text>
                </View>

                {/* Success Icon */}
                <View style={styles.successIconContainer}>
                    <Text style={styles.successIcon}>🎉</Text>
                </View>

                {/* Personalized Welcome */}
                <Text style={styles.title}>
                    Welcome, {getDisplayName()}!
                </Text>

                <Text style={styles.subtitle}>
                    Your personalized experience is ready
                </Text>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Your Setup</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>👤 Name:</Text>
                        <Text style={styles.summaryValue}>{getDisplayName()}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>🎮 Games:</Text>
                        <Text style={styles.summaryValue}>{getPreferenceSummary()}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>🎯 Skill:</Text>
                        <Text style={styles.summaryValue}>
                            {user?.preferences?.gamePreferences?.skillLevel || 'Not set'}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>⏱️ Sessions:</Text>
                        <Text style={styles.summaryValue}>
                            {user?.preferences?.gamePreferences?.preferredSessionLength || 'Not set'}
                        </Text>
                    </View>
                </View>

                {/* Features Unlocked */}
                <View style={styles.featuresContainer}>
                    <Text style={styles.featuresTitle}>🔓 What's unlocked:</Text>
                    <View style={styles.featuresList}>
                        <Text style={styles.featureItem}>✨ Personalized game recommendations</Text>
                        <Text style={styles.featureItem}>🎮 Access to protected game content</Text>
                        <Text style={styles.featureItem}>📊 Custom difficulty suggestions</Text>
                        <Text style={styles.featureItem}>⚡ Tailored session recommendations</Text>
                    </View>
                </View>

                {/* Motivational Message */}
                <View style={styles.motivationContainer}>
                    <Text style={styles.motivationText}>
                        "Great games await! Your preferences help us create the perfect gaming experience just for you."
                    </Text>
                </View>
            </Animated.View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToProfile}>
                    <Text style={styles.secondaryButtonText}>View Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryButton} onPress={handleStartExploring}>
                    <Text style={styles.primaryButtonText}>Start Gaming! 🎮</Text>
                </TouchableOpacity>
            </View>

            {/* Skip to Home Option */}
            <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
                <Text style={styles.homeButtonText}>← Back to Home</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    progressContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#34C759',
        borderRadius: 2,
    },
    progressText: {
        color: '#34C759',
        fontSize: 14,
        fontWeight: '600',
    },
    successIconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    successIcon: {
        fontSize: 72,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginLeft: 12,
    },
    featuresContainer: {
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    featuresTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 12,
    },
    featuresList: {
        gap: 8,
    },
    featureItem: {
        fontSize: 14,
        color: '#005BB5',
        lineHeight: 20,
    },
    motivationContainer: {
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    motivationText: {
        fontSize: 16,
        color: '#E65100',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    homeButton: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default OnboardingCompleteScreen;
