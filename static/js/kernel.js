(function() {
    function deprecateKernel(button) {
        var d = this;
        var kernelId = d.element.getAttribute('kernel_id');
        var deprecated = d.element.getAttribute('deprecated');

        $.ajax({
            type: 'POST',
            url: '/deprecate',
            contentType: 'application/json',
            data: JSON.stringify({
                kernel_id: kernelId,
                deprecate: deprecated,
            })
        }).done(function(data) {
            location.reload();
        });
    }

    var deprecateKernelDialog = new Dialog({
        element: document.querySelector('#deprecate-kernel-dialog'),
        drag: '.title',
        actions: [{
            callback: 'close',
            selector: '.actions .cancel'
        }, {
            callback: deprecateKernel,
            selector: '.actions .mark'
        }],
        trigger: document.querySelector('#open-deprecate-kernel-dialog')
    });

    var CVEInfoDialog = new Dialog({
        element: document.querySelector('#cve-info-dialog'),
        drag: '.title',
        actions: [{
            callback: copyCVEName,
            selector: '.title .copy'
        }, {
            callback: editNotes,
            selector: '.notes .edit',
            id: 'editNotes'
        }, {
            callback: cancelCVEInfoDialog,
            selector: '.actions .cancel'
        }, {
            id: 'save',
            callback: saveNotes,
            selector: '.actions .save'
        }],
        access: {
            name: '.name',
            notesField: '.notes .field',
            links: '.links',
            error: '.error',
            edit: '.actions .edit',
            compare: '.actions .compare'
        }
    });

    function copyCVEName(button) {
        var d = this;
        copyToClipboard(d.access.name.innerHTML);
    }

    function cancelCVEInfoDialog(button) {
        var d = this;
        var cveId = CVEInfoDialog.element.getAttribute('cve_id');
        var editing = CVEInfoDialog.access.notesField.getAttribute('contenteditable');
        if (editing == 'true') {
            getNotes(cveId);
        } else {
            d.close();
        }
    }

    function openInfo(cve_name, cve_id) {
        CVEInfoDialog.access.name.innerHTML = cve_name;
        CVEInfoDialog.access.notesField.setAttribute('empty', false);
        CVEInfoDialog.access.notesField.innerHTML = 'Loading ...';
        CVEInfoDialog.access.links.innerHTML = 'Loading ...';
        CVEInfoDialog.access.edit.href = '/editcve/' + cve_name;
        CVEInfoDialog.access.compare.href = '/status/' + cve_name;
        CVEInfoDialog.element.setAttribute('cve_name', cve_name);
        CVEInfoDialog.element.setAttribute('cve_id', cve_id);
        restoreNotesEditable();
        CVEInfoDialog.open();

        getNotes(cve_id);
        getLinks(cve_id);
    }
    var cves = [].slice.call(document.querySelectorAll('.cve .name'));
    cves.forEach(function(cve) {
        var name = cve.getAttribute('cve_name');
        var id = cve.getAttribute('cve_id');
        cve.addEventListener('click', function() {
            openInfo(name, id);
        });
    });

    function getNotes(cve_id) {
        restoreNotesEditable();
        $.ajax({
            'type': 'POST',
            'url': '/getnotes',
            'contentType': 'application/json',
            'data': JSON.stringify({
                cve_id: cve_id,
            })
        }).done(function(data) {
            data = JSON.parse(data);
            if (!data[0].notes) {
                data[0].notes = 'No notes';
                CVEInfoDialog.access.notesField.setAttribute('empty', true);
            }
            CVEInfoDialog.access.notesField.innerHTML = data[0].notes;
        });
    }

    function getLinks(cve_id) {
        $.ajax({
            'type': 'POST',
            'url': '/getlinks',
            'contentType': 'application/json',
            'data': JSON.stringify({
                cve_id: cve_id
            })
        }).done(function(data) {
            var linkList = CVEInfoDialog.access.links;
            linkList.innerHTML = '';
            if (data.length) {
                var links = JSON.parse(data);
                links.forEach(function(v) {
                    var description = v.desc;
                    var url = v.link;
                    var id = v._id.$oid;
                    if (!description) {
                        description = 'No description';
                    }

                    var linkItem = createElement('div', {
                        parent: linkList
                    });

                    createElement('a', {
                        class: 'link',
                        href: url,
                        target: '_blank',
                        content: shorten(url, 80),
                        parent: linkItem
                    });

                    createElement('span', {
                        class: 'linkdesc',
                        content: ' - ' + description,
                        parent: linkItem
                    });
                });
            } else {
                linkList.innerHTML = 'No links available';
            }
        });
    }

    function editNotes() {
        CVEInfoDialog.access.notesField.setAttribute('contenteditable', true);
        if (CVEInfoDialog.access.notesField.getAttribute('empty') == 'true') {
            CVEInfoDialog.access.notesField.innerHTML = '';
        }
        CVEInfoDialog.actions.editNotes.classList.remove('mdi-pencil');
        CVEInfoDialog.actions.save.disabled = false;
    }

    function saveNotes() {
        var cveId = CVEInfoDialog.element.getAttribute('cve_id');
        var notes = CVEInfoDialog.access.notesField.innerHTML;

        $.ajax({
            'type': 'POST',
            'url': '/editnotes',
            'contentType': 'application/json',
            'data': JSON.stringify({
                cve_id: cveId,
                cve_notes: notes,
            })
        }).done(function(data) {
            if (data.error == 'success') {
                restoreNotesEditable();
                if (!notes) {
                    notes = 'No notes';
                    CVEInfoDialog.access.notesField.setAttribute('empty', true);
                }
                CVEInfoDialog.access.error.innerHTML = '';
                CVEInfoDialog.access.notesField.innerHTML = notes;
            } else {
                CVEInfoDialog.access.error.innerHTML = data.error;
            }
        });
    }

    function restoreNotesEditable() {
        CVEInfoDialog.access.notesField.setAttribute('contenteditable', false);
        CVEInfoDialog.access.notesField.setAttribute('empty', false);
        CVEInfoDialog.access.error.innerHTML = '';
        // Only logged in users do have these
        if (CVEInfoDialog.actions.editNotes) {
            CVEInfoDialog.actions.editNotes.classList.add('mdi-pencil');
        }
        if (CVEInfoDialog.actions.save) {
            CVEInfoDialog.actions.save.disabled = true;
        }
    }

    function shorten(text, maxLength) {
        var ret = text;
        if (ret.length > maxLength) {
            ret = ret.substr(0, maxLength - 3) + '...';
        }
        return ret;
    }

    var progressBar = new Progress({
        container: document.querySelector('#progress-bar'),
        element: document.querySelector('#progress-bar-inner'),
        valueField: document.querySelector('#progress-value'),
        value: document.querySelector('#progress-bar').getAttribute('value')
    });
    window.progressBar = progressBar;
})();
