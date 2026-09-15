"""Snapshot current top-level Pre-IB assessment files without changing sources.

Reads only the supplied folder's immediate files. Keeps PDF and DOCX variants,
including newer Word versions, so an older PDF cannot silently supersede them.
Historical child directories are not traversed. Exact bytes and provenance are
written to an unserved local audit folder for later visual comparison.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from match_trilogy_current_tests import read_text

DEFAULT_ROOT = Path(r"H:\Shared drives\0. Physics (Teachers)\3 - Pre-IB")
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "dist/physics-audit/preib-current-assessments"


def snapshot(root, output, max_files):
    candidates, skipped, unsupported = [], [], []
    for source in sorted(root.iterdir()):
        if source.is_dir():
            skipped.append({"path": str(source), "reason": "Child directory not traversed"})
            continue
        name = source.stem.casefold()
        if "test" not in name and "assessment" not in name:
            continue
        if source.name.startswith("~$") or re.search(r"answers?|mark\s*scheme|solutions?", name):
            skipped.append({"path": str(source), "reason": "Answer/solution file or Office lock file"})
            continue
        if source.suffix.casefold() not in (".pdf", ".docx"):
            unsupported.append({"path": str(source), "reason": "Current assessment variant requires another reader/export route", "extension": source.suffix})
            continue
        candidates.append(source)
    if len(candidates) > max_files:
        raise ValueError(f"Refusing to read {len(candidates)} files; maximum is {max_files}")
    output.mkdir(parents=True, exist_ok=True)
    entries = []
    for source in candidates:
        try:
            content = source.read_bytes()
            digest = hashlib.sha256(content).hexdigest()
            target = output / f"{digest[:12]}-{source.name}"
            if not target.exists() or hashlib.sha256(target.read_bytes()).hexdigest() != digest:
                target.write_bytes(content)
            provenance = {"original_path": str(source), "snapshot_path": str(target.resolve()),
                          "sha256": digest, "snapshot_bytes": len(content),
                          "source_modified_timestamp": source.stat().st_mtime,
                          "snapshot_policy": "Exact source bytes retained locally; source folder was not modified."}
            target.with_name(target.name + ".provenance.json").write_text(json.dumps(provenance,ensure_ascii=False,indent=2),encoding="utf-8")
            text, pages = read_text(target)
            extracted = target.with_name(target.name + ".text.json")
            extracted.write_text(json.dumps({"sha256":digest,"pages":pages,"text":text},ensure_ascii=False,indent=2),encoding="utf-8")
            entries.append({**provenance,"pages":pages,"extracted_words":len(text.split()),"text_path":str(extracted.resolve())})
        except (OSError,ValueError) as error:
            entries.append({"original_path":str(source),"error":str(error)})
    manifest = {"source_root":str(root),"scope":"Top-level test/assessment PDF and DOCX files; all versions retained; no child-directory traversal",
                "files":entries,"skipped":skipped,"unsupported":unsupported,
                "complete":not unsupported and all("error" not in entry for entry in entries)}
    path=output/"manifest.json"
    path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"manifest":str(path.resolve()),"snapshots":len(entries),"unsupported":len(unsupported),"failed":sum("error" in entry for entry in entries)}))


if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root",type=Path,default=DEFAULT_ROOT)
    parser.add_argument("--output",type=Path,default=DEFAULT_OUTPUT)
    parser.add_argument("--max-files",type=int,default=60)
    args=parser.parse_args()
    snapshot(args.root,args.output,args.max_files)
