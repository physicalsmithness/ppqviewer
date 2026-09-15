"""Select the existing historical IB data-analysis catalogue without retagging it.

PaperDatabases is read-only. The output contains native records and must pass
through the viewer's full test reservations, page checks and crop restrictions.
"""
from __future__ import annotations

import argparse
import collections
import csv
import hashlib
import json
from pathlib import Path
import runpy
import sys


WORKSPACE = Path(__file__).resolve().parent.parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--paperdb-root', type=Path, default=Path(r'C:\CodexProjects\PaperDatabases'))
    parser.add_argument('--output', type=Path, default=WORKSPACE / 'dist/physics-inputs/ib-data-analysis.json')
    args = parser.parse_args()
    estate, output = args.paperdb_root.resolve(), args.output.resolve()
    if not output.is_relative_to(WORKSPACE):
        raise SystemExit('Data-analysis output must remain inside the PPQ viewer workspace')
    physics = estate / 'Physics Categorisation'
    inputs = {}

    def read(filename):
        data = filename.read_bytes()
        inputs[filename.relative_to(estate).as_posix()] = hashlib.sha256(data).hexdigest()
        return data.decode('utf-8-sig')

    builder = physics / 'viewer/build_catalogue.py'
    read(builder)
    # Loading only pure helper definitions never invokes the source builder.
    sys.dont_write_bytecode = True
    helpers = runpy.run_path(str(builder), run_name='ib_data_readonly_helpers')
    corpus_rows = list(csv.DictReader(read(estate / 'outputs/exports/ib_physics_archive_flat_v5.csv').splitlines(keepends=True)))
    corpus = {row['part_id']: row for row in corpus_rows}
    assert len(corpus) == len(corpus_rows), 'Duplicate corpus source identities'
    expected = {row['part_id'] for row in corpus_rows
                if 2004 <= int(row['year']) <= 2025 and helpers['focus'](row) == 'data_analysis'}
    raw = read(physics / 'viewer/ibphysics_catalogue.js')
    marker = 'window.IBPHYS_QUESTIONS'
    assert raw.count(marker) == 1, 'Unexpected native catalogue format'
    questions, _ = json.JSONDecoder().raw_decode(raw.split(marker, 1)[1].lstrip(' =\r\n'))
    manifest_rows = json.loads(read(physics / 'viewer/asset_manifest.json'))
    manifest = {(item['preview'], item['file']): item['relative_path'] for item in manifest_rows}
    assert len(manifest) == len(manifest_rows), 'Ambiguous native asset names'
    read(physics / 'reports/viewer_assessment_focus_audit_2026-09-10.md')
    read(physics / 'masters/tools_spine_PROPOSED.csv')

    selected, observed, assets = [], set(), set()

    def source_asset(preview_name, filename):
        preview_root = (estate / 'outputs/previews' / preview_name).resolve()
        asset = (preview_root / manifest[(preview_name, filename)]).resolve()
        assert asset.is_relative_to(preview_root), 'Native asset path escapes its source preview'
        return asset

    for question in questions:
        parts = [part for part in question['parts'] if part['source_part_id'] in expected]
        if not parts:
            continue
        # All source-era data parents should remain whole, including shared
        # stems and the original per-question scheme-page metadata.
        assert len(parts) == len(question['parts']), f'Mixed-focus parent needs review: {question["id"]}'
        assert question['assessment_focus'] == 'data_analysis'
        assert question['topic_codes'] == ['DATA']
        for relative in question.get('crops', []):
            assets.add(source_asset(question['preview'], relative))
        for part in parts:
            pid = part['source_part_id']
            assert pid not in observed, f'Duplicate native source part: {pid}'
            observed.add(pid)
            row = corpus[pid]
            expected_parent, expected_part, _ = helpers['ids'](row)
            assert (question['id'], part['part_id']) == (expected_parent, expected_part)
            assert part['assessment_focus'] == 'data_analysis'
            assert part['topic_codes'] == ['DATA']
            assert all(code == 'DATA' or code == 'TOOLS' or code.startswith('TOOLS.')
                       for code in part.get('primary_codes', []) + part.get('secondary_codes', [])), 'Content tags leaked into data practice'
            assert part.get('selection_evidence', {}).get('DATA') == 'era_rule_d068', 'Unexpected assessment-focus provenance'
            for field in ('crops', 'pages', 'ms_crops', 'ms_pages', 'ms_pages_this_question'):
                for relative in part.get(field, []):
                    assets.add(source_asset(question['preview'], relative))
        selected.append(question)
    assert observed == expected, f'Native DATA and corpus era rule differ: {len(expected - observed)} missing; {len(observed - expected)} unexpected'
    missing_assets = [str(filename) for filename in sorted(assets) if not filename.is_file()]
    assert not missing_assets, f'DATA references {len(missing_assets)} missing assets'

    year_counts = collections.Counter(question['year'] for question in selected for _ in question['parts'])
    paper_counts = collections.Counter(question['paper'] for question in selected for _ in question['parts'])
    eras = collections.Counter(
        '2004-2015 Paper 2 first question' if int(question['year']) <= 2015 else
        '2016-2024 Paper 3 Section A' if int(question['year']) <= 2024 else
        '2025 Paper 1B' for question in selected for _ in question['parts'])
    report = {
        'schema_version': 1,
        'builder': {'path': 'tools/build_ib_data_analysis.py', 'sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},
        'course': 'ib',
        'topic_code': 'DATA',
        'display_intent': 'Data analysis and experimental method, including historical questions since 2004 and modern Paper 1B',
        'selection': 'Existing source catalogue DATA assessment_focus and era_rule_d068, cross-checked against every full-v5 corpus row; no new content tags inferred.',
        'source_files': [{'path': relative, 'sha256': sha} for relative, sha in sorted(inputs.items())],
        'counts': {'full_corpus_parts': len(corpus), 'corpus_data_parts_2004_to_2025': len(expected),
                   'native_data_parts': len(observed), 'supplement_parts_before_exclusions': len(observed),
                   'supplement_parents_before_exclusions': len(selected), 'missing_native_parts': 0,
                   'referenced_assets_checked': len(assets), 'missing_assets': 0},
        'parts_by_year_before_exclusions': dict(sorted(year_counts.items())),
        'parts_by_paper_before_exclusions': dict(sorted(paper_counts.items())),
        'parts_by_assessment_era_before_exclusions': dict(sorted(eras.items())),
        'year_range_before_exclusions': [min(map(int, year_counts)), max(map(int, year_counts))],
        'years_without_source_data_records': [year for year in range(2004, 2026) if str(year) not in year_counts],
        'requires_assembler_test_exclusion_and_crop_checks': True,
        'complete_test_exclusion_certified': False,
        'limitations': [
            'These are candidates before full-parent, duplicate, HL/SL, test-page, crop-quality and syllabus-status exclusions.',
            'Coverage describes the available archive under its existing assessment-era rule, not a claim that every published sitting is present.',
            '2021 and 2022 have no data-analysis records under the source rule; this selection does not invent missing questions.',
            '2026 and later papers are outside this input and remain prohibited for mocks.',
            'Existing provisional tools tags and source review cautions are preserved unchanged.'
        ]
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({'questions': selected, 'report': report}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(output), **report['counts'],
                      'parts_by_era': report['parts_by_assessment_era_before_exclusions'],
                      'year_range': report['year_range_before_exclusions']}, indent=2))


if __name__ == '__main__':
    main()
