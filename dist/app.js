"use strict";
const config = window.UNISTATE || {};
const validUrl = value => { try { return new URL(value).protocol === "https:"; } catch { return false; } };
for (const id of ["authors", "affiliations"]) {
  if (config[id]) { document.getElementById(id).textContent = config[id]; document.getElementById(id).hidden = false; }
}
if (validUrl(config.arxivUrl)) {
 const link = document.createElement("a"); link.className = "button"; link.textContent = "Read on arXiv"; link.href = config.arxivUrl;
 document.getElementById("arxiv").replaceWith(link);
 document.getElementById("publication-status").textContent = "The paper is available on arXiv.";
}
if (validUrl(config.codeUrl)) { const link = document.createElement("a"); link.className = "button secondary"; link.textContent = "Code"; link.href = config.codeUrl; document.getElementById("code").replaceWith(link); }
if (config.bibtex) {
 document.getElementById("citation").hidden = false;
 document.getElementById("bibtex").textContent = config.bibtex;
 document.getElementById("copy-citation").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(config.bibtex); document.getElementById("copy-status").textContent = " Copied."; }
  catch { document.getElementById("copy-status").textContent = " Select and copy the citation above."; }
 });
}
const comparisonVideo = document.getElementById("comparison-video");
const comparisonSlide = document.querySelector(".comparison-slide");
const comparisonButtons = [...document.querySelectorAll("[data-comparison-index]")];
let comparisonIndex = 0;
let comparisonRequest = 0;
function showComparison(index) {
 const next = (index + comparisonButtons.length) % comparisonButtons.length;
 if (next === comparisonIndex) return;
 const resume = !comparisonVideo.paused;
 const request = ++comparisonRequest;
 comparisonIndex = next;
 const number = next + 1;
 const base = `assets/videos/comparisons/sequence-${number}`;
 comparisonVideo.pause();
 comparisonVideo.poster = `${base}.jpg`;
 comparisonVideo.querySelector("source").src = `${base}.mp4`;
 document.getElementById("comparison-download").href = `${base}.mp4`;
 comparisonVideo.setAttribute("aria-label", `Example ${number}: synchronized comparison of UniState, VerseCrafter, WorldDirector, MotionCanvas, SymphoMotion, and Real2SAM2Real`);
 comparisonSlide.setAttribute("aria-label", `Example ${number} of ${comparisonButtons.length}`);
 document.getElementById("comparison-count").textContent = `Example ${number} / ${comparisonButtons.length}`;
 document.getElementById("comparison-error").hidden = true;
 comparisonButtons.forEach((button, i) => {
  if (i === next) button.setAttribute("aria-current", "true");
  else button.removeAttribute("aria-current");
 });
 comparisonVideo.load();
 if (resume) comparisonVideo.play().catch(() => {
  // Native play controls remain available when playback is blocked or interrupted.
  if (request !== comparisonRequest) return;
 });
}
document.getElementById("comparison-prev").addEventListener("click", () => showComparison(comparisonIndex - 1));
document.getElementById("comparison-next").addEventListener("click", () => showComparison(comparisonIndex + 1));
comparisonButtons.forEach((button, i) => button.addEventListener("click", () => showComparison(i)));
document.querySelector(".comparison-carousel").addEventListener("keydown", event => {
 if (event.target.tagName !== "BUTTON" || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
 event.preventDefault();
 showComparison(comparisonIndex + (event.key === "ArrowRight" ? 1 : -1));
});
comparisonVideo.addEventListener("error", () => { document.getElementById("comparison-error").hidden = false; });
// Only visible videos play; off-screen clips stay idle.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const visibleVideos = new Set();
const resumeAfterVisibility = new Set();
function autoplayVisible(video) {
 if (document.hidden || motionPreference.matches || !visibleVideos.has(video)) return;
 video.play().catch(() => { /* Keep native controls available if autoplay is blocked. */ });
}
const observer = new IntersectionObserver(entries => {
 for (const entry of entries) {
  const video = entry.target;
  if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
   visibleVideos.add(video);
   autoplayVisible(video);
  } else {
   visibleVideos.delete(video);
   resumeAfterVisibility.delete(video);
   video.pause();
  }
 }
}, {threshold: [0, 0.2]});
document.querySelectorAll("video").forEach(video => {
 video.muted = true;
 observer.observe(video);
});
document.addEventListener("visibilitychange", () => {
 if (document.hidden) {
  resumeAfterVisibility.clear();
  visibleVideos.forEach(video => {
   if (!video.paused) resumeAfterVisibility.add(video);
   video.pause();
  });
 } else {
  resumeAfterVisibility.forEach(autoplayVisible);
  resumeAfterVisibility.clear();
 }
});
motionPreference.addEventListener("change", () => {
 if (motionPreference.matches) visibleVideos.forEach(video => video.pause());
 else visibleVideos.forEach(autoplayVisible);
});

