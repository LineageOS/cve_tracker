(function() {
    function updateCVEStatus(statusElement, statusId) {
        var kernelId = statusElement.getAttribute('kernel_id');
        var cveId = statusElement.getAttribute('cve_id');

        $.ajax({
            type: 'POST',
            url: '/api/v1/kernel/' + kernelId + '/cve/' + cveId,
            contentType: 'application/json',
            data: JSON.stringify({
                status_id: statusId
            })
        })
        .done(function(data) {
            if (data.error == 'success') {
                setCVEStatus(statusElement, statusId);
                progressBar.set(Math.floor(data.progress));
            }
        });
    }

    var items = statusOptions.slice(1);
    var statusMenu = new ContextMenu({
        selector: '.status-menu',
        trigger: 'click',
        callback: updateCVEStatus,
        items: items
    });
})();
