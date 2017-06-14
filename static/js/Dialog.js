(function() {
	function _draggable(element, target) {
		var moveOffsetX;
		var moveOffsetY;
		function dragHandler(e) {
			moveElement(element, e.clientX - moveOffsetX, e.clientY - moveOffsetY)
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
		var element = o.element;
		var drag = element.querySelector(o.drag);
		var access = {};

		d.close = function() {
			element.classList.remove('active');
		};

		d.open = function() {
			element.classList.add('active');
		};

		d.move = function(x, y) {
			moveElement(element, x, y);
		};

		d.size = function(width, height) {
			if(width) {
				element.style.width = width + 'px';
			}
			if(height) {
				element.style.height = height + 'px';
			}
		};

		d.setup = function(cb) {
			cb(element, access);
		};

		_draggable(element, drag);

		o.actions.forEach(function(a) {
			var target = element.querySelector(a.selector);
			var callback;
			if(typeof a.callback == 'string') {
				callback = d[a.callback];
			} else {
				callback = function(e) {
					a.callback(target, d, access, e);
				}
			}
			var trigger = a.trigger;
			if(!trigger) {
				trigger = 'click';
			}
			target.addEventListener(trigger, callback);
		});

		Object.keys(o.access).forEach(function(key) {
			access[key] = element.querySelector(o.access[key]);
		});
	}
	window.Dialog = Dialog;
})();