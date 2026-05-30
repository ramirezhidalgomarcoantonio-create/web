const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  navLinks?.classList.toggle("is-open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".accordion-item").forEach((item, index) => {
  if (index === 0) item.classList.add("is-open");
  const title = item.querySelector(".accordion-title");
  title?.addEventListener("click", () => {
    item.classList.toggle("is-open");
  });
});

document.querySelectorAll("[data-font]").forEach((button) => {
  button.addEventListener("click", () => {
    document.body.classList.toggle("large-text", button.dataset.font === "large");
  });
});

document.querySelectorAll("[data-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    document.body.classList.toggle("dark", button.dataset.theme === "dark");
  });
});

const shareButton = document.querySelector("[data-share]");
const shareStatus = document.querySelector("[data-share-status]");
const shareUrlField = document.querySelector("[data-share-url]");
const shareLink = document.querySelector("[data-share-link]");
const whatsappShare = document.querySelector("[data-whatsapp-share]");
let publicShareUrl = "";
const isLocalhostOrigin = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const showLocalhostWarning = () => {
  if (!shareStatus) return;
  if (isLocalhostOrigin && !publicShareUrl) {
    shareStatus.textContent = "Abre la URL pública del túnel para obtener un enlace que funcione fuera de tu red.";
    return true;
  }
  return false;
};

const showShareStatus = (message) => {
  if (!shareStatus) return;
  shareStatus.textContent = message;
  window.clearTimeout(showShareStatus.timeoutId);
  showShareStatus.timeoutId = window.setTimeout(() => {
    shareStatus.textContent = "";
  }, 3500);
};

const copyText = async (text) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.append(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
};

const sendEvent = async (endpoint, data) => {
  if (window.location.protocol === "file:") return;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      keepalive: true,
    });
  } catch (error) {
    // Compartir debe seguir funcionando aunque el backend no responda.
  }
};

const getShareUrl = () => {
  if (window.location.protocol === "file:") {
    return publicShareUrl || "Publica el sitio para obtener un enlace compartible.";
  }

  if (isLocalhostOrigin && !publicShareUrl) {
    return "Abre la URL pública del túnel para obtener un enlace compartible.";
  }

  return publicShareUrl || window.location.origin;
};

const updateShareControls = () => {
  const shareUrl = getShareUrl();
  const whatsappText = `Pueblos indígenas en la Independencia de México ${shareUrl}`;

  if (shareUrlField) shareUrlField.value = shareUrl;
  if (shareLink) {
    shareLink.href = shareUrl.startsWith("http") ? shareUrl : "#";
    shareLink.setAttribute("aria-disabled", String(!shareUrl.startsWith("http")));
  }
  if (whatsappShare) {
    whatsappShare.href = shareUrl.startsWith("http")
      ? `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
      : "#";
  }

  if (!shareUrl.startsWith("http")) {
    showLocalhostWarning();
  }
};

const loadPublicConfig = async () => {
  if (window.location.protocol === "file:") {
    updateShareControls();
    return;
  }

  try {
    const response = await fetch("/api/config");
    const config = await response.json();
    if (config.publicUrl) {
      publicShareUrl = config.publicUrl;
    } else if (!isLocalhostOrigin) {
      publicShareUrl = window.location.origin;
    }
  } catch (error) {
    if (!isLocalhostOrigin) {
      publicShareUrl = window.location.origin;
    }
  }

  updateShareControls();
};

loadPublicConfig();
sendEvent("/api/visits", { page: window.location.pathname });

shareUrlField?.addEventListener("click", () => {
  shareUrlField.select();
});

shareButton?.addEventListener("click", async () => {
  const shareUrl = getShareUrl();
  if (!shareUrl.startsWith("http")) {
    showLocalhostWarning();
    return;
  }

  const shareData = {
    title: document.title,
    text: `Pueblos indígenas en la Independencia de México ${shareUrl}`,
    url: shareUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      sendEvent("/api/shares", { method: "native", url: shareUrl });
      showShareStatus("Listo para compartir.");
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await copyText(shareData.url);
    if (!shareData.url.startsWith("http")) {
      showShareStatus("Publica el sitio para obtener un enlace real.");
      return;
    }
    sendEvent("/api/shares", { method: "copy", url: shareUrl });
    showShareStatus("Enlace copiado.");
  } catch (error) {
    showShareStatus("No se pudo compartir el enlace.");
  }
});

whatsappShare?.addEventListener("click", (event) => {
  const shareUrl = getShareUrl();
  if (!shareUrl.startsWith("http")) {
    event.preventDefault();
    showLocalhostWarning();
    return;
  }

  sendEvent("/api/shares", { method: "whatsapp", url: shareUrl });
});
