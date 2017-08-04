(function() {
    var openCloseFilterBox = document.querySelector('#open-close-filters');
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

    var options = {};
    var selectable = new Selector({
        multiple: true
    });
    var elements = [].slice.call(document.querySelector('#selectable').children);
    elements.forEach(function(element) {
        selectable.addOption(element.innerHTML.trim(), element, element.classList.contains('active'));
    });

    var applyFilters = document.querySelector('#apply-filter');
    applyFilters.addEventListener('click', function(e) {
        var address = window.location;
        var search = "?tags=";
        selectable.getActive().forEach(function(e) {
            search += e + ",";
        });
        address.search = search;
    });

    var applyKernelFilters = document.querySelector('#apply-kernel-filter');
    applyKernelFilters.addEventListener('click', function(e) {
        var address = window.location;
        var search = "?tags=";
        elements.forEach(function(element) {
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

    function editTags() {
        var kernelId = editTagsDialog.element.getAttribute('kernel_id');
        var tags = editTagsDialog.access.tags.value;
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
})();