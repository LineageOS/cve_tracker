(function() {
    function isDefined(value) {
        return typeof value != 'undefined';
    }

    function Selector(o) {
        var s = this;
        var options = {};
        s.clickable = true;

        if (isDefined(o.clickable)) {
            s.clickable = o.clickable;
        }

        s.isActive = function(op) {
            return options[op].classList.contains('active');
        };

        s.isOption = function(op) {
            return isDefined(options[op]);
        };

        function _getActive(multiple) {
            var a = [];
            for (var i in options) {
                if (s.isActive(i)) {
                    a.push(i);
                }
            }
            return multiple ? a : a[0];
        }

        s.getActive = function(asArray) {
            var multiple = isDefined(asArray) ? asArray : o.multiple;
            return _getActive(multiple);
        };

        function _setActive(op, value) {
            if (!s.isOption(op) || value == s.isActive(op)) {
                return;
            }

            if (value) {
                options[op].classList.add('active');
            } else {
                options[op].classList.remove('active');
            }

            if (o.callback) {
                o.callback(op, value);
            }
        }

        s.setActive = function(op, value) {
            if (o.multiple) {
                _setActive(op, value);
            } else {
                if (value) {
                    _setActive(s.getActive(false), false);
                    _setActive(op, true);
                }
            }
        };

        s.toggleActive = function(op) {
            s.setActive(op, !s.isActive(op))
        };

        s.addOption = function(op, el) {
            el.addEventListener('click', function() {
                if (s.clickable) {
                    s.toggleActive(op);
                }
            });
            options[op] = el;
        };

        s.getOptions = function() {
            return options;
        };

        s.setOptions = function(newOptions) {
            options = {};
            for (var i in newOptions) {
                s.addOption(i, newOptions[i]);
            }
        };

        if (o.options) {
            s.setOptions(o.options);
        }
    }

    window.Selector = Selector;
})();
