"""Release asset/config contract checks, using Python standard library only."""
from pathlib import Path
import json,struct,unittest,wave
BASE=Path(__file__).resolve().parents[1]
class TestReleaseAssets(unittest.TestCase):
 def pngsize(self,relative):
  with open(BASE/relative,'rb') as f:
   header=f.read(24)
  self.assertEqual(header[:8],b'\x89PNG\r\n\x1a\n')
  return struct.unpack('>II',header[16:24])
 def test_dimensions(self):
  self.assertEqual(self.pngsize('assets/icon.png'),(1024,1024))
  self.assertEqual(self.pngsize('assets/feature-graphic.png'),(1024,500))
  self.assertGreaterEqual(self.pngsize('assets/splash.png')[1],1920)
  for name in ['forest','rainbow','treasure','castle','mountain','fox']:
   w,h=self.pngsize('assets/art/'+name+'.png')
   self.assertGreaterEqual(w,900);self.assertGreaterEqual(h,500)
 def test_sound_files_are_decodable(self):
  for name in ['bell','drum','flute','chime','harp','wood','success','music']:
   with wave.open(str(BASE/'assets/sounds'/f'{name}.wav'),'rb') as w:
    self.assertEqual(w.getnchannels(),1)
    self.assertGreater(w.getnframes(),3000)
    self.assertEqual(w.getsampwidth(),2)
 def test_android_config_has_local_only_guardrails(self):
  cfg=json.loads((BASE/'app.json').read_text())['expo']['android']
  self.assertFalse(cfg['allowBackup'])
  self.assertEqual(cfg['permissions'],[])
  self.assertTrue(any('AD_ID' in name for name in cfg['blockedPermissions']))
  requiredBlocked={
   'android.permission.RECORD_AUDIO',
   'android.permission.CAMERA',
   'android.permission.ACCESS_FINE_LOCATION',
   'android.permission.ACCESS_COARSE_LOCATION',
   'android.permission.SYSTEM_ALERT_WINDOW',
   'android.permission.READ_EXTERNAL_STORAGE',
   'android.permission.WRITE_EXTERNAL_STORAGE',
   'android.permission.ACCESS_NETWORK_STATE',
   'android.permission.INTERNET',
   'android.permission.WAKE_LOCK'
  }
  self.assertTrue(requiredBlocked.issubset(set(cfg['blockedPermissions'])))
  build=json.loads((BASE/'app.json').read_text())['expo']['plugins']
  for plugin in build:
   if isinstance(plugin,list) and plugin[0]=='expo-build-properties':
    self.assertGreaterEqual(plugin[1]['android']['targetSdkVersion'],36)
   if isinstance(plugin,list) and plugin[0]=='expo-audio':
    self.assertFalse(plugin[1]['recordAudioAndroid'])
    self.assertFalse(plugin[1]['enableBackgroundRecording'])
 def test_expo_bundle_configuration(self):
  cfg=json.loads((BASE/'eas.json').read_text())
  self.assertEqual(cfg['build']['preview']['android']['buildType'],'apk')
  self.assertEqual(cfg['build']['production']['android']['buildType'],'app-bundle')
if __name__=='__main__': unittest.main(verbosity=2)
