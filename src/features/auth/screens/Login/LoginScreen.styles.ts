import { StyleSheet } from 'react-native';

const CIRCLE_SIZE = 420;
const RADIUS = CIRCLE_SIZE / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 28,
  },

 

  topCircle1: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    top: -250,
    left: -260,
    borderRadius: RADIUS,
    backgroundColor: 'rgba(243, 126, 0, 0.6)',
    zIndex: 0,
  },

  topCircle2: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    top: -320,
    left: -80,
    borderRadius: RADIUS,
    backgroundColor: 'rgba(243, 126, 0, 0.75)',
    zIndex: 0,
  },

  topCircle3: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    top: -330,
    left: 100,
    borderRadius: RADIUS,
    backgroundColor: 'rgba(243, 126, 0, 0.55)',
    zIndex: 0,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  bottomBlob1: {
    position: 'absolute',
    bottom: -90,
    right: -150,
    zIndex: 0,
  },
  bottomBlob2: {
    position: 'absolute',
    bottom: -150,
    right: -12,
    zIndex: 0,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#111827',
  },

  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },

  passwordInput: {
    flex: 1,
    color: '#111827',
  },

  eyeIcon: {
    width: 22,
    height: 22,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },

  remember: {
    color: '#6B7280',
  },

  forgot: {
    color: '#F37E00',
    fontWeight: '600',
  },

  loginBtn: {
    backgroundColor: '#F37E00',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  orText: {
    textAlign: 'center',
    marginVertical: 18,
    color: '#6B7280',
  },

  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },

  socialText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    marginLeft: 4,
  },


  bottomCircle1: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    bottom: -200,
    right: -160,
    borderRadius: 160,
    backgroundColor: '#F37E00',
  },

  bottomCircle2: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    bottom: -160,
    right: -40,
    borderRadius: 160,
    backgroundColor: '#F37E0080',
  },



   content_: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
    textAlign: 'center',
  },

  label_: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },

  passwordBox_: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 48,
  },

  passwordInput_: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  eyeIcon_: {
    marginLeft: 8,
  },

  confirmBtn: {
    backgroundColor: '#F37E00',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },


});

export default styles;
