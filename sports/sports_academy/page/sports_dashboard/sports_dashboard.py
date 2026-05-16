import frappe
from frappe.utils import today, add_months

@frappe.whitelist()
def get_dashboard_data(athlete=None, sport=None, team=None):
    # Global filters for simple counts
    filters = {}
    if athlete: filters["name"] = athlete # Athlete name is the filter for Athlete DocType
    if sport: filters["primary_sport"] = sport
    
    # Event filters
    event_filters = {}
    if athlete: event_filters["athlete"] = athlete # In statistics child table, it's 'athlete'
    if sport: event_filters["sport"] = sport
    if team: event_filters["team"] = team

    data = {
        "summary": {
            "total_athletes": frappe.db.count("Athlete", filters),
            "active_teams": frappe.db.count("Sports Team", {"sport": sport} if sport else {}),
            "events_played": get_event_count(athlete, sport, team),
            "active_incidents": get_incident_count(athlete),
            "win_rate": get_win_rate(sport, team)
        },
        "athletes_by_sport": get_athletes_by_sport(),
        "event_results": get_event_results(sport, team),
        "upcoming_sessions": get_upcoming_sessions(team),
        "top_performers": get_top_performers(sport, team),
        "discipline_stats": get_discipline_stats(athlete, sport, team),
        "performance_progress": get_performance_progress(athlete, sport, team)
    }
    return data

def get_event_count(athlete=None, sport=None, team=None):
    if not athlete and not sport and not team:
        return frappe.db.count("Event Log")
    
    query = "select count(distinct el.name) from `tabEvent Log` el"
    if athlete:
        query += " join `tabEvent Statistic` es on es.parent = el.name"
    
    query += " where 1=1"
    params = []
    if athlete:
        query += " and es.athlete = %s"
        params.append(athlete)
    if sport:
        query += " and el.sport = %s"
        params.append(sport)
    if team:
        query += " and el.team = %s"
        params.append(team)
        
    return frappe.db.sql(query, tuple(params))[0][0]

def get_incident_count(athlete=None):
    if not athlete:
        return frappe.db.count("Incidence Record", {"status": ["in", ["Pending", "Investigating"]]})
    
    return frappe.db.sql("""
        select count(distinct ir.name) 
        from `tabIncidence Record` ir
        join `tabIncidence Participant` ip on ip.parent = ir.name
        where ip.participant = %s and ir.status in ('Pending', 'Investigating')
    """, (athlete,))[0][0]

def get_win_rate(sport=None, team=None):
    filters = {}
    if sport: filters["sport"] = sport
    if team: filters["team"] = team
    
    total = frappe.db.count("Event Log", filters)
    if not total: return 0
    
    filters["result"] = "Win"
    wins = frappe.db.count("Event Log", filters)
    return round((wins / total) * 100, 1)

def get_athletes_by_sport():
    return frappe.db.sql("""
        select primary_sport as sport, count(*) as count 
        from `tabAthlete` 
        where primary_sport is not null and primary_sport != ''
        group by primary_sport
    """, as_dict=1)

def get_event_results(sport=None, team=None):
    query = "select result, count(*) as count from `tabEvent Log` where 1=1"
    params = []
    if sport:
        query += " and sport = %s"
        params.append(sport)
    if team:
        query += " and team = %s"
        params.append(team)
    query += " group by result"
    
    results = frappe.db.sql(query, tuple(params), as_dict=1)
    
    counts = {"wins": 0, "losses": 0, "draws": 0}
    for r in results:
        if r.result == "Win": counts["wins"] = r.count
        elif r.result == "Loss": counts["losses"] = r.count
        elif r.result == "Draw": counts["draws"] = r.count
    return counts

def get_upcoming_sessions(team=None):
    filters = {"date": [">=", today()]}
    if team: filters["team"] = team
    
    return frappe.db.get_all("Training Session", 
        fields=["team", "date", "start_time", "venue", "coach"],
        filters=filters,
        order_by="date asc",
        limit=5
    )

def get_top_performers(sport=None, team=None, limit=5):
    query = """
        select 
            es.athlete, 
            a.full_name,
            a.primary_sport,
            sum(es.goals) as goals,
            sum(es.assists) as assists,
            sum(es.minutes_played) as minutes,
            (sum(es.goals) * 3 + sum(es.assists)) as performance_score
        from `tabEvent Statistic` es
        join `tabAthlete` a on es.athlete = a.name
        join `tabEvent Log` el on es.parent = el.name
        where 1=1
    """
    params = []
    if sport:
        query += " and el.sport = %s"
        params.append(sport)
    if team:
        query += " and el.team = %s"
        params.append(team)
        
    query += " group by es.athlete order by performance_score desc"
    if limit:
        query += f" limit {limit}"
    return frappe.db.sql(query, tuple(params), as_dict=1)

def get_discipline_stats(athlete=None, sport=None, team=None, limit=5):
    query = """
        select 
            es.athlete,
            a.full_name,
            sum(es.yellow_cards) as yellow_cards,
            sum(es.red_cards) as red_cards,
            sum(es.fouls_committed) as fouls
        from `tabEvent Statistic` es
        join `tabAthlete` a on es.athlete = a.name
        join `tabEvent Log` el on es.parent = el.name
        where 1=1
    """
    params = []
    if athlete:
        query += " and es.athlete = %s"
        params.append(athlete)
    if sport:
        query += " and el.sport = %s"
        params.append(sport)
    if team:
        query += " and el.team = %s"
        params.append(team)
        
    query += " group by es.athlete order by red_cards desc, yellow_cards desc"
    if limit:
        query += f" limit {limit}"
    return frappe.db.sql(query, tuple(params), as_dict=1)

def get_performance_progress(athlete=None, sport=None, team=None):
    query = """
        select 
            DATE_FORMAT(el.match_date, '%%b %%Y') as month,
            sum(es.goals) as goals,
            sum(es.assists) as assists
        from `tabEvent Log` el
        join `tabEvent Statistic` es on es.parent = el.name
        where el.match_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    """
    params = []
    if athlete:
        query += " and es.athlete = %s"
        params.append(athlete)
    if sport:
        query += " and el.sport = %s"
        params.append(sport)
    if team:
        query += " and el.team = %s"
        params.append(team)
        
    query += " group by month order by el.match_date asc"
    return frappe.db.sql(query, tuple(params), as_dict=1)

@frappe.whitelist()
def get_all_athlete_stats(sort_by="performance_score"):
    # This will be used for the detailed analytics page
    if sort_by == "performance_score":
        return get_top_performers(limit=None)
    elif sort_by == "discipline":
        return get_discipline_stats(limit=None)
    return []
