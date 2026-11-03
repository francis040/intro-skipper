import assert from "node:assert/strict";
import test from "node:test";
import { supportLabel, supportValue } from "../src/components/support-labels.ts";

test("support labels localize settings without changing diagnostic identifiers", () => {
    assert.equal(supportLabel("Overview"), "概览");
    assert.equal(supportLabel("AnalysisPercent"), "媒体分析比例");
    assert.equal(supportLabel("FFmpeg version"), "FFmpeg version");
    assert.equal(supportValue("installed, enabled in settings"), "已安装，已在设置中启用");
    assert.equal(supportValue("2 changed items, 1 manual scan, library pass pending"), "2 个已更改项目, 1 个手动扫描, 媒体库扫描等待中");
    assert.equal(supportValue("2026-10-23 03:00 UTC, Completed in 14 min"), "2026-10-23 03:00 UTC, 已完成，耗时 14 分钟");
});

import { serverErrorText } from "../src/store/error-text.ts";

test("server errors localize known messages and preserve unexpected diagnostics", () => {
    assert.equal(serverErrorText("Unknown segment type '42'."), "未知的片段类型：'42'。");
    assert.equal(serverErrorText("Start must be non-negative and End must be after Start."), "开始时间不得为负数，结束时间必须晚于开始时间。");
    assert.equal(serverErrorText("native exception: code XYZ"), "native exception: code XYZ");
});
