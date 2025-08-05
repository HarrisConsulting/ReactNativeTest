import React, { useState } from 'react';
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
import { validateEmail } from '../../auth/utils';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

interface AuthStackParamList extends ParamListBase {
    Login: { returnTo?: string };
    Verification: { email: string; returnTo?: string };
    Profile: undefined;
    Game: undefined;
}

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
    route: LoginScreenRouteProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const { login } = useAuth();
    const returnTo = route.params?.returnTo;

    const handleEmailChange = (text: string) => {
        setEmail(text);
        setEmailError('');
    };

    const handleLoginPress = async () => {
        // Validate email
        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }

        if (!validateEmail(email.trim())) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            await login(email.trim());

            // Navigate to verification screen with email and return destination
            navigation.navigate('Verification', {
                email: email.trim(),
                returnTo
            });

            Alert.alert(
                'Email Sent',
                `We've sent a verification code to ${email.trim()}. Please check your email and enter the code on the next screen.`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                'Login Failed',
                error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const showHelpInfo = () => {
        Alert.alert(
            'Email Authentication',
            'Enter your email address to receive a secure verification code. This allows you to access protected features without a traditional password.',
            [
                { text: 'Learn More', onPress: showSecurityInfo },
                { text: 'OK', style: 'cancel' },
            ]
        );
    };

    const showSecurityInfo = () => {
        Alert.alert(
            'Security Information',
            'Your email is securely processed and never shared with third parties. The verification code expires after 10 minutes for your security.',
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
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>
                        Enter your email to access protected features
                    </Text>
                    {returnTo && (
                        <Text style={styles.returnInfo}>
                            You'll be returned to: {returnTo}
                        </Text>
                    )}
                </View>

                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                        style={[styles.emailInput, emailError ? styles.inputError : null]}
                        value={email}
                        onChangeText={handleEmailChange}
                        placeholder="Enter your email address"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        editable={!isLoading}
                    />
                    {emailError ? (
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            (!email.trim() || isLoading) ? styles.loginButtonDisabled : null
                        ]}
                        onPress={handleLoginPress}
                        disabled={!email.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.loginButtonText}>Send Verification Code</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={showHelpInfo}>
                        <Text style={styles.helpText}>How does email authentication work?</Text>
                    </TouchableOpacity>

                    <Text style={styles.securityNote}>
                        🔒 Your email is processed securely and never shared
                    </Text>
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
        marginBottom: 12,
    },
    returnInfo: {
        fontSize: 14,
        color: '#34C759',
        textAlign: 'center',
        fontWeight: '500',
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
    },
    emailInput: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'white',
        marginBottom: 8,
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        fontSize: 14,
        color: '#FF3B30',
        marginBottom: 16,
        marginLeft: 4,
    },
    loginButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    loginButtonDisabled: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
    securityNote: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default LoginScreen;
