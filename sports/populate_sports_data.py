import frappe
from frappe.utils import today, add_months

def create_data():
    # 1. Create Sports
    for s in ["Football", "Athletics", "Swimming"]:
        if not frappe.db.exists("Sports Master", s):
            frappe.get_doc({"doctype": "Sports Master", "sport_name": s}).insert()

    # 2. Create Event Types
    for et in ["Match", "Marathon", "Meet"]:
        if not frappe.db.exists("Event Type", et):
            frappe.get_doc({"doctype": "Event Type", "event_name": et}).insert()

    # 3. Create Incidence Categories
    for ic in ["Injury", "Disciplinary", "Altercation"]:
        if not frappe.db.exists("Incidence Category", ic):
            frappe.get_doc({"doctype": "Incidence Category", "incidence_name": ic}).insert()

    # 4. Create Sports Teams
    teams = ["Red Dragons", "Blue Hawks", "Green Fielders"]
    for t in teams:
        if not frappe.db.exists("Sports Team", t):
            frappe.get_doc({
                "doctype": "Sports Team", 
                "team_name": t, 
                "sport": "Football" if t != "Green Fielders" else "Athletics"
            }).insert()

    # 5. Assign athletes to sports
    athletes = frappe.get_all("Athlete", fields=["name"])
    if athletes:
        for a in athletes:
            doc = frappe.get_doc("Athlete", a.name)
            doc.primary_sport = "Football" if "1123" in a.name else "Athletics"
            doc.save()

    # 6. Create Event Logs
    if not frappe.db.exists("Event Log", {"opponent": "Tigers FC"}):
        el = frappe.get_doc({
            "doctype": "Event Log",
            "event_type": "Match",
            "competition_type": "Tournament",
            "sport": "Football",
            "team": "Red Dragons",
            "opponent": "Tigers FC",
            "match_date": today(),
            "venue": "Main Stadium",
            "result": "Win",
            "our_score": 2,
            "opponent_score": 1,
            "total_yellow_cards": 3,
            "possession": 55,
            "statistics": [
                {
                    "athlete": athletes[0].name,
                    "goals": 1,
                    "assists": 1,
                    "yellow_cards": 1,
                    "minutes_played": 90,
                    "fouls_committed": 2
                },
                {
                    "athlete": athletes[1].name,
                    "goals": 1,
                    "assists": 0,
                    "yellow_cards": 0,
                    "minutes_played": 75,
                    "fouls_committed": 1
                }
            ]
        })
        el.insert()

    # 7. Create Athletics Event
    if not frappe.db.exists("Event Log", {"opponent": "City Open"}):
        el2 = frappe.get_doc({
            "doctype": "Event Log",
            "event_type": "Meet",
            "competition_type": "Trial",
            "sport": "Athletics",
            "team": "Green Fielders",
            "opponent": "City Open",
            "match_date": today(),
            "venue": "Olympia Track",
            "result": "Completed",
            "statistics": [
                {
                    "athlete": athletes[2].name,
                    "time_taken": 10.25,
                    "distance_covered": 100,
                    "rank": 1,
                    "remarks": "New personal best"
                }
            ]
        })
        el2.insert()

    # 8. Create Incidence Records
    if not frappe.db.exists("Incidence Record", {"remarks": "Minor altercation during training"}):
        ir = frappe.get_doc({
            "doctype": "Incidence Record",
            "incidence_category": "Altercation",
            "incidence_date": today(),
            "severity": "Medium",
            "status": "Investigating",
            "occurred_in": "Training",
            "remarks": "Minor altercation during training",
            "participants": [
                {
                    "participant_type": "Athlete",
                    "participant": athletes[0].name,
                    "role": "Aggressor",
                    "statement": "He tripped me on purpose."
                },
                {
                    "participant_type": "Athlete",
                    "participant": athletes[1].name,
                    "role": "Victim",
                    "statement": "It was an accident."
                }
            ]
        })
        ir.insert()

    frappe.db.commit()

create_data()
