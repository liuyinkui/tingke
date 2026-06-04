/**
 * DictationInput — 听写输入组件
 *
 * 视觉参考: v2-minimal/dictation.html
 * 功能: 逐句听写 · 即时判对错 · 盲区词汇标记
 * 每句独立输入框，提交后显示对/错/留空状态
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme';
import { DictationResult } from '../types';

interface DictationInputProps {
  sentences: string[];
  onSubmitSentence: (index: number, result: DictationResult) => void;
}

export const DictationInput: React.FC<DictationInputProps> = ({
  sentences,
  onSubmitSentence,
}) => {
  const [inputs, setInputs] = useState<string[]>(sentences.map(() => ''));
  const [results, setResults] = useState<(DictationResult | null)[]>(
    sentences.map(() => null),
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleInputChange = useCallback((text: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[currentIndex] = text;
      return next;
    });
  }, [currentIndex]);

  /** 提交当前句 */
  const handleSubmit = useCallback(() => {
    const input = inputs[currentIndex]?.trim() ?? '';
    const original = sentences[currentIndex] ?? '';
    const correctCount = countCorrectWords(input, original);
    const totalWords = original.split(/\s+/).length;

    let status: DictationResult['status'] = 'empty';
    if (!input) {
      status = 'empty';
    } else if (input.toLowerCase() === original.toLowerCase()) {
      status = 'correct';
    } else {
      status = 'wrong';
    }

    const result: DictationResult = {
      sentenceIndex: currentIndex,
      sentence: original,
      userInput: input,
      status,
    };

    setResults((prev) => {
      const next = [...prev];
      next[currentIndex] = result;
      return next;
    });

    onSubmitSentence(currentIndex, result);
    // 自动跳下一句
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, inputs, sentences, onSubmitSentence]);

  /** 重新听当前句（placeholder） */
  const handleReplay = useCallback(() => {
    // 实际应用中触发音频播放
  }, []);

  return (
    <View style={styles.container}>
      {/* 句子列表 */}
      {sentences.map((sentence, index) => {
        const result = results[index];
        const isCurrent = index === currentIndex;

        return (
          <View key={index} style={[styles.sentenceRow, isCurrent && styles.sentenceRowCurrent]}>
            {/* 句子序号 */}
            <Text style={styles.sentenceNum}>句子 {index + 1}</Text>

            {/* 输入/结果区域 */}
            {result ? (
              // 已提交：显示结果
              <View
                style={[
                  styles.inputWrapper,
                  result.status === 'correct'
                    ? styles.correctWrapper
                    : result.status === 'wrong'
                    ? styles.wrongWrapper
                    : styles.emptyWrapper,
                ]}
              >
                <Text
                  style={[
                    styles.resultText,
                    result.status === 'correct' && styles.correctText,
                    result.status === 'wrong' && styles.wrongText,
                    result.status === 'empty' && styles.emptyText,
                  ]}
                  numberOfLines={2}
                >
                  {result.status === 'correct'
                    ? result.userInput
                    : result.status === 'wrong'
                    ? result.userInput
                    : '— 未作答 —'}
                </Text>
                <View style={styles.resultIcon}>
                  <Text>
                    {result.status === 'correct' ? '✓' : result.status === 'wrong' ? '✗' : '○'}
                  </Text>
                </View>
              </View>
            ) : (
              // 未提交：输入框
              <View style={[styles.inputWrapper]}>
                <TextInput
                  style={styles.input}
                  value={isCurrent ? inputs[index] : ''}
                  onChangeText={isCurrent ? handleInputChange : undefined}
                  placeholder={isCurrent ? '听到后输入...' : ''}
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={isCurrent}
                />
                {isCurrent && (
                  <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>↵</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 错误句子的正确答案提示 */}
            {result?.status === 'wrong' && (
              <Text style={styles.correctAnswer}>
                ✓ {result.sentence}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

/** 简单比较输入与原文中正确单词数 */
function countCorrectWords(input: string, original: string): number {
  const inWords = input.toLowerCase().split(/\s+/);
  const orWords = original.toLowerCase().split(/\s+/);
  let count = 0;
  const maxLen = Math.min(inWords.length, orWords.length);
  for (let i = 0; i < maxLen; i++) {
    if (inWords[i] === orWords[i]) count++;
  }
  return count;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  sentenceRow: {
    marginBottom: spacing.base,
  },
  sentenceRowCurrent: {},
  sentenceNum: {
    fontSize: fontSize.captionM,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    minHeight: 40,
  },
  correctWrapper: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  wrongWrapper: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  emptyWrapper: {
    borderColor: colors.divider,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: fontSize.bodyS,
    color: colors.textPrimary,
    fontFamily: 'PingFang SC',
    paddingVertical: 0,
  },
  submitBtn: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand,
  },
  resultText: {
    flex: 1,
    fontSize: fontSize.bodyS,
    color: colors.textPrimary,
    textDecorationLine: 'none',
  },
  resultIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: colors.brandLight,
  },
  correctText: {
    color: colors.textPrimary,
  },
  wrongText: {
    textDecorationLine: 'line-through',
    textDecorationColor: colors.error,
    opacity: 0.6,
  },
  emptyText: {
    color: colors.textTertiary,
  },
  correctAnswer: {
    fontSize: fontSize.captionL,
    color: colors.success,
    marginTop: spacing.sm,
    paddingLeft: spacing.sm,
  },
});
