# UniState project page

Standalone static research website. Publish **this directory** as a separate repository; the paper repository and its history are not part of the website.

## Plan and status

1. Source audit: completed. Text and metrics come from the manuscript; videos come from the supplied supplementary material. The current `figures/overview.pdf` is used instead of the older placeholder PNG.
2. Page implementation: completed. Overview, method, intervention examples, 30 additional trajectories, persistence, quantitative results, and four comparison sequences.
3. Publication details: confirmed authors and affiliations added. arXiv and code are marked Coming soon. Citation remains hidden until confirmed BibTeX is available.
4. Verification: local asset paths, JavaScript syntax, local HTTP response, and browser rendering checked.
5. Public deployment: completed at https://curryjung.github.io/unistate/. Dedicated repository: https://github.com/curryjung/unistate. GitHub Actions run 36653782203 succeeded; public page and hero video loading verified.

## Preview

From this directory:

```sh
python3 -m http.server 8765 --directory dist
```

Open http://localhost:8765.

## Publication updates

Edit `dist/site-config.js`:

- `arxivUrl`: complete https://arxiv.org/abs/... address. The paper link becomes active automatically.
- `codeUrl`: public code repository URL. The code link becomes active automatically.
- `authors`, `affiliations`: author and institution text.
- `bibtex`: confirmed citation. Adding it reveals a citation section and copy button.

Do not use the manuscript repository URL as the code-release URL unless that is the intended public code repository.

## GitHub Pages deployment

Create a dedicated public repository (suggested name: `unistate`). Push the contents of **this directory**, including `.github`, to its `main` branch. In repository Settings → Pages, select **GitHub Actions** as the source. The included workflow uploads only `dist` and deploys it on pushes to `main` or manual dispatch.

The workflow assumes this directory is the repository root. It is not intended to be installed at the root of the manuscript repository.

A second upload-only option is the prepared `unistate-pages-upload.zip`: extract it and upload its contents to the root of a dedicated public repository, then select Pages → Deploy from a branch → `main` → `/ (root)`. This option does not require the Actions workflow.

All URLs for local assets are relative so the page works under a repository subpath. No backend, analytics service, external font service, or npm build is required. Videos are muted and automatically play when at least 20% visible; off-screen playback pauses. Reduced-motion preferences disable automatic playback. Extra scenes do not preload their video files.

## Source provenance

- Title, abstract-derived explanatory copy, method: `main.tex`, `sections/00_abstract.tex`, `sections/03_method.tex`.
- Quantitative comparison: `sections/04_experiments.tex`, table `comparison-competitors`.
- Method image: rendered from `figures/overview.pdf`.
- Demo labels and 63 MP4 files: `Supplementary_of_ UniState/supplementary.html` and `static/sources` in the supplied parent folder.
- Author order and affiliations: provided by the user.

No acceptance claim, arXiv ID, release date, or BibTeX metadata has been invented.

Deployment reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Local revision — 2026-10-01 (deployed)

Qualitative comparisons now use previous/next arrows and four numbered selectors. Each example is a single 3×2 H.264 video with method labels, shared playback/seeking, poster previews, and fast-start metadata. Each source panel is scaled from 832×480 to 520×300; the combined frame is 1584×688 at the original 16 fps, retaining all 81 frames. Original videos are preserved.

To regenerate, run `python3 scripts/compose_comparisons.py --ffmpeg /path/to/ffmpeg --font /path/to/Arial.ttf`. The encoding report is `scripts/comparison-encoding.json`. This revision was deployed on 2026-10-01. The upload ZIP has been refreshed.

Local autoplay revision: visible videos play muted and loop, while off-screen or hidden-tab playback pauses. Native play/pause controls remain available. Deployed on 2026-10-01.

Local gallery revision: replaced the collapsed extra-scenes list with an always-visible gallery, ten scene buttons, previous/next navigation, three videos per scene, and preview posters. All 30 original trajectories remain accessible; only the selected scene is loaded. Scene changes and automatic playback checked in the browser. Deployed on 2026-10-01.

Latest deployment: https://curryjung.github.io/unistate/ — commit `528bd6ac5cb208d7030bf01469dc61f135a9ac04`; GitHub Actions run 36824048286 succeeded. Includes centered intervention examples and qualitative comparisons above the quantitative table.


## Results-focused revision — deployed 2026-10-01

The original 24.63-second output is now presented as two independent clips: state persistence (9.5 seconds) and continued object/camera control (14.5 seconds). The slide transition is omitted; the original is preserved. Regenerate with `python3 scripts/split_rollouts.py --ffmpeg /path/to/ffmpeg`; segment metadata is in `scripts/rollout-segments.json`.

Representative captions describe specified controls and generated responses. Method exposition is reduced to a short overview and a paper reference. Comparisons include a short instruction and viewing guide for each example; the quantitative table is unchanged. The additional scene gallery follows state persistence and comparison results. Author and Familiar links and the gallery's lateral navigation are included in this revision. The upload ZIP does not include this revision.

Local carousel refinement: removed the scene-count eyebrow, reduced scene selectors, widened the gallery video area, and added directional fade/slide transitions to both carousels. Poster decoding precedes source replacement; rapid selections resolve to the latest requested scene, and reduced-motion preferences skip animation. Deployed on 2026-10-01.

Latest verified deployment (2026-10-01): `5a793242a7d1306f2ee6f9c3b89ea7386903de59`, GitHub Actions run [36827051712](https://github.com/curryjung/unistate/actions/runs/36827051712), success. Includes all results and carousel changes plus the cat/balloon swap. Public HTML, JS, CSS and configuration match the local files; both split videos return HTTP 200.

Rollout presentation revision: cropped white framing and embedded title bands from the two rollout videos, preserving their durations and the original source. Cropped assets use new filenames; crop rectangles are recorded in `scripts/rollout-segments.json`. Continued control now precedes state persistence. Control-stage labels on the page follow the original transitions at 130/30 and 9.6 seconds.
