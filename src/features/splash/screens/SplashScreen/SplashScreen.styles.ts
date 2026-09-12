import {
  StyleSheet,
} from 'react-native';

const COLORS = {
  teal: '#579F91',
  tealDark: '#438579',
  tealLight: '#A7C7C1',

  white: '#FFFFFF',

  text: '#18201E',
  secondary: '#74817E',

  track: '#E5EEEC',

  shadow: '#285E55',
};

export default StyleSheet.create({

  /*
   * =========================================
   * ROOT
   * =========================================
   */

  container: {
    flex: 1,

    backgroundColor:
      COLORS.white,

    overflow: 'hidden',
  },

  /*
   * =========================================
   * TOP DECORATION
   * =========================================
   */

  topShape: {
    position: 'absolute',

    backgroundColor:
      COLORS.teal,

    borderBottomLeftRadius: 500,

    borderBottomRightRadius: 500,
  },

  topShapeLight: {
    position: 'absolute',

    backgroundColor:
      COLORS.tealLight,

    opacity: 0.65,

    borderBottomRightRadius: 400,
  },

  /*
   * =========================================
   * BOTTOM DECORATION
   * =========================================
   */

  bottomShape: {
    position: 'absolute',

    backgroundColor:
      COLORS.teal,

    borderTopLeftRadius: 500,

    borderTopRightRadius: 500,
  },

  bottomShapeLight: {
    position: 'absolute',

    backgroundColor:
      COLORS.tealLight,

    opacity: 0.65,

    borderTopLeftRadius: 400,
  },

  /*
   * =========================================
   * CENTER
   * =========================================
   */

  centerContent: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 24,

    paddingBottom: '9%',
  },

  /*
   * =========================================
   * LOGO
   * =========================================
   */

  logoSection: {
    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',
  },

  logo: {
    alignSelf: 'center',

    zIndex: 2,
  },

  logoGlow: {
    position: 'absolute',

    backgroundColor:
      COLORS.tealLight,

    opacity: 0.25,

    zIndex: 0,

    /*
     * The blur-like effect is
     * created using opacity + scale.
     */
    shadowColor:
      COLORS.teal,

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.35,

    shadowRadius: 30,

    elevation: 10,
  },

  /*
   * =========================================
   * BRAND
   * =========================================
   */

  brandSection: {
    alignItems: 'center',

    marginTop: 8,
  },

  brandName: {
    fontSize: 27,

    lineHeight: 34,

    fontWeight: '700',

    color: COLORS.text,

    letterSpacing: 0.2,

    textAlign: 'center',
  },

  brandSubtitle: {
    fontSize: 13,

    lineHeight: 20,

    fontWeight: '400',

    color: COLORS.secondary,

    letterSpacing: 0.3,

    textAlign: 'center',

    marginTop: 3,
  },

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  loadingSection: {
    position: 'absolute',

    left: 42,

    right: 42,

    bottom: '10%',
  },

  loadingHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 10,
  },

  loadingText: {
    fontSize: 12,

    fontWeight: '500',

    color: COLORS.secondary,

    letterSpacing: 0.15,
  },

  loadingPercent: {
    fontSize: 11,

    fontWeight: '600',

    color: COLORS.tealDark,

    letterSpacing: 0.2,
  },

  progressTrack: {
    width: '100%',

    height: 4,

    borderRadius: 4,

    backgroundColor:
      COLORS.track,

    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',

    borderRadius: 4,

    backgroundColor:
      COLORS.teal,
  },

  /*
   * =========================================
   * FOOTER
   * =========================================
   */

  footer: {
    position: 'absolute',

    left: 0,

    right: 0,

    bottom: 22,

    alignItems: 'center',
  },

  footerLine: {
    width: 28,

    height: 2,

    borderRadius: 2,

    backgroundColor:
      COLORS.teal,

    opacity: 0.7,

    marginBottom: 7,
  },

  footerText: {
    fontSize: 8,

    fontWeight: '600',

    color: COLORS.teal,

    letterSpacing: 1.4,

    textAlign: 'center',

    opacity: 0.8,
  },

});