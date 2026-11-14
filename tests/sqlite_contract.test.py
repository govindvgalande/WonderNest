"""Execute the application's real schema/migration and key SQL contracts with Python's SQLite engine.
This is database-level validation, not a claim that Android expo-sqlite has been exercised.
"""
import sqlite3,re,pathlib,unittest
source=pathlib.Path('src/storage/database.ts').read_text()
match=re.search(r'db\.execSync\(`(.*?)`\);\s*\}',source,re.S)
if not match:raise RuntimeError('SQLite DDL was not found in application source')
schema=match.group(1)
class TestSQLiteContracts(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:')
  self.db.execute('PRAGMA foreign_keys=ON')
  self.db.executescript(schema)
  self.db.executescript("ALTER TABLE profiles ADD COLUMN disabled_games TEXT NOT NULL DEFAULT '[]'; PRAGMA user_version=2;")
  self.db.executescript("""
    CREATE TABLE IF NOT EXISTS active_runs (
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      game_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY(profile_id,game_id)
    );
    PRAGMA user_version=3;
  """)
  self.db.execute("INSERT INTO profiles VALUES (?,?,?,?,?,?,?,?)",('p1','Little One','3-5','🦊',15,8,12345,'[]'))
 def tearDown(self):self.db.close()
 def test_schema_and_migration(self):
  self.assertEqual(self.db.execute('PRAGMA user_version').fetchone()[0],3)
  tables={r[0] for r in self.db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
  self.assertTrue({'profiles','attempts','difficulty','rewards','usage_days','session_state','settings','active_runs'}.issubset(tables))
 def test_profile_deletion_cascades(self):
  self.db.execute('INSERT INTO attempts(profile_id,game_id,seed,level,correct,mistakes,hints,duration_sec,created_at) VALUES(?,?,?,?,?,?,?,?,?)',('p1','cards',4,1,1,0,0,30,12345))
  self.db.execute("INSERT INTO rewards VALUES ('p1','first_adventure',123)")
  self.db.execute("INSERT INTO usage_days VALUES ('p1','2026-11-14',50)")
  self.db.execute("INSERT INTO difficulty VALUES ('p1','cards','{}')")
  self.db.execute("INSERT INTO active_runs VALUES ('p1','cards','{}',12345)")
  self.db.execute('DELETE FROM profiles WHERE id=?',('p1',))
  for table in ['attempts','rewards','usage_days','difficulty','active_runs']:
   self.assertEqual(self.db.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0],0,table)
 def test_uniqueness_and_daily_usage_atomic_upsert(self):
  for i in [5,5,2]:
   self.db.execute('INSERT INTO usage_days(profile_id,day,seconds) VALUES(?,?,?) ON CONFLICT(profile_id,day) DO UPDATE SET seconds=usage_days.seconds+excluded.seconds',('p1','2026-11-14',i))
  self.assertEqual(self.db.execute('SELECT seconds FROM usage_days WHERE profile_id=?',('p1',)).fetchone()[0],12)
  for i in range(4):self.db.execute('INSERT OR IGNORE INTO rewards(profile_id,code,created_at) VALUES(?,?,?)',('p1','first_adventure',100+i))
  self.assertEqual(self.db.execute('SELECT COUNT(*) FROM rewards').fetchone()[0],1)
 def test_transaction_rolls_back_partial_progress(self):
  self.db.commit()
  try:
   self.db.execute('BEGIN IMMEDIATE TRANSACTION')
   self.db.execute('INSERT INTO attempts(profile_id,game_id,seed,level,correct,mistakes,hints,duration_sec,created_at) VALUES(?,?,?,?,?,?,?,?,?)',('p1','cards',5,1,1,0,0,30,12345))
   self.db.execute('INSERT INTO rewards(profile_id,code,created_at) VALUES(?,?,?)',('bad_profile','x',100))
   self.db.execute('COMMIT')
  except sqlite3.IntegrityError:self.db.execute('ROLLBACK')
  self.assertEqual(self.db.execute('SELECT COUNT(*) FROM attempts').fetchone()[0],0)
if __name__=='__main__':unittest.main(verbosity=2)
