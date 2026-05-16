frappe.pages['sports-dashboard'].on_page_load = function(wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Academy Overview",
		single_column: true,
	});

	var html_content = `
	<style>
		@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
		
		.sports-dashboard {
			padding: 24px;
			background: #f4f7fb;
			min-height: calc(100vh - 80px);
			font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		}
		
		.welcome-header {
			background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
			border-radius: 16px;
			padding: 30px;
			margin-bottom: 24px;
			color: white;
			box-shadow: 0 10px 25px rgba(0,0,0,0.1);
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.welcome-header h1 {
			font-size: 24px;
			font-weight: 700;
			margin: 0 0 8px 0;
			color: white;
		}

		.welcome-header p { opacity: 0.8; margin: 0; font-size: 14px; }

		.stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 24px; }

		.stat-card {
			background: white;
			border-radius: 12px;
			padding: 20px;
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
			border-top: 4px solid #3b82f6;
		}
		.stat-card.accent-green { border-top-color: #10b981; }
		.stat-card.accent-orange { border-top-color: #f59e0b; }
		.stat-card.accent-red { border-top-color: #ef4444; }
		.stat-card.accent-purple { border-top-color: #8b5cf6; }

		.stat-icon { font-size: 20px; color: #64748b; margin-bottom: 12px; }
		.stat-value { font-size: 28px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
		.stat-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

		.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }

		.dashboard-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }

		.card-title {
			font-size: 16px;
			font-weight: 700;
			color: #1e293b;
			margin-bottom: 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.clickable-icon { cursor: pointer; color: #94a3b8; transition: color 0.2s; }
		.clickable-icon:hover { color: #2563eb; }

		.player-item { display: flex; align-items: center; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
		.player-avatar {
			width: 36px; height: 36px; background: #e2e8f0; border-radius: 50%;
			display: flex; align-items: center; justify-content: center; font-weight: 700;
			color: #475569; margin-right: 12px;
		}
		.player-info { flex: 1; }
		.player-name { font-weight: 600; color: #1e293b; font-size: 14px; }
		.player-sport { font-size: 11px; color: #64748b; }
		.player-score { font-weight: 700; color: #2563eb; font-size: 14px; text-align: right;}
	</style>

	<div class="sports-dashboard">
		<div class="welcome-header">
			<div>
				<h1><i class="fas fa-university"></i> Academy Global Overview</h1>
				<p>Consolidated statistics across all sports and elite teams</p>
			</div>
			<div class="flex gap-2">
				<button class="btn btn-default btn-sm" onclick="frappe.set_route('sports-management-dashboard')">
					<i class="fas fa-chart-pie"></i> Team Analytics
				</button>
				<button class="btn btn-primary btn-sm" id="refresh-dashboard" style="margin-left: 10px;">
					<i class="fas fa-sync-alt"></i> Refresh
				</button>
			</div>
		</div>

		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon"><i class="fas fa-users"></i></div>
				<div class="stat-value" id="stat-athletes">0</div>
				<div class="stat-label">Total Athletes</div>
			</div>
			<div class="stat-card accent-green">
				<div class="stat-icon"><i class="fas fa-shield-alt"></i></div>
				<div class="stat-value" id="stat-teams">0</div>
				<div class="stat-label">Active Teams</div>
			</div>
			<div class="stat-card accent-orange">
				<div class="stat-icon"><i class="fas fa-running"></i></div>
				<div class="stat-value" id="stat-events">0</div>
				<div class="stat-label">Events Logged</div>
			</div>
			<div class="stat-card accent-red">
				<div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
				<div class="stat-value" id="stat-incidents">0</div>
				<div class="stat-label">Pending Incidents</div>
			</div>
			<div class="stat-card accent-purple">
				<div class="stat-icon"><i class="fas fa-star"></i></div>
				<div class="stat-value" id="stat-winrate">0%</div>
				<div class="stat-label">Overall Win Rate</div>
			</div>
		</div>

		<div class="charts-grid">
			<div class="dashboard-card">
				<div class="card-title">
					<span><i class="fas fa-chart-bar"></i> Academy Performance Trend</span>
					<small class="text-muted">Aggregate Score</small>
				</div>
				<div style="height: 350px;"><canvas id="trend-chart"></canvas></div>
			</div>
			<div class="dashboard-card">
				<div class="card-title">
					<span><i class="fas fa-medal"></i> Academy Top Prospects</span>
					<i class="fas fa-arrow-right clickable-icon" onclick="frappe.set_route('athlete-analytics')"></i>
				</div>
				<div id="top-performers-list">
					<div class="text-center text-muted p-5">Loading leaderboard...</div>
				</div>
			</div>
		</div>

		<div class="charts-grid">
			<div class="dashboard-card">
				<div class="card-title">
					<span><i class="fas fa-users"></i> Athlete Distribution by Sport</span>
				</div>
				<div style="height: 250px;"><canvas id="distribution-chart"></canvas></div>
			</div>
			<div class="dashboard-card">
				<div class="card-title">
					<span><i class="fas fa-chart-pie"></i> Match Outcomes</span>
				</div>
				<div style="height: 250px;"><canvas id="results-chart"></canvas></div>
			</div>
		</div>
	</div>
	`;

	$(html_content).appendTo(page.body);

	let lineChart = null;
	let pieChart = null;
	let distChart = null;

	function loadDashboard() {
		frappe.call({
			method: 'sports.sports_academy.page.sports_dashboard.sports_dashboard.get_dashboard_data',
			callback: function(r) {
				if (r.message) {
					const data = r.message;
					renderStats(data.summary);
					renderTopPerformers(data.top_performers);
					
					if (typeof Chart !== "undefined") {
						renderTrendChart(data.performance_progress);
						renderPieChart(data.event_results);
						renderDistributionChart(data.athletes_by_sport);
					} else {
						// Load Chart.js if not available
						$.getScript("https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js").done(() => {
							renderTrendChart(data.performance_progress);
							renderPieChart(data.event_results);
							renderDistributionChart(data.athletes_by_sport);
						});
					}
				}
			}
		});
	}

	function renderStats(summary) {
		$("#stat-athletes").text(summary.total_athletes);
		$("#stat-teams").text(summary.active_teams);
		$("#stat-events").text(summary.events_played);
		$("#stat-incidents").text(summary.active_incidents);
		$("#stat-winrate").text(summary.win_rate + '%');
	}

	function renderTopPerformers(players) {
		const $list = $("#top-performers-list").empty();
		players.forEach((p, i) => {
			const initial = p.full_name ? p.full_name.charAt(0) : '?';
			$list.append(`
				<div class="player-item">
					<div class="player-avatar">${initial}</div>
					<div class="player-info">
						<div class="player-name">${p.full_name}</div>
						<div class="player-sport">${p.primary_sport}</div>
					</div>
					<div class="player-score">${p.performance_score} pts</div>
				</div>
			`);
		});
	}

	function renderTrendChart(progress) {
		const ctx = document.getElementById("trend-chart").getContext("2d");
		if (lineChart) lineChart.destroy();
		lineChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: progress.map(d => d.month),
				datasets: [{
					label: 'Academy Performance',
					data: progress.map(d => (d.goals * 3) + d.assists),
					backgroundColor: '#3b82f6',
					borderRadius: 6
				}]
			},
			options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
		});
	}

	function renderDistributionChart(dist) {
		const ctx = document.getElementById("distribution-chart").getContext("2d");
		if (distChart) distChart.destroy();
		distChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: dist.map(d => d.sport),
				datasets: [{
					label: 'Athletes',
					data: dist.map(d => d.count),
					backgroundColor: '#8b5cf6',
					borderRadius: 4
				}]
			},
			options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
		});
	}

	function renderPieChart(results) {
		const ctx = document.getElementById("results-chart").getContext("2d");
		if (pieChart) pieChart.destroy();
		pieChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: ['Wins', 'Losses', 'Draws'],
				datasets: [{
					data: [results.wins, results.losses, results.draws],
					backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
					borderWidth: 0
				}]
			},
			options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
		});
	}

	$("#refresh-dashboard").click(() => loadDashboard());
	loadDashboard();
};
