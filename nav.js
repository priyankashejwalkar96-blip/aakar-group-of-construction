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

  /* Scroll To Top Functionality */
  var stBtn = document.getElementById("scrollTop");
  if (stBtn) {
    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 250) {
        stBtn.classList.add("visible");
      } else {
        stBtn.classList.remove("visible");
      }
    }, { passive: true });

    stBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  /* Animated Counter for Stats */
  var statCounters = document.querySelectorAll(".st b[data-count]");
  if (statCounters.length > 0) {
    function animateCount(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1800; // ms
      var startTime = null;

      function step(currentTime) {
        if (!startTime) startTime = currentTime;
        var progress = Math.min((currentTime - startTime) / duration, 1);
        // easeOutExpo curve for smooth slowing down at end
        var ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        var current = Math.floor(ease * target);
        el.textContent = prefix + current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target + suffix;
        }
      }
      requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      statCounters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    } else {
      statCounters.forEach(function (counter) {
        animateCount(counter);
      });
    }
  }

  /* Category Filter Chips for Projects */
  var chipContainers = document.querySelectorAll(".chips");
  chipContainers.forEach(function (container) {
    var chips = container.querySelectorAll("span");
    var section = container.closest("section");
    if (!section) return;
    var cards = section.querySelectorAll(".card[data-category]");
    if (cards.length === 0) return;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("on"); });
        chip.classList.add("on");

        var filter = (chip.getAttribute("data-filter") || chip.textContent.trim().toLowerCase());
        cards.forEach(function (card) {
          var categories = (card.getAttribute("data-category") || "").toLowerCase().split(/\s+/);
          if (filter === "all" || categories.indexOf(filter) !== -1) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  });

  /* Testimonial Carousel Slider */
  var sliders = document.querySelectorAll(".testi-slider-wrap");
  sliders.forEach(function (wrap) {
    var track = wrap.querySelector(".testi-track");
    var cards = wrap.querySelectorAll(".ts-card");
    var prevBtn = wrap.querySelector(".ts-prev");
    var nextBtn = wrap.querySelector(".ts-next");
    var sec = wrap.closest(".ts-sec");
    var dotsContainer = sec ? sec.querySelector(".ts-dots") : null;
    if (!track || cards.length === 0) return;

    var currentIndex = 0;
    var autoPlayTimer = null;

    function getVisibleCount() {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 960) return 2;
      return 3;
    }

    function getMaxIndex() {
      var visible = getVisibleCount();
      return Math.max(0, cards.length - visible);
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      var max = getMaxIndex();
      for (var i = 0; i <= max; i++) {
        (function (idx) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "ts-dot" + (idx === currentIndex ? " active" : "");
          dot.setAttribute("aria-label", "Slide to " + (idx + 1));
          dot.addEventListener("click", function () {
            goTo(idx);
            resetAutoplay();
          });
          dotsContainer.appendChild(dot);
        })(i);
      }
    }

    function update() {
      var max = getMaxIndex();
      if (currentIndex > max) currentIndex = max;
      if (currentIndex < 0) currentIndex = 0;

      var cardWidth = cards[0].getBoundingClientRect().width;
      var gap = 24;
      var moveAmount = currentIndex * (cardWidth + gap);
      track.style.transform = "translateX(-" + moveAmount + "px)";

      if (prevBtn) prevBtn.disabled = (currentIndex === 0);
      if (nextBtn) nextBtn.disabled = (currentIndex >= max);

      if (dotsContainer) {
        var dots = dotsContainer.querySelectorAll(".ts-dot");
        dots.forEach(function (d, idx) {
          d.classList.toggle("active", idx === currentIndex);
        });
      }
    }

    function goTo(idx) {
      currentIndex = idx;
      update();
    }

    function next() {
      var max = getMaxIndex();
      if (currentIndex >= max) {
        currentIndex = 0;
      } else {
        currentIndex++;
      }
      update();
    }

    function prev() {
      var max = getMaxIndex();
      if (currentIndex <= 0) {
        currentIndex = max;
      } else {
        currentIndex--;
      }
      update();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        resetAutoplay();
      });
    }

    function startAutoplay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(next, 4500);
    }

    function resetAutoplay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      startAutoplay();
    }

    wrap.addEventListener("mouseenter", function () {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    });

    wrap.addEventListener("mouseleave", function () {
      startAutoplay();
    });

    // Touch swipe support
    var startX = 0;
    var isDragging = false;
    wrap.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
      isDragging = true;
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }, { passive: true });

    wrap.addEventListener("touchend", function (e) {
      if (!isDragging) return;
      var diffX = e.changedTouches[0].clientX - startX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) next();
        else prev();
      }
      isDragging = false;
      startAutoplay();
    }, { passive: true });

    window.addEventListener("resize", function () {
      buildDots();
      update();
    });

    buildDots();
    update();
    startAutoplay();
  });
})();
