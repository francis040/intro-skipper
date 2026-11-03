import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import ts from '../web/node_modules/typescript/lib/typescript.js';

const base = JSON.parse(fs.readFileSync('localization-base.json', 'utf8'));
const show = (file) => execFileSync('git', ['show', `${base.upstreamCommit}:${file}`], {encoding: 'utf8'});
const protectedProperties = new Set(['value', 'key', 'actions', 'kind', 'default', 'className', 'id', 'name', 'type', 'for', 'role', 'method', 'href', 'src', 'target', 'rel', 'aria-controls', 'aria-current', 'aria-live', 'aria-hidden', 'aria-expanded', 'aria-selected']);
function technicalStrings(source, file) {
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const strings = [];
    function walk(node) {
        if (ts.isStringLiteralLike(node) || [ts.SyntaxKind.TemplateHead, ts.SyntaxKind.TemplateMiddle, ts.SyntaxKind.TemplateTail].includes(node.kind)) {
            let protectedText = false;
            for (let parent = node.parent; parent; parent = parent.parent) {
                if (ts.isPropertyAssignment(parent) && protectedProperties.has(parent.name.getText(sf))) protectedText = true;
                if (ts.isLiteralTypeNode(parent) || ts.isCaseClause(parent)) { protectedText = true; break; }
                if (ts.isBinaryExpression(parent) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(parent.operatorToken.kind)) protectedText = true;
                if (ts.isCallExpression(parent)) {
                    const fn = parent.expression.getText(sf);
                    if (/\.(get|set|field|list|addEventListener|removeEventListener|querySelector|closest)$/.test(fn) && parent.arguments[0]?.pos <= node.pos && node.end <= parent.arguments[0]?.end) protectedText = true;
                    if (fn.endsWith('setAttribute') && parent.arguments[0]?.pos <= node.pos && node.end <= parent.arguments[0]?.end) protectedText = true;
                    break;
                }
                if (ts.isStatement(parent)) break;
            }
            if (protectedText) strings.push(node.text);
        }
        ts.forEachChild(node, walk);
    }
    walk(sf);
    return strings;
}
const files = execFileSync('git', ['ls-tree', '-r', '--name-only', base.upstreamCommit, 'web/src'], {encoding:'utf8'}).trim().split('\n').filter(file => file.endsWith('.ts'));
for (const file of files) assert.deepEqual(technicalStrings(fs.readFileSync(file, 'utf8'), file), technicalStrings(show(file), file), `Technical identifiers changed: ${file}`);
for (const file of ['IntroSkipper/Configuration/PluginConfiguration.cs', 'web/src/types.ts']) assert.equal(fs.readFileSync(file,'utf8').replaceAll('\r\n','\n'), show(file).replaceAll('\r\n','\n'), `Config contract changed: ${file}`);
const schema = fs.readFileSync('web/src/config/schema.ts', 'utf8');
assert.match(schema, /label: "自动分析新增媒体"/);
const tabs = ['general','analysis','detection','black-frame','chapters','tracks','ffmpeg','timestamps-browser','tools','information'];
for (const tab of tabs) {
    const source = fs.readFileSync(`web/src/tabs/${tab}.ts`, 'utf8');
    assert.match(source, /label: "[\u4e00-\u9fff]|label: "FFmpeg"/, `Untranslated tab: ${tab}`);
}
const changedBackend = execFileSync('git', ['diff', base.upstreamCommit, '--name-only', '--', 'IntroSkipper'], {encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.ok(changedBackend.every(file => ['IntroSkipper/IntroSkipper.csproj', 'IntroSkipper/Configuration/configPage.html', 'IntroSkipper/ScheduledTasks/DetectSegmentsTask.cs', 'IntroSkipper/ScheduledTasks/CleanCacheTask.cs'].includes(file)), 'Unexpected backend logic change');
console.log(`Localization checked: ${files.length} upstream frontend files; configuration contract and technical identifiers preserved.`);
