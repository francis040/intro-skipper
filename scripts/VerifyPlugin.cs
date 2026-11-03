using System.Diagnostics;
using System.Reflection;
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;
using System.Runtime.CompilerServices;
using System.Text;

if (args.Length != 2) throw new ArgumentException("Expected DLL path and four-part version");
var root = Directory.GetParent(Path.GetDirectoryName(SourceFile())!)!.FullName;
var path = Path.GetFullPath(args[0], root);
if (AssemblyName.GetAssemblyName(path).Version?.ToString() != args[1]) throw new InvalidDataException("Assembly version mismatch");
if (FileVersionInfo.GetVersionInfo(path).FileVersion != args[1]) throw new InvalidDataException("File version mismatch");
using var stream = File.OpenRead(path);
using var pe = new PEReader(stream);
var metadata = pe.GetMetadataReader();
var directory = pe.PEHeaders.CorHeader!.ResourcesDirectory;
var resources = pe.GetSectionData(directory.RelativeVirtualAddress);
var expected = new[] { "configPage.html", "introskipper.js", "introskipper.css" };
foreach (var file in expected)
{
    var handle = metadata.ManifestResources.Single(h => metadata.GetString(metadata.GetManifestResource(h).Name) == "IntroSkipper.Configuration." + file);
    var resource = metadata.GetManifestResource(handle);
    var reader = resources.GetReader((int)resource.Offset, resources.Length - (int)resource.Offset);
    var bytes = reader.ReadBytes(reader.ReadInt32());
    if (!bytes.SequenceEqual(File.ReadAllBytes(Path.Combine(root, "IntroSkipper", "Configuration", file)))) throw new InvalidDataException("Embedded resource mismatch: " + file);
    var text = Encoding.UTF8.GetString(bytes);
    if (file == "introskipper.js" && (!text.Contains("常规") || !text.Contains("时间戳") || !text.Contains("音轨") || !text.Contains("c83d86bb-a1e0-4c35-a113-e2101cf4ee6b"))) throw new InvalidDataException("Missing localization or plugin identity");
    if (file == "configPage.html" && !text.Contains("zh-CN")) throw new InvalidDataException("HTML language missing");
    Console.WriteLine("Verified embedded resource: " + file);
}
Console.WriteLine("Verified assembly/file version: " + args[1]);

static string SourceFile([CallerFilePath] string file = "") => file;
