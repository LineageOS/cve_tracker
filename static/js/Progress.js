(function() {
    function Progress(options) {
        var p = this;
        var container = options.container;
        var element = options.element;
        var valueField = options.valueField;
        var value = options.value;
        if (!value) {
            value = 0;
        }

        p.set = function(newValue) {
            var maxWidth = container.offsetWidth;
            element.style.width = newValue / 100 * maxWidth + 'px';
            valueField.innerHTML = Math.floor(newValue) + '%';
            value = newValue;
        };

        p.get = function() {
            return value;
        };

        p.resize = function() {
            p.set(value);
        }

        p.set(value);
    }

    window.Progress = Progress;
})();
