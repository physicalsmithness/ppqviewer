"""Build a D.2 supplement for the shared IB Physics catalogue.

All PaperDatabases sources are read-only. This emits native parent/part records
inside ppqviewer; the assembler must apply test reservations and crop restrictions.
"""
from __future__ import annotations

import argparse
import collections
import csv
import hashlib
import json
from pathlib import Path
import re
import runpy
import sys

TOPIC = 'D.2'
TOPIC_NAME = 'Electric and magnetic fields'
WORKSPACE = Path(__file__).resolve().parent.parent
# These mismatches were explicitly reported in the D.2 review. Do not make a
# practice item depend on those schemes before a source-level repair is checked.
DOCUMENTED_SCHEME_MISMATCHES = {
    'ibchem_part_9fe6c22d12dbfedb': 'Electron force question was paired with uniform-field drawing credits.',
    'ibchem_part_956f0d6a8bd55901': 'Field-strength ratio question was paired with thermodynamics credits.',
    'ibchem_part_e8b7c9abc89bfbc4': 'Magnetic-force arrow question was paired with path/radius credits.',
}
REVIEWED_CROP_DEFECTS = {
    'ibchem_part_a4e4d46b6c06b1c5': 'November 2004 HL Paper 1 Q28 crop cuts off the lower parts of options C and D; confirmed by visual review on 2026-09-10.',
    **{pid: 'Question diagram content is cut off at the lower crop boundary; flagged by an image-edge check and visually confirmed on 2026-09-10.' for pid in (
        'ibchem_part_f64257c7a882226e', 'ibchem_part_7e9801b218dcf0c4',
        'ibchem_part_bf45df5bd3bd36d4', 'ibchem_part_8243a9ae365cf87a',
        'ibchem_part_680a8b3de2b5508b', 'ibchem_part_7556f87b875a537a',
        'ibchem_part_9145265e7657f9d8', 'ibchem_part_0c94bb4f33bc2e30',
        'ibchem_part_86b359e504351c33', 'ibchem_part_7b18174f8e8f4a25',
        'ibchem_part_a89b298d69121a1d', 'ibchem_part_09808fa974903d8b',
        'ibchem_part_41a043eb42cf8151', 'ibchem_part_b51233e25f930467'
    )}
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--paperdb-root', type=Path, default=Path(r'C:\CodexProjects\PaperDatabases'))
    parser.add_argument('--output', type=Path, default=WORKSPACE / 'dist/physics-inputs/ib-d2.json')
    args = parser.parse_args()
    estate, output = args.paperdb_root.resolve(), args.output.resolve()
    if not output.is_relative_to(WORKSPACE):
        raise SystemExit('The D.2 output must stay inside the PPQ viewer workspace')
    physics = estate / 'Physics Categorisation'
    previews = estate / 'outputs/previews'
    inputs = {}

    def read_bytes(filename):
        data = filename.read_bytes()
        inputs[filename.relative_to(estate).as_posix()] = hashlib.sha256(data).hexdigest()
        return data

    def read_csv(filename):
        text = read_bytes(filename).decode('utf-8-sig')
        return list(csv.DictReader(text.splitlines(keepends=True)))

    def read_json(filename):
        return json.loads(read_bytes(filename).decode('utf-8-sig'))

    # Reuse the source consumer's pure identity, text and era rules. Its main()
    # is not called, and bytecode writing is disabled before loading helpers.
    source_builder = physics / 'viewer/build_catalogue.py'
    read_bytes(source_builder)
    sys.dont_write_bytecode = True
    helpers = runpy.run_path(str(source_builder), run_name='ib_d2_readonly_helpers')
    ids, clean, focus, unique = (helpers[name] for name in ('ids', 'clean', 'focus', 'unique'))

    rows = read_csv(estate / 'outputs/exports/ib_physics_archive_flat_v5.csv')
    corpus = {row['part_id']: row for row in rows}
    if len(rows) != len(corpus):
        raise ValueError('Duplicate source part IDs')
    crop_defect_groups = {corpus[pid]['cross_level_group_id'] for pid in REVIEWED_CROP_DEFECTS if pid in corpus and corpus[pid]['cross_level_group_id']}
    withheld_crop_parts = set(REVIEWED_CROP_DEFECTS) | {row['part_id'] for row in rows if row['cross_level_group_id'] in crop_defect_groups}
    names = {row['code']: row['text'] for row in read_csv(physics / 'syllabus_spine.csv')}
    names[TOPIC + '.X'] = TOPIC_NAME + ' — retired content'
    original_pool = read_json(physics / 'd2_007_work/d2_allowed_records.json')
    pool = {row['part_id'] for row in original_pool}
    routing_file = physics / 'returns/PACKET_004B/topic_assignments.csv'
    routing = {row['part_id']: int(row['rank']) for row in read_csv(routing_file) if row['subtopic'] == TOPIC}
    gate_file = physics / 'returns/PACKET_007B_SNAPSHOT_2026-08-20/PACKET_007B_D2/quarantined.csv'
    quarantined = {row['part_id'] for row in read_csv(gate_file)}
    read_bytes(physics / 'returns/PACKET_007B_SNAPSHOT_2026-08-20/PACKET_007B_D2/FEEDBACK_007B.md')
    read_bytes(physics / 'returns/PACKET_007B_D2/FEEDBACK_007B.md')
    reinstated = set()
    for relative in ('PACKET_010/reinstate.csv', 'PACKET_010B/reinstate_additional.csv'):
        reinstated.update(row['part_id'] for row in read_csv(physics / 'returns' / relative) if row['subtopic'] == TOPIC)

    tags = collections.defaultdict(list)
    all_content_tags = collections.defaultdict(list)
    central_d2_tags = set()
    live_d2_assessed_parts = set()
    tag_sources = collections.defaultdict(set)
    none_parts, ignored_tags = set(), []
    for filename in sorted((physics / 'returns/PACKET_011').glob('[0-9][0-9][0-9][0-9]/syllabus_tags.csv')):
        for row in read_csv(filename):
            code = row.get('understanding_code') or ''
            if code in names or re.fullmatch(r'[A-E]\.\d+\.X', code):
                all_content_tags[row['part_id']].append(code)
            if row['subtopic'] != TOPIC:
                continue
            pid, code = row['part_id'], row['understanding_code']
            tag_sources[pid].add(filename.relative_to(estate).as_posix())
            if code == 'NONE':
                none_parts.add(pid)
            elif code.startswith(TOPIC + '.') and code in names:
                tags[pid].append(code)
                if row.get('needed_how') == 'central':
                    central_d2_tags.add(pid)
                if not code.endswith('.X') and row.get('needed_how') in ('central', 'step'):
                    live_d2_assessed_parts.add(pid)
            elif code:
                ignored_tags.append({'source_part_id': pid, 'code': code, 'source': filename.relative_to(estate).as_posix()})
    for pid in tags:
        tags[pid] = unique(tags[pid])

    selected, rejected = {}, []
    candidate_ids = pool | {pid for pid, rank in routing.items() if rank <= 3} | set(tags) | reinstated
    for row in rows:
        pid = row['part_id']
        if pid not in candidate_ids:
            continue
        reasons = []
        if pid in pool and pid not in quarantined:
            reasons.append('frozen_reviewed_candidate_gate')
        if routing.get(pid, 99) <= 3 and pid not in quarantined:
            reasons.append('rank_1_to_3_routing_after_frozen_gate')
        if pid in reinstated:
            reasons.append('audited_reinstatement')
        if pid in central_d2_tags:
            reasons.append('provisional_central_D2_syllabus_tag')
        rejection = None
        if not reasons:
            rejection = 'quarantined_or_no_positive_D2_evidence'
        elif not re.fullmatch(r'\d{4}', row['year']) or int(row['year']) >= 2026:
            rejection = '2026_and_later_mock_embargo_or_missing_year'
        elif focus(row) == 'data_analysis':
            rejection = 'data_analysis_is_separate_from_topic_practice'
        elif pid in none_parts and not tags[pid]:
            rejection = 'detailed_D2_review_has_NONE_only'
        elif any(code.endswith('.X') for code in tags[pid]) and pid not in live_d2_assessed_parts:
            rejection = 'D2_retired_without_live_assessed_D2_code_even_if_other_topics_current'
        elif pid in DOCUMENTED_SCHEME_MISMATCHES:
            rejection = 'documented_markscheme_mismatch_awaits_source_review'
        elif pid in withheld_crop_parts:
            rejection = 'visually_incomplete_MCQ_options_or_declared_twin'
        if rejection:
            rejected.append({'source_part_id': pid, 'reason': rejection})
        else:
            selected[pid] = reasons
    unknown_ids = sorted(candidate_ids - set(corpus))
    removed_legacy_parts = []
    if unknown_ids:
        migration = {row['v2_part_id']: row for row in read_csv(estate / 'outputs/exports/ib_physics_archive_flat_v2_to_v3_part_id_migration.csv')}
        for pid in unknown_ids:
            change = migration.get(pid, {})
            if change.get('changed_how') == 'removed_or_no_safe_replacement' and not change.get('v3_part_id'):
                removed_legacy_parts.append(change)
                rejected.append({'source_part_id': pid, 'reason': 'explicitly_removed_by_corpus_migration'})
            else:
                raise ValueError(f'D.2 source evidence references an unexplained missing corpus ID: {pid}')

    # Preserve the source consumer's answer-key cautions if any cross-topic part
    # also occurs in D.2; never infer an MCQ answer from general scheme prose.
    answer_issues = {}
    for pid, issue in helpers['ANSWER_ISSUES'].items():
        if pid not in corpus:
            continue
        twin = corpus[pid]['cross_level_group_id']
        for row in rows:
            if row['part_id'] == pid or (twin and row['cross_level_group_id'] == twin):
                answer_issues[row['part_id']] = {**issue, 'source_part_id': pid}

    asset_manifest, missing_assets = {}, []

    def assets(preview, values, kind=None, suppress=()):
        result = []
        for value in values.split(';') if isinstance(values, str) else values or []:
            relative = str(value).replace('\\', '/')
            filename = Path(relative).name
            if not relative or filename in suppress or (kind and not filename.startswith(kind + '_')):
                continue
            preview_root = (previews / preview).resolve()
            asset = (preview_root / relative).resolve()
            if not asset.is_relative_to(preview_root) or asset.suffix.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
                raise ValueError(f'Unsafe image reference: {preview}/{relative}')
            if not asset.is_file():
                missing_assets.append(f'{preview}/{relative}')
                continue
            asset_manifest[f'{preview}/{relative}'] = {'preview': preview, 'relative_path': relative, 'file': filename, 'bytes': asset.stat().st_size}
            result.append(filename)
        return unique(result)

    previous = {row['source_part_id']: row['viewer_part_id'] for row in read_csv(physics / 'viewer/viewer_id_map.csv')}
    grouped = collections.defaultdict(list)
    for row in rows:
        if row['part_id'] in selected:
            grouped[(row['preview'], row['question'])].append(row)
    cache, questions, mapping = {}, [], []
    for (preview, number), group in grouped.items():
        if preview not in cache:
            preview_data = read_json(previews / preview / 'question_preview.json')
            cache[preview] = {str(question['question_number']): question for question in preview_data['question_groups']}
        if number not in cache[preview]:
            raise ValueError(f'Missing native parent context: {preview} Q{number}')
        native, first = cache[preview][number], group[0]
        parent_id = ids(first)[0]
        parts = []
        for row in group:
            pid = row['part_id']
            _, part_id, label = ids(row)
            if pid in previous and previous[pid] != part_id:
                raise ValueError(f'Existing viewer part identity changed: {pid}')
            codes = tags[pid]
            content_codes = unique(all_content_tags[pid])
            retired = [code for code in content_codes if code.endswith('.X')]
            status = 'out' if content_codes and len(retired) == len(content_codes) else 'mixed' if retired else 'current' if row['year'] == '2025' else 'unreviewed'
            caveat = '' if status == 'current' else ('The provisional D.2 tags identify retired content; check syllabus fit.' if status == 'out' else 'The provisional D.2 tags include retired content; check syllabus fit.' if status == 'mixed' else 'Historical D.2 syllabus fit remains provisional; use the original question and marking conventions.')
            pages = assets(preview, row['page_render_paths'], 'question')
            ms_pages = assets(preview, row['page_render_paths'], 'mark')
            mcq = row['paper'].upper() in ('1', '1A')
            ms_pages = [name for name in ms_pages if mcq or int(re.search(r'_p(\d+)', name).group(1)) >= 4]
            suppressions = helpers['CROP_SUPPRESSIONS'].get(pid)
            part = {
                'part_id': part_id, 'source_part_id': pid, 'label': label,
                'text': clean(row['question_text']), 'lead_in': clean(row['parent_context']),
                'marks': int(row['marks']) if row['marks'].isdigit() else None,
                'marks_status': 'source_extracted' if row['marks'].isdigit() else 'unknown', 'mark_group': '',
                'crops': assets(preview, row['question_crop_paths'], suppress=[suppressions['filename']] if suppressions else []),
                'pages': pages, 'ms_crops': assets(preview, row['ms_crop_paths']), 'ms_pages': ms_pages,
                'ms_pages_this_question': ms_pages, 'ms_page_span_source': 'located-medium' if ms_pages else 'unlocated',
                'markscheme_text': row['ms_text'], 'ms_text_status': row['ms_text_status'],
                'topic_codes': [TOPIC], 'primary_codes': codes or [TOPIC],
                'secondary_codes': [code for code in content_codes if code not in codes],
                'classification_status': 'provisional', 'classification_sources': sorted(tag_sources[pid]),
                'selection_evidence': {TOPIC: ';'.join(selected[pid])}, 'assessment_focus': focus(row), 'spec_status': status,
                'spec_status_source': 'explicit_provisional_retired_tag' if retired else 'current_exam' if status == 'current' else 'not_reviewed',
                'usable_if': caveat, 'has_figure_omitted': '[figure]' in clean(row['question_text'] + ' ' + row['parent_context']),
                'examiner_comment': row['examiner_report_part_comment'] or row['examiner_report_question_comment'],
                'examiner_source_type': row['examiner_report_source_type'], 'examiner_match_note': row['examiner_report_match_note'],
                'answer_pack_comment': row['answer_pack_comment'], 'answer_pack_source': row['answer_pack_source'],
                'cross_level_group_id': row['cross_level_group_id'], 'is_canonical': row['is_canonical'] == '1',
                'duplicate_of_source': row['duplicate_of'], 'self_mark': 'marks'
            }
            key = re.fullmatch(r'\s*Answer:\s*([ABCD])\s*', row['ms_text']) if mcq else None
            if key:
                part.update(extracted_answer=key.group(1), answer_source='exact_extracted_answer_key')
                issue = answer_issues.get(pid)
                if issue:
                    part.update(answer_status=issue['status'], answer_note=issue['note'], answer_issue_source_part_id=issue['source_part_id'])
                else:
                    part.update(answer=key.group(1), correct_answer=key.group(1), answer_status='source_key', self_mark='mcq')
            if not part['crops'] and not part['pages']:
                raise ValueError(f'Selected D.2 part has no original question image: {pid}')
            parts.append(part)
            mapping.append({'source_part_id': pid, 'viewer_parent_id': parent_id, 'viewer_part_id': part_id, 'preview': preview, 'selection_evidence': selected[pid], 'syllabus_codes': codes})
        statuses = {part['spec_status'] for part in parts}
        question = {
            'id': parent_id, 'preview': preview, 'year': first['year'], 'series': first['session'], 'session': first['session'],
            'time_zone': first['time_zone'], 'paper': first['paper'], 'level': first['level'], 'question': number,
            'topic_code': TOPIC, 'topic_codes': [TOPIC], 'primary_code': TOPIC,
            'primary_codes': unique(code for part in parts for code in part['primary_codes']),
            'assessment_focus': focus(first), 'spec_status': next(iter(statuses)) if len(statuses) == 1 else 'mixed',
            'usable_if': next((part['usable_if'] for part in parts if part['usable_if']), ''),
            'classification_status': 'provisional', 'stem_text': clean(native.get('shared_stem', first['shared_stem'])),
            'crops': assets(preview, native.get('crop_image_paths', [])), 'parts': parts,
            'pages': unique(name for part in parts for name in part['pages']),
            'ms_crops': unique(name for part in parts for name in part['ms_crops']),
            'ms_pages': unique(name for part in parts for name in part['ms_pages']),
            'ms_pages_this_question': unique(name for part in parts for name in part['ms_pages']),
            'ms_page_span_source': 'located-medium' if any(part['ms_pages'] for part in parts) else 'unlocated',
            'marks': sum(part['marks'] for part in parts) if all(part['marks'] is not None for part in parts) else None,
            'examiner_comment': first['examiner_report_question_comment'], 'examiner_source_type': first['examiner_report_source_type'],
            'examiner_match_note': first['examiner_report_match_note'],
            'marking_differs': 'yes' if int(first['year']) < 2025 else 'no',
            'marking_note': 'This scheme follows the conventions of its original examination.' if int(first['year']) < 2025 else ''
        }
        question['ms_page_span'] = sorted({int(re.search(r'_p(\d+)', name).group(1)) for name in question['ms_pages']})
        questions.append(question)
    assert len({question['id'] for question in questions}) == len(questions), 'Parent ID collision'
    assert len({entry['viewer_part_id'] for entry in mapping}) == len(mapping), 'Part ID collision'
    assert all(int(question['year']) < 2026 for question in questions), 'Mock embargo violation'
    assert all(part['topic_codes'] == [TOPIC] and part['assessment_focus'] != 'data_analysis' for question in questions for part in question['parts'])
    assert all(not (part['primary_codes'] and all(code == TOPIC + '.X' for code in part['primary_codes'])) for question in questions for part in question['parts']), 'Other-topic tags revived retired D.2 content'
    assert all(part['source_part_id'] not in withheld_crop_parts for question in questions for part in question['parts']), 'Reviewed clipped image or twin survived'
    if missing_assets:
        raise ValueError(f'Missing source images: {missing_assets[:8]}')
    report = {
        'topic': TOPIC, 'topic_name': TOPIC_NAME, 'classification_status': 'provisional',
        'selection_policy': 'Frozen D.2 topical gate with audited reinstatements, supplemented only by valid existing central D.2 tags. Secondary/assumed D.2 tags enrich already-selected parts but do not promote unrelated questions. NONE-only D.2 returns and data-analysis parts are withheld. Retired tags from every content topic affect syllabus status. No new topic tags are inferred.',
        'needs_test_exclusion_and_crop_filtering': True,
        'source_files': [{'path': filename, 'sha256': checksum} for filename, checksum in sorted(inputs.items())],
        'counts': {'archive_parts': len(rows), 'original_candidate_pool': len(pool), 'latest_rank_1_to_3_parts': sum(rank <= 3 for rank in routing.values()), 'frozen_quarantined': len(quarantined), 'audited_reinstatements': len(reinstated), 'selected_parents': len(questions), 'selected_parts': len(mapping), 'overlapping_existing_viewer_parts': sum(entry['source_part_id'] in previous for entry in mapping), 'assets': len(asset_manifest)},
        'syllabus_status_counts': dict(collections.Counter(part['spec_status'] for question in questions for part in question['parts'])),
        'selection_evidence_counts': dict(collections.Counter(reason for reasons in selected.values() for reason in reasons)),
        'withheld_counts': dict(collections.Counter(row['reason'] for row in rejected)),
        'withheld_parts': rejected, 'ignored_unrecognised_tags': ignored_tags,
        'removed_legacy_parts': removed_legacy_parts,
        'documented_scheme_mismatch_sources': DOCUMENTED_SCHEME_MISMATCHES,
        'reviewed_crop_defects': REVIEWED_CROP_DEFECTS,
        'withheld_crop_defect_parts_and_twins': sorted(withheld_crop_parts),
        'part_mapping': mapping, 'asset_manifest': list(asset_manifest.values()),
        'limitations': ['D.2 classification and historical syllabus fit remain provisional.', 'Original source crops and schemes are retained; there is no full-page or text fallback promise.', 'This is an input supplement, not a pupil-facing collection. Merge by stable source/part IDs, then apply the shared whole-parent test reservations and blocked-page checks.']
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({'questions': questions, 'report': report}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(output), 'counts': report['counts'], 'syllabus_status_counts': report['syllabus_status_counts'], 'withheld_counts': report['withheld_counts']}, indent=2))


if __name__ == '__main__':
    main()
