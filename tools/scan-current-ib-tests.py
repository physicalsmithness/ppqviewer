"""Read the user's current IB tests and reserve plausible archive matches.

Shared-drive files and PaperDatabases are read-only. Writes only the requested
local JSON audit. Native PDF/DOCX text cannot certify diagram-only questions.
"""
import argparse
import collections
import csv
import hashlib
import json
import re
import time
import unicodedata
import zipfile
from pathlib import Path
from xml.etree import ElementTree

import fitz


def normalise(value):
    value = unicodedata.normalize('NFKC', value or '').lower()
    value = re.sub(r'\[(?:answer space|diagram/graph layout text omitted; see source clipping)\]', ' ', value)
    return re.findall(r'[a-z0-9]+', value)


def extract(filename):
    if filename.suffix.lower() == '.pdf':
        with fitz.open(filename) as document:
            return [page.get_text('text', sort=True) for page in document]
    with zipfile.ZipFile(filename) as archive:
        root = ElementTree.fromstring(archive.read('word/document.xml'))
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        return ['\n'.join(' '.join(node.itertext()) for node in root.findall('.//w:p', namespace))]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tests-root', type=Path, default=Path(r'H:\Shared drives\0. Physics (Teachers)\1- IB Folder\3. Assessments'))
    parser.add_argument('--paperdb-root', type=Path, default=Path(r'C:\CodexProjects\PaperDatabases'))
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    destination = args.output.resolve()
    workspace = Path(__file__).resolve().parent.parent
    if not destination.is_relative_to(workspace):
        raise SystemExit('Audit output must stay inside the PPQ viewer workspace')
    roots = [args.tests_root / folder for folder in ['A', 'B', 'C', 'D', 'E', 'Data Analysis Tests']]
    missing_roots = [str(folder) for folder in roots if not folder.is_dir()]
    if missing_roots:
        raise SystemExit('Required shared-drive folders unavailable: ' + '; '.join(missing_roots))
    files = sorted({file for folder in roots for file in folder.rglob('*') if file.is_file() and file.suffix.lower() in ('.pdf', '.docx') and not file.name.startswith('~$')})
    if not files:
        raise SystemExit('No test documents found')
    corpus_path = args.paperdb_root / 'outputs/exports/ib_physics_archive_flat_v5.csv'
    with corpus_path.open(encoding='utf-8-sig', newline='') as stream:
        corpus = list(csv.DictReader(stream))
    print(f'Read {len(corpus)} archive parts; scanning {len(files)} current test documents.', flush=True)

    # Index exact substantive word runs. Very common runs cannot identify an
    # archive question. One long run or two distinct shorter runs is enough for
    # precautionary withholding, but is never labelled a confirmed identity.
    gram_size = 8
    index = collections.defaultdict(set)
    short_index = collections.defaultdict(set)
    sitting_index = collections.defaultdict(set)
    token_fields = {}
    for row in corpus:
        pid = row['part_id']
        text = ' '.join([row['shared_stem'], row['parent_context'], row['question_text']])
        tokens = normalise(text)
        token_fields[pid] = tokens
        for i in range(max(0, len(tokens) - gram_size + 1)):
            gram = tuple(tokens[i:i + gram_size])
            if sum(map(len, gram)) >= 32:
                index[gram].add(pid)
        question_tokens = normalise(row['question_text'])
        if 4 <= len(question_tokens) < 8 and sum(map(len, question_tokens)) >= 25:
            short_index[tuple(question_tokens)].add(pid)
        # Existing papers use e.g. 21M.1.SL.TZ2.19 or 21M.P1.SL.TZ2.Q19.
        sitting = (row['year'][-2:], row['session'][0].upper(), row['paper'].upper(), row['level'].upper(), row['time_zone'].upper() or 'TZ0', row['question'].upper())
        sitting_index[sitting].add(pid)
    index = {gram: pids for gram, pids in index.items() if len(pids) <= 24}
    short_index = {gram: pids for gram, pids in short_index.items() if len(pids) <= 8}
    short_sizes = sorted({len(gram) for gram in short_index})
    source_reports = []
    blocked = set()
    linked = []
    failures = []
    code_pattern = re.compile(r'\b(\d{2})([MN])\s*[. /_-]\s*P?(1A|1B|[123])\s*[. /_-]\s*(SL|HL)\s*[. /_-]\s*(TZ[0123])\s*[. /_-]\s*Q?([AB]?\d+)\b', re.I)
    snapshot_root = args.paperdb_root / 'Physics Categorisation/reference/tests/3. Assessments'
    for number, filename in enumerate(files, 1):
        relative = filename.relative_to(args.tests_root).as_posix()
        try:
            data = filename.read_bytes()
            checksum = hashlib.sha256(data).hexdigest()
            pages = extract(filename)
            text = '\n'.join(pages)
            tokens = normalise(text)
            hits = collections.defaultdict(set)
            reasons = collections.defaultdict(set)
            for i in range(max(0, len(tokens) - gram_size + 1)):
                gram = tuple(tokens[i:i + gram_size])
                for pid in index.get(gram, ()):
                    hits[pid].add(gram)
            for size in short_sizes:
                for i in range(max(0, len(tokens) - size + 1)):
                    for pid in short_index.get(tuple(tokens[i:i + size]), ()):
                        reasons[pid].add('short_exact_question_wording')
            for pid, grams in hits.items():
                if len(grams) >= 2 or any(sum(map(len, gram)) >= 45 for gram in grams):
                    reasons[pid].add('distinctive_exact_word_runs_candidate')
            code_count = 0
            for match in code_pattern.finditer(text):
                key = tuple(value.upper() for value in match.groups())
                for pid in sitting_index.get(key, ()):
                    reasons[pid].add('printed_sitting_reference')
                    code_count += 1
            source_ids = sorted(reasons)
            blocked.update(source_ids)
            for pid in source_ids:
                linked.append({'source_file': relative, 'source_part_id': pid, 'reasons': sorted(reasons[pid]), 'distinct_word_runs': len(hits.get(pid, ()))})
            snapshot = snapshot_root / relative
            snapshot_hash = hashlib.sha256(snapshot.read_bytes()).hexdigest() if snapshot.is_file() else None
            low_text_pages = [i + 1 for i, page in enumerate(pages) if len(normalise(page)) < 15]
            source_reports.append({'path': str(filename), 'relative_path': relative, 'sha256': checksum, 'bytes': len(data), 'pages_or_docx_text_blocks': len(pages), 'native_words': len(tokens), 'low_native_text_pages': low_text_pages, 'same_bytes_as_local_snapshot': snapshot_hash == checksum, 'snapshot_sha256': snapshot_hash, 'candidate_archive_parts': len(source_ids), 'printed_sitting_reference_links': code_count})
            print(f'[{number}/{len(files)}] {relative}: {len(tokens)} words, {len(source_ids)} precautionary archive links.', flush=True)
        except Exception as error:
            failures.append({'path': str(filename), 'error': str(error)})
            print(f'[{number}/{len(files)}] READ FAILURE {relative}: {error}', flush=True)
    report = {
        'schema_version': 1,
        'created_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'source_root': str(args.tests_root),
        'corpus_path': str(corpus_path),
        'corpus_sha256': hashlib.sha256(corpus_path.read_bytes()).hexdigest(),
        'scope': 'All available PDF and DOCX test documents under A, B, C, D, E and Data Analysis Tests; older versions retained conservatively.',
        'complete_test_exclusion_certified': False,
        'source_files': source_reports,
        'read_failures': failures,
        'blocked_source_ids': sorted(blocked),
        'candidate_links': linked,
        'counts': {'files_discovered': len(files), 'files_read': len(source_reports), 'read_failures': len(failures), 'archive_parts_precautionarily_linked': len(blocked), 'files_identical_to_local_snapshot': sum(row['same_bytes_as_local_snapshot'] for row in source_reports), 'low_native_text_pages': sum(len(row['low_native_text_pages']) for row in source_reports)},
        'limitations': [
            'This additional pass reserves plausible text/reference matches; it does not certify their identity.',
            'Native extraction may miss diagram-only, scanned or significantly rewritten test questions. Low-text pages are reported for visual review.',
            'Tests without a native text match are not proof that their questions are absent from the archive.',
            'The caller must expand linked parts to complete parent questions and cross-level twins before serving practice.',
        ],
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report['counts'], indent=2), flush=True)
    if failures:
        raise SystemExit(2)


if __name__ == '__main__':
    main()
