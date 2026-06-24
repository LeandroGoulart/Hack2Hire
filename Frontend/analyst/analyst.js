(function () {
    'use strict';

    async function loadSidebar() {
        const sidebar = document.querySelector('[data-analyst-sidebar]');
        if (!sidebar) return;

        try {
            const response = await fetch('analystSidebar.html');
            if (!response.ok) {
                throw new Error('Falha ao carregar a navegacao');
            }
            sidebar.innerHTML = await response.text();
            setActiveNavigation(sidebar);
            bindMobileMenu(sidebar);
        } catch (error) {
            sidebar.innerHTML = '<div class="sidebar-error">Nao foi possivel carregar a navegacao.</div>';
            console.error(error);
        }
    }

    function setActiveNavigation(sidebar) {
        const activeItem = document.body.dataset.active;
        sidebar.querySelectorAll('[data-nav]').forEach(function (item) {
            item.classList.toggle('active', item.dataset.nav === activeItem);
        });
    }

    function bindMobileMenu(sidebar) {
        const menuButton = document.querySelector('[data-menu]');
        if (!menuButton) return;
        menuButton.addEventListener('click', function () {
            sidebar.classList.toggle('open');
        });
    }

    function bindPageActions() {
        document.querySelectorAll('[data-refresh]').forEach(function (button) {
            button.addEventListener('click', function () {
                const original = button.innerHTML;
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando';

                window.setTimeout(function () {
                    button.innerHTML = '<i class="fas fa-check"></i> Atualizado';
                    window.setTimeout(function () {
                        button.innerHTML = original;
                        button.disabled = false;
                    }, 900);
                }, 800);
            });
        });

        document.querySelectorAll('[data-stage]').forEach(function (stage) {
            stage.addEventListener('click', function () {
                document.querySelectorAll('[data-stage]').forEach(function (item) {
                    item.style.outline = '';
                });
                stage.style.outline = '2px solid #1677ff';
            });
        });
    }

    loadSidebar();
    bindPageActions();
}());
