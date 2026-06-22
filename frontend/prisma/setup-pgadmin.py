import sqlite3, os, json

db = os.path.expandvars(r'%APPDATA%\pgAdmin\pgadmin4.db')
conn = sqlite3.connect(db)
cur = conn.cursor()

user_id  = 1
group_id = 1  # "Servers" group

# Connection params as JSON (pgAdmin 4 modern format)
connection_params = json.dumps([
    {"name": "sslmode", "value": "prefer"},
    {"name": "connect_timeout", "value": "10"}
])

# Check if KCM Local already exists
cur.execute("SELECT id FROM server WHERE name='KCM Local' AND user_id=?", (user_id,))
existing = cur.fetchone()

if existing:
    cur.execute("""
        UPDATE server SET
            host='localhost', port=5432,
            maintenance_db='church_db', username='postgres'
        WHERE id=?
    """, (existing[0],))
    conn.commit()
    print('Updated existing server id:', existing[0])
else:
    cur.execute("""
        INSERT INTO server (
            user_id, servergroup_id, name, host, port,
            maintenance_db, username, comment,
            password, role, bgcolor, fgcolor,
            service, use_ssh_tunnel, tunnel_host, tunnel_port,
            tunnel_username, tunnel_authentication, tunnel_identity_file,
            tunnel_password, save_password, shared, kerberos_conn,
            cloud_status, passexec_cmd, passexec_expiration,
            connection_params, shared_username, prepare_threshold,
            tunnel_keep_alive, tags, is_adhoc, post_connection_sql,
            db_res_type, tunnel_prompt_password
        ) VALUES (
            ?, ?, 'KCM Local', 'localhost', 5432,
            'church_db', 'postgres', 'Kingdom of Christ Ministries DB',
            NULL, NULL, NULL, NULL,
            NULL, 0, NULL, 22,
            NULL, 0, NULL,
            NULL, 1, 0, 0,
            0, NULL, NULL,
            ?, NULL, NULL,
            0, NULL, 0, NULL,
            NULL, 0
        )
    """, (user_id, group_id, connection_params))
    conn.commit()
    new_id = cur.lastrowid
    print('SUCCESS! Created KCM Local server id:', new_id)

# Verify
cur.execute("SELECT id, name, host, port, maintenance_db, username FROM server WHERE user_id=?", (user_id,))
all_servers = cur.fetchall()
print('\nAll servers in pgAdmin:')
for s in all_servers:
    print(f'  [{s[0]}] {s[1]} -> {s[3]}:{s[4]}/{s[5]} (user: {s[6]})')

conn.close()
print('\nDONE! Now in pgAdmin:')
print('  1. Press F5 to refresh')
print('  2. Expand Servers -> KCM Local')
print('  3. Enter password: 2106')
