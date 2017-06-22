(function() {
    Ripple(['#navbar .logo', '#navbar .items > *', 'button']);

    var footer = document.querySelector('#footer');
    var footerIsFixed = false;

    function toggleFixedFooter() {
        footer.classList.toggle('fixed');
        footerIsFixed = !footerIsFixed;
    }

    function checkFixedFooter() {
        var footerBoundingRect = footer.getBoundingClientRect();
        if (footerBoundingRect.bottom < window.innerHeight) {
            toggleFixedFooter();
        } else if (footerIsFixed){
            toggleFixedFooter();
            checkFixedFooter();
        }
    }
    window.addEventListener('resize', checkFixedFooter);
    checkFixedFooter();

    var themes = {
        light: '/static/css/light.css',
        dark: '/static/css/dark.css'
    };
    var defaultTheme = 'light';

    var themeSwitcher = new ThemeSwitcher({
        target: document.querySelector('#theme-switcher-target'),
        default: defaultTheme,
        themes: themes
    });

    var themeSelector = document.querySelector('#theme-selector');
    Object.keys(themes).forEach(function(name) {
        var themeOption = createElement('option', {
            content: name,
            value: name,
            parent: themeSelector
        });
    });
    themeSelector.value = themeSwitcher.get();
    themeSelector.onchange = function(e) {
        themeSwitcher.set(themeSelector.value);
    }
})();
