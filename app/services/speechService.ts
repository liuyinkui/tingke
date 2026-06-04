/**
 * speechService — Web Speech API 语音合成服务
 *
 * 使用浏览器内置的 SpeechSynthesis 引擎，将英文文本实时转语音。
 * 无需外部音频文件，完美匹配精听练习场景。
 *
 * 功能:
 *   playText(text, rate?, pitch?)   — 朗读文本
 *   pause()                         — 暂停
 *   resume()                        — 恢复
 *   stop()                          — 停止
 *   setRate(rate)                   — 变速 (0.5~2.0)
 *   isSpeaking() → boolean          — 是否正在播放
 *   onBoundary?                     — 逐词高亮回调
 */

type BoundaryCallback = (charIndex: number, charLength: number) => void;

interface SpeechServiceState {
  isPlaying: boolean;
  paused: boolean;
  rate: number;
  pitch: number;
  voice: SpeechSynthesisVoice | null;
}

class SpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private state: SpeechServiceState = {
    isPlaying: false,
    paused: false,
    rate: 1.0,
    pitch: 1.0,
    voice: null,
  };

  /** 外界注册的边界回调（用于逐词高亮） */
  onBoundary: BoundaryCallback | null = null;

  /** 外界注册的结束回调 */
  onEnd: (() => void) | null = null;

  constructor() {
    this.initVoice();
  }

  /**
   * 初始化美式英语语音
   */
  private initVoice(): void {
    // 如果语音列表已经加载，直接选
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.selectVoice(voices);
    }
    // 否则等 onvoiceschanged 事件
    window.speechSynthesis.onvoiceschanged = () => {
      const allVoices = window.speechSynthesis.getVoices();
      this.selectVoice(allVoices);
    };
  }

  private selectVoice(voices: SpeechSynthesisVoice[]): void {
    // 优先选美式英语
    this.state.voice =
      voices.find((v) => v.lang.startsWith('en-US') && v.name.includes('Google')) ||
      voices.find((v) => v.lang.startsWith('en-US') && v.name.includes('Samantha')) ||
      voices.find((v) => v.lang.startsWith('en-US')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null;

    if (this.state.voice) {
      console.log(`[SpeechService] Selected voice: ${this.state.voice.name} (${this.state.voice.lang})`);
    }
  }

  /**
   * 朗读文本
   * @param text  要朗读的英文文本
   * @param rate  语速 (0.5~2.0，默认 1.0)
   * @param pitch 音高 (0.5~2.0，默认 1.0)
   */
  playText(text: string, rate?: number, pitch?: number): Promise<void> {
    return new Promise((resolve) => {
      // 停止当前朗读
      this.stopInternal();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.voice = this.state.voice;

      // 应用语速和音高
      if (rate !== undefined) {
        this.state.rate = rate;
      }
      if (pitch !== undefined) {
        this.state.pitch = pitch;
      }
      utterance.rate = this.state.rate;
      utterance.pitch = this.state.pitch;

      // 绑定额外的 end 回调
      let externalEndFired = false;
      utterance.onend = () => {
        this.state.isPlaying = false;
        this.state.paused = false;
        this.utterance = null;
        if (this.onEnd && !externalEndFired) {
          externalEndFired = true;
          this.onEnd();
        }
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechService] Error:', e.error);
        this.state.isPlaying = false;
        this.state.paused = false;
        this.utterance = null;
        if (this.onEnd && !externalEndFired) {
          externalEndFired = true;
          this.onEnd();
        }
        resolve();
      };

      // 逐词高亮回调
      utterance.onboundary = (e) => {
        if (e.name === 'word' && this.onBoundary) {
          this.onBoundary(e.charIndex, e.charLength);
        }
      };

      this.utterance = utterance;
      this.state.isPlaying = true;
      this.state.paused = false;

      // Chrome 需要这个小延迟来让语音引擎就绪
      window.speechSynthesis.speak(utterance);
    });
  }

  /** 暂停朗读 */
  pause(): void {
    if (this.state.isPlaying && !this.state.paused) {
      window.speechSynthesis.pause();
      this.state.paused = true;
    }
  }

  /** 恢复朗读 */
  resume(): void {
    if (this.state.isPlaying && this.state.paused) {
      window.speechSynthesis.resume();
      this.state.paused = false;
    }
  }

  /** 停止朗读 */
  stop(): void {
    this.stopInternal();
  }

  private stopInternal(): void {
    window.speechSynthesis.cancel();
    this.state.isPlaying = false;
    this.state.paused = false;
    this.utterance = null;
  }

  /** 设置语速 (0.5 ~ 2.0) */
  setRate(rate: number): void {
    this.state.rate = Math.max(0.5, Math.min(2.0, rate));
    // 如果当前正在播放，需要重启才能生效
    if (this.state.isPlaying) {
      // 记下当前文本
      const text = this.utterance?.text;
      const wasPlaying = this.state.isPlaying;
      if (text && wasPlaying) {
        const wasPaused = this.state.paused;
        this.stopInternal();
        if (!wasPaused) {
          this.playText(text);
        }
      }
    }
  }

  /** 获取当前语速 */
  getRate(): number {
    return this.state.rate;
  }

  /** 是否正在说话 */
  isSpeaking(): boolean {
    return this.state.isPlaying || window.speechSynthesis.speaking;
  }

  /** 是否处于暂停状态 */
  isPaused(): boolean {
    return this.state.paused;
  }

  /** 销毁清理 */
  dispose(): void {
    this.stopInternal();
    this.onBoundary = null;
    this.onEnd = null;
    window.speechSynthesis.onvoiceschanged = null;
  }
}

/** 单例导出 */
export const speechService = new SpeechService();
export type { BoundaryCallback };
