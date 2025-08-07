import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
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
    PreferenceOnboardingStep1: undefined;
    PreferenceOnboardingStep2: undefined;
    PreferenceOnboardingStep3: undefined;
}

type PreferredNameOnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PreferenceOnboardingStep1'>;

interface PreferredNameOnboardingScreenProps {
    navigation: PreferredNameOnboardingScreenNavigationProp;
}

const PreferredNameOnboardingScreen: React.FC<PreferredNameOnboardingScreenProps> = ({ navigation }) => {
    const { user, updatePreferredName } = useAuth();
    const [preferredName, setPreferredName] = useState(user?.preferredName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const getSuggestedName = (): string => {
        if (!user?.email) return '';
        return user.email.split('@')[0];
    };

    const handleUseSuggestion = () => {
        setPreferredName(getSuggestedName());
    };

    const handleContinue = async () => {
        if (!preferredName.trim()) {
            Alert.alert(
                'Name Required',
                'Please enter a preferred name to continue with personalization.',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsLoading(true);
        try {
            const result = await updatePreferredName(preferredName.trim());
            if (result.success) {
                navigation.navigate('PreferenceOnboardingStep2');
            } else {
                Alert.alert('Error', result.error || 'Failed to save preferred name. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        Alert.alert(
            'Skip Personalization?',
            'You can always set up your preferences later in your profile settings.',
            [
                { text: 'Set Up Now', style: 'cancel' },
                { text: 'Skip for Now', onPress: () => navigation.navigate('Profile') },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header with Progress */}
                <View style={styles.header}>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '33%' }]} />
                        </View>
                        <Text style={styles.progressText}>Step 1 of 3</Text>
                    </View>
                    <Text style={styles.title}>What should we call you?</Text>
                    <Text style={styles.subtitle}>
                        Help us personalize your experience with a name you prefer
                    </Text>
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Welcome Message */}
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeIcon}>👋</Text>
                        <Text style={styles.welcomeText}>
                            Welcome to your personalized gaming experience!
                        </Text>
                    </View>

                    {/* Name Input Section */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Preferred Name</Text>
                        <TextInput
                            style={styles.nameInput}
                            value={preferredName}
                            onChangeText={setPreferredName}
                            placeholder="Enter your preferred name"
                            placeholderTextColor="#999"
                            autoCapitalize="words"
                            autoCorrect={false}
                            maxLength={30}
                        />
                        <Text style={styles.inputHint}>
                            This is how we'll greet you throughout the app
                        </Text>
                    </View>

                    {/* Suggestion */}
                    {!preferredName && getSuggestedName() && (
                        <View style={styles.suggestionContainer}>
                            <Text style={styles.suggestionLabel}>Quick suggestion:</Text>
                            <TouchableOpacity style={styles.suggestionButton} onPress={handleUseSuggestion}>
                                <Text style={styles.suggestionButtonText}>
                                    Use "{getSuggestedName()}"
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Preview */}
                    {preferredName.trim() && (
                        <View style={styles.previewContainer}>
                            <Text style={styles.previewLabel}>Preview:</Text>
                            <View style={styles.previewCard}>
                                <Text style={styles.previewText}>
                                    "Welcome, {preferredName.trim()}!"
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Benefits */}
                    <View style={styles.benefitsContainer}>
                        <Text style={styles.benefitsTitle}>Why personalization matters:</Text>
                        <View style={styles.benefitsList}>
                            <Text style={styles.benefitItem}>✨ Tailored game recommendations</Text>
                            <Text style={styles.benefitItem}>🎯 Customized difficulty levels</Text>
                            <Text style={styles.benefitItem}>📊 Personal progress tracking</Text>
                            <Text style={styles.benefitItem}>🎮 Enhanced gaming experience</Text>
                        </View>
                    </View>
                </View>
            </Animated.View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavigation}>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipButtonText}>Skip for Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        (!preferredName.trim() || isLoading) && styles.continueButtonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={!preferredName.trim() || isLoading}
                >
                    <Text style={styles.continueButtonText}>
                        {isLoading ? 'Saving...' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
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
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 24,
        paddingTop: 12,
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
    },
    progressText: {
        color: '#E3F2FD',
        fontSize: 14,
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#E3F2FD',
        lineHeight: 22,
    },
    mainContent: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    welcomeIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    welcomeText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '500',
    },
    inputSection: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    nameInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        fontWeight: '500',
        borderWidth: 2,
        borderColor: '#E5E5E5',
        marginBottom: 8,
    },
    inputHint: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    suggestionContainer: {
        marginBottom: 24,
    },
    suggestionLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    suggestionButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    suggestionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    previewContainer: {
        marginBottom: 24,
    },
    previewLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    previewCard: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    previewText: {
        fontSize: 16,
        color: '#005BB5',
        fontWeight: '500',
        textAlign: 'center',
    },
    benefitsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    benefitsList: {
        gap: 8,
    },
    benefitItem: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    bottomNavigation: {
        flexDirection: 'row',
        padding: 24,
        paddingTop: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 12,
    },
    skipButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#666',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    continueButton: {
        flex: 2,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#A0A0A0',
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PreferredNameOnboardingScreen;