const galleryScenes = [{"name": "Car & tree", "clips": [{"src": "assets/videos/more/project-car_and_tree-om_000_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-car_and_tree-om_000_cm_001-vis.jpg", "label": "Object motion 1 · Camera path 2"}, {"src": "assets/videos/more/project-car_and_tree-om_001_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-car_and_tree-om_001_cm_000-vis.jpg", "label": "Object motion 2 · Camera path 1"}, {"src": "assets/videos/more/project-car_and_tree-om_002_cm_002-vis.mp4", "poster": "assets/videos/more/posters/project-car_and_tree-om_002_cm_002-vis.jpg", "label": "Object motion 3 · Camera path 3"}]}, {"name": "Car show", "clips": [{"src": "assets/videos/more/project-car_show-om_000_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-car_show-om_000_cm_000-vis.jpg", "label": "Object motion 1 · Camera path 1"}, {"src": "assets/videos/more/project-car_show-om_001_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-car_show-om_001_cm_001-vis.jpg", "label": "Object motion 2 · Camera path 2"}, {"src": "assets/videos/more/project-car_show-om_002_cm_002-vis.mp4", "poster": "assets/videos/more/posters/project-car_show-om_002_cm_002-vis.jpg", "label": "Object motion 3 · Camera path 3"}]}, {"name": "Delivery robot", "clips": [{"src": "assets/videos/more/project-deliver_robot-om_000_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-deliver_robot-om_000_cm_000-vis.jpg", "label": "Object motion 1 · Camera path 1"}, {"src": "assets/videos/more/project-deliver_robot-om_001_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-deliver_robot-om_001_cm_001-vis.jpg", "label": "Object motion 2 · Camera path 2"}, {"src": "assets/videos/more/project-deliver_robot-om_002_cm_002-vis.mp4", "poster": "assets/videos/more/posters/project-deliver_robot-om_002_cm_002-vis.jpg", "label": "Object motion 3 · Camera path 3"}]}, {"name": "Excavator", "clips": [{"src": "assets/videos/more/project-excavator-om_000_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-excavator-om_000_cm_001-vis.jpg", "label": "Object motion 1 · Camera path 2"}, {"src": "assets/videos/more/project-excavator-om_001_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-excavator-om_001_cm_000-vis.jpg", "label": "Object motion 2 · Camera path 1"}, {"src": "assets/videos/more/project-excavator-om_002_cm_002-vis.mp4", "poster": "assets/videos/more/posters/project-excavator-om_002_cm_002-vis.jpg", "label": "Object motion 3 · Camera path 3"}]}, {"name": "Rabbit tumbler", "clips": [{"src": "assets/videos/more/project-rabbit_tumbler-om_000_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-rabbit_tumbler-om_000_cm_001-vis.jpg", "label": "Object motion 1 · Camera path 2"}, {"src": "assets/videos/more/project-rabbit_tumbler-om_001_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-rabbit_tumbler-om_001_cm_000-vis.jpg", "label": "Object motion 2 · Camera path 1"}, {"src": "assets/videos/more/project-rabbit_tumbler-om_002_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-rabbit_tumbler-om_002_cm_001-vis.jpg", "label": "Object motion 3 · Camera path 2"}]}, {"name": "Robot hand", "clips": [{"src": "assets/videos/more/project-robot_hand_with_block-om_000_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-robot_hand_with_block-om_000_cm_000-vis.jpg", "label": "Object motion 1 · Camera path 1"}, {"src": "assets/videos/more/project-robot_hand_with_block-om_001_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-robot_hand_with_block-om_001_cm_001-vis.jpg", "label": "Object motion 2 · Camera path 2"}, {"src": "assets/videos/more/project-robot_hand_with_block-om_002_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-robot_hand_with_block-om_002_cm_000-vis.jpg", "label": "Object motion 3 · Camera path 1"}]}, {"name": "Supermarket robot", "clips": [{"src": "assets/videos/more/project-supermarket_ask_robot-om_000_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-supermarket_ask_robot-om_000_cm_000-vis.jpg", "label": "Object motion 1 · Camera path 1"}, {"src": "assets/videos/more/project-supermarket_ask_robot-om_001_cm_002-vis.mp4", "poster": "assets/videos/more/posters/project-supermarket_ask_robot-om_001_cm_002-vis.jpg", "label": "Object motion 2 · Camera path 3"}, {"src": "assets/videos/more/project-supermarket_ask_robot-om_002_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-supermarket_ask_robot-om_002_cm_001-vis.jpg", "label": "Object motion 3 · Camera path 2"}]}, {"name": "Tissue box", "clips": [{"src": "assets/videos/more/project-tissue_box-om_000_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-tissue_box-om_000_cm_000-vis.jpg", "label": "Object motion 1 · Camera path 1"}, {"src": "assets/videos/more/project-tissue_box-om_001_cm_002-vis.mp4", "poster": "assets/videos/more/posters/project-tissue_box-om_001_cm_002-vis.jpg", "label": "Object motion 2 · Camera path 3"}, {"src": "assets/videos/more/project-tissue_box-om_002_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-tissue_box-om_002_cm_001-vis.jpg", "label": "Object motion 3 · Camera path 2"}]}, {"name": "Toy car & flower", "clips": [{"src": "assets/videos/more/project-toy_car_and_flower-om_000_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-toy_car_and_flower-om_000_cm_000-vis.jpg", "label": "Object motion 1 · Camera path 1"}, {"src": "assets/videos/more/project-toy_car_and_flower-om_000_cm_002-vis.mp4", "poster": "assets/videos/more/posters/project-toy_car_and_flower-om_000_cm_002-vis.jpg", "label": "Object motion 1 · Camera path 3"}, {"src": "assets/videos/more/project-toy_car_and_flower-om_001_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-toy_car_and_flower-om_001_cm_001-vis.jpg", "label": "Object motion 2 · Camera path 2"}]}, {"name": "Tractor & hay", "clips": [{"src": "assets/videos/more/project-tractor_and_hay-om_000_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-tractor_and_hay-om_000_cm_000-vis.jpg", "label": "Object motion 1 · Camera path 1"}, {"src": "assets/videos/more/project-tractor_and_hay-om_001_cm_001-vis.mp4", "poster": "assets/videos/more/posters/project-tractor_and_hay-om_001_cm_001-vis.jpg", "label": "Object motion 2 · Camera path 2"}, {"src": "assets/videos/more/project-tractor_and_hay-om_002_cm_000-vis.mp4", "poster": "assets/videos/more/posters/project-tractor_and_hay-om_002_cm_000-vis.jpg", "label": "Object motion 3 · Camera path 1"}]}];
const sceneButtons = [...document.querySelectorAll("[data-scene-index]")];
const sceneFigures = [...document.querySelectorAll("#scene-videos figure")];
let sceneIndex = 0;
function showScene(index) {
 const next = (index + galleryScenes.length) % galleryScenes.length;
 if (next === sceneIndex) return;
 sceneIndex = next;
 const scene = galleryScenes[next];
 document.getElementById("scene-name").textContent = scene.name;
 document.getElementById("scene-count").textContent = `Scene ${next + 1} / ${galleryScenes.length}`;
 sceneButtons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === next)));
 sceneFigures.forEach((figure, i) => {
  const video = figure.querySelector("video");
  const clip = scene.clips[i];
  video.pause();
  video.poster = clip.poster;
  video.setAttribute("aria-label", `${scene.name}: ${clip.label}`);
  video.querySelector("source").src = clip.src;
  video.querySelector("a").href = clip.src;
  figure.querySelector("figcaption").textContent = clip.label;
  video.load();
  autoplayVisible(video);
 });
}
sceneButtons.forEach((button, i) => button.addEventListener("click", () => showScene(i)));
document.getElementById("scene-prev").addEventListener("click", () => showScene(sceneIndex - 1));
document.getElementById("scene-next").addEventListener("click", () => showScene(sceneIndex + 1));
