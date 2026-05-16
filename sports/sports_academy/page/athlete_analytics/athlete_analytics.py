import frappe

@frappe.whitelist()
def get_detailed_stats(category="performance"):
    from sports.sports_academy.page.sports_dashboard.sports_dashboard import get_top_performers, get_discipline_stats
    
    if category == "performance":
        return get_top_performers(limit=None)
    else:
        return get_discipline_stats(limit=None)
