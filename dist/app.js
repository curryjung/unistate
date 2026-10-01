"use strict";
const config = window.UNISTATE || {};
const validUrl = value => { try { return new URL(value).protocol === "https:"; } catch { return false; } };
if (config.affiliations) {
 const affiliationsElement = document.getElementById("affiliations");
 const text = config.affiliations;
 affiliationsElement.replaceChildren();
 let position = 0;
 const links = Object.entries(config.affiliationLinks || {})
  .map(([name, url]) => ({ name, url, index: text.indexOf(name) }))
  .filter(link => link.index >= 0 && validUrl(link.url))
  .sort((a, b) => a.index - b.index);
 for (const link of links) {
  if (link.index < position) continue;
  affiliationsElement.append(document.createTextNode(text.slice(position, link.index)));
  const anchor = document.createElement("a");
  anchor.textContent = link.name;
  anchor.href = link.url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  affiliationsElement.append(anchor);
  position = link.index + link.name.length;
 }
 affiliationsElement.append(document.createTextNode(text.slice(position)));
 affiliationsElement.hidden = false;
}
const authorsElement = document.getElementById("authors");
if (Array.isArray(config.authors) && config.authors.length) {
 authorsElement.replaceChildren();
 config.authors.forEach((author, i) => {
  if (i) authorsElement.append(document.createTextNode(" · "));
  const block = document.createElement("span");
  block.className = "author-block";
  let hasLink = false;
  try { hasLink = ["https:", "http:"].includes(new URL(author.url).protocol); } catch {}
  const name = document.createElement(hasLink ? "a" : "span");
  name.textContent = author.name;
  if (hasLink) {
   name.href = author.url;
   name.target = "_blank";
   name.rel = "noopener noreferrer";
  }
  block.append(name);
  if (author.affiliation) {
   const affiliation = document.createElement("sup");
   affiliation.textContent = author.affiliation;
   block.append(affiliation);
  }
  authorsElement.append(block);
 });
 authorsElement.hidden = false;
} else if (typeof config.authors === "string" && config.authors) {
 authorsElement.textContent = config.authors;
 authorsElement.hidden = false;
}
if (validUrl(config.arxivUrl)) {
 const link = document.createElement("a"); link.className = "button"; link.textContent = "Read on arXiv"; link.href = config.arxivUrl;
 document.getElementById("arxiv").replaceWith(link);
 document.getElementById("method-paper-link").href = config.arxivUrl;
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
// Fade and gently slide the media while retaining the existing controls and layout.
// A newer selection cancels the earlier transition so rapid clicks finish on the latest choice.
const carouselTransitions = new WeakMap();
async function transitionMedia(element, direction, posters, update) {
 const state = carouselTransitions.get(element) || { version: 0 };
 const version = ++state.version;
 carouselTransitions.set(element, state);
 element.setAttribute("aria-busy", "true");
 // Decode small posters before replacing sources, avoiding a blank frame on first visit.
 await Promise.race([
  Promise.all(posters.map(src => {
   const poster = new Image();
   poster.src = src;
   return poster.decode().catch(() => {});
  })),
  new Promise(resolve => setTimeout(resolve, 500))
 ]);
 if (state.version !== version) return;
 const current = getComputedStyle(element);
 const start = { opacity: current.opacity, transform: current.transform };
 state.animation?.cancel();
 if (motionPreference.matches) {
  update();
  element.removeAttribute("aria-busy");
  return;
 }
 state.animation = element.animate([
  start,
  { opacity: 0, transform: `translateX(${-direction * 14}px)` }
 ], { duration: 130, easing: "ease-in", fill: "forwards" });
 await state.animation.finished.catch(() => {});
 if (state.version !== version) return;
 update();
 state.animation.cancel();
 state.animation = element.animate([
  { opacity: 0, transform: `translateX(${direction * 18}px)` },
  { opacity: 1, transform: "translateX(0)" }
 ], { duration: 240, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" });
 await state.animation.finished.catch(() => {});
 if (state.version !== version) return;
 state.animation.cancel();
 element.removeAttribute("aria-busy");
}
const comparisonVideo = document.getElementById("comparison-video");
const comparisonSlide = document.querySelector(".comparison-slide");
const comparisonButtons = [...document.querySelectorAll("[data-comparison-index]")];
const comparisonDescriptions = [
 "Move and rotate the ball behind the blocks while keeping the camera fixed. Compare the ball’s rotation, occlusion, and background stability.",
 "Move the yellow robot forward and left while turning it; move the camera right. Compare the robot’s approach and heading under the viewpoint change.",
 "Move the ball up and down and rotate it while tilting the camera upward. Compare the ball’s changing orientation and vertical motion.",
 "Move the tractor behind the hay and partly back while moving the camera forward. Compare the return motion and whether the hay remains in place."
];
let comparisonIndex = 0;
function showComparison(index) {
 const next = (index + comparisonButtons.length) % comparisonButtons.length;
 if (next === comparisonIndex) return;
 const resume = !comparisonVideo.paused;
 const direction = index > comparisonIndex ? 1 : -1;
 comparisonIndex = next;
 transitionMedia(comparisonSlide, direction, [`assets/videos/comparisons/sequence-${next + 1}.jpg`], () => {
 document.getElementById("comparison-description").textContent = comparisonDescriptions[next];
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
 if (resume) autoplayVisible(comparisonVideo);
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
 const direction = index > sceneIndex ? 1 : -1;
 sceneIndex = next;
 const scene = galleryScenes[next];
 transitionMedia(document.getElementById("scene-videos"), direction, scene.clips.map(clip => clip.poster), () => {
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
 });
}
sceneButtons.forEach((button, i) => button.addEventListener("click", () => showScene(i)));
document.getElementById("scene-prev").addEventListener("click", () => showScene(sceneIndex - 1));
document.getElementById("scene-next").addEventListener("click", () => showScene(sceneIndex + 1));

// Match the original clip's phase labels after cropping its white title band.
const rolloutVideo = document.querySelector("#continued-control video");
const rolloutPhases = [...document.querySelectorAll("[data-rollout-phase]")];
function updateRolloutPhase() {
 const phase = rolloutVideo.currentTime >= 9.6 ? 2 : rolloutVideo.currentTime >= 130 / 30 ? 1 : 0;
 rolloutPhases.forEach((label, index) => {
  if (index === phase) label.setAttribute("aria-current", "step");
  else label.removeAttribute("aria-current");
 });
}
["loadedmetadata", "timeupdate", "seeked"].forEach(event => rolloutVideo.addEventListener(event, updateRolloutPhase));
