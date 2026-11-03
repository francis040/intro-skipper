// The one declaration of every plugin setting the dashboard edits. The
// PluginConfig type, the validator, the form controls and the tabs all read
// from here. Which tab shows a field, and in what order, is the tab's own
// business; a field's visibility rule stays with the tab too, because it needs
// the config store.

import type { FieldKind, FieldSchema, KeysOfKind, ValuesOf } from "./field-spec.ts";

const PATTERN_TAIL = "(?![\\s:]+End)(\\s|:|$)";

export const configSchema = {
    // General
    AutoDetectIntros: {
        kind: "checkbox",
        label: "自动分析新增媒体",
        description:
            "启用后，媒体加入媒体库时将自动分析可跳过的片段。<br/><br/>注意：如需配置定时任务，请前往<a href=\"#/dashboard/tasks\">计划任务</a>。",
    },
    ReanalyzeSettledSeasons: {
        kind: "checkbox",
        label: "重新分析已稳定的季",
        description:
            "某季在设定时间内没有新增分集时，使用缓存的音频指纹重新分析整季，并根据完整的一季重新计算片段，无需重新解码媒体。",
    },
    UseSettledSeasonChromaprintConsensus: {
        kind: "checkbox",
        label: "要求 Chromaprint 达成共识",
        description:
            "重新分析已稳定的季时，要求局部关联的分集组具有共同的片头或片尾模式，才将该模式确认为片段。",
    },
    SettledSeasonChromaprintConsensusEpisodes: {
        kind: "number",
        label: "共识分集数阈值",
        min: 2,
        max: 1000,
        step: 1,
        description:
            "确认共同模式所需的不同分集目标数量。可比较的模式组可以降低目标，以适应季中主题曲变化；覆盖至少四分之三可用音频指纹的单个组，也可在未达到目标时通过确认。",
    },
    SettledSeasonDelayHours: {
        kind: "number",
        label: "季稳定等待时间（小时）",
        min: 0,
        max: 87600,
        step: 1,
        description:
            "某季连续这么多小时没有新增分集后，视为已稳定。默认 24 小时；对于每周更新的剧集，可适当增大。",
    },
    UpdateMediaSegments: {
        kind: "checkbox",
        label: "扫描时补全缺失的媒体片段",
        description:
            "启用后，扫描媒体库时会更新所有未缓存媒体的片段，包括新增、修改或先前跳过（但未被忽略）的文件。<br/><b>警告：</b>如果还使用其他媒体片段提供程序，请禁用此选项。",
    },
    SeriesExclusions: {
        kind: "list",
        label: "排除的剧集",
        placeholder: "剧集名称",
        description:
            "按剧集名称精确匹配，不区分大小写。输入文字可从媒体库中选择。",
    },
    MovieExclusions: {
        kind: "list",
        label: "排除的电影",
        placeholder: "电影名称",
        description:
            "按电影名称精确匹配，不区分大小写。输入文字可从媒体库中选择。",
    },
    PathExclusions: {
        kind: "list",
        label: "排除的路径",
        placeholder: "/media/library",
        description:
            "匹配所列路径及其子路径。服务器提供存储文件夹信息时，可从建议中选择。",
    },
    ScanIntroduction: { kind: "checkbox", label: "片头" },
    ScanCredits: { kind: "checkbox", label: "片尾" },
    ScanRecap: { kind: "checkbox", label: "回顾" },
    ScanPreview: { kind: "checkbox", label: "预览" },
    ScanCommercial: { kind: "checkbox", label: "广告" },
    AnalyzeSeasonZero: {
        kind: "checkbox",
        label: "分析第 0 季（特别篇／花絮）",
        description:
            "注意：如果剧集同时包含特别篇和花絮文件夹，花絮会被识别为第 0 季，特别篇则会被忽略，与此设置无关。",
    },
    UseFileTransformationPlugin: {
        kind: "checkbox",
        label: "使用 File Transformation 插件修改网页界面",
    },
    SkipbuttonHideDelay: {
        kind: "number",
        label: "跳过按钮隐藏延迟（秒）",
        min: 0,
        max: 1000,
        description:
            "跳过按钮自动隐藏前的等待时间。设为 0 时，按钮始终显示。",
        warning:
            "注意：此设置仅适用于网页客户端（浏览器、LG webOS、启用网页播放器的 Android 等）。可能需要刷新或清除缓存才能生效。",
    },
    AutoSkipIntro: {
        kind: "checkbox",
        label: "自动跳过片头",
        description:
            "自动跳过片头，不显示跳过按钮。用户在 Jellyfin 设置中明确指定的偏好将保留。",
    },
    AutoSkipCredits: {
        kind: "checkbox",
        label: "自动跳过片尾",
        description:
            "自动跳过片尾，不显示跳过按钮。用户在 Jellyfin 设置中明确指定的偏好将保留。",
    },
    SkipButtonVisibleSeconds: {
        kind: "number",
        label: "在片段结束前隐藏跳过按钮（秒）",
        min: 0,
        max: 600,
        step: 1,
        description:
            "在片段结束前这么多秒隐藏跳过按钮。设为 0 可关闭此限制。常规的跳过按钮隐藏延迟仍然有效。",
    },
    EnableMainMenu: {
        kind: "checkbox",
        label: "在主菜单中显示 Intro Skipper",
        description:
            "控制服务器主导航中的 Intro Skipper 入口。保存后刷新客户端或清除缓存即可生效。",
    },

    // Analysis
    PreferChromaprint: {
        kind: "checkbox",
        label: "优先使用 Chromaprint 分析",
        description:
            "检测片头和回顾时，在章节分析器之前运行 Chromaprint。片尾检测不受此设置影响。",
    },
    EnhanceChapterCredits: {
        kind: "checkbox",
        label: "增强章节片尾检测",
        description:
            "启用后，将已识别的片尾章节与黑帧及 Chromaprint 结果合并，可延长片尾或发现额外片尾段。片尾将在下次扫描时重新分析。",
    },
    FullLengthChapters: {
        kind: "checkbox",
        label: "章节不受时长限制",
        description:
            "当章节标记超出比例或时长等其他用户设置时，允许片段延伸至章节末尾。",
    },
    AnalysisPercent: {
        kind: "number",
        label: "媒体分析比例",
        min: 1,
        max: 50,
        description:
            "按每个项目总时长的此比例限制分析范围。例如默认值 25 表示只分析每个项目的前四分之一。",
    },
    AnalysisLengthLimit: {
        kind: "number",
        label: "最大分析时长（分钟）",
        min: 1,
        description:
            "按此时长限制每个项目的分析范围。例如默认值 10 表示只分析每个项目的前 10 分钟。",
    },
    MinimumRecapDuration: {
        kind: "number",
        label: "回顾章节最短时长（秒）",
        min: 1,
        description:
            "短于此时长的回顾章节不会被视为回顾。",
    },
    MaximumRecapDuration: {
        kind: "number",
        label: "回顾章节最长时长（秒）",
        min: 1,
        description:
            "长于此时长的回顾章节不会被视为回顾。",
    },
    MinimumRecapDetectionDuration: {
        kind: "number",
        label: "回顾检测最短时长（秒）",
        min: 1,
        description: "通过黑帧或 Chromaprint 检测回顾时，不会检出短于此时长的片段。",
    },
    MaximumRecapDetectionDuration: {
        kind: "number",
        label: "回顾检测最长时长（秒）",
        min: 1,
        description:
            "通过黑帧或 Chromaprint 检测回顾时，超出此时长的片段将被截断或忽略。",
    },
    MinimumIntroDuration: {
        kind: "number",
        label: "片头最短时长（秒）",
        min: 1,
        description:
            "短于此时长的片段或相似音频不会被视为片头。",
    },
    MaximumIntroDuration: {
        kind: "number",
        label: "片头最长时长（秒）",
        min: 1,
        description:
            "长于此时长的片段或相似音频不会被视为片头。",
    },
    MinimumCreditsDuration: {
        kind: "number",
        label: "片尾最短时长（秒）",
        min: 1,
        description:
            "短于此时长的片段或相似音频不会被视为片尾。",
    },
    MaximumCreditsDuration: {
        kind: "number",
        label: "片尾最长时长（秒）",
        min: 1,
        description:
            "长于此时长的片段或相似音频不会被视为片尾。",
    },
    MaximumMovieCreditsDuration: {
        kind: "number",
        label: "电影片尾最长时长（秒）",
        min: 1,
        description: "长于此时长的片段不会被视为电影片尾。",
    },
    MinimumPreviewDuration: {
        kind: "number",
        label: "预览最短时长（秒）",
        min: 1,
        description: "短于此时长的片段不会被视为预览。",
    },
    MaximumPreviewDuration: {
        kind: "number",
        label: "预览最长时长（秒）",
        min: 1,
        description: "长于此时长的片段不会被视为预览。",
    },
    MinimumCommercialDuration: {
        kind: "number",
        label: "广告最短时长（秒）",
        min: 1,
        description:
            "短于此时长的片段不会被视为广告。",
    },
    MaximumCommercialDuration: {
        kind: "number",
        label: "广告最长时长（秒）",
        min: 1,
        description:
            "长于此时长的片段不会被视为广告。",
    },

    // Detection
    SnapToKeyframe: {
        kind: "checkbox",
        label: "启用关键帧对齐",
        description:
            "将片段结束时间移至最近的关键帧，使跳转落在完整画面上。直接取自章节的结束时间仍保持在章节标记处。",
    },
    AdjustIntroBasedOnChapters: {
        kind: "checkbox",
        label: "启用章节对齐",
        description:
            "启用后，片段开始和结束时间将调整至最近的章节边界。",
    },
    AdjustIntroBasedOnSilence: {
        kind: "checkbox",
        label: "启用静音检测",
        description:
            "将片段结束时间移至调整范围内的第一处静音。直接取自章节的结束时间仍保持在章节标记处。",
    },
    SilenceDetectionMaximumNoise: {
        kind: "number",
        label: "噪声容限",
        min: -90,
        max: 0,
        description: "噪声容限，以负分贝表示。",
    },
    SilenceDetectionMinimumDuration: {
        kind: "number",
        label: "最短静音时长",
        min: 0,
        step: 0.01,
        description: "调整片头结束时间前所需的最短静音时长，单位为秒。",
    },
    AdjustWindowInward: {
        kind: "number",
        label: "向内调整范围",
        min: 0,
        description:
            "在已检测片段内部寻找更合适起止点的最大秒数。增大此值可从片段开头或末尾裁去更多时间。",
    },
    AdjustWindowOutward: {
        kind: "number",
        label: "向外调整范围",
        min: 0,
        description:
            "在已检测片段外部寻找更合适起止点的最大秒数。增大此值可在片段前后包含更多时间。",
    },
    EndSnapThreshold: {
        kind: "number",
        label: "对齐至分集起止点的阈值",
        min: 0,
        description:
            "当片段起止时间距分集起止点不超过此秒数时，自动对齐至分集边界。设为 0 可关闭此功能。",
    },
    FirstEpisodeIntroMode: {
        kind: "select",
        label: "每季首集的片头处理方式",
        options: [
            { value: "Analyze", label: "分析首集片头" },
            { value: "Ignore", label: "忽略首集片头" },
            { value: "IgnoreAnime", label: "仅忽略动漫首集片头" },
        ],
        description:
            "为每一季选择：分析首集片头、忽略首集片头，或仅在剧集为动漫时忽略首集片头。",
    },
    AnimePreviewFromCreditsEnd: {
        kind: "checkbox",
        label: "将动漫片尾后的内容设为预览",
        description:
            "启用后，如果未检测到预览，则从最后一段片尾的结尾到分集结束创建预览片段。也可在“时间戳 > 管理”中为任意季或剧集单独设置。",
    },
    IntroStartOffset: {
        kind: "number",
        label: "片头开始偏移（秒）",
        min: 0,
        step: 0.5,
        description:
            "默认值：0。例如设为 3 时，将先播放片头的前 3 秒，再执行跳过。",
    },
    IncludeIntroStartOffsetWhenSnapping: {
        kind: "checkbox",
        label: "对齐至分集开头时也应用开始偏移",
        description:
            "启用后，当检测到的片头开始时间对齐至分集开头时，也应用片头开始偏移。",
    },
    IntroEndOffset: {
        kind: "number",
        label: "片头结束偏移（秒）",
        min: 0,
        step: 0.5,
        description:
            "默认值：0。例如设为 3 时，将从片头结束前 3 秒处恢复播放。",
    },

    // Black frame
    DetectRecapUsingBlackFrames: {
        kind: "checkbox",
        label: "使用黑帧检测回顾",
        description:
            "章节回顾检测失败时，在回顾检测时长限制内、片头之前，将 0:00 到最后一个检测到的黑帧标记为回顾。",
    },
    AnchorRecapToColdOpen: {
        kind: "checkbox",
        label: "保留回顾前的开场剧情",
        description:
            "将 Chromaprint 回顾的起点设为共同的“前情提要”提示音之前的黑帧，而非 0:00，以免跳过回顾前的剧情。章节回顾和仅由黑帧检测到的回顾仍从 0:00 开始。如果同时启用上方选项，必须先运行 Chromaprint（“分析”页中的“优先使用 Chromaprint 分析”），否则黑帧回顾会在 Chromaprint 运行前将起点定为 0:00。",
    },
    // No tab renders this. The Black Frame tab reads it to decide which of the
    // legacy and modern toggles to show.
    UseLegacyBlackFrameAnalyzer: { kind: "checkbox", label: "使用旧版黑帧分析器" },
    RefineCreditsBoundary: {
        kind: "checkbox",
        label: "精确调整片尾边界",
        description:
            "逐帧分析以确定精确的片尾边界。禁用可加快分析，但精度仅达到关键帧级别。",
    },
    DetectNonBlackCredits: {
        kind: "checkbox",
        label: "检测卡片式片尾",
        description:
            "同时检测在近乎纯色背景上显示文字的卡片式片尾，支持黑、白、灰或低饱和度背景。结果会与黑帧及其他片尾候选合并，包含滚动片尾前后的卡片式片尾。不支持鲜艳、高饱和度背景。",
    },
    UseChapterMarkersBlackFrame: {
        kind: "checkbox",
        label: "使用章节标记辅助检测片尾",
        description:
            "启用后，尝试通过章节标记附近的黑帧识别片尾片段。",
    },
    BlackFrameMinimumPercentage: {
        kind: "number",
        label: "黑色像素最低比例",
        min: 0,
        max: 100,
        description:
            "画面中黑色像素达到此最低比例时，才视为黑帧。默认值为 85。",
    },
    BlackFrameThreshold: {
        kind: "number",
        label: "黑帧阈值",
        min: 16,
        max: 255,
        description: "像素值低于此阈值时视为黑色。默认值为 28。",
    },

    // Chapters
    UseEmbeddedChaptersForAnalysis: {
        kind: "checkbox",
        label: "使用媒体文件内嵌章节进行分析",
        description:
            "从媒体文件读取章节，而非使用 Jellyfin 的章节表，从而忽略其他插件添加的章节。更改后，下次分析会为每个被分析的分集探测一次章节，仅重新分析文件章节与数据库章节不同的分集。启用期间，每个被分析的分集会额外调用一次 ffprobe。",
    },
    ChapterAnalyzerIntroductionPattern: {
        kind: "regex",
        label: "片头",
        description: "输入用于识别片头章节的正则表达式。",
        default: "(^|\\s)(Intro|Introduction|OP|Opening)" + PATTERN_TAIL,
    },
    ChapterAnalyzerEndCreditsPattern: {
        kind: "regex",
        label: "片尾",
        description: "输入用于识别片尾章节的正则表达式。",
        default: "(^|\\s)(Credits?|ED|Ending|Outro)" + PATTERN_TAIL,
    },
    ChapterAnalyzerPreviewPattern: {
        kind: "regex",
        label: "预览",
        description: "输入用于识别预览章节的正则表达式。",
        default:
            "(^|\\s)(Preview|PV|Sneak\\s?Peek|Coming\\s?(Up|Soon)|Next\\s+(time|on|episode)|Extra|Teaser|Trailer)" +
            PATTERN_TAIL,
    },
    ChapterAnalyzerRecapPattern: {
        kind: "regex",
        label: "回顾",
        description: "输入用于识别回顾章节的正则表达式。",
        default:
            "(^|\\s)(Re?cap|Sum{1,2}ary|Prev(ious(ly)?)?|(Last|Earlier)(\\s\\w+)?|Catch[ -]up)" +
            PATTERN_TAIL,
    },
    ChapterAnalyzerCommercialPattern: {
        kind: "regex",
        label: "广告",
        description: "输入用于识别广告章节的正则表达式。",
        default: "(^|\\s)(Ad(vert(isement)?)?|Commercial|Intermission)" + PATTERN_TAIL,
    },
    EnableSponsorBlockChapterDetection: {
        kind: "checkbox",
        label: "启用 SponsorBlock 章节检测",
        description:
            "除上述正则表达式外，也识别已知的 SponsorBlock 章节标签。",
    },

    // Subtitles
    SubtitleLanguages: {
        kind: "text",
        label: "字幕语言",
        placeholder: "ger, eng",
        description:
            "要读取的语言代码，以逗号分隔。留空表示读取全部语言。回顾标题卡通常只出现在翻译字幕中，仅读取音轨语言可能遗漏。",
    },
    SubtitleRecapPattern: {
        kind: "regex",
        label: "字幕回顾正则表达式",
        description:
            "匹配用于提示回顾的文本字幕。在“时间戳 > 管理”中为某季或剧集启用回顾匹配。",
        default:
            "\\bpreviously\\s+on|^\\W*(?:zuvor\\s+bei|zuletzt\\s+bei|was\\s+bisher\\s+geschah|bisher\\s+bei|anteriormente|previamente|précédemment|wat\\s+voorafging)|episodio?\\s+precedent[ei]|^\\W*前回までは|前情提要|지난\\s*이야기\\W*$",
    },
    SubtitlePreviewPattern: {
        kind: "regex",
        label: "字幕预览正则表达式",
        description:
            "匹配用于提示预览的文本字幕。在“时间戳 > 管理”中为某季或剧集启用预览匹配。",
        default:
            "\\b(?:here(?:'|’)?s|now)\\s+the\\s+preview\\b|^\\W*(?:\\[[^\\]]*\\]|\\([^)]*\\)|[^\\s:]+:)?\\s*next\\s+time\\b",
    },
    // FFmpeg
    PreferredAudioLanguage: {
        kind: "text",
        label: "首选音轨语言",
        placeholder: "eng",
        description:
            "生成 Chromaprint 音频指纹时，优先选择带有此语言标签的音轨。留空或无匹配时，使用下方的音轨选择策略。",
    },
    PreferAudioStreamWithMostChannels: {
        kind: "checkbox",
        label: "优先选择声道数最多的音轨",
        description:
            "启用后，Chromaprint 使用 FFmpeg 的音轨选择顺序：默认音轨优先，其次比较声道数，最后比较音轨顺序。禁用时，选择第一条音轨。",
    },
    ProbeAudioDuration: {
        kind: "checkbox",
        label: "探测音轨时长以检测片尾",
        description:
            "当容器总时长大于音频时长时，使用 ffprobe 获取第一条音轨的时长，并据此生成片尾音频指纹。",
    },
    MaxParallelism: {
        kind: "number",
        label: "最大并行数",
        min: 1,
        description: "同时分析的最大季数；同一季内的分集按顺序分析。",
    },
    ProcessPriority: {
        kind: "select",
        label: "FFmpeg 优先级",
        options: [
            { value: "Idle", label: "空闲" },
            { value: "BelowNormal", label: "低于正常" },
            { value: "Normal", label: "正常" },
            { value: "AboveNormal", label: "高于正常" },
            { value: "High", label: "高" },
            { value: "RealTime", label: "最高" },
        ],
        description:
            "分析用 FFmpeg 进程的优先级。低于正常可减少资源争用；实时优先级可能导致其他任务得不到资源。",
    },
    ProcessThreads: {
        kind: "number",
        label: "FFmpeg 编解码线程数",
        min: 0,
        max: 16,
        description:
            "每个 FFmpeg 进程的编解码线程数。设为 0 由 FFmpeg 自动选择。降低可减少 CPU 占用，但可能减慢扫描；可通过最大并行数限制进程数量。",
    },
    ScanTimeoutSeconds: {
        kind: "number",
        label: "FFmpeg 扫描超时（秒）",
        min: 0,
        description:
            "终止运行时间超过此值的音频指纹或检测扫描。慢速磁盘上的高码率媒体可适当增大。设为 0 可关闭超时限制。",
    },
    CacheCompressionLevel: {
        kind: "select",
        label: "缓存压缩级别",
        options: [
            { value: "NoCompression", label: "不压缩" },
            { value: "Fastest", label: "最快" },
            { value: "Optimal", label: "最佳" },
            { value: "SmallestSize", label: "最小体积" },
        ],
        description:
            "设置检测缓存的 Brotli 压缩级别。" +
            "更高的压缩率可减少磁盘占用，但会增加分析时的 CPU 耗时。" +
            "更改只影响新生成的缓存数据。",
    },
} as const satisfies FieldSchema;

