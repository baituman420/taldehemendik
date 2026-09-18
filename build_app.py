import re, os

screens_order = [
    ("screen_a_home_coach", "stitch_screens/screen_a_home_coach.html"),
    ("screen_b_calendar", "stitch_screens/screen_b_calendar.html"),
    ("screen_c_create_event", "stitch_screens/screen_c_create_event.html"),
    ("screen_d_event_detail_coach", "stitch_screens/screen_d_event_detail_coach.html"),
    ("screen_e_create_squad", "stitch_screens/screen_e_create_squad.html"),
    ("screen_f_squad_published_injury", "stitch_screens/screen_f_squad_published_injury.html"),
    ("screen_g_home_parent", "stitch_screens/screen_g_home_parent.html"),
    ("screen_h_rsvp_parent", "stitch_screens/screen_h_rsvp_parent.html"),
    ("screen_i_callup_parent", "stitch_screens/screen_i_callup_parent.html"),
    ("screen_j_roster", "stitch_screens/screen_j_roster.html"),
    ("screen_k_notices", "stitch_screens/screen_k_notices.html"),
]

extracted_screens = {}
for screen_id, file_path in screens_order:
    content = open(file_path).read()
    # Extract body content
    match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
    if match:
        body_content = match.group(1)
        # Clean any redundant script tags from individual files
        body_content = re.sub(r'<script.*?</script>', '', body_content, flags=re.DOTALL)
        extracted_screens[screen_id] = body_content
    else:
        print(f"Failed to match body in {file_path}")

print("Extracted", len(extracted_screens), "screens.")
