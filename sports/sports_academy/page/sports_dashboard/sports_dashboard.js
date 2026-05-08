frappe.pages['sports-dashboard'].on_page_load = function(wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Sports Academy Analytics",
		single_column: true,
	});

	// CSS and HTML Template
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

		.welcome-header p {
			opacity: 0.8;
			margin: 0;
			font-size: 14px;
		}

		.stats-grid {
			display: grid;
			grid-template-columns: repeat(5, 1fr);
			gap: 20px;
			margin-bottom: 24px;
		}

		.stat-card {
			background: white;
			border-radius: 12px;
			padding: 20px;
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
			border-top: 4px solid #3b82f6;
			transition: transform 0.2s;
		}

		.stat-card:hover { transform: translateY(-3px); }
		.stat-card.accent-green { border-top-color: #10b981; }
		.stat-card.accent-orange { border-top-color: #f59e0b; }
		.stat-card.accent-red { border-top-color: #ef4444; }
		.stat-card.accent-purple { border-top-color: #8b5cf6; }

		.stat-icon { font-size: 20px; color: #64748b; margin-bottom: 12px; }
		.stat-value { font-size: 28px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
		.stat-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

		.charts-grid {
			display: grid;
			grid-template-columns: 2fr 1fr;
			gap: 24px;
			margin-bottom: 24px;
		}

		.dashboard-card {
			background: white;
			border-radius: 12px;
			padding: 24px;
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		}

		.card-title {
			font-size: 16px;
			font-weight: 700;
			color: #1e293b;
			margin-bottom: 20px;
			display: flex;
			align-items: center;
			gap: 10px;
		}

		.player-item {
			display: flex;
			align-items: center;
			padding: 12px;
			border-radius: 8px;
			margin-bottom: 8px;
			transition: background 0.2s;
		}

		.player-item:hover { background: #f8fafc; }

		.player-rank {
			width: 24px;
			font-weight: 800;
			color: #94a3b8;
		}

		.player-avatar {
			width: 36px;
			height: 36px;
			background: #e2e8f0;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 700;
			color: #475569;
			margin-right: 12px;
		}

		.player-info { flex: 1; }
		.player-name { font-weight: 600; color: #1e293b; font-size: 14px; }
		.player-sport { font-size: 11px; color: #64748b; }
		.player-score { font-weight: 700; color: #2563eb; font-size: 14px; }

		.table-wrapper { overflow-x: auto; }
		.modern-table { width: 100%; border-collapse: collapse; }
		.modern-table th { text-align: left; padding: 12px; font-size: 12px; color: #64748b; border-bottom: 2px solid #f1f5f9; }
		.modern-table td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
		
		.badge {
			padding: 4px 10px;
			border-radius: 12px;
			font-size: 11px;
			font-weight: 600;
		}
		.badge-success { background: #dcfce7; color: #166534; }
		.badge-danger { background: #fee2e2; color: #991b1b; }
		.badge-warning { background: #fef3c7; color: #92400e; }
	</style>

	<div class="sports-dashboard">
		<!-- Header -->
		<div class="welcome-header">
			<div>
				<h1><i class="fas fa-trophy"></i> Sports Academy Performance</h1>
				<p>Real-time tracking of athletes, teams, and match analytics</p>
			</div>
			<button class="btn btn-primary btn-sm" id="refresh-dashboard">
				<i class="fas fa-sync-alt"></i> Refresh Data
			</button>
		</div>

		<!-- Stats -->
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
				<div class="stat-value" id="stat-matches">0</div>
				<div class="stat-label">Matches Played</div>
			</div>
			<div class="stat-card accent-red">
				<div class="stat-icon"><i class="fas fa-medkit"></i></div>
				<div class="stat-value" id="stat-injuries">0</div>
				<div class="stat-label">Injuries</div>
			</div>
			<div class="stat-card accent-purple">
				<div class="stat-icon"><i class="fas fa-star"></i></div>
				<div class="stat-value" id="stat-winrate">0%</div>
				<div class="stat-label">Win Rate</div>
			</div>
		</div>

		<!-- Charts Section -->
		<div class="charts-grid">
			<div class="dashboard-card">
				<div class="card-title"><i class="fas fa-chart-line"></i> Performance Trend (Goals & Assists)</div>
				<div style="height: 350px;"><canvas id="trend-chart"></canvas></div>
			</div>
			<div class="dashboard-card">
				<div class="card-title"><i class="fas fa-medal"></i> Top Performers</div>
				<div id="top-performers-list">
					<div class="text-center text-muted p-5">Loading leaderboard...</div>
				</div>
			</div>
		</div>

		<div class="charts-grid">
			<div class="dashboard-card">
				<div class="card-title"><i class="fas fa-calendar-alt"></i> Upcoming Training Sessions</div>
				<div class="table-wrapper">
					<table class="modern-table">
						<thead>
							<tr><th>Team</th><th>Date</th><th>Time</th><th>Venue</th><th>Coach</th></tr>
						</thead>
						<tbody id="sessions-table-body">
							<tr><td colspan="5" class="text-center p-4">No sessions scheduled</td></tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class="dashboard-card">
				<div class="card-title"><i class="fas fa-chart-pie"></i> Match Outcomes</div>
				<div style="height: 250px;"><canvas id="results-chart"></canvas></div>
			</div>
		</div>
	</div>
	`;

	$(html_content).appendTo(page.body);

	// Load Chart.js
	function loadChartLibrary() {
		return new Promise((resolve, reject) => {
			if (typeof Chart !== "undefined") { resolve(); return; }
			const script = document.createElement("script");
			script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
			script.onload = () => resolve();
			script.onerror = () => reject();
			document.head.appendChild(script);
		});
	}

	let lineChart = null;
	let pieChart = null;

	async function loadDashboard() {
		frappe.call({
			method: 'sports.sports_academy.page.sports_dashboard.sports_dashboard.get_dashboard_data',
			callback: function(r) {
				if (r.message) {
					const data = r.message;
					renderStats(data.summary);
					renderTopPerformers(data.top_performers);
					renderSessions(data.upcoming_sessions);
					
					loadChartLibrary().then(() => {
						renderLineChart(data.performance_progress);
						renderPieChart(data.match_results);
					});
				}
			}
		});
	}

	function renderStats(summary) {
		$("#stat-athletes").text(summary.total_athletes);
		$("#stat-teams").text(summary.active_teams);
		$("#stat-matches").text(summary.matches_played);
		$("#stat-injuries").text(summary.active_injuries);
		$("#stat-winrate").text(summary.win_rate + '%');
	}

	function renderTopPerformers(players) {
		const $list = $("#top-performers-list").empty();
		if (!players || players.length === 0) {
			$list.append('<div class="text-center text-muted p-4">No data available</div>');
			return;
		}
		players.forEach((p, i) => {
			const initial = p.full_name ? p.full_name.charAt(0) : '?';
			$list.append(`
				<div class="player-item">
					<div class="player-rank">#${i+1}</div>
					<div class="player-avatar">${initial}</div>
					<div class="player-info">
						<div class="player-name">${p.full_name}</div>
						<div class="player-sport">${p.primary_sport}</div>
					</div>
					<div class="player-score">${p.goals} G / ${p.assists} A</div>
				</div>
			`);
		});
	}

	function renderSessions(sessions) {
		const $tbody = $("#sessions-table-body").empty();
		if (!sessions || sessions.length === 0) {
			$tbody.append('<tr><td colspan="5" class="text-center p-4">No sessions scheduled</td></tr>');
			return;
		}
		sessions.forEach(s => {
			$tbody.append(`
				<tr>
					<td><strong>${s.team}</strong></td>
					<td>${frappe.datetime.str_to_user(s.date)}</td>
					<td>${s.start_time || '--:--'}</td>
					<td>${s.venue || 'Field'}</td>
					<td>${s.coach}</td>
				</tr>
			`);
		});
	}

	function renderLineChart(progress) {
		const ctx = document.getElementById("trend-chart").getContext("2d");
		if (lineChart) lineChart.destroy();
		
		lineChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: progress.map(d => d.month),
				datasets: [
					{
						label: 'Goals',
						data: progress.map(d => d.goals),
						borderColor: '#3b82f6',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						fill: true,
						tension: 0.4
					},
					{
						label: 'Assists',
						data: progress.map(d => d.assists),
						borderColor: '#10b981',
						backgroundColor: 'rgba(16, 185, 129, 0.1)',
						fill: true,
						tension: 0.4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { position: 'top' } },
				scales: { y: { beginAtZero: true } }
			}
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
					backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { position: 'bottom' } }
			}
		});
	}

	$("#refresh-dashboard").click(() => loadDashboard());

	// Initial Load
	loadDashboard();
};
