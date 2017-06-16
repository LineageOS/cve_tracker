(function() {
	var deleteLinkDialog = new Dialog({
		element: document.querySelector('#delete-link-dialog'),
		drag: '.title',
		actions: [{
			id: 'delete',
			callback: deleteLink,
			selector: '.actions .delete'
		}, {
			id: 'cancel',
			callback: 'close',
			selector: '.actions .cancel'
		}],
		access: {
			title: '.title'
		}
	});

	function deleteLink(button) {
		var d = this;
		var linkId = d.element.getAttribute('link_id');
		d.actions.delete.disabled = true;
		d.actions.cancel.disabled = true;

		$.ajax({
			'type': 'POST',
			'url': '/deletelink',
			'contentType': 'application/json',
			'data': JSON.stringify({
				link_id: linkId,
			})
		}).done(function(data) {
			d.actions.delete.disabled = false;
			d.actions.cancel.disabled = false;
			if (data.error == "success") {
				getLinks();
				d.close();
			} else {
				d.access.error.innerHTML = data.error;
			}
		});
	}

	function getLinks() {
		var cveId = document.getElementById('title').getAttribute('cve_id');
		$.ajax({
			type: 'POST',
			url: '/getlinks',
			contentType: 'application/json',
			data: JSON.stringify({
				cve_id: cveId
			})
		}).done(function(data) {
			var linkList = document.getElementById('linklist');
			if (data.length) {
				var links = JSON.parse(data);
				linkList.innerHTML = "";
				links.forEach(function(v) {
					if (!v.desc) {
						v.desc = 'No description';
					}

					var linkItem = createElement('div', {
						id: v._id.$oid,
						link: v.link,
						desc: v.desc,
						parent: linkList
					});

					createElement('a', {
						class: 'link',
						href: v.link,
						content: v.link
					});
					createElement('span', {
						class: 'linkdesc',
						content: v.desc
					});

					var deleteButton = createElement('button', {
						class: 'delete',
						link_id: v._id.$oid,
						content: 'Delete'
					});
					deleteButton.addEventListener('click', function() {
						deleteLinkDialog.element.setAttribute('link_id', linkId);
						deleteLinkDialog.open();
					});

					var editButton = createElement('button', {
						class: 'edit',
						link_id: v._id.$oid,
						content: 'Edit'
					});
					editButton.addEventListener('click', function() {
						editLinkDialog.element.setAttribute('link_id', linkId);
						editLinkDialog.access.link.value = button.parentElement.getAttribute('link');
						editLinkDialog.access.description.value = button.parentElement.getAttribute('desc');
						editLinkDialog.open();
					});
				});
			} else {
				linkList.innerHTML = "No links available";
			}
		});
	}

	var addLinkDialog = new Dialog({
		element: document.querySelector('#add-link-dialog'),
		drag: '.title',
		actions: [{
			id: 'add',
			callback: addLink,
			selector: '.actions .add'
		}, {
			id: 'cancel',
			callback: 'close',
			selector: '.actions .cancel'
		}],
		access: {
			title: '.title',
			link: '.link',
			description: '.description',
			error: '.error'
		},
		trigger: document.querySelector('.add-link')
	});

	function addLink(button) {
		var d = this;
		var cveId = document.getElementById('title').getAttribute('cve_id');
		var link = d.access.link.value;
		var description = d.access.description.value;

		d.actions.add.disabled = true;
		d.actions.cancel.disabled = true;

		$.ajax({
			'type': 'POST',
			'url': '/addlink',
			'contentType': 'application/json',
			'data': JSON.stringify({
				cve_id: cveId,
				link_url: link,
				link_desc: description,
			})
		}).done(function(data) {
			d.actions.add.disabled = false;
			d.actions.cancel.disabled = false;

			if (data.error == "success") {
				getLinks();
				d.close();
			} else {
				d.access.error.innerHTML = data.error;
			}
		});
	}

	var editLinkDialog = new Dialog({
		element: document.querySelector('#edit-link-dialog'),
		drag: '.title',
		actions: [{
			id: 'save',
			callback: editLink,
			selector: '.actions .save'
		}, {
			id: 'cancel',
			callback: 'close',
			selector: '.actions .cancel'
		}],
		access: {
			title: '.title',
			link: '.link',
			description: '.description',
			error: '.error'
		}
	});

	function editLink(button) {
		var d = this;
		var linkId = d.element.getAttribute('link_id');
		var link = d.access.link.value;
		var description = d.access.description.value;

		d.actions.save.disabled = true;
		d.actions.cancel.disabled = true;

		$.ajax({
			'type': 'POST',
			'url': '/editlink',
			'contentType': 'application/json',
			'data': JSON.stringify({
				link_id: linkId,
				link_url: link,
				link_desc: description,
			})
		}).done(function(data) {
			d.actions.save.disabled = false;
			d.actions.cancel.disabled = false;

			if (data.error == "success") {
				getLinks();
				d.close();
			} else {
				d.access.error.innerHTML = data.error;
			}
		});
	}

	var deleteCVEDialog = new Dialog({
		element: document.querySelector('#delete-cve-dialog'),
		drag: '.title',
		actions: [{
			id: 'delete',
			callback: deleteCVE,
			selector: '.actions .delete'
		}, {
			id: 'cancel',
			callback: 'close',
			selector: '.actions .cancel'
		}],
		access: {
			title: '.title'
		},
		trigger: document.querySelector('.delete-cve')
	});

	function deleteCVE(button) {
		var cveName = document.getElementById('title').innerHTML;
		window.location = "/deletecve/" + cveName;
	}

	getLinks();
})();