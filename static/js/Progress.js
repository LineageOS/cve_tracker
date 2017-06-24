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
            newValue = Math.min(Math.max(0, newValue), 100);
            element.style.width = newValue + '%';
            valueField.innerHTML = Math.floor(newValue) + '%';
            value = newValue;
        };

        p.get = function() {
            return value;
        };

        p.set(value);
    }

    window.Progress = Progress;
})();
