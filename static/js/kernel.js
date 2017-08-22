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
            callback: editNotesAndData,
            selector: '.tags .edit',
            id: 'editTags'
        }, {
            callback: editNotesAndData,
            selector: '.notes .edit',
            id: 'editNotes'
        }, {
            callback: cancelCVEInfoDialog,
            selector: '.actions .cancel'
        }, {
            id: 'save',
            callback: saveTagsAndNotes,
            selector: '.actions .save'
        }],
        access: {
            name: '.name',
            tagsField: '.tags .field',
            notesField: '.notes .field',
            links: '.links',
            error: '.error',
            logs: '.actions .logs',
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
        var isEditing = CVEInfoDialog.access.notesField.getAttribute('contenteditable');
        if (isEditing == 'true') {
            getData(cveId);
        } else {
            d.close();
        }
    }

    function openInfo(cve_name, cve_id) {
        CVEInfoDialog.access.name.innerHTML = cve_name;
        if (CVEInfoDialog.access.tagsField) {
            CVEInfoDialog.access.tagsField.setAttribute('empty', false);
            CVEInfoDialog.access.tagsField.innerHTML = 'Loading ...';
        }
        CVEInfoDialog.access.notesField.setAttribute('empty', false);
        CVEInfoDialog.access.notesField.innerHTML = 'Loading ...';
        CVEInfoDialog.access.links.innerHTML = 'Loading ...';
        if (CVEInfoDialog.access.edit) {
            CVEInfoDialog.access.edit.href = '/editcve/' + cve_name;
        }
        if (CVEInfoDialog.access.logs) {
            CVEInfoDialog.access.logs.href = '/logs/cve/' + cve_name;
        }
        CVEInfoDialog.access.compare.href = '/status/' + cve_name;
        CVEInfoDialog.element.setAttribute('cve_name', cve_name);
        CVEInfoDialog.element.setAttribute('cve_id', cve_id);
        restoreEditables();
        CVEInfoDialog.open();

        getData(cve_id);
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

    var cveTagSelector = new Selector({
        multiple: true,
        isClickable: false
    });

    function getData(cve_id) {
        restoreEditables();
        $.ajax({
            'type': 'POST',
            'url': '/getcvedata',
            'contentType': 'application/json',
            'data': JSON.stringify({
                cve_id: cve_id,
            })
        }).done(function(data) {
            data = JSON.parse(data);
            if (CVEInfoDialog.access.tagsField) {
                cveTagSelector.setOptions({});
                processTags(data[0].tags, false);
                if (!data[0].tags) {
                    data[0].tags = ['No tags'];
                    CVEInfoDialog.access.tagsField.setAttribute('empty', true);
                }
                CVEInfoDialog.access.tagsField.innerHTML = data[0].tags.join(', ');
            }
            if (!data[0].notes) {
                data[0].notes = 'No notes';
                CVEInfoDialog.access.notesField.setAttribute('empty', true);
            }
            CVEInfoDialog.access.notesField.innerHTML = data[0].notes;
        });
    }

    function processTags(tags, displayAll) {
        var cveTags = document.querySelector('#cveTags.selectable');
        if (!cveTags) {
            return;
        }

        cveTags.innerText = "";
        kernelTags.forEach(function(e) {
            option = e.innerHTML.trim();
            var el = createElement('span', {
                content: e.innerHTML.trim(),
                parent: cveTags
            });

            if (cveTagSelector.isOption(option) && cveTagSelector.isActive(option)) {
                el.classList.add('active');
            }
            if (tags != undefined && tags.indexOf(option) >= 0) {
                tags.splice(tags.indexOf(option), 1);
                if (!el.classList.contains('active')) {
                    el.classList.add('active');
                }
            } else {
                if (!displayAll) {
                    el.classList.add('hidden');
                }
            }
        });

        cveTagElements = [].slice.call(cveTags.children);
        cveTagElements.forEach(function(element) {
            if (!cveTagSelector.isOption(element)) {
                cveTagSelector.addOption(element.innerHTML.trim(), element, element.classList.contains('active'));
            }
        });
        console.log(tags);
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

    function editNotesAndData() {
        CVEInfoDialog.access.tagsField.setAttribute('contenteditable', true);
        CVEInfoDialog.access.notesField.setAttribute('contenteditable', true);
        if (CVEInfoDialog.access.tagsField.getAttribute('empty') == 'true') {
            CVEInfoDialog.access.tagsField.innerHTML = '';
        }
        processTags(null, true);
        cveTagSelector.clickable = true;
        if (CVEInfoDialog.access.notesField.getAttribute('empty') == 'true') {
            CVEInfoDialog.access.notesField.innerHTML = '';
        }
        CVEInfoDialog.actions.editTags.classList.remove('mdi-pencil');
        CVEInfoDialog.actions.editNotes.classList.remove('mdi-pencil');
        CVEInfoDialog.actions.save.disabled = false;
    }

    function saveTagsAndNotes() {
        var cveId = CVEInfoDialog.element.getAttribute('cve_id');
        var tags = CVEInfoDialog.access.tagsField.innerText;
        cveTagSelector.getActive().forEach(function(e) {
            tags += "," + e;
        });
        var notes = CVEInfoDialog.access.notesField.innerText;

        $.ajax({
            'type': 'POST',
            'url': '/editcvedata',
            'contentType': 'application/json',
            'data': JSON.stringify({
                cve_id: cveId,
                cve_notes: notes,
                cve_tags: tags
            })
        }).done(function(data) {
            if (data.error == 'success') {
                restoreEditables();
                if (!tags) {
                    tags = 'No tags';
                    CVEInfoDialog.access.tagsField.setAttribute('empty', true);
                }
                if (!notes) {
                    notes = 'No notes';
                    CVEInfoDialog.access.notesField.setAttribute('empty', true);
                }
                CVEInfoDialog.access.error.innerHTML = '';
                //CVEInfoDialog.access.tagsField.innerHTML = tags;
                getData(cveId);
                //CVEInfoDialog.access.notesField.innerHTML = notes;
            } else {
                CVEInfoDialog.access.error.innerHTML = data.error;
            }
        });
    }

    function restoreEditables() {
        CVEInfoDialog.access.notesField.setAttribute('contenteditable', false);
        CVEInfoDialog.access.notesField.setAttribute('empty', false);
        CVEInfoDialog.access.error.innerHTML = '';
        // Only logged in users do have these
        if (CVEInfoDialog.actions.editTags) {
            CVEInfoDialog.access.tagsField.setAttribute('contenteditable', false);
            CVEInfoDialog.access.tagsField.setAttribute('empty', false);
            CVEInfoDialog.actions.editTags.classList.add('mdi-pencil');
            CVEInfoDialog.actions.editNotes.classList.add('mdi-pencil');
            CVEInfoDialog.actions.save.disabled = true;
            cveTagSelector.clickable = false;
        }
    }

    function shorten(text, maxLength) {
        var ret = text;
        if (ret.length > maxLength) {
            ret = ret.substr(0, maxLength - 3) + '...';
        }
        return ret;
    }

    var importStatusesDialog = new Dialog({
        element: document.querySelector('#import-statuses-dialog'),
        drag: '.title',
        actions: [{
            callback: 'close',
            selector: '.actions .cancel'
        }, {
            callback: importStatuses,
            selector: '.actions .import'
        }],
        access: {
            error: '.error',
            fromKernel: '.from_kernel',
            overrideAll: '.override_all'
        },
        trigger: document.querySelector('#open-import-stauses-dialog')
    });

    function importStatuses() {
        var fromKernel = importStatusesDialog.access.fromKernel.value;
        var toKernel = importStatusesDialog.element.getAttribute('to_kernel');
        var overrideAll = importStatusesDialog.access.overrideAll.checked;
        console.log(fromKernel, toKernel, overrideAll);
        $.ajax({
            'type': 'POST',
            'url': '/import_statuses',
            'contentType': 'application/json',
            'data': JSON.stringify({
                from_kernel: fromKernel,
                to_kernel: toKernel,
                override_all: overrideAll
            })
        }).done(function(data) {
            if (data.error == 'success') {
                importStatusesDialog.access.error.innerHTML = '';
                location.reload();
            } else {
                importStatusesDialog.access.error.innerHTML = data.error;
            }
        });
    }

    var openCloseFilterBox = document.querySelector('#open-close-filters');
    if (openCloseFilterBox) {
        openCloseFilterBox.addEventListener('click', function(e) {
            var filterBox = document.querySelector('#filter-box');
            var chevron = document.querySelector('#open-close-filters .mdi');
            if (filterBox.classList.contains('active')) {
                filterBox.classList.remove('active');
                chevron.classList.remove('mdi-chevron-up');
                chevron.classList.add('mdi-chevron-down');
            } else {
                filterBox.classList.add('active');
                chevron.classList.remove('mdi-chevron-down');
                chevron.classList.add('mdi-chevron-up');
            }
        });

        var filterSelectable = new Selector({
            multiple: true
        });
        var filterElements = [].slice.call(document.querySelector('#filter-box .selectable').children);
        filterElements.forEach(function(element) {
            filterSelectable.addOption(element.innerHTML.trim(), element, element.classList.contains('active'));
        });

        var applyFilters = document.querySelector('#apply-filter');
        applyFilters.addEventListener('click', function(e) {
            var address = window.location;
            var search = "?tags=";
            filterSelectable.getActive().forEach(function(e) {
                search += e + ",";
            });
            address.search = search;
        });

        var applyKernelFilters = document.querySelector('#apply-kernel-filter');
        applyKernelFilters.addEventListener('click', function(e) {
            var address = window.location;
            var search = "?tags=";
            filterElements.forEach(function(element) {
                if (element.classList.contains('kernel-filter')) {
                    search += element.innerHTML.trim() + ",";
                }
            });
            address.search = search;
        });

        var editTagsDialog = new Dialog({
            element: document.querySelector('#edit-tags-dialog'),
            drag: '.title',
            actions: [{
                callback: 'close',
                selector: '.actions .cancel'
            }, {
                callback: editTags,
                selector: '.actions .save'
            }],
            access: {
                error: '.error',
                tags: '.tags',
            },
            trigger: document.querySelector('#open-edit-tags-dialog')
        });

        var kernelTagsSelectable = new Selector({
            multiple: true
        });
        var kernelTags = [].slice.call(document.querySelector('#kernelTags.selectable').children);
        kernelTags.forEach(function(element) {
            kernelTagsSelectable.addOption(element.innerHTML.trim(), element, element.classList.contains('active'));
        });

        function editTags() {
            var kernelId = editTagsDialog.element.getAttribute('kernel_id');
            var tags = editTagsDialog.access.tags.value;
            kernelTagsSelectable.getActive().forEach(function(e) {
                tags += "," + e;
            });
            console.log(tags)
            $.ajax({
                'type': 'POST',
                'url': '/editkerneltags',
                'contentType': 'application/json',
                'data': JSON.stringify({
                    kernel_id: kernelId,
                    tags: tags
                })
            }).done(function(data) {
                if (data.error == 'success') {
                    editTagsDialog.access.error.innerHTML = '';
                    location.reload();
                } else {
                    editTagsDialog.access.error.innerHTML = data.error;
                }
            });
        }
    }

    var progressBar = new Progress({
        container: document.querySelector('#progress-bar'),
        element: document.querySelector('#progress-bar-inner'),
        valueField: document.querySelector('#progress-value'),
        value: document.querySelector('#progress-bar').getAttribute('value')
    });
    window.progressBar = progressBar;
})();
