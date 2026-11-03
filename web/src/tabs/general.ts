import type { Tab } from "../types.ts";
import { configStore } from "../store/config-store.ts";
import {
    clearExcludedTimestamps,
    getStorageUsage,
    injectSkipButtonCss,
} from "../store/api.ts";
import { getAllShows } from "../store/jellyfin-client.ts";
import { el, htmlEl } from "../components/dom.ts";
import { configForm } from "../components/config-form.ts";
import { actionButton } from "../components/action-button.ts";
import { createStatusMessage } from "../components/async-feedback.ts";
import { confirmDashboard, confirmDialog, eraseCheckboxes } from "../components/confirm-dialog.ts";
import { pluralize } from "../utils.ts";

function normalizePathCandidate(value: string): string {
    let normalized = value.trim().replace(/\\/g, "/");
    while (normalized.length > 1 && normalized.endsWith("/")) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
}

function isBroadPathRoot(value: string): boolean {
    const normalized = normalizePathCandidate(value);
    if (normalized === "/" || /^[A-Za-z]:$/.test(normalized)) {
        return true;
    }

    return normalized.startsWith("//") && normalized.split("/").filter(Boolean).length === 2;
}

async function confirmPathExclusion(value: string): Promise<boolean> {
    if (!isBroadPathRoot(value)) {
        return true;
    }

    return confirmDashboard(
        "此路径似乎是文件系统根目录或驱动器根目录，排除后可能跳过媒体库中的大量内容。",
        "确认排除路径",
    );
}

async function loadMediaNameSuggestions(type: "Series" | "Movie"): Promise<string[]> {
    return (await getAllShows())
        .filter((item) => item.Type === type)
        .map((item) => item.Name)
        .sort((a, b) => a.localeCompare(b));
}

async function loadStoragePathSuggestions(): Promise<string[]> {
    const result = await getStorageUsage();
    if (!result.ok) throw new Error(result.error);
    const paths: string[] = [];
    for (const library of result.data) {
        for (const folder of library.Folders) {
            const path = folder.Path.trim();
            if (path.length > 0) {
                paths.push(path);
            }
        }
    }

    return paths;
}

export const generalTab: Tab = {
    id: "general",
    label: "常规",
    render(container, signal) {
        const form = configForm(signal);

        const injectSection = el("div", { className: "input-container" });
        injectSection.append(
            el("h3", { className: "is-section-heading" }, "注入跳过按钮 CSS"),
        );
        injectSection.append(
            el(
                "div",
                { className: "field-description" },
                "通过 @import 语句，将跳过按钮样式注入 Jellyfin 的品牌设置。",
            ),
        );

        const statusMessage = createStatusMessage();

        injectSection.append(
            actionButton("注入 CSS", async () => {
                statusMessage.show("正在注入 CSS…");
                const response = await injectSkipButtonCss();
                if (response.ok) {
                    statusMessage.show("跳过按钮 CSS 已成功注入！", "success");
                } else {
                    statusMessage.show(`注入 CSS 失败：${response.error}`, "error");
                }
            }),
        );
        injectSection.append(statusMessage.element);

        const ftWarning = htmlEl(
            "div",
            { className: "field-warning" },
            "<strong>需要 File Transformation 插件</strong><br/>" +
                "此功能需要安装 File Transformation 插件。" +
                "<a href=\"https://github.com/IAmParadox27/jellyfin-plugin-file-transformation\" target=\"_blank\">前往安装</a>",
        );
        form.visibleWhen(ftWarning, () => !configStore.get("FileTransformationPluginEnabled"));

        const clearExcludedSection = el("div", { className: "input-container" });
        clearExcludedSection.append(
            el("h3", { className: "is-section-heading" }, "清除已排除媒体的时间戳"),
            el(
                "div",
                { className: "field-description" },
                "删除当前匹配排除列表的媒体所对应的时间戳和缓存记录。",
            ),
        );

        const clearStatus = createStatusMessage();
        clearExcludedSection.append(
            actionButton("清除已排除媒体的时间戳数据", async () => {
                if (configStore.isDirty()) {
                    clearStatus.show(
                        "请先保存配置更改，再清除时间戳数据。",
                        "error",
                    );
                    return;
                }

                const result = await confirmDialog({
                    title: "清除已排除媒体的时间戳",
                    body: "删除当前匹配排除列表的媒体的时间戳数据。用户手动创建的片段，以及同季中未被排除的媒体将保留。",
                    confirmLabel: "清除",
                    checkboxes: { eraseTombstones: eraseCheckboxes.eraseTombstones },
                });
                if (!result) return;

                clearStatus.show("正在清除已排除媒体的时间戳数据…");
                const response = await clearExcludedTimestamps(result);
                if (!response.ok) {
                    clearStatus.show(response.error, "error");
                    return;
                }

                clearStatus.show(
                    `已清除 ${pluralize(response.data.RemovedSegments, "条时间戳记录", "条时间戳记录")} 和 ${pluralize(response.data.RemovedCacheEntries, "条缓存记录", "条缓存记录")}，涉及 ${pluralize(response.data.AffectedItems, "个已排除项目", "个已排除项目")}。`,
                    "success",
                );
            }, { danger: true }),
            clearStatus.element,
        );

        const fileTransformationOn = () =>
            configStore.get("UseFileTransformationPlugin") === true;

        container.append(
            form.checkboxGroup("分析类型：", [
                "ScanIntroduction",
                "ScanCredits",
                "ScanRecap",
                "ScanPreview",
                "ScanCommercial",
            ]),
            form.field("AutoDetectIntros"),
            form.field("ReanalyzeSettledSeasons"),
            form.field("SettledSeasonDelayHours", {
                visible: () => configStore.get("ReanalyzeSettledSeasons") === true,
            }),
            form.field("UseSettledSeasonChromaprintConsensus", {
                visible: () => configStore.get("ReanalyzeSettledSeasons") === true,
            }),
            form.field("SettledSeasonChromaprintConsensusEpisodes", {
                visible: () =>
                    configStore.get("ReanalyzeSettledSeasons") === true &&
                    configStore.get("UseSettledSeasonChromaprintConsensus") === true,
            }),
            form.field("UpdateMediaSegments"),
            form.field("AnalyzeSeasonZero"),
            form.list("SeriesExclusions", {
                suggestions: () => loadMediaNameSuggestions("Series"),
            }),
            form.list("MovieExclusions", {
                suggestions: () => loadMediaNameSuggestions("Movie"),
            }),
            form.list("PathExclusions", {
                suggestions: loadStoragePathSuggestions,
                confirmAdd: confirmPathExclusion,
            }),
            clearExcludedSection,
            form.field("UseFileTransformationPlugin", {
                disabled: () => !configStore.get("FileTransformationPluginEnabled"),
            }),
            ftWarning,
            form.field("SkipbuttonHideDelay", { visible: fileTransformationOn }),
            form.field("AutoSkipIntro", { visible: fileTransformationOn }),
            form.field("AutoSkipCredits", { visible: fileTransformationOn }),
            form.field("SkipButtonVisibleSeconds", { visible: fileTransformationOn }),
            injectSection,
            form.field("EnableMainMenu"),
        );
    },
};
