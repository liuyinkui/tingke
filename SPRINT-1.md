# Sprint 1 · MVP · 开发任务清单

> 目标：4–6 周上线可用的核心学习流
> 给：王工
> 参考：PRD.md + design-spec.html + design-system.md + architecture.html

---

## 一、项目初始化（Day 1–2）

### 1.1 React Native 脚手架
```bash
npx react-native init TingKe --template react-native-template-typescript
```
**必须装的依赖：**
- `@react-navigation/native` + `@react-navigation/native-stack`（导航）
- `react-native-screens` + `react-native-safe-area-context`
- `react-native-sound` 或 `react-native-track-player`（音频播放）
- `react-native-svg`（波形图用）

### 1.2 后端脚手架
```
TingKe-server/
├── src/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   └── index.ts
├── package.json
├── tsconfig.json
└── .env
```

**依赖：** Express/Fastify + TypeScript + Prisma（ORM）+ PostgreSQL

### 1.3 目录结构约定
```
TingKe/
├── src/
│   ├── screens/          # 页面组件
│   │   ├── HomeScreen.tsx
│   │   ├── ListenScreen.tsx    # 盲听
│   │   ├── DictationScreen.tsx # 听写
│   │   ├── ShadowingScreen.tsx # 跟读（二期）
│   │   ├── CompleteScreen.tsx  # 完成页
│   │   └── LibraryScreen.tsx   # 素材库
│   ├── components/       # 复用组件
│   │   ├── AudioPlayer.tsx
│   │   ├── Waveform.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── StreakBadge.tsx
│   │   └── DictationInput.tsx
│   ├── theme/            # 设计Token（见 design-system.md）
│   │   └── index.ts
│   ├── services/         # API 调用
│   └── types/            # TS 类型定义
└── ...
```

---

## 二、Sprint 1.1 · 核心学习流（Day 3–12）

### 🅿️0 优先级 · 先做这个才能交付

| # | 任务 | 文件/参考 | 验收标准 |
|---|------|---------|---------|
| 1 | **首页** | `design/v4/homepage.html`<br>design-spec.html §③ | ✅ 显示 streak 徽章<br>✅ "今日练习" 状态<br>✅ "开始今日练习" 按钮居中<br>✅ 底部文字链（素材库/个人中心） |
| 2 | **盲听页面** | `design-spec.html §④`<br>PRD §4.1 | ✅ 波形可视化<br>✅ 播放/暂停/重听<br>✅ 变速 0.5x~1.5x<br>✅ 单句循环 |
| 3 | **听写页面** | `design/v4/dictation.html`<br>design-spec.html §⑤<br>PRD §4.1 Step 2 | ✅ 逐句听写（每句一个输入区）<br>✅ 点击空格播放当前句<br>✅ 提交后即时判对错（绿/红/灰）<br>✅ 显示正确答案 |
| 4 | **完成页** | `design-spec.html §⑥`<br>PRD §4.1 Step 3 | ✅ 🎉 动画（500ms spring）<br>✅ 辨音准确率<br>✅ 盲区词汇数<br>✅ streak 更新<br>✅ 分享打卡按钮（可选）<br>✅ "明天继续" 文字链 |

### 验收检查清单（每个页面都要）
```
□ 正常态
□ 加载态（骨架屏, 不用转圈）
□ 空态（首次使用）
□ 错误态（网络失败）
□ 边界值（全对/全错/全留空）
```

---

## 三、Sprint 1.2 · 素材与数据（Day 10–16，与1.1有交叉）

| # | 任务 | 说明 |
|---|------|------|
| 5 | **素材库浏览页** | 按难度/场景/来源分类列表，点击进入学习流 |
| 6 | **素材数据模型** | PostgreSQL 建表：materials, sentences, users, learning_records |
| 7 | **预置70篇素材入库** | 来源：PRD §5 — CET-4(20) + CET-6(20) + VOA慢速(15) + VOA常速(15)<br>需逐句时间轴 |
| 8 | **后端 CRUD API** | GET /materials, GET /materials/:id, POST /records, GET /records/stats |
| 9 | **简单用户系统** | 微信登录（或手机号+验证码）<br>MVP 阶段不做密码注册 |

---

## 四、Sprint 1.3 · 跟读+统计（Day 17–22）

| # | 任务 | 说明 |
|---|------|------|
| 10 | **跟读页面** | 长按录音（微信语音交互）→ 松手提交 → 显示AI评分<br>*集成阿里云/腾讯云语音评测 SDK* |
| 11 | **个人中心** | 学习统计（累计天数/准确率曲线/时长）<br>单词本（听写错词自动收录） |
| 12 | **设置页** | 每日目标时间 · 通知提醒 · 当前水平(L1-L5) · 英音/美音偏好 |

---

## 五、二期不做清单（别碰）

```
❌ 付费系统
❌ 社交/社区/排行榜
❌ AI对话
❌ 背单词模块
❌ 游戏化（积分/皮肤）
❌ 老师端/班级功能
❌ 家长端小程序（架构图里有，但PRD说MVP不做）
```

---

## 六、设计Token速查（给王工挑代码用）

```typescript
// theme/index.ts
export const colors = {
  primary: '#1E3A5F',
  primaryLight: '#2D5A8E',
  primaryBg: '#E8EDF2',
  accent: '#FF6B35',
  accentLight: '#FF8C5A',
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textHint: '#B2BEC3',
  success: '#00B894',
  error: '#FF6B6B',
  divider: '#DFE6E9',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20,
  xl: 24, '2xl': 32, '3xl': 40, '4xl': 48,
};

export const fontSize = {
  hero: 32, h1: 24, h2: 20, h3: 17,
  body: 15, caption: 13, tag: 11,
};

export const radius = {
  sm: 4, md: 8, lg: 12, xl: 16, full: 999,
};

export const shadows = {
  card: '0 2px 8px rgba(30,58,95,0.08)',
  sheet: '0 -4px 16px rgba(30,58,95,0.12)',
  button: '0 4px 12px rgba(255,107,53,0.24)',
  modal: '0 8px 32px rgba(30,58,95,0.16)',
};
```

---

## 七、提给王工的备注

1. **设计文件全是HTML** — 直接浏览器打开 `design/v4/homepage.html` 和 `design/v4/dictation.html` 就能看到效果，不用猜设计长啥样。
2. **先做听写，再做盲听，再做完成页。** 跟读可以最后。
3. **如果跟读 SDK 集成卡住了**——先发一个"只有盲听+听写"的版本上线，不要等项目完美。
4. **素材的时间轴标注**——逐句时间轴是听写功能的基础。可以用 ffmpeg + 脚本批量生成，或者手动标。
5. **有问题问若楠**——设计规格书里每个交互细节都写了，如果还有不清楚的，直接找设计师确认。

---

*Sprint 1 计划结束 · 预计4-6周*
