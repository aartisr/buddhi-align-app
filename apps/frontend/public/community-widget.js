(function () {
  var DEFAULT_BASE_URL = "https://buddhi-align.foreverlotus.com/community";
  var MODULE_SLUGS = {
    karma: "karma-yoga",
    bhakti: "bhakti-journal",
    jnana: "jnana-reflection",
    dhyana: "dhyana-meditation",
    vasana: "vasana-tracker",
    dharma: "dharma-planner",
    motivation: "motivation-analytics",
    autograph: "autograph-exchange"
  };

  function trimTrailingSlash(value) {
    return String(value || "").replace(/\/+$/, "");
  }

  function buildCommunityUrl(baseUrl, moduleKey) {
    var base = trimTrailingSlash(baseUrl || DEFAULT_BASE_URL);
    var slug = MODULE_SLUGS[String(moduleKey || "").toLowerCase()];
    return slug ? base + "/c/" + encodeURIComponent(slug) : base;
  }

  function appendText(node, text) {
    node.appendChild(document.createTextNode(text));
  }

  function renderWidget(host, script) {
    var baseUrl = host.getAttribute("data-base-url") || script.getAttribute("data-base-url") || DEFAULT_BASE_URL;
    var moduleKey = host.getAttribute("data-module") || script.getAttribute("data-module") || "";
    var title = host.getAttribute("data-title") || "ForeverLotus Community";
    var body = host.getAttribute("data-body") || "Join mindful practice conversations, module discussions, and community support from Buddhi Align.";
    var label = host.getAttribute("data-label") || "Join the community";
    var href = buildCommunityUrl(baseUrl, moduleKey);

    var card = document.createElement("div");
    card.style.cssText = [
      "box-sizing:border-box",
      "max-width:420px",
      "border:1px solid rgba(47,93,80,.22)",
      "border-radius:12px",
      "padding:16px",
      "background:#fffdf7",
      "color:#1f352d",
      "font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      "box-shadow:0 12px 30px rgba(47,93,80,.12)"
    ].join(";");

    var heading = document.createElement("h3");
    heading.style.cssText = "margin:0 0 8px;font-size:18px;line-height:1.3;color:#2f5d50;";
    appendText(heading, title);

    var copy = document.createElement("p");
    copy.style.cssText = "margin:0 0 14px;font-size:14px;line-height:1.55;color:#40534b;";
    appendText(copy, body);

    var link = document.createElement("a");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.cssText = [
      "display:inline-flex",
      "align-items:center",
      "justify-content:center",
      "min-height:40px",
      "padding:0 14px",
      "border-radius:10px",
      "background:#2f5d50",
      "color:#fff",
      "font-size:14px",
      "font-weight:700",
      "text-decoration:none"
    ].join(";");
    appendText(link, label);

    card.appendChild(heading);
    card.appendChild(copy);
    card.appendChild(link);
    host.textContent = "";
    host.appendChild(card);
  }

  function boot() {
    var script = document.currentScript || document.querySelector("script[src*='community-widget.js']");
    var hosts = document.querySelectorAll("[data-buddhi-community-widget]");
    for (var i = 0; i < hosts.length; i += 1) {
      renderWidget(hosts[i], script || document.createElement("script"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
