/**
 * audioService — expo-av 本地 WAV 音频管理服务
 *
 * 使用 expo-av Audio.Sound 播放 assets/audio/sentence_N.wav 本地文件。
 * 不再依赖 Web Speech TTS，保证 Expo web 构建后正常工作。
 *
 * 功能:
 *   loadSentences(count)      — 预加载所有句子音频
 *   playSentence(index)       — 播放某一句
 *   pause()                   — 暂停
 *   resume()                  — 恢复
 *   stop()                    — 停止
 *   setSpeed(rate)            — 变速 (0.5~2.0)
 *   seekTo(positionMillis)    — 跳转到指定位置
 *   getDurationMillis()       — 当前音频时长
 *   getPositionMillis()       — 当前播放位置
 *
 * 状态:
 *   isPlaying                 — 是否正在播放
 *   currentIndex              — 当前播放句索引
 *   onEnd                     — 播放完成回调
 *   onPlaybackStatusUpdate    — 播放状态变化回调 (位置/进度)
 */

import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess, RecordingOptionsPresets } from 'expo-av';

// 音频源映射：assets/audio/sentence_{n}.wav
const audioSources = [
  require('../../assets/audio/sentence_0.wav'),
  require('../../assets/audio/sentence_1.wav'),
  require('../../assets/audio/sentence_2.wav'),
  require('../../assets/audio/sentence_3.wav'),
  require('../../assets/audio/sentence_4.wav'),
  require('../../assets/audio/sentence_5.wav'),
];

export interface AudioServiceState {
  isPlaying: boolean;
  isPaused: boolean;
  currentIndex: number;
  rate: number;
  durationMillis: number;
  positionMillis: number;
}

class AudioService {
  /** 所有预加载的 Sound 实例 */
  private sounds: (Audio.Sound | null)[] = [];
  /** 当前播放中的 Sound 实例 */
  private currentSound: Audio.Sound | null = null;
  /** 当前状态 */
  private state: AudioServiceState = {
    isPlaying: false,
    isPaused: false,
    currentIndex: -1,
    rate: 1.0,
    durationMillis: 0,
    positionMillis: 0,
  };

  /** 播放完成回调 */
  onEnd: (() => void) | null = null;
  /** 播放状态变化回调 (位置/进度更新) */
  onPlaybackStatusUpdate: ((status: AudioServiceState) => void) | null = null;

  /** 录音相关 */
  private recording: Audio.Recording | null = null;
  private _isRecording: boolean = false;
  private _recordingDurationMs: number = 0;

  get isRecording(): boolean {
    return this._isRecording;
  }

  get recordingDurationMs(): number {
    return this._recordingDurationMs;
  }

