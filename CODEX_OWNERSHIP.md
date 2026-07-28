# ppqviewer ownership and update path

> The filename is historical. Viewer maintenance returned from Codex to Claude
> on 2026-07-28. Read `CLAUDE_HANDOFF_2026-07-28.md` first.

**Viewer maintainer:** Claude  
**Analysis/project-control owner:** Codex  
**Live ESAT site:** <https://physicalsmithness.github.io/esatwallop/>

## Canonical sources

| Concern | Canonical location |
| --- | --- |
| Shared viewer | `engine\ppqviewer.js`, `engine\ppqviewer.css` |
| ESAT page wiring | `example\esat-compare.html`, `example\ppq-login.js` |
| Analysis source | `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\data` |
| Analysis validator/builder | `analysis_v2\scripts\validate_analysis_v2.py`, `build_ppqviewer_bundle.py` |
| Local assembled website | `dist\esat-compare` |
| Pages checkout | `deploy\esatwallop` |
| Repeatable bridge | `SYNC_ESAT_WEBSITE.cmd` |

Do not use old Qoder workspace copies as sources.

## Update path

```text
PaperDatabases analysis JSON
        ↓ validate + build
analysis_v2\dist\esat_analysis_v2.js
        ↓ assemble with current viewer/page/catalogue
ppqviewer\dist\esat-compare
        ↓ copy exact deployable files
ppqviewer\deploy\esatwallop
        ↓ review, commit and push main
GitHub Pages
```

`SYNC_ESAT_WEBSITE.cmd` validates analysis, rebuilds browser bundles,
syntax-checks assets, assembles the local and Pages copies, writes deterministic
build information and runs the viewer acceptance suite. It does not stage,
commit, push, delete, move or change GitHub settings.

## Current baseline

- Viewer v0.2.15, build `b778d4c0d9c2`
- 720 deep analysis records
- 46 Full, 674 Provisional, 18 Solution pending
- 738 classifications
- 281 viewer assertions passing

The 18 pending questions have held historical launch cards which are not
bundled or loaded. Do not report them as pupil-visible provisional feedback.

## Maintenance rules

- Establish recoverable viewer-source history before material changes; the
  source `.git` directory is empty.
- Never edit generated `dist` or deploy files by hand.
- Never publish an unvalidated bundle.
- Keep syntax/structural results separate from substantive content safety.
- Do not let unsafe deep-v2 content override a safe generic fallback.
- Update `ROADMAP.md`, `CHANGELOG.md`, `REGISTRY.md` and the current handoff when
  responsibilities or release state change.
- Preserve historical attribution.
- Do not commit unrelated `PaperDatabases` changes.
- Treat GitHub Desktop as the human-visible final review/push surface unless the
  user explicitly changes that workflow.

— Codex handoff to Claude, 2026-07-28
