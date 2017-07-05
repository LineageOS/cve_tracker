(function() {
    function ContextMenu(o) {
        var c = this;
        var element = createElement('div', {
            class: 'context-menu',
            parent: document.body
        });

        c.isActive = function() {
            return element.classList.contains('active');
        };

        var openedBy;
        c.open = function(from, x, y) {
            openedBy = from;

            element.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            document.body.addEventListener('click', function(e) {
                c.close();
            });

            var elementHeight = element.getBoundingClientRect().height;
            var documentHeight = document.body.offsetHeight;
            if(elementHeight > documentHeight - y) {
                y = y - elementHeight;
            }
            moveElement(element, x, y);
            element.classList.add('active');
        };

        c.close = function() {
            element.classList.remove('active');
        };

        o.items.forEach(function(item) {
            var i = createElement('div', {
                content: item.text,
                parent: element
            });

            i.addEventListener('click', function(e) {
                o.callback(openedBy, item.value);
                c.close();
            });
        });

        var targets;
        if (o.selector instanceof HTMLElement) {
            targets = [o.selector];
        } else {
            targets = [].slice.call(document.querySelectorAll(o.selector));
        }
        targets.forEach(function(target) {
            target.addEventListener(o.trigger, function(e) {
                c.open(target, e.pageX, e.pageY);
                e.stopPropagation();
            });
        });
    }

    window.ContextMenu = ContextMenu;
})();
