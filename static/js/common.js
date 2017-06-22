(function() {
    Ripple(['#navbar .logo', '#navbar .items > *', 'button']);

    var themes = {
        light: '/static/css/light.css',
        dark: '/static/css/dark.css'
    };
    var defaultTheme = 'light';

    var themeEngine = new ThemeEngine({
        target: document.querySelector('#theme-engine-target'),
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
    themeSelector.value = themeEngine.get();
    themeSelector.onchange = function(e) {
        themeEngine.set(themeSelector.value);
    }
})();
