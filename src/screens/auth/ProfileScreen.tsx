import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Switch,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../auth/hooks';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

interface AuthStackParamList extends ParamListBase {
    Login: { returnTo?: string };
    Verification: { email: string; returnTo?: string };
    Profile: undefined;
    Game: undefined;
}

type ProfileScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Profile'>;

interface ProfileScreenProps {
    navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const { user, logout, isAuthenticated, updatePreferredName, updateUserPreferences } = useAuth();

    // Local state for form inputs
    const [preferredName, setPreferredName] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [rememberDevice, setRememberDevice] = useState(false);
    const [lastUpdate] = useState(new Date().toLocaleTimeString());

    // Loading states
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

    // Initialize form with current user data
    useEffect(() => {
        if (user) {
            setPreferredName(user.preferredName || '');
            const prefs = user.preferences || {};
            setNotificationsEnabled(prefs.notifications?.email ?? true);
            setRememberDevice(prefs.device?.rememberDevice ?? false);
        }
    }, [user]);

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout? You will need to verify your email again to access protected features.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            Alert.alert(
                                'Logged Out',
                                'You have been successfully logged out.',
                                [{ text: 'OK' }]
                            );
                        } catch (error) {
                            Alert.alert(
                                'Logout Error',
                                'An error occurred while logging out. Please try again.',
                                [{ text: 'OK' }]
                            );
                        }
                    },
                },
            ]
        );
    };

    const showAccountDetails = () => {
        if (!user) return;

        Alert.alert(
            'Account Details',
            `Email: ${user.email}\n` +
            `Account Created: ${user.createdAt.toLocaleDateString()}\n` +
            `Last Login: ${user.lastLoginAt.toLocaleDateString()}\n` +
            `Status: ${user.isVerified ? 'Verified' : 'Pending Verification'}`,
            [{ text: 'OK' }]
        );
    };

    const showSecurityInfo = () => {
        Alert.alert(
            'Security Information',
            'Your account uses email-only authentication for enhanced security:\n\n' +
            '• No passwords to remember or compromise\n' +
            '• Time-limited verification codes\n' +
            '• Secure token-based sessions\n' +
            '• Automatic session expiry\n\n' +
            'Your email is never shared with third parties.',
            [{ text: 'OK' }]
        );
    };

    const navigateToGame = () => {
        navigation.navigate('Game');
    };

    const handleUpdatePreferredName = async () => {
        if (!preferredName.trim()) {
            Alert.alert('Error', 'Please enter a preferred name.');
            return;
        }

        setIsUpdatingName(true);
        try {
            const result = await updatePreferredName(preferredName.trim());
            if (result.success) {
                Alert.alert('Success', 'Your preferred name has been updated!');
            } else {
                Alert.alert('Error', result.error || 'Failed to update preferred name. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleNotificationToggle = async (value: boolean) => {
        setIsUpdatingPreferences(true);
        setNotificationsEnabled(value);

        try {
            const newPreferences = {
                notifications: { email: value, push: false }
            };

            const result = await updateUserPreferences(newPreferences);
            if (result.success) {
                Alert.alert(
                    'Notifications Updated',
                    `Email notifications are now ${value ? 'enabled' : 'disabled'}.`
                );
            } else {
                // Revert on failure
                setNotificationsEnabled(!value);
                Alert.alert('Error', result.error || 'Failed to update preferences. Please try again.');
            }
        } catch (error) {
            // Revert on failure
            setNotificationsEnabled(!value);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsUpdatingPreferences(false);
        }
    };

    const handleRememberDeviceToggle = async (value: boolean) => {
        setIsUpdatingPreferences(true);
        setRememberDevice(value);

        try {
            const newPreferences = {
                device: { rememberDevice: value, sessionExtension: value }
            };

            const result = await updateUserPreferences(newPreferences);
            if (result.success) {
                Alert.alert(
                    'Device Preference Updated',
                    `Device remembering is now ${value ? 'enabled' : 'disabled'}. ${value
                        ? 'Your login sessions will last longer on this device.'
                        : 'You will need to verify your email more frequently.'
                    }`
                );
            } else {
                // Revert on failure
                setRememberDevice(!value);
                Alert.alert('Error', result.error || 'Failed to update preferences. Please try again.');
            }
        } catch (error) {
            // Revert on failure
            setRememberDevice(!value);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsUpdatingPreferences(false);
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.title}>Not Authenticated</Text>
                    <Text style={styles.subtitle}>Please log in to view your profile.</Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
                <Text style={styles.subtitle}>Manage your account and preferences</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <Text style={[
                            styles.infoValue,
                            user.isVerified ? styles.statusVerified : styles.statusPending
                        ]}>
                            {user.isVerified ? '✓ Verified' : '⏳ Pending'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last Updated</Text>
                        <Text style={styles.infoValue}>{lastUpdate}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={showAccountDetails}>
                    <Text style={styles.actionButtonText}>View Full Account Details</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Preferred Name</Text>
                        <Text style={styles.inputDescription}>
                            How you'd like to be addressed in the app
                        </Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.textInput}
                                value={preferredName}
                                onChangeText={setPreferredName}
                                placeholder={`Enter preferred name (optional)`}
                                placeholderTextColor="#999"
                                maxLength={50}
                                autoCapitalize="words"
                                autoCorrect={false}
                                editable={!isUpdatingName}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.updateButton,
                                    isUpdatingName && styles.updateButtonDisabled
                                ]}
                                onPress={handleUpdatePreferredName}
                                disabled={isUpdatingName}
                            >
                                {isUpdatingName ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.updateButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        {user.preferredName && (
                            <Text style={styles.currentValueText}>
                                Current: {user.preferredName}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Email Notifications</Text>
                            <Text style={styles.settingDescription}>
                                Receive verification codes and account updates
                            </Text>
                        </View>
                        {isUpdatingPreferences ? (
                            <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={notificationsEnabled ? '#34C759' : '#f4f3f4'}
                                disabled={isUpdatingPreferences}
                            />
                        )}
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Remember This Device</Text>
                            <Text style={styles.settingDescription}>
                                Extend session duration on this device
                            </Text>
                        </View>
                        {isUpdatingPreferences ? (
                            <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                            <Switch
                                value={rememberDevice}
                                onValueChange={handleRememberDeviceToggle}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={rememberDevice ? '#34C759' : '#f4f3f4'}
                                disabled={isUpdatingPreferences}
                            />
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Protected Content</Text>
                <View style={styles.card}>
                    <Text style={styles.cardDescription}>
                        You now have access to all protected features in the app.
                    </Text>
                    <TouchableOpacity style={styles.gameButton} onPress={navigateToGame}>
                        <Text style={styles.gameButtonText}>🎮 Access Game</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.infoButton} onPress={showSecurityInfo}>
                        <Text style={styles.infoButtonText}>🔒 Security Information</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        padding: 20,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
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
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardDescription: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
    },
    actionButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    gameButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    gameButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    infoButton: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    infoButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    statusVerified: {
        color: '#34C759',
    },
    statusPending: {
        color: '#FF9500',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        marginBottom: 4,
    },
    inputDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: 'white',
        color: '#333',
    },
    updateButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateButtonDisabled: {
        backgroundColor: '#a0a0a0',
    },
    updateButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    currentValueText: {
        fontSize: 12,
        color: '#666',
        marginTop: 6,
        fontStyle: 'italic',
    },
});

export default ProfileScreen;
