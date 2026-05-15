import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';

import ScreenWrapper from '../../../../components/ScreenWrapper';
import { createStyles } from './CommunityBoard.styles';

import HeartIcon from '../../../../assets/Icons/Like.svg';
import HeartFilledIcon from '../../../../assets/Icons/Like.svg';
import MessageIcon from '../../../../assets/Icons/Comment1.svg';
import PlusIcon from '../../../../assets/Icons/add.svg';
import GroupsIcon from '../../../../assets/Icons/groups_2.svg';
import CommentIcon from '../../../../assets/Icons/comment.svg';

import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import {
  fetchPosts,
  setFilter,
  searchPosts,
  toggleLike,
  addPostComment,
  getPostComments,
  reportCommunityPost,
  deleteCommunityPost,
} from '../../state/communitySlice';
import type { Comment } from '../../services/communityService';
import { API_BASE_URL } from '../../../../config/api';
import ThemedLoader from '../../../../components/ThemedLoader';
import EmptyState from '../../../../components/EmptyState';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import { hasMaxLength, hasMinLength, trimValue } from '../../../../shared/validation/formValidation';

// ─── Icons ────────────────────────────────────────────────────────────────────

const ActionArrowIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M13 6l6 6-6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MoreDotsIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="6" cy="12" r="1.8" fill={color} />
    <Circle cx="12" cy="12" r="1.8" fill={color} />
    <Circle cx="18" cy="12" r="1.8" fill={color} />
  </Svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeMediaUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");

const stripHtmlTags = (value?: string) => {
  const normalized = String(value || '');
  return decodeHtmlEntities(
    normalized
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim(),
  );
};

