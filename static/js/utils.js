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

    function limitValue(value, lower, upper) {
        return Math.min(Math.max(lower, value), upper);
    }
    window.limitValue = limitValue;

    function toTitleCase(s) {
        var words = s.split(' ');
        var titleCaseWords = words.map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        });
        return titleCaseWords.join(' ');
    }
    window.toTitleCase = toTitleCase;
})();
