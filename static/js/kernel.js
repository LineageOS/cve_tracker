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
		}],
		access: {
			notes: '.notes',
			links: '.links'
		}
	});

	function editCVE(button, dialog, access) {
		var cve_name = $("#cve-info-dialog").attr("cve_name");
		window.location = "/editcve/" + cve_name;
	}

	function compareCVE(button, dialog, access) {
		var cve_name = $("#cve-info-dialog").attr("cve_name");
		window.location = "/status/" + cve_name;
	}

	function openLinks(cve, cve_id) {
		$("#cve-info-dialog .title").text(cve);
		$("#cve-info-dialog .notes").text('Loading ...');
		$("#cve-info-dialog .links").text('Loading ...');
		$("#cve-info-dialog").attr("cve_name", cve);
		cveinfodialog.open();

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
			$("#cve-info-dialog .notes").text(data[0].notes);
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
			$("#cve-info-dialog .links").empty();
			$.each(JSON.parse(data), function(i, v) {
				if (!v.desc) {
					v.desc = 'No description';
				}
				$("#cve-info-dialog .links").append("<a href='" + v.link + "' target='_blank'>" +
					shorten(v.link, 80) + "</a> - " + v.desc + "<hr>");
			});
		});
	}

	$(document).ready(function() {
		$("#cveinfodialog").dialog({autoOpen: false, width: 'auto' });
		$("#cveinfodialog").on('dialogbeforeclose', function(event, ui) {
			$("#editnotesdialog").dialog('close');
		});

		$("#editnotesdialog").dialog({
			autoOpen: false,
			width: 'auto',
			buttons: [{
				text: "Save!",
				id: "savenotes",
				click: savenotes
			}]
		});
	});

	function editnotes() {
		$('#editnotesdialog').dialog('open');
	}

	function savenotes() {
		var cve_id = $('#editnotesdialog').attr('cve_id');
		var notes = $('#cvenotes_input').val();

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
				if (!notes) {
					notes = 'No notes';
				}
				$('#cvenotes').text(notes);
				$('#editnotesdialog').dialog('close');
			} else {
				$("#editnoteserror").empty().append(data.error);
			}
		});
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