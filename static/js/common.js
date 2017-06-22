(function() {
    Ripple(['#navbar .logo', '#navbar .items > *', 'button']);

    var footer = document.querySelector('#footer');
    var wrapper = document.querySelector('#wrapper');
    function padWrapper() {
        wrapper.style.paddingBottom = footer.offsetHeight + 'px';
    }
    window.addEventListener('resize', padWrapper);
    padWrapper();

    var themes = {
        light: '/static/css/light.css',
        dark: '/static/css/dark.css'
    };
    var defaultTheme = 'light';

    var themeSwitcher = new ThemeSwitcher({
        target: document.querySelector('#theme-target'),
        default: defaultTheme,
        themes: themes
    });

    function setTheme(from, value) {
        themeSwitcher.set(value);
        from.innerHTML = toTitleCase(value);
    }
    var themeMenuSelector = '#theme-menu';
    var themeMenuItems = Object.keys(themes).map(function(i) {
        return {
            value: i,
            text: i
        };
    });
    var themeMenu = new ContextMenu({
        selector: themeMenuSelector,
        trigger: 'click',
        callback: setTheme,
        items: themeMenuItems
    });
    var themeMenuElement = document.querySelector(themeMenuSelector);
    setTheme(themeMenuElement, themeSwitcher.get());
})();
