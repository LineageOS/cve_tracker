(function(){
    function createElement(type, o) {
        var e = document.createElement(type);

        if (o.parent) {
            o.parent.appendChild(e);
            delete o.parent;
        }

        if (o.content) {
            e.innerHTML = o.content;
            delete o.content;
        }

        if (o.style) {
            for (var s in o.style) {
                e.style[s] = o.style[s];
            }

            delete o.style;
        }

        for (var i in o) {
            e.setAttribute(i, o[i]);
        }

        return e;
    }
    window.createElement = createElement;

    function moveElement(e, x, y) {
        if (x) {
            e.style.left = x + 'px';
        }
        if (y) {
            e.style.top = y + 'px';
        }
    }
    window.moveElement = moveElement;

    function resizeElement(e, width, height) {
        if (width) {
            e.style.width = width + 'px';
        }
        if (height) {
            e.style.height = height + 'px';
        }
    }
    window.resizeElement = resizeElement;

    function copyToClipboard(text) {
        var textarea = createElement('textarea', {
            style: {
                opacity: 0
            },
            parent: document.body
        });
        textarea.value = text;
        textarea.select();
        document.execCommand('copy');
        textarea.parentElement.removeChild(textarea);
    }
    window.copyToClipboard = copyToClipboard;

    function registerDialogCloseOnKey(dialogList, key) {
        if (!dialogList || !(dialogList instanceof Array)) {
            console.log("No dialogList (Array of Dialog) passed!");
            return;
        }

        document.addEventListener('keydown', function(event) {
            event = event || window.event;
            var keyCode = event.keyCode || event.which;
            if (keyCode == key || keyCode == key) {
                var dlg;
                var zIndex = 0;
                dialogList.forEach(function(dialog, index, array) {
                    if (dialog.isOpen() && dialog.element.style.zIndex > zIndex) {
                        dlg = dialog;
                        zIndex = dialog.element.style.zIndex;
                    }
                });

                if (dlg && zIndex != 0) {
                    dlg.close();
                }
            }
        });
    }
    window.registerDialogCloseOnKey = registerDialogCloseOnKey;

    function registerDialogCloseOnESC(dialogList) {
        registerDialogCloseOnKey(dialogList, 27);
    }
    window.registerDialogCloseOnESC = registerDialogCloseOnESC;
})();
