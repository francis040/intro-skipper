"""Build Jellyfin's DLL-only archive and append a verified release to the catalog."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
GUID = "c83d86bb-a1e0-4c35-a113-e2101cf4ee6b"


def version():
    project = ET.parse(ROOT / "IntroSkipper/IntroSkipper.csproj")
    values = [project.findtext(f".//{key}") for key in ("AssemblyVersion", "FileVersion", "Version")]
    if len(set(values)) != 1 or not re.fullmatch(r"\d+\.\d+\.\d+\.\d+", values[0] or ""):
        raise ValueError("Assembly, file and package versions must be identical four-part versions")
    return values[0]


def package(dll, output):
    output.mkdir(parents=True, exist_ok=True)
    archive = output / f"intro-skipper-zh-CN-v{version()}.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(dll, "IntroSkipper.dll")
    with zipfile.ZipFile(archive) as z:
        if z.namelist() != ["IntroSkipper.dll"] or z.read("IntroSkipper.dll") != dll.read_bytes():
            raise ValueError("Archive payload differs from the validated DLL")
    md5, sha256 = hashes(archive)
    (output / "checksums.txt").write_text(
        f"MD5 ({archive.name}) = {md5}\nSHA256 ({archive.name}) = {sha256}\n", encoding="utf-8")
    print(archive)


def hashes(archive):
    data = archive.read_bytes()
    return hashlib.md5(data, usedforsecurity=False).hexdigest(), hashlib.sha256(data).hexdigest()


def manifest(archive, repository, catalog):
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        raise ValueError("Invalid GitHub repository")
    if repository == "intro-skipper/intro-skipper":
        raise ValueError("Publishing must target a personal Fork")
    current = version()
    if archive.name != f"intro-skipper-zh-CN-v{current}.zip":
        raise ValueError("Archive name/version mismatch")
    base = json.loads((ROOT / "localization-base.json").read_text(encoding="utf-8-sig"))
    data = json.loads(catalog.read_text(encoding="utf-8-sig"))
    if len(data) != 1 or data[0]["guid"] != GUID:
        raise ValueError("Unexpected plugin identity in manifest")
    md5, _ = hashes(archive)
    entry = {
        "version": current,
        "changelog": f"基于官方 {base['upstreamAssemblyVersion']} 的简体中文汉化版；非官方、未使用官方签名。保留插件身份、配置与检测逻辑。",
        "targetAbi": base["targetAbi"],
        "sourceUrl": f"https://github.com/{repository}/releases/download/zh-CN-v{current}/{archive.name}",
        "checksum": md5,
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
    }
    existing = next((item for item in data[0]["versions"] if item["version"] == current), None)
    if existing is not None:
        if existing["checksum"] != md5 or existing["sourceUrl"] != entry["sourceUrl"]:
            raise ValueError("Published versions are immutable; bump the version instead")
        return
    data[0]["versions"].append(entry)
    data[0]["versions"].sort(key=lambda item: tuple(map(int, item["version"].split("."))), reverse=True)
    catalog.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    json.loads(catalog.read_text(encoding="utf-8"))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["package", "manifest"])
    parser.add_argument("--dll", type=Path, default=ROOT / "IntroSkipper/bin/Release/net10.0/IntroSkipper.dll")
    parser.add_argument("--output", type=Path, default=ROOT / "package/release")
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--repository", default="francis040/intro-skipper")
    parser.add_argument("--catalog", type=Path, default=ROOT / "manifest.json")
    args = parser.parse_args()
    if args.action == "package":
        package(args.dll, args.output)
    else:
        manifest(args.archive, args.repository, args.catalog)
