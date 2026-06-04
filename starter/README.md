# 听刻 · 开发启动包

> 王工，这是给你的开发起点。设计全在 `../design/` 里，代码骨架在这里。

## 项目结构

```
starter/
├── README.md
├── theme/
│   └── index.ts          # 设计Token（颜色/字号/间距/圆角/阴影）
├── components/
│   ├── AudioPlayer.tsx   # 音频播放器（波形+控制+变速+循环）
│   ├── DictationInput.tsx # 听写输入组件（逐句即时判对错）
│   ├── StepIndicator.tsx # 三步进度指示器（盲听→听写→跟读）
│   └── StreakBadge.tsx   # (待建) 打卡徽章
├── screens/
│   ├── HomeScreen.tsx    # 首页
│   ├── ListenScreen.tsx  # (待建) 盲听页
│   ├── DictationScreen.tsx # (待建) 听写页
│   ├── ShadowingScreen.tsx # (待建) 跟读页
│   └── CompleteScreen.tsx  # (待建) 完成页
└── types/
    └── index.ts          # (待建) TS类型定义
```

## 使用方式

1. `npx react-native init TingKe --template react-native-template-typescript`
2. 把 `theme/` 和 `components/` 复制进项目
3. 安装依赖（见 SPRINT-1.md）
4. 从 `screens/HomeScreen.tsx` 开始写

## 设计参考

| 页面 | 设计文件 |
|------|---------|
| 首页 | `../design/v4/homepage.html` |
| 听写 | `../design/v4/dictation.html` |
| 完整设计规格 | `../design-spec.html` |
| 设计系统 | `../design-system.md` |
| 线框图 | `../wireframes.html` |

## 开发排期

详见 `../SPRINT-1.md`
