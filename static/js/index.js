(function() {
    function addCVE(button) {
        var d = this;
        var cveId = d.access.name.value;
        var cveNotes = d.access.details.value;
        var cveTags = d.access.tags.value;
        button.disabled = true;
        d.access.error.innerHTML = 'Adding, please wait...';

        $.ajax({
            type: 'POST',
            url: '/addcve',
            contentType: 'application/json',
            data: JSON.stringify({
                cve_id: cveId,
                cve_notes: cveNotes,
                cve_tags: cveTags
            })
        }).done(function(data) {
            button.disabled = false;
            if (data.error == 'success') {
                d.access.error.innerHTML = '';
                d.close();
            } else {
                d.access.error.innerHTML = data.error;
            }
            button.disabled = false;
        }).fail(function() {
            button.disabled = false;
            ajaxFailMessage(d);
        });
    }

    var addCVEDialog = new Dialog({
        element: document.querySelector('#add-cve-dialog'),
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
            tags: '.tags',
            details: '.details',
            error: '.error'
        }
    });
    window.addCVEDialog = addCVEDialog;

    var openAddCVEDialog = document.querySelector('#open-add-cve-dialog');
    openAddCVEDialog.addEventListener('click', function(e) {
        addCVEDialog.open();
        addCVEDialog.access.name.focus();
        addCVEDialog.access.name.value = "";
        addCVEDialog.access.tags.value = "";
        addCVEDialog.access.details.value = "";
        addCVEDialog.access.error.innerHTML = "";
    });

    function addKernel(button) {
        var d = this;
        var kernel = d.access.repo.value;
        var tags = d.access.tags.value;
        button.disabled = true;

        $.ajax({
            type: 'POST',
            url: '/addkernel',
            contentType: 'application/json',
            data: JSON.stringify({
                kernel: kernel,
                tags: tags
            })
        }).done(function(data) {
            if (data.error == "success") {
                location.reload();
            } else {
                d.access.error.innerHTML = data.error;
            }
            button.disabled = false;
        }).fail(function() {
            button.disabled = false;
            ajaxFailMessage(d);
        });
    }

    var addKernelDialog = new Dialog({
        element: document.querySelector('#add-kernel-dialog'),
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
            tags: '.tags',
            error: '.error'
        }
    });
    window.addKernelDialog = addKernelDialog;

    var openAddKernelDialog = document.querySelector('#open-add-kernel-dialog');
    openAddKernelDialog.addEventListener('click', function(e) {
        addKernelDialog.open();
        addKernelDialog.access.repo.focus();
        addKernelDialog.access.repo.value = '';
        addKernelDialog.access.tags.value = '';
        addKernelDialog.access.error.innerHTML = '';
    });
})();
