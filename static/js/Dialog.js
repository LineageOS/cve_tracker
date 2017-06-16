(function() {
	function _draggable(element, target) {
		var moveOffsetX;
		var moveOffsetY;

		function dragHandler(e) {
			moveElement(element, e.clientX - moveOffsetX, e.clientY - moveOffsetY);
		};

		function dragEndHandler(e) {
			document.body.removeEventListener('mousemove', dragHandler);
			document.body.removeEventListener('mouseup', dragEndHandler);
		};

		function dragStart(e) {
			var boundingRect = element.getBoundingClientRect();
			moveOffsetX = e.clientX - boundingRect.left;
			moveOffsetY = e.clientY - boundingRect.top;
			document.body.addEventListener('mousemove', dragHandler);
			document.body.addEventListener('mouseup', dragEndHandler);
		};

		target.addEventListener('mousedown', dragStart);
	}

	function Dialog(o) {
		var d = this;
		d.element = o.element;
		d.access = {};
		d.actions = {};
		var drag = d.element.querySelector(o.drag);

		d.close = function() {
			d.element.classList.remove('active');
		};

		d.open = function() {
			d.element.classList.add('active');
		};

		d.move = moveElement.bind(d, d.element);
		d.size = resizeElement.bind(d, d.element);

		_draggable(d.element, drag);

		if (o.position) {
			d.move(o.position.x, o.position.y);
		} else {
			var boundingRect = d.element.getBoundingClientRect();
			var x = (innerWidth - boundingRect.width) / 2;
			var y = (innerHeight - boundingRect.height) / 2;
			d.move(x, y);
		}

		if (o.trigger) {
			var element;
			var event;

			if (o.trigger instanceof Element) {
				element = o.trigger;
				event = 'click';
			} else {
				element = o.trigger.element;
				event = o.trigger.event;
			}

			element.addEventListener(event, d.open);
		}

		if (o.size) {
			d.size(o.size.width, o.size.height);
		}

		o.actions.forEach(function(a) {
			var target = d.element.querySelector(a.selector);

			var callback;
			if (typeof a.callback == 'string') {
				callback = d[a.callback];
			} else {
				callback = function(e) {
					a.callback.call(d, target, e);
				}
			}

			var event = a.event;
			if (!event) {
				event = 'click';
			}

			target.addEventListener(event, callback);

			if(a.id) {
				d.actions[a.id] = target;
			}
		});

		if (o.access) {
			Object.keys(o.access).forEach(function(key) {
				d.access[key] = d.element.querySelector(o.access[key]);
			});
		}
	}

	window.Dialog = Dialog;
})();