  /**
   * 开始录音
   * 使用 expo-av Audio.Recording API
   * Web 浏览器自动请求麦克风权限
   */
  async startRecording(): Promise<void> {
    try {
      // 切换到录音模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      this.recording = recording;
      this._isRecording = true;
      this._recordingDurationMs = 0;

      // 监听录音时长
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          this._recordingDurationMs = status.durationMillis ?? 0;
        }
      });
    } catch (error) {
      console.warn('[AudioService] Failed to start recording:', error);
      this._isRecording = false;
      throw error;
    }
  }

  /**
   * 停止录音，返回录音文件 URI
   * @returns 录音文件 URI (wav/m4a 格式依平台而定)
   */
  async stopRecording(): Promise<string> {
    if (!this.recording || !this._isRecording) {
      throw new Error('[AudioService] No recording in progress');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this._isRecording = false;

      // 恢复播放模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      if (!uri) {
        throw new Error('[AudioService] Recording URI is null');
      }

      return uri;
    } catch (error) {
      console.warn('[AudioService] Failed to stop recording:', error);
      this.recording = null;
      this._isRecording = false;
      throw error;
    }
  }

  /**
   * 播放录音文件
   * @param uri 录音文件 URI（来自 stopRecording 的返回值）
   */
  async playRecording(uri: string): Promise<void> {
    // 停止当前播放
    await this.stopInternal();

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          const s = status as AVPlaybackStatusSuccess;
          this.state.isPlaying = s.isPlaying;

          if (s.didJustFinish) {
            this.state.isPlaying = false;
            this.currentSound = null;
            if (this.onEnd) {
              this.onEnd();
            }
          }
        },
      );
      this.currentSound = sound;
      this.state.isPlaying = true;
    } catch (error) {
      console.warn('[AudioService] Failed to play recording:', error);
      throw error;
    }
  }

  private sentenceCount: number = 0;

  constructor() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    });
  }

  /**
   * 预加载指定数量的句子音频
   * @param count 句子数量 (默认 audioSources.length)
   */
  async loadSentences(count: number = audioSources.length): Promise<void> {
    this.sentenceCount = Math.min(count, audioSources.length);
    this.sounds = new Array(this.sentenceCount).fill(null);

    for (let i = 0; i < this.sentenceCount; i++) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          audioSources[i],
          { shouldPlay: false, rate: this.state.rate },
          (status) => this.handlePlaybackStatus(i, status),
        );
        this.sounds[i] = sound;
      } catch (error) {
        console.warn(`[AudioService] Failed to load sentence ${i}:`, error);
      }
    }
    console.log(`[AudioService] Loaded ${this.sentenceCount} sentences`);
  }

  /**
   * 单个 Sound 实例的播放状态回调
   */
  private handlePlaybackStatus(index: number, status: AVPlaybackStatus): void {
    if (!status.isLoaded) return;

    const s = status as AVPlaybackStatusSuccess;

    // 只在当前播放的句子上分发状态
    if (index === this.state.currentIndex) {
      this.state.durationMillis = s.durationMillis ?? 0;
      this.state.positionMillis = s.positionMillis ?? 0;
      this.state.isPlaying = s.isPlaying;

      if (s.didJustFinish) {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.currentSound = null;
        if (this.onEnd) {
          this.onEnd();
        }
      }

      if (this.onPlaybackStatusUpdate) {
        this.onPlaybackStatusUpdate({ ...this.state });
      }
    }
  }

  /**
   * 播放指定索引的句子
   * @param index 句子索引 (0-based)
   */
  async playSentence(index: number): Promise<void> {
    if (index < 0 || index >= this.sentenceCount) {
      console.warn(`[AudioService] Invalid sentence index: ${index}`);
      return;
    }

    // 停止当前播放
    await this.stopInternal();

    const sound = this.sounds[index];
    if (!sound) {
      console.warn(`[AudioService] Sound ${index} not loaded`);
      return;
    }

    this.state.currentIndex = index;
    this.currentSound = sound;

    try {
      // 设置当前语速
      await sound.setRateAsync(this.state.rate, false);
      await sound.playAsync();
    } catch (error) {
      console.warn(`[AudioService] Failed to play sentence ${index}:`, error);
    }
  }

  /** 暂停 */
  async pause(): Promise<void> {
    if (this.currentSound && this.state.isPlaying) {
      try {
        await this.currentSound.pauseAsync();
        this.state.isPaused = true;
      } catch (error) {
        console.warn('[AudioService] Pause failed:', error);
      }
    }
  }

  /** 恢复 */
  async resume(): Promise<void> {
    if (this.currentSound && this.state.isPaused) {
      try {
        await this.currentSound.playAsync();
        this.state.isPaused = false;
      } catch (error) {
        console.warn('[AudioService] Resume failed:', error);
      }
    }
  }

  /** 停止 */
  async stop(): Promise<void> {
    await this.stopInternal();
  }

  private async stopInternal(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
      } catch {
        // ignore
      }
    }
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.positionMillis = 0;
    this.currentSound = null;
  }

  /**
   * 设置语速 (0.5 ~ 2.0)
   * expo-av 可以直接在播放中更改速率
   */
  async setSpeed(rate: number): Promise<void> {
    this.state.rate = Math.max(0.5, Math.min(2.0, rate));
    if (this.currentSound) {
      try {
        // shouldCorrectPitch = false 保持音调不变（类似 Web Speech 效果）
        await this.currentSound.setRateAsync(this.state.rate, false);
      } catch (error) {
        console.warn('[AudioService] Set rate failed:', error);
      }
    }
  }

  /**
   * 跳转到指定位置（毫秒）
   */
  async seekTo(positionMillis: number): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.setPositionAsync(positionMillis);
      } catch (error) {
        console.warn('[AudioService] Seek failed:', error);
      }
    }
  }

  /** 获取当前音频总时长 (毫秒) */
  getDurationMillis(): number {
    return this.state.durationMillis;
  }

  /** 获取当前播放位置 (毫秒) */
  getPositionMillis(): number {
    return this.state.positionMillis;
  }

  /** 获取当前语速 */
  getRate(): number {
    return this.state.rate;
  }

  /** 是否正在播放 */
  isPlaying(): boolean {
    return this.state.isPlaying;
  }

  /** 是否处于暂停状态 */
  isPaused(): boolean {
    return this.state.isPaused;
  }

  /** 获取当前播放索引 */
  getCurrentIndex(): number {
    return this.state.currentIndex;
  }

  /**
   * 重新加载所有音频 (例如重新进入页面时调用)
   */
  async reload(): Promise<void> {
    await this.unloadAll();
    await this.loadSentences(this.sentenceCount || audioSources.length);
  }

  /** 卸载所有 Sound 实例 */
  async unloadAll(): Promise<void> {
    await this.stopInternal();
    for (const sound of this.sounds) {
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch {
          // ignore
        }
      }
    }
    this.sounds = [];
    this.state.currentIndex = -1;
  }

  /** 销毁清理 */
  async dispose(): Promise<void> {
    // 清理录音
    if (this.recording) {
      try {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording) {
          await this.recording.stopAndUnloadAsync();
        }
      } catch {
        // ignore
      }
      this.recording = null;
    }
    this._isRecording = false;
    this._recordingDurationMs = 0;

    await this.unloadAll();
    this.onEnd = null;
    this.onPlaybackStatusUpdate = null;
  }
}

/** 单例导出 */
export const audioService = new AudioService();