export type ConfigSchema = typeof configSchema;
export type ConfigKey = keyof ConfigSchema;

/**
 * The plugin configuration as the server sends it. Every schema key is
 * editable. The rest are only read: FileTransformationPluginEnabled is set by
 * the server, and the subtitle detection values are what a season without its
 * own subtitle override inherits.
 */
export type PluginConfig = ValuesOf<ConfigSchema> & {
    readonly FileTransformationPluginEnabled: boolean;
    readonly EnableSubtitleRecapDetection: boolean;
    readonly EnableSubtitlePreviewDetection: boolean;
};

/** Config keys whose value has type V, so a control binds only to keys it can hold. */
export type ConfigKeysOfType<V> = {
    [K in ConfigKey]: PluginConfig[K] extends V ? K : never;
}[ConfigKey];

/** Config keys whose schema entry has the given kind. */
export type KeyOfKind<Kd extends FieldKind> = KeysOfKind<ConfigSchema, Kd>;

export const configKeys = Object.keys(configSchema) as ConfigKey[];

export function isKind<Kd extends FieldKind>(key: ConfigKey, kind: Kd): key is KeyOfKind<Kd> {
    return configSchema[key].kind === kind;
}

/** Min/max field pairs that must stay ordered; validation flags both sides. */
export const orderedPairs = [
    ["MinimumIntroDuration", "MaximumIntroDuration"],
    ["MinimumCreditsDuration", "MaximumCreditsDuration"],
    ["MinimumRecapDuration", "MaximumRecapDuration"],
    ["MinimumRecapDetectionDuration", "MaximumRecapDetectionDuration"],
    ["MinimumPreviewDuration", "MaximumPreviewDuration"],
    ["MinimumCommercialDuration", "MaximumCommercialDuration"],
] as const satisfies readonly (readonly [ConfigKeysOfType<number>, ConfigKeysOfType<number>])[];
