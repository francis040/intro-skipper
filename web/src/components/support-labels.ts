import { configSchema } from "../config/schema.ts";

// Translate presentation only; support JSON and copied diagnostics retain their original keys.
const labels: Readonly<Record<string, string>> = {
    Overview: "概览",
    "Jellyfin version": "Jellyfin 版本",
    "Plugin version": "插件版本",
    "Runs on": "运行平台",
    Runtime: "运行环境",
    "FFmpeg path": "FFmpeg 路径",
    "Debug logging": "调试日志",
    "Last scan": "上次扫描",
    "Scan running": "扫描状态",
    Queue: "队列",
    Warnings: "警告",
    "File Transformation plugin": "File Transformation 插件",
    "Changed settings": "已更改的设置",
    "All settings": "所有设置",
    "Fingerprint failures since the last full scan": "上次完整扫描后的音频指纹失败记录",
    unknown: "未知", Unknown: "未知", okay: "正常", unknown_error: "未知错误",
    timed_out: "已超时", on: "开启", off: "关闭", never: "从未运行",
    pending: "等待中", no: "未运行", yes: "运行中", empty: "空",
    installed: "已安装", "not installed": "未安装",
    ", enabled in settings": "，已在设置中启用",
    ", disabled in settings": "，已在设置中禁用",
    "library pass pending": "媒体库扫描等待中",
    Completed: "已完成", Failed: "失败", Cancelled: "已取消", Aborted: "已中止",
    None: "无", IncompatibleFFmpegBuild: "FFmpeg 构建不兼容",
    chromaprint_not_supported: "不支持 Chromaprint", fp_format_not_supported: "不支持原始音频指纹格式", silencedetect_not_supported: "不支持静音检测", InvalidChromaprintFingerprint: "无效的 Chromaprint 音频指纹",
};

export function supportLabel(text: string): string {
    const spec = Reflect.get(configSchema, text);
    return spec?.label ?? labels[text] ?? text;
}

export function supportValue(text: string): string {
    if (labels[text] !== undefined) return labels[text];
    return text
        .replace(/not installed|installed|, enabled in settings|, disabled in settings|library pass pending|Completed|Failed|Cancelled|Aborted/g, (word) => labels[word])
        .replace(/yes \((\d+)%\)/g, "运行中（$1%）")
        .replace(/(\d+) changed items?/g, "$1 个已更改项目")
        .replace(/(\d+) manual scans?/g, "$1 个手动扫描")
        .replace(/ in /g, "，耗时 ")
        .replace(/\b(\d+) h\b/g, "$1 小时")
        .replace(/\b(\d+) min\b/g, "$1 分钟")
        .replace(/\b(\d+) s\b/g, "$1 秒")
        .replace(/ \(default (.*)\)$/, "（默认值：$1）");
}
