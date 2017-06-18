(function() {
    function addCVE(button) {
        var d = this;
        var cveId = d.access.name.value;
        var cveNotes = d.access.details.value;
        button.disabled = true;
        d.access.error.innerHTML = 'Adding...';

        $.ajax({
            type: 'POST',
            url: '/addcve',
            contentType: 'application/json',
            data: JSON.stringify({
                cve_id: cveId,
                cve_notes: cveNotes
            })
        }).done(function(data) {
            if (data.error == 'success') {
                d.access.error.innerHTML = '';
                d.close();
            } else {
                d.access.error.innerHTML = data.error;
            }
            button.disabled = false;
        });
    }

    var addCVEDialog = new Dialog({
        element: document.querySelector('#add-cve-dialog'),
        trigger: document.querySelector('#open-add-cve-dialog'),
        drag: '.title',
        actions: [{
            callback: 'close',
            selector: '.actions .cancel'
        }, {
            callback: addCVE,
            selector: '.actions .add'
        }],
        access: {
            name: '.name',
            details: '.details',
            error: '.error'
        }
    });

    function addKernel(button) {
        var d = this;
        var kernel = d.access.repo.value;
        button.disabled = true;

        $.ajax({
            type: 'POST',
            url: '/addkernel',
            contentType: 'application/json',
            data: JSON.stringify({
                kernel: kernel
            })
        }).done(function(data) {
            if (data.error == "success") {
                location.reload();
            } else {
                d.access.error.innerHTML = data.error;
            }
            button.disabled = false;
        });
    }

    var addKernelDialog = new Dialog({
        element: document.querySelector('#add-kernel-dialog'),
        trigger: document.querySelector('#open-add-kernel-dialog'),
        drag: '.title',
        actions: [{
            callback: 'close',
            selector: '.actions .cancel'
        }, {
            callback: addKernel,
            selector: '.actions .add'
        }],
        access: {
            repo: '.repo',
            error: '.error'
        }
    });
})();
