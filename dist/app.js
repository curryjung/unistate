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
document.getElementById("scene").addEventListener("change", event => {
 for (const figure of document.querySelectorAll("[data-method]")) {
  const video = figure.querySelector("video"); video.pause();
  video.querySelector("source").src = `assets/videos/figure-${event.target.value}-${figure.dataset.method}.mp4`;
  video.load();
 }
});
const observer = new IntersectionObserver(entries => {
 for (const entry of entries) if (!entry.isIntersecting) entry.target.pause();
}, {threshold: 0.05});
document.querySelectorAll("video").forEach(video => observer.observe(video));
document.addEventListener("visibilitychange", () => { if (document.hidden) document.querySelectorAll("video").forEach(video => video.pause()); });
