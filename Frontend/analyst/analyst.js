(function () {
    'use strict';

    const menuButton = document.querySelector('[data-menu]');
    const sidebar = document.querySelector('.side-nav');

    if (menuButton && sidebar) {
        menuButton.addEventListener('click', function () {
            sidebar.classList.toggle('open');
        });
    }

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
}());
