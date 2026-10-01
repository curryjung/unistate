# UniState

**Unifying Memory and Intervention for Controllable World Simulation**

Jaeseok Jeong, Kyungmook Choi, Sohyun Chung, Youngsik Yun, Youngjung Uh  
Department of Artificial Intelligence, Yonsei University · Familiar

This repository hosts the research project website. Paper and implementation links are coming soon.

## Update

Edit `dist/site-config.js` to set the arXiv URL, code URL, author information, and confirmed BibTeX. Edit `dist/index.html`, `dist/style.css`, and `dist/app.js` for page content, styling, and interactions.

GitHub Actions publishes `dist` to GitHub Pages on pushes to `main`.

## Local preview

```sh
python3 -m http.server 8765 --directory dist
```

## Video presentation

Comparison examples use synchronized 3×2 composite videos and previous/next controls. Qualitative comparisons appear before the quantitative table. The scene gallery exposes all ten scenes, with three trajectories per scene. Videos automatically play muted when visible, pause off-screen, and respect reduced-motion preferences.

Regenerate composite videos with `python3 scripts/compose_comparisons.py --ffmpeg /path/to/ffmpeg --font /path/to/font.ttf`. Encoding sizes are recorded in `scripts/comparison-encoding.json`.
