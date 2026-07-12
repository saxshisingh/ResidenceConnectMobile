import React, {useCallback, useMemo} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import EmptyState from '../../../../components/EmptyState';
import ThemedLoader from '../../../../components/ThemedLoader';
import FamilyIcon from '../../../../assets/Icons/family_restroom.svg';
import EditIcon from '../../../../assets/Icons/Edit_duotone.svg';
import DeleteIcon from '../../../../assets/Icons/Trash.svg';

import {useAppDispatch, useAppSelector} from '../../../../redux/hooks';
import {
  deleteFamilyMemberThunk,
  fetchFamilyMembers,
} from '../../state/familySlice';
import {useAppTheme} from '../../../../theme/ThemeProvider';
import {useI18n} from '../../../../i18n';

const ChevronRight = ({color}: {color: string}) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke="#fff"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AVATAR_COLORS = ['#22C55E', '#10B981', '#059669', '#16A34A', '#15803D'];

export default function FamilyDetails({navigation}: any) {
  const dispatch = useAppDispatch();
  const {colors} = useAppTheme();
  const {language, t} = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width - 32, 520);

  const user = useAppSelector((state: any) => state.auth.user);
  const {items, loading} = useAppSelector((state: any) => state.familyMembers);
  const residentId = user?.data?.residentId;
  const actorId = user?.data?.userId || residentId;
  const familyCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        title:
          '\u0623\u0641\u0631\u0627\u062f \u0627\u0644\u0639\u0627\u0626\u0644\u0629',
        subtitle:
          '\u0623\u062f\u0631 \u0623\u0641\u0631\u0627\u062f \u0623\u0633\u0631\u062a\u0643',
        membersLabel:
          '\u0627\u0644\u0623\u0639\u0636\u0627\u0621',
        add:
          '\u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u062f \u0639\u0627\u0626\u0644\u0629',
      };
    }

    if (language === 'fr') {
      return {
        title: 'Membres de la famille',
        subtitle: 'Gerez les membres de votre foyer',
        membersLabel: 'MEMBRES',
        add: 'Ajouter un membre de la famille',
      };
    }

    return {
      title: 'Family Members',
      subtitle: 'Manage your household members',
      membersLabel: 'MEMBERS',
      add: 'Add Family Member',
    };
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      if (residentId) {
        dispatch(fetchFamilyMembers(residentId));
      }
    }, [dispatch, residentId]),
  );

  const getFamilyId = (item: any) =>
    item.familyMemberId || item.memberId || item.id || '';

  const getInitials = (name?: string) => {
    if (!name) {
      return 'FM';
    }

    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() || 'FM';
    }

    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  };

  const handleDelete = (item: any) => {
    const familyMemberId = getFamilyId(item);
    if (!familyMemberId || !actorId || !residentId) {
      Alert.alert(
        t('common.error', 'Error'),
        t(
          'familyMember.delete.errorMessage',
          'Failed to delete family member',
        ),
      );
      return;
    }

    Alert.alert(
      t('familyMember.delete.title', 'Delete Family Member'),
      t(
        'familyMember.delete.message',
        'Are you sure you want to delete this family member?',
      ),
      [
        {text: t('common.cancel', 'Cancel'), style: 'cancel'},
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                deleteFamilyMemberThunk({familyMemberId, deletedBy: actorId}),
              ).unwrap();
              dispatch(fetchFamilyMembers(residentId));
              Alert.alert(
                t('common.success', 'Success'),
                t(
                  'familyMember.delete.successMessage',
                  'Family member deleted successfully',
                ),
              );
            } catch {
              Alert.alert(
                t('common.error', 'Error'),
                t(
                  'familyMember.delete.errorMessage',
                  'Failed to delete family member',
                ),
              );
            }
          },
        },
      ],
    );
  };

  if (loading && items.length === 0) {
    return (
      <ScreenWrapper
        title={familyCopy.title}
        onBackPress={() => navigation.goBack()}>
        <View style={styles.loaderWrap}>
          <ThemedLoader size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  const renderMember = ({item, index}: any) => {
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.card, {width: contentWidth}]}
        onPress={() =>
          navigation.push('AddEditFamilydetial', {
            mode: 'view',
            familyData: item,
          })
        }>
        <View style={styles.accentBar} />

        <View style={[styles.avatarCircle, {backgroundColor: avatarColor}]}>
          <Text style={styles.avatarText}>
            {getInitials(item.fullName || item.name)}
          </Text>
        </View>

        <View style={{flex: 1}}>
          <Text style={styles.memberName} numberOfLines={1}>
            {item.fullName ||
              item.name ||
              t('family.mobile.memberFallback', 'Family Member')}
          </Text>
          <Text style={styles.memberRelation}>
            {item.relation ||
              item.relationship ||
              t('family.mobile.relationNotSet', 'Relation not set')}
          </Text>
          {item.accessPermission ? (
            <View style={styles.permPill}>
              <Text style={styles.permPillText}>{item.accessPermission}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#D1FAE5'}]}
            onPress={() =>
              navigation.navigate('AddEditFamilydetial', {
                mode: 'edit',
                familyData: item,
              })
            }>
            <EditIcon width={15} height={15} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#FEE2E2'}]}
            onPress={() => handleDelete(item)}>
            <DeleteIcon width={15} height={15} />
          </TouchableOpacity>
        </View>

        <View style={styles.chevronBox}>
          <ChevronRight color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper
      title={familyCopy.title}
      onBackPress={() => navigation.goBack()}>
      <View
        style={[styles.heroCard, {width: contentWidth, alignSelf: 'center'}]}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={styles.heroContent}>
          <View style={styles.heroIconBox}>
            <FamilyIcon width={22} height={22} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.heroTitle}>{familyCopy.title}</Text>
            <Text style={styles.heroSub}>{familyCopy.subtitle}</Text>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={[styles.heroStat, {backgroundColor: '#22C55E'}]}>
            <Text style={styles.heroStatNum}>{items.length}</Text>
            <Text style={styles.heroStatLabel}>{familyCopy.membersLabel}</Text>
          </View>
        </View>
      </View>

      <View style={{flex: 1}}>
        <FlatList
          data={items}
          keyExtractor={item => getFamilyId(item)}
          renderItem={renderMember}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 120,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => {
            if (residentId) {
              dispatch(fetchFamilyMembers(residentId));
            }
          }}
          ListEmptyComponent={
            <EmptyState
              title={t('family.mobile.emptyTitle', 'No family members added yet')}
              description={t(
                'family.mobile.emptyDescription',
                'Add your family members to manage their details.',
              )}
              illustration={<FamilyIcon width={110} height={110} />}
            />
          }
        />

        <TouchableOpacity
          style={[
            styles.addButton,
            {
              width: contentWidth,
              alignSelf: 'center',
              marginBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddEditFamilydetial', {mode: 'add'})}>
          <PlusIcon />
          <Text style={styles.addButtonText}>{familyCopy.add}</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ReturnType<typeof useAppTheme>['colors']) =>
  StyleSheet.create({
    loaderWrap: {flex: 1, justifyContent: 'center', alignItems: 'center'},

    heroCard: {
      backgroundColor: '#1C2340',
      marginHorizontal: 20,
      marginTop: 12,
      marginBottom: 8,
      borderRadius: 20,
      padding: 18,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    heroCircle1: {
      position: 'absolute',
      top: -50,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(34,197,94,0.10)',
    },
    heroCircle2: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: 'rgba(34,197,94,0.07)',
    },
    heroContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    heroIconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    heroSub: {fontSize: 12, color: '#94A3B8', fontWeight: '500'},
    heroStats: {flexDirection: 'row', gap: 8},
    heroStat: {flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center'},
    heroStatNum: {fontSize: 22, fontWeight: '800', color: '#FFFFFF'},
    heroStatLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.65)',
      marginTop: 2,
      letterSpacing: 0.5,
    },

    card: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingRight: 12,
      paddingLeft: 0,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    accentBar: {
      width: 4,
      alignSelf: 'stretch',
      backgroundColor: '#22C55E',
      marginRight: 12,
    },
    avatarCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0,
    },
    avatarText: {color: '#FFFFFF', fontSize: 14, fontWeight: '800'},
    memberName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    memberRelation: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 5,
    },
    permPill: {
      alignSelf: 'flex-start',
      backgroundColor: '#F0FDF4',
      borderRadius: 50,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    permPillText: {fontSize: 11, fontWeight: '700', color: '#16A34A'},
    actions: {flexDirection: 'row', gap: 6, marginRight: 8},
    actionBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chevronBox: {
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },

    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginBottom: 28,
      height: 54,
      backgroundColor: '#22C55E',
      borderRadius: 16,
      shadowColor: '#22C55E',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 5,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    container: {flex: 1},
    emptyWrap: {alignItems: 'center', marginTop: 24},
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    cardLeft: {flexDirection: 'row', alignItems: 'center'},
    cardActions: {flexDirection: 'row'},
    iconBtn: {marginLeft: 12},
    button: {
      margin: 16,
      paddingVertical: 16,
      backgroundColor: colors.primary,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    carName: {fontSize: 14, fontWeight: '600', color: colors.textPrimary},
    parkingId: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  });