const getInitials = (name: string) =>
  (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const buildUserDisplayName = (user: any) =>
  [user?.data?.firstName, user?.data?.lastName]
    .map((part: unknown) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();

const isPostOwnedByUser = (post: any, userId?: string) =>
  String(post?.createdBy || '').trim() !== '' &&
  String(post?.createdBy || '').trim() === String(userId || '').trim();

// Deterministic avatar color
const AVATAR_PAIRS = [
  { bg: '#E0E7FF', fg: '#4338CA' },
  { bg: '#FCE7F3', fg: '#9D174D' },
  { bg: '#D1FAE5', fg: '#065F46' },
  { bg: '#FEF3C7', fg: '#92400E' },
  { bg: '#FFEDD5', fg: '#C2410C' },
];
const getAvatarColors = (name?: string) => AVATAR_PAIRS[((name || '?').charCodeAt(0) || 0) % AVATAR_PAIRS.length];

const POST_TYPE_META: Record<string, { color: string; bg: string; icon: string }> = {
  Announcement: { color: '#7C3AED', bg: '#EDE9FE', icon: '📢' },
  Event:        { color: '#0284C7', bg: '#E0F2FE', icon: '🗓' },
  Maintenance:  { color: '#D97706', bg: '#FEF3C7', icon: '🔧' },
};

const formatRelativeDate = (ds: string | undefined, t: any) => {
  if (!ds) return '';
  const d = new Date(ds);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return t('community.mobile.board.today', 'Today');
  if (diff === 1) return t('community.mobile.board.yesterday', 'Yesterday');
  if (diff < 7) return t('community.mobile.board.daysAgo', '{{count}}d ago').replace('{{count}}', String(diff));
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const getCommentMeta = (comment: Comment) => {
  return [comment.createdByRole, comment.apartmentUnit, comment.blockName]
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .join(' · ');
};

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = React.memo(({
  post,
  userId,
  styles,
  colors,
  onLike,
  onComment,
  onOpenAttachment,
  onMenuToggle,
  onReport,
  onDelete,
  isMenuOpen,
  t,
}: any) => {
  const typeMeta = POST_TYPE_META[post.postType] || POST_TYPE_META.Announcement;
  const { bg: avBg, fg: avFg } = getAvatarColors(post.createdByName);
  const safeTitle = stripHtmlTags(post.title);
  const safeContent = stripHtmlTags(post.content);
  const canDeletePost = isPostOwnedByUser(post, userId);
  const typeLabel =
    post.postType === 'Event'
      ? t('community.mobile.createPost.typeEvent', 'Event')
      : post.postType === 'Maintenance'
        ? t('community.mobile.createPost.typeMaintenance', 'Maintenance')
        : t('community.mobile.createPost.typeAnnouncement', 'Announcement');

  return (
    <View style={styles.postCard}>
      {/* ── Header ── */}
      <View style={styles.postHeader}>
        <View style={styles.postUser}>
          {post.createdByProfilePhoto ? (
            <Image source={{ uri: normalizeMediaUrl(post.createdByProfilePhoto) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: avBg }]}>
              <Text style={[styles.avatarText, { color: avFg }]}>{getInitials(post.createdByName)}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.author} numberOfLines={1}>{post.createdByName}</Text>
            <View style={localStyles.metaRow}>
              <Text style={styles.badge}>{post.createdByRole}</Text>
              {post.createdAt ? (
                <Text style={localStyles.dot}>·</Text>
              ) : null}
              <Text style={styles.badge}>{formatRelativeDate(post.createdAt, t)}</Text>
            </View>
          </View>
        </View>

        <View style={localStyles.menuAnchor}>
          <TouchableOpacity style={styles.moreButton} onPress={() => onMenuToggle(post.postId)}>
            <MoreDotsIcon color={colors.textPrimary} />
          </TouchableOpacity>
          {isMenuOpen ? (
            <View style={styles.inlineMenu}>
              {canDeletePost ? (
                <TouchableOpacity style={styles.inlineMenuItem} activeOpacity={0.85} onPress={() => onDelete(post.postId)}>
                <Text style={styles.inlineMenuText} numberOfLines={1}>
                  {`🗑  ${t('common.delete', 'Delete')}`}
                </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.inlineMenuItem} activeOpacity={0.85} onPress={() => onReport(post.postId)}>
                <Text style={styles.inlineMenuText} numberOfLines={1}>
                  {`🚩  ${t('community.mobile.board.report', 'Report')}`}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Type pill ── */}
      <View style={[styles.postTypePill, { backgroundColor: typeMeta.bg }]}>
        <Text style={[styles.postTypePillText, { color: typeMeta.color }]}>{`${typeMeta.icon} ${typeLabel}`}</Text>
      </View>

      {/* ── Content ── */}
      {!!safeTitle && <Text style={styles.postTitle}>{safeTitle}</Text>}
      <Text style={styles.postText}>{safeContent}</Text>

      {post.attachment ? (
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => onOpenAttachment(normalizeMediaUrl(post.attachment))}
          accessibilityRole="button"
          accessibilityLabel={t('community.mobile.board.openAttachment', 'Open attachment')}
        >
          <Image
            source={{ uri: normalizeMediaUrl(post.attachment) }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.action} onPress={() => onLike(post.postId)}>
            {post.isLikedByUser
              ? <HeartFilledIcon width={16} height={16} fill="#EF4444" />
              : <HeartIcon width={16} height={16} color={colors.textPrimary} />
            }
            <Text style={[styles.actionText, post.isLikedByUser && localStyles.likedText]}>
              {post.likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={() => onComment(post)}>
            <MessageIcon width={16} height={16} color={colors.textPrimary} />
            <Text style={styles.actionText}>{post.commentCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

// ─── Comment Modal ────────────────────────────────────────────────────────────

const CommentSheet = ({
  visible,
  post,
  comments,
  commentsLoading,
  commentText,
  onChangeText,
  onSubmit,
  onClose,
  user,
  styles,
  colors,
  t,
}: any) => (
  <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
    {post ? (
      <>
        <TouchableOpacity style={styles.overlayDim} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.commentModalCenter}
        >
          <View style={styles.commentCard}>
            <View style={styles.commentHandle} />

            <Text style={styles.commentTitle}>{t('community.mobile.board.commentsTitle', 'Comments')}</Text>
            <Text style={styles.commentSubtitle} numberOfLines={1}>{stripHtmlTags(post.title)}</Text>

            <ScrollView style={styles.commentsList} keyboardShouldPersistTaps="handled">
              {commentsLoading ? (
                <View style={styles.commentsLoadingWrap}><ThemedLoader /></View>
              ) : comments.length === 0 ? (
                <EmptyState
                  title={t('community.mobile.board.noCommentsTitle', 'No comments yet')}
                  description={t('community.mobile.board.noCommentsDescription', 'Be the first to start the conversation.')}
                  illustration={<CommentIcon width={52} height={52} />}
                  compact
                />
              ) : (
                comments.map((c: Comment, i: number) => (
                  <View key={c.commentId || `${c.createdBy}-${i}`} style={styles.commentItem}>
                    <View style={localStyles.commentHeaderRow}>
                      {c.createdByProfilePhoto ? (
                        <Image
                          source={{ uri: normalizeMediaUrl(c.createdByProfilePhoto) }}
                          style={localStyles.commentAvatarSmall}
                        />
                      ) : (
                        <View
                          style={[
                            localStyles.commentAvatarSmall,
                            localStyles.commentAvatarFallback,
                            { backgroundColor: getAvatarColors(c.createdByName).bg },
                          ]}
                        >
                          <Text
                            style={[
                              localStyles.commentAvatarFallbackText,
                              { color: getAvatarColors(c.createdByName).fg },
                            ]}
                          >
                            {getInitials(c.createdByName)}
                          </Text>
                        </View>
                      )}

                      <View style={localStyles.commentMetaWrap}>
                        <Text style={styles.commentAuthor1}>{c.createdByName}</Text>
                        {!!getCommentMeta(c) && (
                          <Text style={localStyles.commentMetaText}>{getCommentMeta(c)}</Text>
                        )}
                      </View>

                      {!!c.createdAt && (
                        <Text style={localStyles.commentDateText}>
                          {formatRelativeDate(c.createdAt, t)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.commentText1}>{stripHtmlTags(c.commentText)}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentBox}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>{getInitials(buildUserDisplayName(user) || 'User')}</Text>
                </View>
                <Text style={styles.commentAuthor}>
                  {buildUserDisplayName(user) || t('community.mobile.board.currentUser', 'You')}
                </Text>
              </View>

              <TextInput
                style={styles.commentTextInput}
                placeholder={t('community.mobile.board.commentPlaceholder', 'Write a comment…')}
                placeholderTextColor="#94A3B8"
                multiline
                value={commentText}
                onChangeText={onChangeText}
              />

              <View style={styles.commentToolbar}>
                <TouchableOpacity
                  style={[styles.commentBtn, !commentText.trim() && styles.commentBtnDisabled]}
                  onPress={onSubmit}
                  disabled={!commentText.trim()}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.commentBtnText}>{t('community.mobile.board.commentButton', 'Post Comment')}</Text>
                    <ActionArrowIcon color={resolvedActionColor(colors, true)} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </>
    ) : null}
  </Modal>
);

// ─── Report Modal ─────────────────────────────────────────────────────────────

const ReportSheet = ({
  visible,
  reason,
  onChangeReason,
  onSubmit,
  onClose,
  styles,
  t,
}: any) => (
  <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
    {visible ? (
      <>
        <TouchableOpacity style={styles.overlayDim} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.commentModalCenter}
        >
          <View style={styles.commentCard}>
            <View style={styles.commentHandle} />
            <Text style={styles.commentTitle}>{t('community.mobile.board.reportPostTitle', 'Report Post')}</Text>
            <Text style={[styles.commentSubtitle, { marginBottom: 16 }]}>
              {t('community.mobile.board.reportSubtitle', "Tell us what's wrong with this post")}
            </Text>

            <View style={styles.commentBox}>
              <TextInput
                style={[styles.commentTextInput, { minHeight: 90 }]}
                placeholder={t('community.mobile.board.reportPlaceholder', 'Describe why you are reporting this post…')}
                placeholderTextColor="#94A3B8"
                multiline
                value={reason}
                onChangeText={onChangeReason}
              />
            </View>

            <View style={[styles.commentToolbar, { marginTop: 14 }]}>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={onClose}>
                <Text style={styles.modalSecondaryBtnText}>{t('common.cancel', 'Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.commentBtn, styles.reportBtn, !reason.trim() && styles.commentBtnDisabled]}
                onPress={onSubmit}
                disabled={!reason.trim()}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.commentBtnText}>{t('community.mobile.board.report', 'Report')}</Text>
                  <ActionArrowIcon color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </>
    ) : null}
  </Modal>
);

const AttachmentPreviewModal = ({
  visible,
  imageUri,
  onClose,
  styles,
}: any) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    {visible && imageUri ? (
      <View style={styles.imagePreviewOverlay}>
        <TouchableOpacity style={styles.imagePreviewBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.imagePreviewFrame}>
          <TouchableOpacity style={styles.imagePreviewClose} onPress={onClose} accessibilityRole="button">
            <Text style={styles.imagePreviewCloseText}>X</Text>
          </TouchableOpacity>
          <Image source={{ uri: imageUri }} style={styles.imagePreviewImage} resizeMode="contain" />
        </View>
      </View>
    ) : null}
  </Modal>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CommunityBoard() {
  const { colors, resolvedTheme } = useAppTheme();
  const { t } = useI18n();
  const styles = React.useMemo(
    () => createStyles(colors, resolvedTheme === 'dark'),
    [colors, resolvedTheme],
  );
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const { filteredPosts, loading, activeFilter, comments, commentsLoading } = useAppSelector(state => state.posts);
  const user = useAppSelector(state => state.auth.user);

  const [showComments, setShowComments]   = useState(false);
  const [selectedPost, setSelectedPost]   = useState<any>(null);
  const [searchText, setSearchText]       = useState('');
  const [refreshing, setRefreshing]       = useState(false);
  const [commentText, setCommentText]     = useState('');
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId]   = useState<string | null>(null);
  const [reportReason, setReportReason]   = useState('');
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);
  useFocusEffect(useCallback(() => { dispatch(fetchPosts()); }, [dispatch]));

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPosts());
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    dispatch(searchPosts(text));
  };

  const handleAddComment = async () => {
    const userId = user?.data?.userId;
    const val = trimValue(commentText);
    if (!selectedPost?.postId || !val) return;
    if (!hasMinLength(val, 2) || !hasMaxLength(val, 500)) {
      Alert.alert(t('community.mobile.createPost.validationTitle', 'Validation'), t('community.mobile.board.commentLength', 'Comment must be between 2 and 500 characters'));
      return;
    }
    if (!userId) { Alert.alert(t('common.error', 'Error'), t('community.mobile.board.userIdMissing', 'User ID is missing')); return; }
    await dispatch(addPostComment({ postId: selectedPost.postId, commentText: val, userId }));
    dispatch(getPostComments(selectedPost.postId));
    setCommentText('');
  };

  const handleLike = (postId: string) => {
    const userId = user?.data?.userId;
    if (!userId) { Alert.alert(t('common.error', 'Error'), t('community.mobile.board.userIdMissing', 'User ID is missing')); return; }
    dispatch(toggleLike({ postId, userId }));
  };

  const openComments = (post: any) => {
    setSelectedPost(post);
    setShowComments(true);
    dispatch(getPostComments(post.postId));
  };

  const closeComments = () => { setShowComments(false); setSelectedPost(null); setCommentText(''); };

  const handleReport = async () => {
    const val = trimValue(reportReason);
    if (!reportPostId || !val) return;
    if (!hasMinLength(val, 5) || !hasMaxLength(val, 500)) {
      Alert.alert(t('community.mobile.createPost.validationTitle', 'Validation'), t('community.mobile.board.reportReasonLength', 'Report reason must be between 5 and 500 characters'));
      return;
    }
    await dispatch(reportCommunityPost({ postId: reportPostId, reason: val, reportedBy: user?.data?.userId }));
    setShowReportModal(false); setReportReason(''); setReportPostId(null);
  };

  const confirmDeletePost = (postId: string) => {
    const normalizedPostId = String(postId || '').trim();
    const post = filteredPosts.find(item => item.postId === normalizedPostId);
    const currentUserId = String(user?.data?.userId || '').trim();
    if (!normalizedPostId) return;
    if (!isPostOwnedByUser(post, currentUserId)) {
      setOpenPostMenuId(null);
      return;
    }

    Alert.alert(
      t('community.mobile.board.deletePostTitle', 'Delete Post'),
      t('community.mobile.board.deletePostConfirm', 'Are you sure you want to delete this post?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCommunityPost(normalizedPostId)).unwrap();
              setOpenPostMenuId(null);
            } catch (error: any) {
              Alert.alert(
                t('common.error', 'Error'),
                error?.message || t('community.mobile.board.deletePostFailed', 'Failed to delete post'),
              );
            }
          },
        },
      ],
    );
  };

  const tabs = React.useMemo(() => [
    { value: 'All',          label: t('community.mobile.board.tabs.all', 'All') },
    { value: 'Announcement', label: t('community.mobile.createPost.typeAnnouncement', 'Announcement') },
    { value: 'Event',        label: t('community.mobile.createPost.typeEvent', 'Event') },
    { value: 'Maintenance',  label: t('community.mobile.createPost.typeMaintenance', 'Maintenance') },
  ], [t]);

  return (
    <ScreenWrapper
      title={t('communityBoard.view.title', 'Community Board')}
      onBackPress={() => navigation.goBack()}
      rightIcon={
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreatePost')}>
          <PlusIcon width={18} height={18} color={colors.textPrimary} />
        </TouchableOpacity>
      }
    >
      <View style={styles.boardWrap}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => setOpenPostMenuId(null)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E293B" />}
          showsVerticalScrollIndicator={false}
        >
        {/* ── Search ── */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder={t('community.mobile.board.searchPlaceholder', 'Search posts…')}
            style={styles.searchInput}
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* ── Tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsWrap}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => dispatch(setFilter(tab.value))}
              style={[styles.tab, activeFilter === tab.value && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeFilter === tab.value && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Loading ── */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ThemedLoader size="large" />
            <Text style={styles.loadingText}>{t('communityBoard.view.loading', 'Loading posts…')}</Text>
          </View>
        )}

        {/* ── Empty ── */}
        {!loading && filteredPosts.length === 0 && (
          <EmptyState
            title={t('community.mobile.board.noPostsTitle', 'No posts found')}
            description={t('community.mobile.board.noPostsDescription', 'Try a different filter or search.')}
            illustration={<GroupsIcon width={72} height={72} />}
          />
        )}

        {/* ── Posts ── */}
        {filteredPosts.map(post => (
          <PostCard
            key={post.postId}
            post={post}
            userId={user?.data?.userId}
            styles={styles}
            colors={colors}
            onLike={handleLike}
            onComment={openComments}
            onOpenAttachment={setPreviewImageUri}
            onMenuToggle={(id: string) => setOpenPostMenuId(openPostMenuId === id ? null : id)}
            onReport={(id: string) => {
              setReportPostId(id);
              setShowReportModal(true);
              setOpenPostMenuId(null);
            }}
            onDelete={confirmDeletePost}
            isMenuOpen={openPostMenuId === post.postId}
            t={t}
          />
        ))}
        </ScrollView>
      </View>

      <CommentSheet
        visible={showComments}
        post={selectedPost}
        comments={comments}
        commentsLoading={commentsLoading}
        commentText={commentText}
        onChangeText={setCommentText}
        onSubmit={handleAddComment}
        onClose={closeComments}
        user={user}
        styles={styles}
        colors={colors}
        t={t}
      />

      <ReportSheet
        visible={showReportModal}
        reason={reportReason}
        onChangeReason={setReportReason}
        onSubmit={handleReport}
        onClose={() => { setShowReportModal(false); setReportReason(''); setReportPostId(null); }}
        styles={styles}
        t={t}
      />

      <AttachmentPreviewModal
        visible={!!previewImageUri}
        imageUri={previewImageUri}
        onClose={() => setPreviewImageUri(null)}
        styles={styles}
      />
    </ScreenWrapper>
  );
}

const resolvedActionColor = (colors: any, filled: boolean) =>
  filled ? colors.onPrimary || '#FFFFFF' : colors.textPrimary;

const localStyles = StyleSheet.create({
  menuAnchor: {
    position: 'relative',
    zIndex: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dot: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  likedText: {
    color: '#EF4444',
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarFallbackText: {
    fontSize: 11,
    fontWeight: '800',
  },
  commentMetaWrap: {
    flex: 1,
    marginRight: 8,
  },
  commentMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  commentDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
