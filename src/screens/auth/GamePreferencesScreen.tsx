import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { useAuth } from '../../auth/hooks';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';
import type {
    GamePreferences,
    StrategyBoardGame,
    PuzzleGame,
    ArcadeGame,
    ActionGame,
    SportsGame,
    SkillLevel,
    SessionLength
} from '../../auth/types';

interface AuthStackParamList extends ParamListBase {
    Login: { returnTo?: string };
    Verification: { email: string; returnTo?: string };
    Profile: undefined;
    Game: undefined;
    PreferenceOnboardingStep2: undefined;
    PreferenceOnboardingStep3: undefined;
}

type GamePreferencesScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PreferenceOnboardingStep2'>;

interface GamePreferencesScreenProps {
    navigation: GamePreferencesScreenNavigationProp;
}

const GamePreferencesScreen: React.FC<GamePreferencesScreenProps> = ({ navigation }) => {
    const { updateUserPreferences } = useAuth();

    // Game preferences state
    const [selectedStrategyGames, setSelectedStrategyGames] = useState<StrategyBoardGame[]>([]);
    const [selectedPuzzleGames, setSelectedPuzzleGames] = useState<PuzzleGame[]>([]);
    const [selectedArcadeGames, setSelectedArcadeGames] = useState<ArcadeGame[]>([]);
    const [selectedActionGames, setSelectedActionGames] = useState<ActionGame[]>([]);
    const [selectedSportsGames, setSelectedSportsGames] = useState<SportsGame[]>([]);
    const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediate');
    const [sessionLength, setSessionLength] = useState<SessionLength>('15-30 minutes');
    const [competitiveMode, setCompetitiveMode] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Game options
    const strategyGames: StrategyBoardGame[] = ['Chess', 'Checkers', 'Backgammon', 'Go', 'Othello', 'Shogi'];
    const puzzleGames: PuzzleGame[] = ['Tetris', 'Rubik\'s Cube', 'Sudoku', 'Crossword', 'Jigsaw', 'Word Search'];
    const arcadeGames: ArcadeGame[] = ['Pac-Man', 'Space Invaders', 'Donkey Kong', 'Frogger', 'Asteroids', 'Centipede'];
    const actionGames: ActionGame[] = ['Call of Duty', 'God of War', 'Street Fighter', 'Mortal Kombat', 'Tekken', 'Doom'];
    const sportsGames: SportsGame[] = ['Soccer', 'Golf', 'Tennis', 'Basketball', 'Baseball', 'Football'];

    const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const sessionLengths: SessionLength[] = ['5-15 minutes', '15-30 minutes', '30-60 minutes', '1+ hours'];

    const toggleGameSelection = <T extends string>(
        game: T,
        selectedGames: T[],
        setSelectedGames: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
        if (selectedGames.includes(game)) {
            setSelectedGames(selectedGames.filter(g => g !== game));
        } else {
            setSelectedGames([...selectedGames, game]);
        }
    };

    const handleContinue = async () => {
        setIsLoading(true);

        try {
            const gamePreferences: GamePreferences = {
                strategyBoardGames: selectedStrategyGames,
                puzzleGames: selectedPuzzleGames,
                arcadeGames: selectedArcadeGames,
                actionGames: selectedActionGames,
                sportsGames: selectedSportsGames,
                skillLevel,
                preferredSessionLength: sessionLength,
                competitiveMode,
            };

            const result = await updateUserPreferences({
                gamePreferences
            });

            if (result.success) {
                navigation.navigate('PreferenceOnboardingStep3');
            } else {
                Alert.alert('Error', result.error || 'Failed to save game preferences. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        Alert.alert(
            'Skip Game Preferences?',
            'You can always set your game preferences later in your profile settings.',
            [
                { text: 'Set Now', style: 'cancel' },
                { text: 'Skip for Now', onPress: () => navigation.navigate('PreferenceOnboardingStep3') },
            ]
        );
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const totalSelections = selectedStrategyGames.length + selectedPuzzleGames.length +
        selectedArcadeGames.length + selectedActionGames.length + selectedSportsGames.length;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header with Progress */}
                <View style={styles.header}>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '66%' }]} />
                        </View>
                        <Text style={styles.progressText}>Step 2 of 3</Text>
                    </View>
                    <Text style={styles.title}>Game Preferences</Text>
                    <Text style={styles.subtitle}>
                        Help us personalize your gaming experience
                    </Text>
                </View>

                {/* Strategy Board Games */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🧠 Strategy Board Games</Text>
                    <View style={styles.gameGrid}>
                        {strategyGames.map((game) => (
                            <TouchableOpacity
                                key={game}
                                style={[
                                    styles.gameChip,
                                    selectedStrategyGames.includes(game) && styles.gameChipSelected
                                ]}
                                onPress={() => toggleGameSelection(game, selectedStrategyGames, setSelectedStrategyGames)}
                            >
                                <Text style={[
                                    styles.gameChipText,
                                    selectedStrategyGames.includes(game) && styles.gameChipTextSelected
                                ]}>
                                    {game}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Puzzle Games */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🧩 Puzzle Games</Text>
                    <View style={styles.gameGrid}>
                        {puzzleGames.map((game) => (
                            <TouchableOpacity
                                key={game}
                                style={[
                                    styles.gameChip,
                                    selectedPuzzleGames.includes(game) && styles.gameChipSelected
                                ]}
                                onPress={() => toggleGameSelection(game, selectedPuzzleGames, setSelectedPuzzleGames)}
                            >
                                <Text style={[
                                    styles.gameChipText,
                                    selectedPuzzleGames.includes(game) && styles.gameChipTextSelected
                                ]}>
                                    {game}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Arcade Games */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🕹️ Arcade Games</Text>
                    <View style={styles.gameGrid}>
                        {arcadeGames.map((game) => (
                            <TouchableOpacity
                                key={game}
                                style={[
                                    styles.gameChip,
                                    selectedArcadeGames.includes(game) && styles.gameChipSelected
                                ]}
                                onPress={() => toggleGameSelection(game, selectedArcadeGames, setSelectedArcadeGames)}
                            >
                                <Text style={[
                                    styles.gameChipText,
                                    selectedArcadeGames.includes(game) && styles.gameChipTextSelected
                                ]}>
                                    {game}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Action Games */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚔️ Action Games</Text>
                    <View style={styles.gameGrid}>
                        {actionGames.map((game) => (
                            <TouchableOpacity
                                key={game}
                                style={[
                                    styles.gameChip,
                                    selectedActionGames.includes(game) && styles.gameChipSelected
                                ]}
                                onPress={() => toggleGameSelection(game, selectedActionGames, setSelectedActionGames)}
                            >
                                <Text style={[
                                    styles.gameChipText,
                                    selectedActionGames.includes(game) && styles.gameChipTextSelected
                                ]}>
                                    {game}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Sports Games */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚽ Sports Games</Text>
                    <View style={styles.gameGrid}>
                        {sportsGames.map((game) => (
                            <TouchableOpacity
                                key={game}
                                style={[
                                    styles.gameChip,
                                    selectedSportsGames.includes(game) && styles.gameChipSelected
                                ]}
                                onPress={() => toggleGameSelection(game, selectedSportsGames, setSelectedSportsGames)}
                            >
                                <Text style={[
                                    styles.gameChipText,
                                    selectedSportsGames.includes(game) && styles.gameChipTextSelected
                                ]}>
                                    {game}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Skill Level */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 Skill Level</Text>
                    <View style={styles.optionGrid}>
                        {skillLevels.map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.optionChip,
                                    skillLevel === level && styles.optionChipSelected
                                ]}
                                onPress={() => setSkillLevel(level)}
                            >
                                <Text style={[
                                    styles.optionChipText,
                                    skillLevel === level && styles.optionChipTextSelected
                                ]}>
                                    {level}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Session Length */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏱️ Preferred Session Length</Text>
                    <View style={styles.optionGrid}>
                        {sessionLengths.map((length) => (
                            <TouchableOpacity
                                key={length}
                                style={[
                                    styles.optionChip,
                                    sessionLength === length && styles.optionChipSelected
                                ]}
                                onPress={() => setSessionLength(length)}
                            >
                                <Text style={[
                                    styles.optionChipText,
                                    sessionLength === length && styles.optionChipTextSelected
                                ]}>
                                    {length}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Competitive Mode */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🏆 Competitive Gaming</Text>
                    <TouchableOpacity
                        style={[
                            styles.competitiveOption,
                            competitiveMode && styles.competitiveOptionSelected
                        ]}
                        onPress={() => setCompetitiveMode(!competitiveMode)}
                    >
                        <Text style={[
                            styles.competitiveText,
                            competitiveMode && styles.competitiveTextSelected
                        ]}>
                            {competitiveMode ? '✓' : '○'} I enjoy competitive gaming
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Selection Summary */}
                {totalSelections > 0 && (
                    <View style={styles.summarySection}>
                        <Text style={styles.summaryText}>
                            ✨ You've selected {totalSelections} games
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavigation}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipButtonText}>Skip for Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={isLoading}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
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
    section: {
        padding: 20,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    gameGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    gameChip: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        marginRight: 8,
        marginBottom: 8,
    },
    gameChipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    gameChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    gameChipTextSelected: {
        color: 'white',
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#E5E5E5',
        marginRight: 8,
        marginBottom: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    optionChipSelected: {
        backgroundColor: '#34C759',
        borderColor: '#34C759',
    },
    optionChipText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    optionChipTextSelected: {
        color: 'white',
    },
    competitiveOption: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E5E5',
    },
    competitiveOptionSelected: {
        backgroundColor: '#FF9500',
        borderColor: '#FF9500',
    },
    competitiveText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    competitiveTextSelected: {
        color: 'white',
    },
    summarySection: {
        padding: 20,
        paddingTop: 0,
    },
    summaryText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#007AFF',
        textAlign: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    bottomNavigation: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 12,
    },
    backButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#666',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FF9500',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#FF9500',
        fontSize: 16,
        fontWeight: '600',
    },
    continueButton: {
        flex: 1,
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

export default GamePreferencesScreen;
