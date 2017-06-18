(function() {
    var statusOptions = [null];
    [].slice.call(document.querySelector('#status_ids').children)
    .forEach(function(s, i) {
        statusOptions.push({
            class: s.id,
            text: s.innerHTML,
            value: i + 1
        });
    });
    window.statusOptions = statusOptions;

    function setCVEStatus(statusElement, id) {
        statusOptions.slice(1).forEach(function(statusOption) {
            statusElement.classList.remove(statusOption.class);
        });
        statusElement.classList.add(statusOptions[id].class);
        statusElement.innerHTML = statusOptions[id].text;
    }
    window.setCVEStatus = setCVEStatus;

    function loadCVEStatus(statusElement) {
        setCVEStatus(statusElement, statusElement.getAttribute('status_id'));
    }
    [].slice.call(document.querySelectorAll('.status')).forEach(loadCVEStatus);
})();
