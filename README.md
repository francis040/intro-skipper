# Intro Skipper 简体中文汉化版

基于 [官方 Intro Skipper](https://github.com/intro-skipper/intro-skipper) 的非官方汉化 Fork，由 [francis040](https://github.com/francis040) 维护。保留原插件身份、配置及检测功能，使用自己的 GitHub Actions 构建与 Release 发布，**未使用官方 SignPath 签名**。

## 版本与兼容性

| 项目 | 当前值 |
| --- | --- |
| 汉化版程序集／文件／发行版本 | `12.0.6.1` |
| 官方基础 Tag | `12.0/v12.0.6.0` |
| 官方基础 Commit | `da3d8d50af3418ecd1ba80c58eefa48df5b5e2b4` |
| 官方发行 DLL 版本 | `12.0.6.0` |
| 官方 Tag 中的源码版本 | `12.0.5.0`（官方发行工作流构建时提升为 `12.0.6.0`） |
| Jellyfin `targetAbi` | `12.2.0.0` |
| 插件 GUID | `c83d86bb-a1e0-4c35-a113-e2101cf4ee6b` |

本版本沿用官方 Jellyfin `12.2.0` 依赖，不能安装到低于 `12.2.0.0` 的服务器。插件版本号的 `12.0` 前缀不代表支持所有 Jellyfin 12.x，更不代表支持 Jellyfin 10.x。

## 汉化范围与保留内容

配置页：常规、分析、检测、黑帧、章节、音轨、FFmpeg、时间戳、工具、信息；同时覆盖片段编辑器、单季覆盖设置、动态扫描状态、按钮、帮助文字、输入校验、确认框及无障碍标签。Jellyfin 计划任务的名称和说明也提供中文。

插件 GUID、程序集名称、配置字段及默认值、章节／字幕匹配正则、API 路径与请求响应结构、枚举值、检测算法、FFmpeg 参数、数据库和权限逻辑均沿用官方。插件运行时名称仍为 `Intro Skipper`，仓库目录中显示为 `Intro Skipper 简体中文汉化版`。

FFmpeg、Chromaprint、API 等技术名称保留原文。媒体名称来自自己的媒体库；原始 FFmpeg 输出、异常详情、支持日志中的配置键和诊断标识保留原文，便于排错。信息页的诊断标题和常用状态作中文显示，复制到剪贴板的原始支持包保持官方格式。

社区参考：[PaperLeisurely 的汉化分支](https://github.com/PaperLeisurely/Jellyfin.Plugin.IntroSkipper/tree/localization/zh-CN)，参考提交 `56e10e4eec562d00c5ded8eec700cbc40b25c6bb`。旧分支只提交了生成后的界面 JS；本项目重新在当前 TypeScript 源码中翻译，未复用旧 DLL、JS 安装资源或检测代码。术语统一为“片头／片尾／回顾／预览／广告”。

## 安装与仓库配置

自定义插件仓库地址：

```text
https://raw.githubusercontent.com/francis040/intro-skipper/zh-CN-12.0/manifest.json
```

1. 先核对 Jellyfin 服务器版本符合 `targetAbi`，备份 Jellyfin 插件配置及 Intro Skipper 数据。服务器版本、架构和生产数据应在部署阶段单独验证。
2. 进入 Jellyfin 管理控制台 → 插件 → 仓库，**禁用或移除官方 Intro Skipper 仓库**，同时移除其他提供相同 GUID 的第三方仓库。保留 Jellyfin 官方通用插件仓库，以及不提供此 GUID 的其他仓库。
3. 添加上述汉化仓库，保存并刷新插件目录。
4. 选择 `Intro Skipper 简体中文汉化版` 的 `12.0.6.1` 安装／更新，随后完整重启 Jellyfin。
5. 检查插件版本并打开配置页。旧浏览器缓存可能需要刷新或清除。

**不要同时安装两份 DLL，不要删除配置文件或插件数据来切换语言。** 相同 GUID 用于保持原插件身份。此项目没有自动连接 NAS、安装插件或修改生产配置。

### 为什么要关闭官方 Intro Skipper 仓库

Jellyfin 按 GUID 匹配插件，并将多个启用仓库中相同 GUID 的版本合并，再按兼容性及版本选择更新。仓库顺序不能固定后续更新来源。官方 `12.0.7.0` 等更高版本可能覆盖本汉化版；同版本来自不同仓库时也可能出现来源不明确。

依据：[Jellyfin InstallationManager 源码](https://github.com/jellyfin/jellyfin/blob/master/Emby.Server.Implementations/Updates/InstallationManager.cs)，其中 `GetAvailablePackages` 合并版本，`FilterPackages` 优先以 GUID 筛选，`GetCompatibleVersions` 按版本降序返回候选。此说明基于维护时检查的上游实现，实际部署仍需核对服务器版本。

## 更新与回滚

更新：只启用本汉化仓库后，使用 Jellyfin 插件更新功能，再完整重启服务器。发行包、MD5 与 SHA256 均在 [Releases](https://github.com/francis040/intro-skipper/releases) 中提供；manifest 使用 ZIP 的 MD5。

回滚：先备份；关闭自动更新，在插件目录中选择已保留的旧版本。如果服务器界面不允许降级，停止 Jellyfin 后手动移除较新版本的插件 DLL 目录，再安装旧版 Release；不要删除 `plugins/configurations` 或 Intro Skipper 数据目录。切回官方版时禁用汉化仓库、恢复官方 Intro Skipper 仓库，按同样方法选择兼容版本。保留 GUID 不等于允许跨任意数据库版本降级；本纯汉化版本以同一官方基础版本回滚为优先选择。

## 本地构建与检查

需要 Git、.NET 10 SDK、Node.js 24 LTS、pnpm 10、Python 3。Windows 官方测试会下载便携 jellyfin-ffmpeg 8.1.3；Linux CI 安装官方对应软件包。

```powershell
Copy-Item nuget/NuGet.Stable.Config NuGet.Config
pnpm --dir web install --frozen-lockfile
pnpm --dir web build
pnpm --dir web test
dotnet restore IntroSkipper.sln
dotnet build IntroSkipper.sln -c Release --no-restore -p:SkipWebBuild=true
dotnet test IntroSkipper.sln -c Release --no-build --no-restore
node scripts/check-localization.mjs
python scripts/test_release.py
dotnet run --file scripts/VerifyPlugin.cs -- IntroSkipper/bin/Release/net10.0/IntroSkipper.dll 12.0.6.1
python scripts/release.py package
```

构建生成的 JS、CSS、HTML 嵌入 `IntroSkipper.dll`。验证脚本检查程序集与文件版本，并逐字节核对 DLL 中三项资源与本地构建资源一致。ZIP 根目录只有 `IntroSkipper.dll`，与官方安装格式一致。构建输出、日志和本地验证文件不提交。

## GitHub Actions 与发布

- `Build and test`：维护分支 Push、Pull Request 或手动触发时执行前端构建与测试、Release 编译、官方全量测试、汉化契约检查和打包校验。
- `Release Chinese localization`：手动触发或推送 `zh-CN-v*` Tag 时运行同一套检查，成功后发布 ZIP、校验文件并更新维护分支的 manifest。
- 仅使用仓库自带 `GITHUB_TOKEN`，不依赖官方 PAT、SignPath 或官方组织权限。仓库必须允许 Actions 运行和工作流写入仓库内容。
- 发布前确认三个版本字段一致、Tag 版本相符，且维护分支尚未前进。已发布版本不可覆盖；发现问题时提升汉化修订号。
- Release 上传完成后才提交 manifest。manifest 保留历史版本。更新 manifest 的提交可能不会再次触发 CI（GitHub 对 `GITHUB_TOKEN` 事件的正常限制）；发布脚本自身会验证 JSON。

首次使用应在维护分支的 Actions 页面手动运行发行工作流：

```powershell
gh workflow run release.yml --repo francis040/intro-skipper --ref zh-CN-12.0
gh run list --repo francis040/intro-skipper --workflow release.yml
```

## 跟进官方版本

保留 `upstream`：`https://github.com/intro-skipper/intro-skipper.git`；`origin` 必须指向个人 Fork。建议在独立工作分支上操作，不直接把移动中的官方默认分支合并到生产汉化分支。

```powershell
git fetch upstream --tags
git diff '12.0/v12.0.6.0' '12.0/v12.0.7.0' -- web/src IntroSkipper/Configuration IntroSkipper/IntroSkipper.csproj
git switch -c zh-CN-next '12.0/v12.0.7.0'
```

以上 `12.0.7.0` 是未来维护示例，需替换为实际存在且已核实的稳定 Tag。随后将上一汉化提交中的文字修改迁移到新源码，逐项检查新增、修改和删除的 `label`、`description`、提示、模板字符串、确认框及后端显示名称，保留新的技术标识和默认值。

比较变更时，必须同时检查算法、数据库、配置、API 和 FFmpeg 变化。冲突需人工解决；禁止未经检查自动合并并发布。更新 `localization-base.json` 中的官方 Tag、Commit、实际发行 DLL 版本和 targetAbi；重新核对官方 manifest，不根据 Tag 猜测程序集版本。

在官方没有占用该版本号时，官方 `12.0.7.0` 对应汉化 `12.0.7.1`。再次发布汉化修正依次使用 `.2`、`.3`，发布前检查官方及本 Fork 已用版本。不要通过修改 GUID 或虚高版本号抢占更新。

`Check upstream release` 每周检查一次官方 `12.0` 稳定发行，有新版本时产生失败检查供维护者注意，不创建 Issue、自动合并或自动发布。启用 GitHub Actions 失败通知即可收到提示。新基础版本迁移后，必要时同步更新脚本中的基线约束与对应测试。

## 许可证与版权

保留 [GPL-3.0-only 许可证](LICENSE) 和所有原作者版权声明。原项目和汉化参考的权利归各自作者所有；汉化及发布维护由 francis040 提供。本项目不代表 Jellyfin 或 Intro Skipper 官方，不冒用官方签名或发布身份。
