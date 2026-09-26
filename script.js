const wallets = document.querySelectorAll(".wallet");
const languageButtons = document.querySelectorAll("[data-language-switch]");

function setLanguagePreference(language) {
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `opinionated_ts_lang=${encodeURIComponent(language)}; expires=${expiresAt}; path=/; SameSite=Lax`;
}

languageButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();

        const selectedLanguage = button.dataset.languageSwitch;

        if (!selectedLanguage) {
            return;
        }

        setLanguagePreference(selectedLanguage);
        window.location.reload();
    });
});

function fallbackCopy(text) {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";

    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const copied = document.execCommand("copy");

    textarea.remove();

    if (!copied) {
        throw new Error("Copy command failed");
    }
}

async function copyAddress(wallet) {
    const address = wallet.dataset.address;
    const label = wallet.querySelector(".copy-label");

    if (!address || !label) {
        return;
    }

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(address);
        } else {
            fallbackCopy(address);
        }

        wallet.classList.add("copied");
        label.textContent = "Copied";

        window.setTimeout(() => {
            wallet.classList.remove("copied");
            label.textContent = "Copy";
        }, 1600);
    } catch {
        label.textContent = "Copy failed";

        window.setTimeout(() => {
            label.textContent = "Copy";
        }, 1600);
    }
}

wallets.forEach((wallet) => {
    wallet.addEventListener("click", () => {
        copyAddress(wallet);
    });
});