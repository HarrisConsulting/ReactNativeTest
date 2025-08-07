import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Animated,
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

type GameScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Game'>;

interface GameScreenProps {
    navigation: GameScreenNavigationProp;
}

const GameScreen: React.FC<GameScreenProps> = ({ navigation }) => {
    const { user, isAuthenticated } = useAuth();
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
    const scaleAnim = new Animated.Value(1);

    // Helper function to get the display name for personalization
    const getDisplayName = (): string => {
        if (!user) return 'Player';
        if (user.preferredName && user.preferredName.trim()) {
            return user.preferredName;
        }
        // Fallback to email prefix (part before @)
        return user.email.split('@')[0];
    };

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setScore(prevScore => prevScore + level * 10);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, level]);

    const startGame = () => {
        setIsPlaying(true);
        setGameStartTime(new Date());
        setScore(0);

        // Animate button press
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        Alert.alert(
            'Game Started!',
            `Welcome to the Protected Game, ${getDisplayName()}! Your score will automatically increase. Try to reach the next level!`,
            [{ text: 'Let\'s Play!' }]
        );
    };

    const stopGame = () => {
        setIsPlaying(false);
        const playTime = gameStartTime
            ? Math.round((new Date().getTime() - gameStartTime.getTime()) / 1000)
            : 0;

        Alert.alert(
            'Game Over!',
            `Final Score: ${score.toLocaleString()}\n` +
            `Level Reached: ${level}\n` +
            `Play Time: ${playTime} seconds\n\n` +
            'Thanks for playing the protected content demo!',
            [
                { text: 'Play Again', onPress: () => setScore(0) },
                { text: 'OK' },
            ]
        );
    };

    const levelUp = () => {
        if (score >= level * 1000) {
            setLevel(prevLevel => prevLevel + 1);
            Alert.alert(
                'Level Up!',
                `Congratulations! You've reached Level ${level + 1}! Your score multiplier has increased.`,
                [{ text: 'Awesome!' }]
            );
        } else {
            Alert.alert(
                'Not Yet!',
                `You need ${(level * 1000).toLocaleString()} points to reach Level ${level + 1}. Current score: ${score.toLocaleString()}`,
                [{ text: 'Keep Playing!' }]
            );
        }
    };

    const showGameInfo = () => {
        Alert.alert(
            'Protected Game Features',
            'This is a demonstration of protected content that requires email authentication to access.\n\n' +
            'Game Features:\n' +
            '• Automatic score progression\n' +
            '• Level-based multipliers\n' +
            '• User-specific welcome messages\n' +
            '• Session-based gameplay\n' +
            '• Protected content access control',
            [{ text: 'Got it!' }]
        );
    };

    const goToProfile = () => {
        navigation.navigate('Profile');
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.title}>🔒 Protected Content</Text>
                    <Text style={styles.subtitle}>
                        You need to be authenticated to access this game.
                    </Text>
                    <TouchableOpacity
                        style={styles.loginPromptButton}
                        onPress={() => navigation.navigate('Login', { returnTo: 'Game' })}
                    >
                        <Text style={styles.loginPromptButtonText}>Login to Play</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={styles.title}>🎮 Protected Game</Text>
                <Text style={styles.subtitle}>
                    Welcome, {getDisplayName()}! You have successfully accessed protected content.
                </Text>
            </View>

            <View style={styles.gameArea}>
                <View style={styles.statsCard}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Score</Text>
                            <Text style={styles.statValue}>{score.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Level</Text>
                            <Text style={styles.statValue}>{level}</Text>
                        </View>
                    </View>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Status</Text>
                            <Text style={[
                                styles.statValue,
                                isPlaying ? styles.statusPlaying : styles.statusPaused
                            ]}>
                                {isPlaying ? '🟢 Playing' : '⏸️ Paused'}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Next Level</Text>
                            <Text style={styles.statValue}>{(level * 1000).toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.controlsCard}>
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            style={[
                                styles.gameButton,
                                isPlaying ? styles.stopButton : styles.startButton
                            ]}
                            onPress={isPlaying ? stopGame : startGame}
                        >
                            <Text style={styles.gameButtonText}>
                                {isPlaying ? '⏹️ Stop Game' : '▶️ Start Game'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity
                        style={[
                            styles.levelButton,
                            score < level * 1000 ? styles.levelButtonDisabled : null
                        ]}
                        onPress={levelUp}
                        disabled={score < level * 1000}
                    >
                        <Text style={[
                            styles.levelButtonText,
                            score < level * 1000 ? styles.levelButtonTextDisabled : null
                        ]}>
                            🆙 Level Up ({(level * 1000).toLocaleString()} pts)
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.infoSection}>
                <TouchableOpacity style={styles.infoButton} onPress={showGameInfo}>
                    <Text style={styles.infoButtonText}>ℹ️ About This Game</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileButton} onPress={goToProfile}>
                    <Text style={styles.profileButtonText}>👤 View Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    🔐 This content is only accessible to authenticated users
                </Text>
                <Text style={styles.footerSubtext}>
                    Protected content demonstration - ReactNativeTest
                </Text>
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
        marginBottom: 12,
    },
    gameArea: {
        marginBottom: 30,
    },
    statsCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    controlsCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gameButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    startButton: {
        backgroundColor: '#34C759',
    },
    stopButton: {
        backgroundColor: '#FF3B30',
    },
    gameButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    levelButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    levelButtonDisabled: {
        backgroundColor: '#ccc',
    },
    levelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    levelButtonTextDisabled: {
        color: '#999',
    },
    infoSection: {
        marginBottom: 30,
    },
    infoButton: {
        backgroundColor: 'white',
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
    profileButton: {
        backgroundColor: '#FF9500',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    profileButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loginPromptButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginTop: 20,
    },
    loginPromptButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerText: {
        fontSize: 16,
        color: '#34C759',
        fontWeight: '600',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    statusPlaying: {
        color: '#34C759',
    },
    statusPaused: {
        color: '#FF9500',
    },
});

export default GameScreen;
