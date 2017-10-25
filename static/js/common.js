(function() {
    Ripple(['#navbar .logo', '#navbar .items > *', 'button']);

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

    function setTheme(requestElement, newTheme) {
        themeSwitcher.set(newTheme);
        requestElement.innerHTML = toTitleCase(newTheme) + " theme";

        createElement('i', {
            parent: requestElement,
            class: 'mdi mdi-chevron-down'
        });
    }
    var themeMenuElement = document.querySelector('#theme-menu');
    var themeMenuItems = Object.keys(themes).map(function(i) {
        return {
            value: i,
            text: i
        };
    });
    var themeMenu = new ContextMenu({
        selector: themeMenuElement,
        trigger: 'click',
        callback: setTheme,
        items: themeMenuItems
    });
    setTheme(themeMenuElement, themeSwitcher.get());

    var footer = document.querySelector('#footer');
    function padBodyforFooter() {
        var height = footer.offsetHeight;
        document.body.style.paddingBottom = height + 'px';
    }
    window.addEventListener('load', padBodyforFooter);
    window.addEventListener('resize', padBodyforFooter);

    function ajaxFailMessage(element) {
        var message = 'Something went wrong with the request!'
        if (element.access.error) {
            element.access.error.innerHTML = message;
        } else {
            element.innerHTML = message;
        }
    }
    window.ajaxFailMessage = ajaxFailMessage;

    $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
        if (jqxhr && jqxhr.responseJSON) {
            var data = jqxhr.responseJSON;
            if (data.exception) {
                console.log(data.exception);
            }
        }
    });
})();
