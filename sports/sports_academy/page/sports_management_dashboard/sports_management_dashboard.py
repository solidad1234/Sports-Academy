import frappe
from frappe.utils import today

@frappe.whitelist()
def get_management_data(sport=None, team=None):
    # Global management overview with new status support
    data = {
        "team_summary": get_team_summary(sport, team),
        "results_breakdown": get_results_breakdown(sport, team),
        "status_breakdown": get_status_breakdown(sport, team),
        "top_athletes": get_top_team_athletes(sport, team),
        "discipline_report": get_team_discipline(sport, team),
        "training_consistency": get_training_consistency(team) if team else get_global_training_consistency(),
        "upcoming_events": get_team_events(sport, team)
    }
    return data

def get_team_summary(sport=None, team=None):
    filters = {"status": "Completed"}
    if sport: filters["sport"] = sport
    if team: filters["team"] = team
    
    completed_total = frappe.db.count("Event Log", filters)
    wins = frappe.db.count("Event Log", {**filters, "result": "Win"})
    
    if team:
        athlete_count = frappe.db.count("Sports Team Member", {"parent": team})
    elif sport:
        athlete_count = frappe.db.count("Athlete", {"primary_sport": sport})
    else:
        athlete_count = frappe.db.count("Athlete")

    return {
        "total_events": completed_total,
        "win_rate": round((wins / completed_total * 100), 1) if completed_total > 0 else 0,
        "athlete_count": athlete_count
    }

def get_results_breakdown(sport=None, team=None):
    # Only for completed matches
    query = "select result, count(*) as count from `tabEvent Log` where status = 'Completed'"
    params = []
    if sport:
        query += " and sport = %s"
        params.append(sport)
    if team:
        query += " and team = %s"
        params.append(team)
    query += " group by result"
    return frappe.db.sql(query, tuple(params), as_dict=1)

def get_status_breakdown(sport=None, team=None):
    query = "select status, count(*) as count from `tabEvent Log` where 1=1"
    params = []
    if sport:
        query += " and sport = %s"
        params.append(sport)
    if team:
        query += " and team = %s"
        params.append(team)
    query += " group by status"
    return frappe.db.sql(query, tuple(params), as_dict=1)

def get_top_team_athletes(sport=None, team=None):
    query = """
        select 
            es.athlete, a.full_name,
            sum(es.goals) as goals,
            sum(es.assists) as assists,
            (sum(es.goals) * 3 + sum(es.assists)) as score
        from `tabEvent Statistic` es
        join `tabAthlete` a on es.athlete = a.name
        join `tabEvent Log` el on es.parent = el.name
        where el.status = 'Completed'
    """
    params = []
    if sport:
        query += " and el.sport = %s"
        params.append(sport)
    if team:
        query += " and el.team = %s"
        params.append(team)
    query += " group by es.athlete order by score desc limit 5"
    return frappe.db.sql(query, tuple(params), as_dict=1)

def get_team_discipline(sport=None, team=None):
    query = """
        select 
            sum(es.yellow_cards) as yellow,
            sum(es.red_cards) as red,
            sum(es.fouls_committed) as fouls
        from `tabEvent Statistic` es
        join `tabEvent Log` el on es.parent = el.name
        where el.status = 'Completed'
    """
    params = []
    if sport:
        query += " and el.sport = %s"
        params.append(sport)
    if team:
        query += " and el.team = %s"
        params.append(team)
    res = frappe.db.sql(query, tuple(params), as_dict=1)
    return res[0] if res and res[0].get("yellow") is not None else {"yellow": 0, "red": 0, "fouls": 0}

def get_training_consistency(team):
    sessions = frappe.db.get_all("Training Session", filters={"team": team}, fields=["name"])
    if not sessions: return 0
    
    session_names = [s.name for s in sessions]
    present = frappe.db.count("Training Attendance", {"parent": ["in", session_names], "status": "Present"})
    total = frappe.db.count("Training Attendance", {"parent": ["in", session_names]})
    
    return round((present / total * 100), 1) if total > 0 else 0

def get_global_training_consistency():
    present = frappe.db.count("Training Attendance", {"status": "Present"})
    total = frappe.db.count("Training Attendance")
    return round((present / total * 100), 1) if total > 0 else 0

def get_team_events(sport=None, team=None):
    # Only Upcoming events
    filters = {"status": "Upcoming"}
    if sport: filters["sport"] = sport
    if team: filters["team"] = team
    return frappe.db.get_all("Event Log", 
        filters=filters, 
        fields=["name", "match_date", "opponent", "venue"],
        order_by="match_date asc",
        limit=5
    )
