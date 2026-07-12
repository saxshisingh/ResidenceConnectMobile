import { Vibration } from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

export const playAlertTone = () => {
  try {
    const sound = new Sound('alert_tone.wav', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Alert tone load error:', error);
        Vibration.vibrate(350);
        return;
      }

      sound.play(success => {
        if (!success) {
          console.log('Alert tone playback failed');
          Vibration.vibrate(350);
        }
        sound.release();
      });
    });
  } catch (error) {
    console.log('Alert tone unexpected error:', error);
    Vibration.vibrate(350);
  }
};
