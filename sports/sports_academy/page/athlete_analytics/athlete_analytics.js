frappe.pages['athlete-analytics'].on_page_load = function(wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Athlete Global Analytics",
		single_column: true,
	});

	var html_content = `
	<style>
		.analytics-container { padding: 24px; background: #f8fafc; min-height: 100vh; }
		.filter-bar { background: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; gap: 20px; align-items: center; }
		.stats-table-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
		.stats-table { width: 100%; border-collapse: collapse; }
		.stats-table th { background: #f1f5f9; padding: 15px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
		.stats-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; }
		.stats-table tr:hover { background: #f8fafc; }
		.rank-badge { background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 12px; }
		.score-pill { background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 20px; font-weight: 700; }
		.discipline-pill { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 20px; font-weight: 700; }
		.tab-btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid #e2e8f0; }
		.tab-btn.active { background: #1e293b; color: white; border-color: #1e293b; }
	</style>

	<div class="analytics-container">
		<div class="filter-bar">
			<div class="tab-btn active" data-cat="performance">Performance Leaderboard</div>
			<div class="tab-btn" data-cat="discipline">Discipline & Fair Play</div>
			<div style="flex: 1"></div>
			<button class="btn btn-primary btn-sm" onclick="location.reload()"><i class="fas fa-sync"></i> Refresh</button>
		</div>

		<div class="stats-table-card">
			<table class="stats-table">
				<thead id="table-head"></thead>
				<tbody id="table-body">
					<tr><td colspan="10" class="text-center p-5">Fetching data...</td></tr>
				</tbody>
			</table>
		</div>
	</div>
	`;

	$(html_content).appendTo(page.body);

	let current_cat = "performance";

	function loadData() {
		frappe.call({
			method: 'sports.sports_academy.page.athlete_analytics.athlete_analytics.get_detailed_stats',
			args: { category: current_cat },
			callback: function(r) {
				renderTable(r.message || []);
			}
		});
	}

	function renderTable(data) {
		const $head = $("#table-head").empty();
		const $body = $("#table-body").empty();

		if (current_cat === "performance") {
			$head.append(`
				<tr>
					<th>Rank</th>
					<th>Athlete</th>
					<th>Primary Sport</th>
					<th>Goals/Points</th>
					<th>Assists</th>
					<th>Minutes</th>
					<th>Performance Score</th>
				</tr>
			`);
			data.forEach((d, i) => {
				$body.append(`
					<tr>
						<td><span class="rank-badge">#${i+1}</span></td>
						<td><strong>${d.full_name}</strong></td>
						<td>${d.primary_sport || '-'}</td>
						<td>${d.goals}</td>
						<td>${d.assists}</td>
						<td>${d.minutes}</td>
						<td><span class="score-pill">${d.performance_score} pts</span></td>
					</tr>
				`);
			});
		} else {
			$head.append(`
				<tr>
					<th>Rank</th>
					<th>Athlete</th>
					<th>Yellow Cards</th>
					<th>Red Cards</th>
					<th>Total Fouls</th>
					<th>Status</th>
				</tr>
			`);
			data.forEach((d, i) => {
				$body.append(`
					<tr>
						<td><span class="rank-badge">#${i+1}</span></td>
						<td><strong>${d.full_name}</strong></td>
						<td style="color: #f59e0b; font-weight: 700;">${d.yellow_cards}</td>
						<td style="color: #ef4444; font-weight: 700;">${d.red_cards}</td>
						<td>${d.fouls}</td>
						<td><span class="discipline-pill">${d.red_cards > 0 ? 'High Alert' : 'Clean'}</span></td>
					</tr>
				`);
			});
		}
	}

	$(".tab-btn").click(function() {
		$(".tab-btn").removeClass("active");
		$(this).addClass("active");
		current_cat = $(this).data("cat");
		loadData();
	});

	loadData();
};
