import frappe
from frappe.utils import today, add_months

@frappe.whitelist()
def get_dashboard_data():
    data = {
        "summary": {
            "total_athletes": frappe.db.count("Athlete"),
            "active_teams": frappe.db.count("Sports Team"),
            "matches_played": frappe.db.count("Match Log"),
            "active_injuries": frappe.db.count("Injury Record", {"status": "Recovering"}),
            "win_rate": get_win_rate()
        },
        "athletes_by_sport": get_athletes_by_sport(),
        "match_results": get_match_results(),
        "upcoming_sessions": get_upcoming_sessions(),
        "top_performers": get_top_performers(),
        "performance_progress": get_performance_progress()
    }
    return data

def get_win_rate():
    total = frappe.db.count("Match Log")
    if not total: return 0
    wins = frappe.db.count("Match Log", {"result": "Win"})
    return round((wins / total) * 100, 1)

def get_athletes_by_sport():
    return frappe.db.sql("""
        select primary_sport as sport, count(*) as count 
        from `tabAthlete` 
        where primary_sport is not null and primary_sport != ''
        group by primary_sport
    """, as_dict=1)

def get_match_results():
    results = frappe.db.sql("""
        select result, count(*) as count 
        from `tabMatch Log` 
        group by result
    """, as_dict=1)
    
    counts = {"wins": 0, "losses": 0, "draws": 0}
    for r in results:
        if r.result == "Win": counts["wins"] = r.count
        elif r.result == "Loss": counts["losses"] = r.count
        elif r.result == "Draw": counts["draws"] = r.count
    return counts

def get_upcoming_sessions():
    return frappe.db.get_all("Training Session", 
        fields=["team", "date", "start_time", "venue", "coach"],
        filters={"date": [">=", today()]},
        order_by="date asc",
        limit=5
    )

def get_top_performers():
    # Summing goals and assists from match statistics
    return frappe.db.sql("""
        select 
            ms.athlete, 
            a.full_name,
            a.primary_sport,
            sum(ms.goals_scored) as goals,
            sum(ms.assists) as assists,
            (sum(ms.goals_scored) + sum(ms.assists)) as total_points
        from `tabMatch Statistic` ms
        join `tabAthlete` a on ms.athlete = a.name
        group by ms.athlete
        order by total_points desc
        limit 5
    """, as_dict=1)

def get_performance_progress():
    # Goals scored over the last 6 months
    return frappe.db.sql("""
        select 
            DATE_FORMAT(ml.match_date, '%b %Y') as month,
            sum(ms.goals_scored) as goals,
            sum(ms.assists) as assists
        from `tabMatch Log` ml
        join `tabMatch Statistic` ms on ms.parent = ml.name
        where ml.match_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        group by month
        order by ml.match_date asc
    """, as_dict=1)
