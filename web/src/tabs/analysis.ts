import type { Tab } from "../types.ts";
import type { KeyOfKind } from "../config/schema.ts";
import { configStore } from "../store/config-store.ts";
import { el, htmlEl } from "../components/dom.ts";
import { configForm, type ConfigForm } from "../components/config-form.ts";

/** A min/max pair side by side. The ordering rule itself lives in the schema. */
function pairRow(
    form: ConfigForm,
    minId: KeyOfKind<"number">,
    maxId: KeyOfKind<"number">,
    visible?: () => boolean,
): HTMLElement {
    const row = el("div", { className: "side-by-side" }, form.field(minId), form.field(maxId));
    if (visible) form.visibleWhen(row, visible);
    return row;
}

export const analysisTab: Tab = {
    id: "analysis",
    label: "分析",
    render(container, signal) {
        const form = configForm(signal);

        const info = htmlEl(
            "div",
            { className: "field-description" },
            "<p>媒体分析范围由分析比例和最大时长共同决定，取“总时长 × 比例”和“最大分析时长”中的较小值。</p>" +
                "<p>更改分析比例或最大时长后，若要使用新设置分析某部剧集、某季或电影，<b>必须重新生成</b>其缓存的音频指纹和时间戳。</p>" +
                "<p>增大上述任一设置，都会明显延长分集分析时间。</p>",
        );

        const chaptersOff = () => configStore.get("FullLengthChapters") !== true;

        container.append(
            form.field("PreferChromaprint"),
            form.field("AnalysisPercent"),
            form.field("AnalysisLengthLimit"),
            info,
            pairRow(form, "MinimumRecapDuration", "MaximumRecapDuration"),
            pairRow(form, "MinimumRecapDetectionDuration", "MaximumRecapDetectionDuration"),
            pairRow(form, "MinimumIntroDuration", "MaximumIntroDuration"),
            pairRow(form, "MinimumCreditsDuration", "MaximumCreditsDuration"),
            form.field("MaximumMovieCreditsDuration"),
            pairRow(form, "MinimumPreviewDuration", "MaximumPreviewDuration", chaptersOff),
            pairRow(form, "MinimumCommercialDuration", "MaximumCommercialDuration", chaptersOff),
            form.field("FullLengthChapters"),
            form.field("EnhanceChapterCredits"),
        );
    },
};
