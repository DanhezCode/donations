(function () {
  const COOKIE_NAME = "opinionated_ts_lang";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = ["en", "es"];

  function readCookie(name) {
    const cookieString = document.cookie;
    const match = cookieString.match(
      new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]*)")
    );

    return match ? decodeURIComponent(match[1]) : "";
  }

  function writeCookie(name, value) {
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expiresAt}; path=/; SameSite=Lax`;
  }

  function normalizeLanguage(language) {
    const locale = String(language || "").toLowerCase();

    if (locale.startsWith("es")) {
      return "es";
    }

    if (locale.startsWith("en")) {
      return "en";
    }

    return DEFAULT_LANGUAGE;
  }

  function getSiteBasePath() {
    const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
    const normalizedPath = currentPath
      .replace(/\/index\.html?$/i, "")
      .replace(/\/terms\.html?$/i, "");

    return normalizedPath || "/";
  }

  function getCurrentPageLanguage() {
    const currentPath = window.location.pathname;
    const htmlLang = document.documentElement.lang || "";

    if (currentPath.includes("/es") || htmlLang.toLowerCase().startsWith("es")) {
      return "es";
    }

    return "en";
  }

  function getPageTarget(language) {
    const siteBasePath = getSiteBasePath();
    const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
    const lastSegment = currentPath.split("/").filter(Boolean).pop() || "index.html";
    const pageName = /\.html?$/i.test(lastSegment) ? lastSegment : "index.html";
    const baseWithoutLanguage = siteBasePath.endsWith("/es") ? siteBasePath.slice(0, -3) || "/" : siteBasePath;

    const targetDirectory =
      language === "es"
        ? baseWithoutLanguage === "/" ? "/es" : `${baseWithoutLanguage}/es`
        : baseWithoutLanguage;

    const targetBase = `${window.location.origin}${targetDirectory === "/" ? "" : targetDirectory}/`;
    const targetUrl = new URL(pageName, targetBase);

    targetUrl.search = window.location.search;
    targetUrl.hash = window.location.hash;

    return targetUrl;
  }

  function getPreferredLanguage() {
    const cookieValue = readCookie(COOKIE_NAME);

    if (cookieValue && SUPPORTED_LANGUAGES.includes(cookieValue)) {
      return cookieValue;
    }

    if (!cookieValue) {
      const browserLanguage = navigator.language || navigator.languages?.[0] || DEFAULT_LANGUAGE;
      const detectedLanguage = normalizeLanguage(browserLanguage);

      writeCookie(COOKIE_NAME, detectedLanguage);
      return detectedLanguage;
    }

    return DEFAULT_LANGUAGE;
  }

  function applyLanguageRedirect() {
    const currentLanguage = getCurrentPageLanguage();
    const preferredLanguage = getPreferredLanguage();

    if (preferredLanguage !== currentLanguage) {
      window.location.replace(getPageTarget(preferredLanguage).toString());
      return;
    }

    document.querySelectorAll("[data-language-switch]").forEach((button) => {
      const selectedLanguage = button.dataset.languageSwitch;
      const isActive = selectedLanguage === currentLanguage;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  document.addEventListener("DOMContentLoaded", applyLanguageRedirect);
})();
