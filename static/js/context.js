(function() {
	function moveElement(e, x, y) {
		e.style.left = x + 'px';
		e.style.top = y + 'px';
	}
	function Context(o) {
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
			moveElement(element, x, y);
			element.addEventListener('click', function(e) {
				e.stopPropagation();
			});
			document.body.addEventListener('click', function(e) {
				c.close();
			});
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
		var targets = [].slice.call(document.querySelectorAll(o.selector));
		targets.forEach(function(target) {
			target.addEventListener(o.trigger, function(e) {
				c.open(target, e.pageX, e.pageY);
				e.stopPropagation();
			});
		});
	}
	window.Context = Context;
})();
