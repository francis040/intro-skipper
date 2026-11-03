// Only display text changes; routes, HTTP status and response payloads stay untouched.
const messages: Readonly<Record<string, string>> = {
    "Start must be non-negative and End must be after Start.": "开始时间不得为负数，结束时间必须晚于开始时间。",
    "EndTicks must be after StartTicks and both must be non-negative.": "EndTicks 必须大于 StartTicks，且两者均不得为负数。",
    "If-Match must contain a valid entity-tag list returned by GET /MediaSegmentsApi/{itemId}.": "If-Match 必须包含 GET /MediaSegmentsApi/{itemId} 返回的有效实体标签列表。",
    "Every segment must be non-null.": "每个片段都不得为空。",
    "Every segment must belong to the requested item.": "每个片段都必须属于请求的媒体项目。",
    "Analysis overrides are outside the supported range.": "分析覆盖设置超出支持范围。",
    "The segment image has changed since it was read.": "片段在读取后已被其他操作修改，请刷新后重试。",
    "Item ID must not be empty.": "项目 ID 不得为空。",
    "Segment ID must not be empty.": "片段 ID 不得为空。",
    "Invalid mode or tick range.": "无效的检测模式或时间范围。",
    "Invalid mode, tick range, or duplicate segment ID.": "检测模式或时间范围无效，或存在重复的片段 ID。",
    "Invalid tick range.": "无效的时间范围。",
    "Invalid segment type.": "无效的片段类型。",
    "The user segment already exists.": "手动片段已存在。",
    "Segment was not found on the item or is suppressed.": "未找到此项目的片段，或片段已被屏蔽。",
    "Segment was not found on the item or was already deleted.": "未找到此项目的片段，或片段已被删除。",
    "Segment was not found on the item or was not suppressed.": "未找到此项目的片段，或片段未被屏蔽。",
    "The segment is already deleted.": "片段已被删除。",
    "External segment was not found.": "未找到外部片段。",
    "External segment belongs to another item.": "外部片段属于其他媒体项目。",
    "The item is already visible.": "此项目已处于显示状态。",
    "The item is already hidden.": "此项目已处于隐藏状态。",
    "Unsupported segment change intent.": "不支持此片段修改操作。",
    "The existing database could not be read for backup. Repeat the request with forceCleanOnBackupFailure=true to discard it and rebuild empty.": "无法读取现有数据库以备份。如需丢弃数据并重建空数据库，请使用 forceCleanOnBackupFailure=true 重新请求。",
    "One or more validation errors occurred.": "存在一个或多个输入校验错误。",
    "Bad Request": "请求无效",
    "Unauthorized": "未登录或登录已失效",
    "Forbidden": "没有操作权限",
    "Not Found": "未找到请求的内容",
    "An error occurred while processing your request.": "处理请求时发生错误。",
};

export function serverErrorText(text: string): string {
    return messages[text] ?? text.replace(/^Unknown segment type '(.*)'\.$/, "未知的片段类型：'$1'。");
}
