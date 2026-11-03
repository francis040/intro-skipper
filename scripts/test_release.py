import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location("release", Path(__file__).with_name("release.py"))
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)


class ReleaseTests(unittest.TestCase):
    def test_archive_and_catalog_integrity_and_immutable_history(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            dll = root / "IntroSkipper.dll"
            dll.write_bytes(b"test payload")
            release.package(dll, root)
            archive = root / f"intro-skipper-zh-CN-v{release.version()}.zip"
            with zipfile.ZipFile(archive) as z:
                self.assertEqual(z.namelist(), ["IntroSkipper.dll"])
                self.assertEqual(z.read("IntroSkipper.dll"), dll.read_bytes())
            catalog = root / "manifest.json"
            old = {"version": "12.0.5.1", "checksum": "old"}
            catalog.write_text(json.dumps([{"guid": release.GUID, "versions": [old]}]), encoding="utf-8")
            release.manifest(archive, "francis040/intro-skipper", catalog)
            data = json.loads(catalog.read_text(encoding="utf-8"))
            entry = data[0]["versions"][0]
            self.assertEqual(entry["checksum"], release.hashes(archive)[0])
            self.assertEqual(entry["targetAbi"], "12.2.0.0")
            self.assertTrue(entry["timestamp"].endswith("Z"))
            self.assertIn(old, data[0]["versions"])
            before = catalog.read_bytes()
            release.manifest(archive, "francis040/intro-skipper", catalog)
            self.assertEqual(catalog.read_bytes(), before)
            archive.write_bytes(b"different archive")
            with self.assertRaises(ValueError):
                release.manifest(archive, "francis040/intro-skipper", catalog)
            with self.assertRaises(ValueError):
                release.manifest(archive, "intro-skipper/intro-skipper", catalog)


if __name__ == "__main__":
    unittest.main()
