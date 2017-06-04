(function() {
	function moveElement(e, x, y) {
		e.style.left = x + 'px';
		e.style.top = y + 'px';
	}
	function Context(options) {
		var c = this;
		var selector = options.selector;
		var trigger = options.trigger;
		var items = options.items;
		var callback = options.callback;
		var element;
		var openedBy;
		console.log(options);

		c.isActive = function() {
			return element.classList.contains('active');
		}
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

		element = createElement('div', {
			class: 'context-menu'
		});
		items.forEach(function(item) {
			item.class += ' context-menu-item';
			item.parent = element;
			var i = createElement('div', item);
			i.addEventListener('click', function(e) {
				callback(openedBy, item.value);
				c.close();
			});
		});
		var targets = [].slice.call(document.querySelectorAll(selector));
		console.log(targets);
		targets.forEach(function(target) {
			target.addEventListener(trigger, function(e) {
				c.open(target, e.pageX, e.pageY);
				e.stopPropagation();
			});
		});
		document.body.appendChild(element);
	}
	window.Context = Context;
})();
