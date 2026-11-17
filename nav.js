/* Aakar Group - responsive header (hamburger + accordion sub-menus) */
(function () {
  var h = document.querySelector("header");
  if (!h) return;
  var btn = h.querySelector(".nb"), nav = h.querySelector("#nav");
  if (!btn || !nav) return;
  var mq = window.matchMedia("(max-width:1100px)");

  /* add a small expand/collapse button next to every parent item that has a sub-menu */
  Array.prototype.forEach.call(nav.children, function (li) {
    var sub = li.querySelector(":scope > ul"), a = li.querySelector(":scope > a");
    if (!sub || !a) return;
    var label = a.textContent.replace("▾", "").trim();
    var t = document.createElement("button");
    t.type = "button";
    t.className = "sb";
    t.setAttribute("aria-label", label + " sub-menu");
    t.setAttribute("aria-expanded", "false");
    li.insertBefore(t, sub);
    t.addEventListener("click", function () {
      var open = li.classList.toggle("open");
      t.setAttribute("aria-expanded", open ? "true" : "false");
    });
    /* keep the current section expanded */
    if (a.classList.contains("on") || sub.querySelector("a.on")) {
      li.classList.add("open");
      t.setAttribute("aria-expanded", "true");
    }
  });

  function fit() {
    /* menu panel never taller than the visible screen under the header */
    if (!mq.matches) { nav.style.maxHeight = ""; return; }
    var room = window.innerHeight - h.getBoundingClientRect().bottom;
    nav.style.maxHeight = Math.max(180, room) + "px";
  }
  function set(open) {
    h.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) fit();
  }

  btn.addEventListener("click", function (e) { e.stopPropagation(); set(!h.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("click", function (e) {
    if (h.classList.contains("open") && !h.contains(e.target)) set(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && h.classList.contains("open")) { set(false); btn.focus(); }
  });
  window.addEventListener("resize", fit);
  window.addEventListener("scroll", function () { if (h.classList.contains("open")) fit(); }, { passive: true });
  (mq.addEventListener ? mq.addEventListener("change", function () { set(false); fit(); })
                       : mq.addListener(function () { set(false); fit(); }));
})();
