import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../auth/hooks';
import { validateOTPCode } from '../../auth/utils';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

interface AuthStackParamList extends ParamListBase {
    Login: { returnTo?: string };
    Verification: { email: string; returnTo?: string };
    Profile: undefined;
    Game: undefined;
}

type VerificationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Verification'>;
type VerificationScreenRouteProp = RouteProp<AuthStackParamList, 'Verification'>;

interface VerificationScreenProps {
    navigation: VerificationScreenNavigationProp;
    route: VerificationScreenRouteProp;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ navigation, route }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [resendCountdown, setResendCountdown] = useState(0);
    const { verify, login } = useAuth();

    const email = route.params?.email || '';
    const returnTo = route.params?.returnTo;

    // Countdown timer for resend functionality
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    // Start countdown on mount
    useEffect(() => {
        setResendCountdown(60); // 60 second countdown
    }, []);

    const handleCodeChange = (text: string) => {
        // Only allow numeric input and limit to 6 digits
        const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
        setCode(numericText);
        setCodeError('');
    };

    const handleVerifyPress = async () => {
        // Validate code
        if (!code.trim()) {
            setCodeError('Verification code is required');
            return;
        }

        const validation = validateOTPCode(code.trim());
        if (!validation.isValid) {
            setCodeError(validation.error || 'Invalid verification code');
            return;
        }

        setIsLoading(true);

        try {
            await verify(email, code.trim());

            Alert.alert(
                'Welcome!',
                'You have been successfully authenticated.',
                [
                    {
                        text: 'Continue',
                        onPress: () => {
                            if (returnTo === 'Game') {
                                navigation.navigate('Game');
                            } else if (returnTo === 'Profile') {
                                navigation.navigate('Profile');
                            } else {
                                // Navigate to profile by default
                                navigation.navigate('Profile');
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            setCodeError(error instanceof Error ? error.message : 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCountdown > 0) return;

        try {
            await login(email);
            setResendCountdown(60);
            setCode('');
            setCodeError('');

            Alert.alert(
                'Code Resent',
                'A new verification code has been sent to your email.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                'Resend Failed',
                'Unable to resend verification code. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleBackToLogin = () => {
        Alert.alert(
            'Return to Login',
            'Are you sure you want to return to the login screen? You will need to enter your email again.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => navigation.navigate('Login', { returnTo })
                },
            ]
        );
    };

    const showCodeHelp = () => {
        Alert.alert(
            'Verification Code Help',
            'The 6-digit verification code was sent to your email address. If you don\'t see it, please check your spam folder.\n\nThe code expires after 10 minutes for security.',
            [{ text: 'OK' }]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Verify Your Email</Text>
                    <Text style={styles.subtitle}>
                        We've sent a 6-digit verification code to:
                    </Text>
                    <Text style={styles.emailText}>{email}</Text>
                    {returnTo && (
                        <Text style={styles.returnInfo}>
                            After verification, you'll access: {returnTo}
                        </Text>
                    )}
                </View>

                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Verification Code</Text>
                    <TextInput
                        style={[styles.codeInput, codeError ? styles.inputError : null]}
                        value={code}
                        onChangeText={handleCodeChange}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        maxLength={6}
                        autoFocus={true}
                        editable={!isLoading}
                        textAlign="center"
                    />
                    {codeError ? (
                        <Text style={styles.errorText}>{codeError}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[
                            styles.verifyButton,
                            (code.length !== 6 || isLoading) ? styles.verifyButtonDisabled : null
                        ]}
                        onPress={handleVerifyPress}
                        disabled={code.length !== 6 || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.verifyButtonText}>Verify Code</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.resendButton,
                            resendCountdown > 0 ? styles.resendButtonDisabled : null
                        ]}
                        onPress={handleResendCode}
                        disabled={resendCountdown > 0}
                    >
                        <Text style={[
                            styles.resendButtonText,
                            resendCountdown > 0 ? styles.resendButtonTextDisabled : null
                        ]}>
                            {resendCountdown > 0
                                ? `Resend code in ${resendCountdown}s`
                                : 'Resend verification code'
                            }
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={showCodeHelp}>
                        <Text style={styles.helpText}>Need help with the verification code?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleBackToLogin}>
                        <Text style={styles.backText}>← Back to login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    emailText: {
        fontSize: 16,
        color: '#34C759',
        fontWeight: '600',
        marginBottom: 12,
    },
    returnInfo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    codeInput: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: 'white',
        marginBottom: 8,
        letterSpacing: 8,
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        marginBottom: 16,
        textAlign: 'center',
    },
    verifyButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    verifyButtonDisabled: {
        backgroundColor: '#ccc',
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resendButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    resendButtonDisabled: {
        opacity: 0.5,
    },
    resendButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    resendButtonTextDisabled: {
        color: '#999',
    },
    footer: {
        alignItems: 'center',
    },
    helpText: {
        fontSize: 16,
        color: '#007AFF',
        marginBottom: 16,
        textDecorationLine: 'underline',
    },
    backText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
});

export default VerificationScreen;
