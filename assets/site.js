// Search / filter on the home page, and chart rendering on report pages.
(function () {
  const q = document.getElementById("q");
  const seg = document.getElementById("seg");
  let rating = "";
  function apply() {
    const term = (q && q.value || "").trim().toLowerCase();
    document.querySelectorAll("#grid .rcard").forEach((c) => {
      const ok = (!term || c.dataset.search.includes(term)) && (!rating || c.dataset.rating === rating);
      c.classList.toggle("hide", !ok);
    });
    document.querySelectorAll("#tbl tbody tr").forEach((r) => {
      r.classList.toggle("hide", !!term && !r.dataset.search.includes(term) && !r.textContent.toLowerCase().includes(term));
    });
  }
  if (q) q.addEventListener("input", apply);
  if (seg) seg.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    seg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    rating = b.dataset.f; apply();
  });

  // Show timestamps in the reader's own time zone (the HTML fallback is UTC).
  document.querySelectorAll("time[data-local]").forEach((t) => {
    const d = new Date(t.getAttribute("datetime"));
    if (isNaN(d)) return;
    t.title = d.toUTCString();
    t.textContent = t.dataset.local === "t"
      ? d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })
      : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  });

  // Render charts lazily when they scroll into view (keeps report pages fast on phones).
  const nodes = document.querySelectorAll("script[data-chart]");
  if (!nodes.length) return;
  function render(node) {
    if (node.dataset.done || typeof Plotly === "undefined") return;
    node.dataset.done = "1";
    const fig = JSON.parse(node.textContent);
    const layout = Object.assign({}, fig.layout, { autosize: true, paper_bgcolor: "rgba(0,0,0,0)",
      font: Object.assign({ family: "Inter, system-ui, sans-serif" }, (fig.layout || {}).font) });
    delete layout.width;
    Plotly.newPlot(node.dataset.chart, fig.data, layout, { responsive: true, displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"] });
  }
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { render(document.querySelector(`script[data-chart="${en.target.id}"]`)); io.unobserve(en.target); } });
  }, { rootMargin: "400px" }) : null;
  window.addEventListener("load", () => nodes.forEach((n) => io ? io.observe(document.getElementById(n.dataset.chart)) : render(n)));
})();
