const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        entry.target.classList.add("active");
        observer.unobserve(entry.target);
    });
}, {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px"
});

document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((element) => revealObserver.observe(element));

    const nav = document.querySelector(".navbar");
    const updateNavbar = () => {
        nav.classList.toggle("scrolled", window.scrollY > 18);
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });

    const segmentMenus = document.querySelectorAll("[data-segment-menu]");
    const menuCloseTimers = new WeakMap();
    const cancelMenuClose = (menu) => {
        const timer = menuCloseTimers.get(menu);
        if (timer) {
            window.clearTimeout(timer);
            menuCloseTimers.delete(menu);
        }
    };
    const scheduleMenuClose = (menu, delay = 150) => {
        cancelMenuClose(menu);
        const timer = window.setTimeout(() => {
            const defaultPanel = menu.dataset.defaultPanel;
            menu.classList.remove("open");

            if (!defaultPanel) {
                return;
            }

            const toggleButtons = menu.querySelectorAll(".toggle-btn");
            const submenus = menu.querySelectorAll(".segment-submenu");

            toggleButtons.forEach((button) => {
                button.classList.toggle("active", button.dataset.segmentPanel === defaultPanel);
            });

            submenus.forEach((submenu) => {
                submenu.classList.toggle("active", submenu.dataset.segmentSubmenu === defaultPanel);
            });

            menu.dataset.activePanel = defaultPanel;
            menuCloseTimers.delete(menu);
        }, delay);

        menuCloseTimers.set(menu, timer);
    };
    const closeAllSegmentMenus = () => {
        segmentMenus.forEach((menu) => {
            cancelMenuClose(menu);
            scheduleMenuClose(menu, 0);
        });
    };

    segmentMenus.forEach((menu) => {
        const toggleButtons = menu.querySelectorAll(".toggle-btn");
        const submenus = menu.querySelectorAll(".segment-submenu");
        const submenuLinks = menu.querySelectorAll(".submenu-link");
        const supportsHover = window.matchMedia("(hover: hover)").matches;
        const defaultActiveButton = menu.querySelector(".toggle-btn.active") || toggleButtons[0];
        const defaultPanel = defaultActiveButton?.dataset.segmentPanel || "";

        menu.dataset.defaultPanel = defaultPanel;
        menu.dataset.activePanel = defaultPanel;

        const setActivePanel = (panelName) => {
            if (!panelName) {
                return;
            }

            toggleButtons.forEach((button) => {
                button.classList.toggle("active", button.dataset.segmentPanel === panelName);
            });

            submenus.forEach((submenu) => {
                submenu.classList.toggle("active", submenu.dataset.segmentSubmenu === panelName);
            });

            menu.dataset.activePanel = panelName;
        };

        setActivePanel(defaultPanel);

        menu.addEventListener("mouseenter", () => {
            if (supportsHover) {
                cancelMenuClose(menu);
            }
        });

        toggleButtons.forEach((button) => {
            const panelName = button.dataset.segmentPanel;

            if (supportsHover) {
                button.addEventListener("mouseenter", () => {
                    cancelMenuClose(menu);
                    setActivePanel(panelName);
                    menu.classList.add("open");
                });
            }

            button.addEventListener("focus", () => {
                cancelMenuClose(menu);
                setActivePanel(panelName);
                menu.classList.add("open");
            });

            button.addEventListener("click", (event) => {
                event.preventDefault();
                cancelMenuClose(menu);
                const isSamePanel = menu.classList.contains("open") && menu.dataset.activePanel === panelName;

                if (!supportsHover && isSamePanel) {
                    closeAllSegmentMenus();
                    return;
                }

                setActivePanel(panelName);
                menu.classList.add("open");
            });
        });

        if (supportsHover) {
            menu.addEventListener("mouseleave", () => {
                scheduleMenuClose(menu);
            });
        }

        submenuLinks.forEach((link) => {
            link.addEventListener("click", () => {
                closeAllSegmentMenus();
            });
        });
    });

    document.addEventListener("click", (event) => {
        if ([...segmentMenus].some((menu) => menu.contains(event.target))) {
            return;
        }

        closeAllSegmentMenus();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAllSegmentMenus();
        }
    });

    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
        const trigger = item.querySelector(".faq-trigger");
        trigger.addEventListener("click", () => {
            const shouldOpen = !item.classList.contains("active");

            faqItems.forEach((entry) => {
                entry.classList.remove("active");
                entry.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
            });

            if (shouldOpen) {
                item.classList.add("active");
                trigger.setAttribute("aria-expanded", "true");
            }
        });
    });

    const railToggles = document.querySelectorAll("[data-rail-toggle]");
    const railPanels = document.querySelectorAll("[data-rail-panel]");

    railToggles.forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.dataset.railToggle;

            railToggles.forEach((item) => {
                item.classList.toggle("active", item === button);
                item.setAttribute("aria-selected", item === button ? "true" : "false");
            });

            railPanels.forEach((panel) => {
                panel.classList.toggle("active", panel.dataset.railPanel === target);
            });
        });
    });

    const authModal = document.querySelector("[data-auth-modal]");
    if (authModal) {
        const authOpeners = document.querySelectorAll("[data-auth-open]");
        const authClosers = authModal.querySelectorAll("[data-auth-close]");
        const authSwitchers = authModal.querySelectorAll("[data-auth-switch]");
        const authForm = authModal.querySelector("[data-auth-form]");
        const authTitle = authModal.querySelector("[data-auth-title]");
        const authSubtitle = authModal.querySelector("[data-auth-subtitle]");
        const authSubmit = authModal.querySelector("[data-auth-submit]");
        const authNameField = authModal.querySelector("[data-auth-name-field]");
        const authConfirmField = authModal.querySelector("[data-auth-confirm-field]");
        const authLoginMeta = authModal.querySelector("[data-auth-login-meta]");
        const authLoginSwitch = authModal.querySelector("[data-auth-login-switch]");
        const authRegisterSwitch = authModal.querySelector("[data-auth-register-switch]");
        const authEmailInput = authModal.querySelector('input[name="email"]');
        const authPasswordInput = authModal.querySelector('input[name="password"]');
        let authMode = "login";
        let closeTimer = null;
        let lastAuthTrigger = null;

        const authState = {
            login: {
                title: "Welcome back to Talaps",
                subtitle: "Sign in to your account",
                submit: "Continue"
            },
            register: {
                title: "Create your Talaps account",
                subtitle: "Set up your access in a few quick steps",
                submit: "Create account"
            }
        };

        const setAuthMode = (mode) => {
            authMode = mode === "register" ? "register" : "login";
            authModal.dataset.authMode = authMode;
            authTitle.textContent = authState[authMode].title;
            authSubtitle.textContent = authState[authMode].subtitle;
            authSubmit.textContent = authState[authMode].submit;
            authNameField.hidden = authMode !== "register";
            authConfirmField.hidden = authMode !== "register";
            authLoginMeta.hidden = authMode !== "login";
            authLoginSwitch.hidden = authMode !== "login";
            authRegisterSwitch.hidden = authMode !== "register";
            authPasswordInput.setAttribute("autocomplete", authMode === "login" ? "current-password" : "new-password");
        };

        const openAuth = (mode = "login", trigger = null) => {
            if (closeTimer) {
                window.clearTimeout(closeTimer);
            }

            lastAuthTrigger = trigger;
            authModal.hidden = false;
            setAuthMode(mode);
            document.body.classList.add("modal-open");

            window.requestAnimationFrame(() => {
                authModal.classList.add("open");
            });

            window.setTimeout(() => {
                authEmailInput?.focus();
            }, 140);
        };

        const closeAuth = () => {
            authModal.classList.remove("open");
            document.body.classList.remove("modal-open");
            closeTimer = window.setTimeout(() => {
                authModal.hidden = true;
                lastAuthTrigger?.focus?.();
            }, 220);
        };

        authOpeners.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                openAuth(button.dataset.authOpen, button);
            });
        });

        authClosers.forEach((button) => {
            button.addEventListener("click", closeAuth);
        });

        authSwitchers.forEach((button) => {
            button.addEventListener("click", () => {
                setAuthMode(button.dataset.authSwitch);
                authEmailInput?.focus();
            });
        });

        authForm?.addEventListener("submit", (event) => {
            event.preventDefault();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !authModal.hidden) {
                closeAuth();
            }
        });
    }
});
