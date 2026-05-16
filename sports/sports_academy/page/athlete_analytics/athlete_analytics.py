import frappe

@frappe.whitelist()
def get_detailed_stats(category="performance", athlete=None, team=None):
    from sports.sports_academy.page.sports_dashboard.sports_dashboard import get_top_performers, get_discipline_stats
    
    if category == "performance":
        return get_top_performers(athlete=athlete, sport=None, team=team, limit=None)
    else:
        return get_discipline_stats(athlete=athlete, sport=None, team=team, limit=None)
