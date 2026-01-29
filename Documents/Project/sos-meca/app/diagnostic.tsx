import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DiagnosticCard } from '../components/diagnosis/DiagnosticCard';
import { Button } from '../components/ui/Button';
import { QUESTIONS_MAP, getDiagnosticResult } from '../services/diagnosis';
import { useSOSStore } from '../stores';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

export default function DiagnosticScreen() {
  const router = useRouter();
  const { diagnosticAnswers, setDiagnosticAnswer, setDiagnosticResult, setStep } = useSOSStore();
  const [currentQuestionId, setCurrentQuestionId] = useState('mobilite');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = QUESTIONS_MAP[currentQuestionId];

  useEffect(() => {
    setSelectedOption(diagnosticAnswers[currentQuestionId] || null);
  }, [currentQuestionId, diagnosticAnswers]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setDiagnosticAnswer(currentQuestionId, optionId);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const nextQuestionId = currentQuestion?.nextQuestionMap?.[selectedOption];

    if (nextQuestionId && QUESTIONS_MAP[nextQuestionId]) {
      setCurrentQuestionId(nextQuestionId);
      setSelectedOption(null);
    } else {
      const result = getDiagnosticResult(diagnosticAnswers);
      setDiagnosticResult(result);

      if (result.besoinMecanicien) {
        setStep('location');
        router.push('/location');
      } else {
        router.push('/advice');
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionId === 'mobilite') {
      router.back();
    } else if (currentQuestionId === 'symptome') {
      setCurrentQuestionId('mobilite');
    } else {
      setCurrentQuestionId('symptome');
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.progressText}>Diagnostic</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <DiagnosticCard
              key={option.id}
              icon={option.icon}
              label={option.label}
              description={option.description}
              selected={selectedOption === option.id}
              onPress={() => handleOptionSelect(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continuer" onPress={handleNext} disabled={!selectedOption} size="lg" style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  progressText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  question: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  optionsContainer: {
    paddingBottom: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  button: {
    width: '100%',
  },
});
