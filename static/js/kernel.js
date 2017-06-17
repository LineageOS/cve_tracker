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
			callback: editCVE,
			selector: '.actions .edit'
		}, {
			callback: compareCVE,
			selector: '.actions .compare'
		}, {
			callback: 'close',
			selector: '.actions .close'
		}, {
			id: 'save',
			callback: saveNotes,
			selector: '.actions .save'
		}],
		access: {
			title: '.title',
			editNotesIcon: '.notes .icon',
			notesField: '.notes .field',
			links: '.links',
			error: '.error'
		}
	});
	CVEInfoDialog.access.editNotesIcon.addEventListener("click", editNotes);

	function editCVE(button) {
		var d = this;
		var cve_name = d.element.getAttribute('cve_name');
		window.location = "/editcve/" + cve_name;
	}

	function compareCVE(button) {
		var d = this;
		var cve_name = d.element.getAttribute('cve_name');
		window.location = "/status/" + cve_name;
	}

	function openLinks(cve_name, cve_id) {
		CVEInfoDialog.access.title.innerHTML = cve_name;
		CVEInfoDialog.access.notesField.innerHTML = "Loading ...";
		CVEInfoDialog.access.links.innerHTML = "Loading ...";
		CVEInfoDialog.element.setAttribute("cve_name", cve_name);
		CVEInfoDialog.element.setAttribute("cve_id", cve_id);
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
			openLinks(name, id);
		});
	});

	function getNotes(cve_id) {
		$.ajax({
			'type': 'POST',
			'url': '/getnotes',
			'contentType': 'application/json',
			'data': JSON.stringify({
				cve_id: cve_id,
			})
		}).done(function(data) {
			data = JSON.parse(data);
			$('#cvenotes_input').val(data[0].notes);
			if (!data[0].notes) {
				data[0].notes = 'No notes';
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
			CVEInfoDialog.access.links.innerHTML = "";
			$.each(JSON.parse(data), function(i, v) {
				if (!v.desc) {
					v.desc = 'No description';
				}
				CVEInfoDialog.access.links.innerHTML += "<a href='" + v.link + "' target='_blank'>" +
					shorten(v.link, 80) + "</a> - " + v.desc;
			});
		});
	}

	function editNotes() {
		CVEInfoDialog.access.notesField.setAttribute("contenteditable", true);
		CVEInfoDialog.access.editNotesIcon.classList.remove("mdi-pencil");
		CVEInfoDialog.actions.save.disabled = false;
	}

	function saveNotes() {
		var cve_id = CVEInfoDialog.element.getAttribute('cve_id');
		var notes = CVEInfoDialog.access.notesField.innerHTML;

		$.ajax({
			'type': 'POST',
			'url': '/editnotes',
			'contentType': 'application/json',
			'data': JSON.stringify({
				cve_id: cve_id,
				cve_notes: notes,
			})
		}).done(function(data) {
			if (data.error == "success") {
				if (!notes) notes = 'No notes';
				CVEInfoDialog.access.error.innerHTML = "";
				CVEInfoDialog.access.notesField.innerHTML = notes;
				restoreNotesEditable();
			} else {
				CVEInfoDialog.access.error.innerHTML = data.error;
			}
		});
	}

	function restoreNotesEditable() {
		CVEInfoDialog.access.editNotesIcon.classList.remove("mdi-pencil");
		CVEInfoDialog.access.editNotesIcon.classList.add("mdi-pencil");
		CVEInfoDialog.access.notesField.setAttribute("contenteditable", false);
		CVEInfoDialog.access.error.innerHTML = "";
		CVEInfoDialog.actions.save.disabled = true
	}

	function shorten(text, maxLength) {
		var ret = text;
		if (ret.length > maxLength) {
			ret = ret.substr(0, maxLength - 3) + "...";
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