import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Pdf from 'react-native-pdf';

import { createStyles } from './Documents.styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import EmptyState from '../../../../components/EmptyState';
import { useAppTheme } from '../../../../theme/ThemeProvider';
import { useI18n } from '../../../../i18n';
import NoDocumentsIllustration from './NoDocumentsIllustration';

const FolderHeroIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke="#FFFFFF"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FilePreviewIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V9zm0 0v7h7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 16h7M8.5 12.5h6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const ErrorIcon = ({ color }: { color: string }) => (
  <Svg width={52} height={52} viewBox="0 0 52 52" fill="none">
    <Circle cx="26" cy="26" r="26" fill={color} opacity={0.12} />
    <Path d="M26 14v15" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
    <Circle cx="26" cy="35" r="2.5" fill={color} />
  </Svg>
);

const isPdfDocument = (filePath?: string) =>
  /\.pdf(\?|#|$)/i.test(String(filePath || '').trim());
const isImageDocument = (filePath?: string) =>
  /\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/i.test(String(filePath || '').trim());

export default function DocumentViewerScreen({ navigation, route }: any) {
  const { title, files = [] } = route.params || {};
  const { colors } = useAppTheme();
  const { language, t } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 32, 520);
  const [selectedFileId, setSelectedFileId] = useState<string>(String(files?.[0]?.fileId || ''));
  const [previewError, setPreviewError] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);

  const selectedFile = useMemo(
    () =>
      files.find((item: any) => String(item.fileId) === selectedFileId) ||
      files[0] ||
      null,
    [files, selectedFileId],
  );

  const formatDate = (dateStr: string) => {
    try {
      const locale = language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-GB';
      return new Date(dateStr).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const selectedUrl = String(selectedFile?.fileUrl || '');
  const isPdf = isPdfDocument(selectedUrl) || isPdfDocument(selectedFile?.fileName);
  const isImage = isImageDocument(selectedUrl) || isImageDocument(selectedFile?.fileName);
  const canPreviewInApp = isPdf || isImage;

  const handleSelectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setPreviewError(false);
    setLoadingPreview(true);
  };

  return (
    <ScreenWrapper title={title} onBackPress={() => navigation.goBack()}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.heroCard, { width: contentWidth, alignSelf: 'center' }]}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconBox}>
              <FolderHeroIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSub}>
                {t(
                  files.length === 1
                    ? 'documents.mobile.filesUploadedSingle'
                    : 'documents.mobile.filesUploadedPlural',
                  files.length === 1 ? '1 file uploaded' : '{{count}} files uploaded',
                ).replace('{{count}}', String(files.length))}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.viewerList}
          showsVerticalScrollIndicator={false}
        >
          {files.length === 0 ? (
            <View style={styles.viewerContainer}>
              <EmptyState
                title={t('documents.mobile.empty', 'No documents uploaded')}
                description={t(
                  'documents.mobile.emptyViewerDescription',
                  'This document category is empty right now.',
                )}
                illustration={<NoDocumentsIllustration width={220} height={130} />}
                compact
              />
            </View>
          ) : (
            <>
              {files.map((item: any) => {
                const isActive = String(item.fileId) === String(selectedFile?.fileId);

                const rowContent = (
                  <>
                    <View style={styles.fileAccentBar} />
                    <View style={styles.fileIconBox}>
                      <FilePreviewIcon color={colors.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.fileName, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {item.fileName || t('documents.mobile.untitled', 'Untitled file')}
                      </Text>
                      <Text style={[styles.fileMeta, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.uploadedAt
                          ? formatDate(item.uploadedAt)
                          : t(
                              'documents.mobile.uploadDateUnavailable',
                              'Upload date unavailable',
                            )}
                      </Text>
                    </View>
                  </>
                );

                if (isActive) {
                  return (
                    <View
                      key={String(item.fileId)}
                      style={[
                        styles.fileRow,
                        { width: contentWidth, alignSelf: 'center' },
                        styles.fileRowActive,
                      ]}
                    >
                      {rowContent}
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    key={String(item.fileId)}
                    style={[
                      styles.fileRow,
                      { width: contentWidth, alignSelf: 'center' },
                    ]}
                    onPress={() => handleSelectFile(String(item.fileId))}
                    activeOpacity={0.85}
                  >
                    {rowContent}
                  </TouchableOpacity>
                );
              })}

              {selectedFile ? (
                <View style={[styles.previewCard, { width: contentWidth, alignSelf: 'center' }]}>
                  <View style={styles.previewSurface}>
                    {previewError || !canPreviewInApp ? (
                      <View style={styles.previewEmpty}>
                        <ErrorIcon color={colors.danger} />
                        <Text style={[styles.previewEmptyTitle, { color: colors.textPrimary }]}>
                          {canPreviewInApp
                            ? t('documents.mobile.previewUnavailable', 'Preview unavailable')
                            : t('documents.mobile.unsupportedPreview', 'Preview not supported')}
                        </Text>
                        <Text style={[styles.previewEmptyText, { color: colors.textMuted }]}>
                          {canPreviewInApp
                            ? t(
                                'documents.mobile.tryOpenDocument',
                                'Unable to load this file in-app.',
                              )
                            : t(
                                'documents.mobile.externalOpenHint',
                                'This file type is not supported in the in-app preview.',
                              )}
                        </Text>
                      </View>
                    ) : isPdf ? (
                      <Pdf
                        source={{ uri: selectedUrl, cache: true }}
                        style={styles.previewPdf}
                        trustAllCerts={false}
                        onLoadComplete={() => setLoadingPreview(false)}
                        onError={() => {
                          setLoadingPreview(false);
                          setPreviewError(true);
                        }}
                        enablePaging
                        spacing={0}
                        fitPolicy={0}
                      />
                    ) : (
                      <Image
                        source={{ uri: selectedUrl }}
                        style={styles.previewImage}
                        resizeMode="contain"
                        onLoad={() => setLoadingPreview(false)}
                        onError={() => {
                          setLoadingPreview(false);
                          setPreviewError(true);
                        }}
                      />
                    )}

                    {loadingPreview && !previewError ? (
                      <View style={styles.previewLoading}>
                        <Text style={[styles.previewLoadingText, { color: colors.textMuted }]}>
                          {t('documents.mobile.loadingDocument', 'Loading document...')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
