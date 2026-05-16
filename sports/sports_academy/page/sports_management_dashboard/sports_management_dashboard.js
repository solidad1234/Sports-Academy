frappe.pages['sports-management-dashboard'].on_page_load = function(wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Sports Management Analytics",
		single_column: true,
	});

	page.add_field({
		fieldname: 'sport_filter', label: __('Sport'), fieldtype: 'Link', options: 'Sports Master',
		onchange: () => loadData()
	});

	page.add_field({
		fieldname: 'team_filter', label: __('Team'), fieldtype: 'Link', options: 'Sports Team',
		onchange: () => loadData()
	});

	var html_content = `
	<style>
		.mgmt-dashboard { padding: 24px; background: #f1f5f9; min-height: 100vh; font-family: 'Inter', sans-serif; }
		.mgmt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
		.mgmt-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
		.mgmt-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
		.mgmt-card .value { font-size: 32px; font-weight: 800; color: #1e293b; }
		
		.mgmt-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
		.chart-container { background: white; padding: 24px; border-radius: 12px; min-height: 380px; }
	</style>

	<div class="mgmt-dashboard">
		<div id="dashboard-content" style="display: flex; flex-wrap: wrap;">
			<div class="text-center p-5 w-100 text-muted">Initialising Global Management Data...</div>
		</div>
	</div>
	`;

	$(html_content).appendTo(page.body);
	page.set_primary_action('Main Dashboard', () => frappe.set_route("sports-dashboard"), 'fa fa-home');

	function loadChartLibrary() {
		return new Promise((resolve) => {
			if (typeof Chart !== "undefined") { resolve(); return; }
			$.getScript("https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js").done(() => resolve());
		});
	}

	function loadData() {
		const filters = {
			sport: page.fields_dict['sport_filter'].get_value(),
			team: page.fields_dict['team_filter'].get_value()
		};

		frappe.call({
			method: 'sports.sports_academy.page.sports_management_dashboard.sports_management_dashboard.get_management_data',
			args: filters,
			callback: function(r) {
				if (r.message) {
					loadChartLibrary().then(() => renderDashboard(r.message));
				}
			}
		});
	}

	function renderDashboard(data) {
		const $container = $("#dashboard-content").empty();
		
		$container.append(`
			<div class="mgmt-grid" style="width: 100%">
				<div class="mgmt-card">
					<h3>Win Rate (Completed)</h3>
					<div class="value">${data.team_summary.win_rate}%</div>
				</div>
				<div class="mgmt-card">
					<h3>Completed Events</h3>
					<div class="value">${data.team_summary.total_events}</div>
				</div>
				<div class="mgmt-card">
					<h3>Athletes</h3>
					<div class="value">${data.team_summary.athlete_count}</div>
				</div>
				<div class="mgmt-card">
					<h3>Training Consistency</h3>
					<div class="value">${data.training_consistency}%</div>
				</div>
			</div>

			<div class="mgmt-charts" style="width: 100%">
				<div class="chart-container">
					<h3>Outcome Distribution (Completed)</h3>
					<div style="height: 300px;"><canvas id="mgmt-results-chart"></canvas></div>
				</div>
				<div class="chart-container">
					<h3>Event Status Breakdown</h3>
					<div style="height: 300px;"><canvas id="mgmt-status-chart"></canvas></div>
				</div>
			</div>

			<div class="mgmt-charts" style="width: 100%">
				<div class="chart-container" style="min-height: 250px;">
					<h3>Team Discipline Report</h3>
					<div style="display: flex; justify-content: space-around; align-items: center; padding: 20px;">
						<div class="text-center">
							<div style="width: 40px; height: 60px; background: #facc15; border-radius: 4px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
							<div style="font-size: 24px; font-weight: 800; margin-top: 10px;">${data.discipline_report.yellow}</div>
							<div style="font-size: 11px; color: #64748b;">YELLOW CARDS</div>
						</div>
						<div class="text-center">
							<div style="width: 40px; height: 60px; background: #ef4444; border-radius: 4px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
							<div style="font-size: 24px; font-weight: 800; margin-top: 10px;">${data.discipline_report.red}</div>
							<div style="font-size: 11px; color: #64748b;">RED CARDS</div>
						</div>
						<div class="text-center">
							<div style="font-size: 40px; color: #475569;"><i class="fas fa-hand-paper"></i></div>
							<div style="font-size: 24px; font-weight: 800; margin-top: 10px;">${data.discipline_report.fouls}</div>
							<div style="font-size: 11px; color: #64748b;">TOTAL FOULS</div>
						</div>
					</div>
				</div>
				<div class="mgmt-card" style="padding: 0;">
					<div style="padding: 20px; border-bottom: 1px solid #f1f5f9; font-weight: 700; background: #f8fafc;">Upcoming Fixtures</div>
					<div id="mgmt-event-list" style="max-height: 250px; overflow-y: auto;"></div>
				</div>
			</div>

			<div class="mgmt-card" style="width: 100%; padding: 0;">
				<div style="padding: 20px; border-bottom: 1px solid #f1f5f9; font-weight: 700; background: #f8fafc;">Top Performers (Based on Completed Events)</div>
				<div id="mgmt-top-list"></div>
			</div>
		`);

		const $topList = $("#mgmt-top-list");
		if (data.top_athletes.length === 0) $topList.append('<div class="p-4 text-muted">No completed athlete stats found.</div>');
		data.top_athletes.forEach(a => {
			$topList.append(`
				<div style="padding: 12px 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #f8fafc;">
					<span><strong>${a.full_name}</strong></span>
					<span style="color: #2563eb; font-weight: 700;">${a.score} pts</span>
				</div>
			`);
		});

		const $eventList = $("#mgmt-event-list");
		if (data.upcoming_events.length === 0) $eventList.append('<div class="p-4 text-muted">No upcoming fixtures.</div>');
		data.upcoming_events.forEach(e => {
			$eventList.append(`
				<div style="padding: 12px 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #f8fafc;">
					<div>
						<strong>vs ${e.opponent}</strong><br>
						<small class="text-muted">${frappe.datetime.str_to_user(e.match_date)} @ ${e.venue}</small>
					</div>
					<span class="badge badge-info">UPCOMING</span>
				</div>
			`);
		});

		// Results Pie Chart
		if (data.results_breakdown.length > 0) {
			new Chart(document.getElementById("mgmt-results-chart"), {
				type: 'pie',
				data: {
					labels: data.results_breakdown.map(r => r.result),
					datasets: [{
						data: data.results_breakdown.map(r => r.count),
						backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']
					}]
				},
				options: { responsive: true, maintainAspectRatio: false }
			});
		} else {
			$("#mgmt-results-chart").parent().html('<div class="text-center p-5 text-muted">No results found.</div>');
		}

		// Status Bar Chart
		if (data.status_breakdown.length > 0) {
			new Chart(document.getElementById("mgmt-status-chart"), {
				type: 'bar',
				data: {
					labels: data.status_breakdown.map(s => s.status),
					datasets: [{
						label: 'Events',
						data: data.status_breakdown.map(s => s.count),
						backgroundColor: '#6366f1',
						borderRadius: 4
					}]
				},
				options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
			});
		}
	}

	loadData();
};
