// 听刻 · 听写输入组件
// 参考：design/v4/dictation.html + design-spec.html §⑤
// 功能：逐句听写 · 即时判对错 · 盲区词汇标记

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

interface DictationWord {
  index: number;
  original: string;
  userInput: string;
  status: 'pending' | 'correct' | 'wrong' | 'empty';
}

interface DictationInputProps {
  sentence: string;
  words: { index: number; text: string }[];
  onSentenceComplete: (results: DictationWord[]) => void;
}

export const DictationInput: React.FC<DictationInputProps> = ({
  sentence,
  words,
  onSentenceComplete,
}) => {
  const [wordStates, setWordStates] = useState<DictationWord[]>(
    words.map((w) => ({
      index: w.index,
      original: w.text,
      userInput: '',
      status: 'pending' as const,
    }))
  );
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (index: number, text: string) => {
    setWordStates((prev) =>
      prev.map((w) => (w.index === index ? { ...w, userInput: text } : w))
    );
  };

  const handleSubmit = () => {
    const results = wordStates.map((w) => {
      if (!w.userInput.trim()) {
        return { ...w, status: 'empty' as const };
      }
      return {
        ...w,
        status: (w.userInput.trim().toLowerCase() === w.original.toLowerCase()
          ? 'correct'
          : 'wrong') as 'correct' | 'wrong',
      };
    });
    setWordStates(results);
    setSubmitted(true);
    onSentenceComplete(results);
  };

  const statusColors = {
    pending: colors.divider,
    correct: colors.success,
    wrong: colors.error,
    empty: colors.textHint,
  };

  const statusLabels = {
    pending: '',
    correct: '✓',
    wrong: `✗ → ${wordStates.find((w) => w.status === 'wrong')?.original || ''}`,
    empty: '—',
  };

  return (
    <View style={styles.container}>
      {/* 句子显示：每个词一个输入框 */}
      <View style={styles.wordsRow}>
        {wordStates.map((word) => (
          <View key={word.index} style={styles.wordContainer}>
            {word.status === 'pending' ? (
              <TextInput
                style={[styles.input, { borderColor: statusColors[word.status] }]}
                value={word.userInput}
                onChangeText={(t) => handleInputChange(word.index, t)}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="..."
                placeholderTextColor={colors.textHint}
              />
            ) : (
              <View
                style={[
                  styles.resultWord,
                  { backgroundColor: word.status === 'correct' ? colors.successBg : colors.errorBg },
                ]}
              >
                <Text
                  style={[
                    styles.resultText,
                    { color: statusColors[word.status] },
                  ]}
                >
                  {word.status === 'correct'
                    ? word.userInput
                    : word.original}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 提交按钮（只在未提交时显示） */}
      {!submitted && (
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>提交</Text>
        </TouchableOpacity>
      )}

      {/* 上句结果（提交后显示） */}
      {submitted && (
        <View style={styles.resultBar}>
          {wordStates.map((word) => (
            <Text key={word.index} style={[styles.resultIcon, { color: statusColors[word.status] }]}>
              {statusLabels[word.status].split('→')[0].trim()}
              {' '}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  wordContainer: {
    marginBottom: spacing.xs,
  },
  input: {
    minWidth: 60,
    height: 36,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    textAlign: 'center',
  },
  resultWord: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  resultText: {
    fontSize: fontSize.body,
    fontWeight: '500',
  },
  submitBtn: {
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: fontSize.body,
    fontWeight: '600',
  },
  resultBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  resultIcon: {
    fontSize: fontSize.body,
    fontWeight: '500',
  },
});
