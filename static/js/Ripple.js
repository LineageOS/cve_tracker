(function() {
    function _ripple(element, inEvents, outEvents) {
        inEvents = inEvents.split(' ');
        outEvents = outEvents.split(' ');

        var ripple = createElement('span', {
            class: 'ripple-effect',
            parent: element
        });

        function removeRipple(e) {
            ripple.classList.add('out');
            ripple.classList.remove('in');
            outEvents.forEach(function(outEvent) {
                element.removeEventListener(outEvent, removeRipple);
            });
        }

        function addRipple(e) {
            var boundingRect = element.getBoundingClientRect();
            var width = boundingRect.width;
            var height = boundingRect.height;
            var left = boundingRect.left;
            var top = boundingRect.top;
            var size = Math.max(width, height);
            ripple.style.width = ripple.style.height = size + 'px';
            var offsetX = e.pageX - left - pageXOffset - size / 2;
            var offsetY = e.pageY - top - pageYOffset - size / 2;
            ripple.style.left = offsetX + 'px';
            ripple.style.top = offsetY + 'px';
            ripple.classList.remove('out');
            ripple.classList.add('in');
            outEvents.forEach(function(outEvent) {
                element.addEventListener(outEvent, removeRipple);
            });
        }

        inEvents.forEach(function(inEvent) {
            element.addEventListener(inEvent, addRipple);
        });

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
    }

    function Ripple(selectors, inEvents, outEvents) {
        if (!inEvents) {
            inEvents = 'mousedown';
        }

        if (!outEvents) {
            outEvents = 'mouseup mouseout';
        }

        selectors.forEach(function(selector) {
            var matches = [].slice.call(document.querySelectorAll(selector));
            matches.forEach(function(match) {
                _ripple(match, inEvents, outEvents);
            });
        });
    }

    window.Ripple = Ripple;
})();
