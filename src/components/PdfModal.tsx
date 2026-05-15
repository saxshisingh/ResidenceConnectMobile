import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  View,
  Text,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { createStyles } from '../features/bills/screens/MyBills/MyBillsScreen.styles';
import { API_BASE_URL } from '../config/api';
import ThemedLoader from './ThemedLoader';
import { useAppTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
  billFilePath?: string;
  bill?: any;
}

const normalizePdfUrl = (billFilePath?: string) => {
  const rawPath = String(billFilePath || '').trim();
  if (!rawPath) {
    return '';
  }

  if (/^https?:\/\//i.test(rawPath)) {
    return encodeURI(rawPath);
  }

  const normalizedPath = rawPath
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');

  return encodeURI(`${API_BASE_URL}/${normalizedPath}`);
};

const isPdfDocument = (billFilePath?: string) => /\.pdf(\?|#|$)/i.test(String(billFilePath || '').trim());
const isImageDocument = (billFilePath?: string) => /\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/i.test(String(billFilePath || '').trim());

const getDocumentExtension = (billFilePath?: string) => {
  const raw = String(billFilePath || '').trim().split('?')[0].split('#')[0];
  const match = raw.match(/\.([a-z0-9]+)$/i);
  if (match?.[1]) {
    return match[1].toLowerCase();
  }
  if (isPdfDocument(billFilePath)) {
    return 'pdf';
  }
  if (isImageDocument(billFilePath)) {
    return 'jpg';
  }
  return 'bin';
};

const getLocalizedBillType = (
  billType: unknown,
  t: (key: string, fallback?: string) => string,
) => {
  const raw = String(billType || '').trim();
  const normalized = raw.toLowerCase();

  if (!raw) {
    return t('bills.mobile.viewer.bill', 'Bill');
  }
  if (normalized.includes('maintenance')) {
    return t('bills.mobile.types.maintenance', 'Maintenance');
  }
  if (normalized.includes('water')) {
    return t('bills.mobile.types.water', 'Water');
  }
  if (normalized.includes('electric')) {
    return t('bills.mobile.types.electricity', 'Electricity');
  }
  if (normalized.includes('gas')) {
    return t('bills.mobile.types.gas', 'Gas');
  }

  return raw;
};

const PdfErrorIcon = ({ color }: { color: string }) => (
  <Svg width={56} height={56} viewBox="0 0 56 56" fill="none">
    <Circle cx="28" cy="28" r="28" fill={color} opacity={0.14} />
    <Path d="M28 16V31" stroke={color} strokeWidth={4} strokeLinecap="round" />
    <Circle cx="28" cy="39" r="3" fill={color} />
  </Svg>
);

const DownloadIcon = ({ color }: { color: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4v10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 10l4 4 4-4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 19h14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BillPdfModal = ({ visible, onClose, billFilePath, bill }: Props) => {
  const { colors } = useAppTheme();
  const { t, language } = useI18n();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pdfKey, setPdfKey] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const viewerCopy = useMemo(() => {
    if (language === 'ar') {
      return {
        downloadSuccessTitle: 'تم تنزيل الفاتورة بنجاح',
        downloading: 'جارٍ تنزيل الفاتورة',
        downloadedMessage: '',
        openFile: 'فتح الملف',
        downloadFailed: 'تعذر تنزيل هذه الفاتورة الآن.',
      };
    }

    if (language === 'fr') {
      return {
        downloadSuccessTitle: 'Telechargement reussi',
        downloading: 'Telechargement de la facture',
        downloadedMessage: '',
        openFile: 'Ouvrir le fichier',
        downloadFailed: 'Impossible de telecharger cette facture pour le moment.',
      };
    }

    return {
      downloadSuccessTitle: 'Download successful',
      downloading: 'Downloading bill',
      downloadedMessage: '',
      openFile: 'Open file',
      downloadFailed: 'Unable to download this bill right now.',
    };
  }, [language]);

  const pdfUrl = normalizePdfUrl(billFilePath);
  const isPdf = isPdfDocument(billFilePath);
  const isImage = isImageDocument(billFilePath);
  const isSupportedDocument = isPdf || isImage;
  const source = {
    uri: pdfUrl,
    cache: true,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `DZD ${amount.toLocaleString('fr-DZ')}`;
  };

  const handleLoadComplete = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleClose = () => {
    setLoading(true);
    setError(false);
    setPdfKey(0);
    onClose();
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setPdfKey(current => current + 1);
  };

  const handleDownload = async () => {
    const currentPdfUrl = pdfUrl;
    const currentBillFilePath = billFilePath;
    const currentBillType = bill?.billType;
    const currentBillCreatedOn = bill?.createdOn;
    const currentIsPdf = isPdf;
    const currentIsImage = isImage;

    if (!currentPdfUrl) {
      return;
    }

    setDownloading(true);
    handleClose();

    try {
      const extension = getDocumentExtension(currentBillFilePath);
      const safeType = String(currentBillType || 'bill')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '') || 'bill';
      const safeDate = String(currentBillCreatedOn || '')
        .slice(0, 10)
        .replace(/[^0-9-]/g, '') || `${Date.now()}`;
      const fileName = `${safeType}-${safeDate}.${extension}`;
      const mimeType = currentIsPdf
        ? 'application/pdf'
        : currentIsImage
          ? 'image/*'
          : 'application/octet-stream';
      const { fs, config } = ReactNativeBlobUtil;

      if (Platform.OS === 'android') {
        const downloadPath = `${fs.dirs.DownloadDir}/${fileName}`;
        await config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            mediaScannable: true,
            title: fileName,
            description: viewerCopy.downloading,
            path: downloadPath,
            mime: mimeType,
          },
        }).fetch('GET', currentPdfUrl);

        Alert.alert(viewerCopy.downloadSuccessTitle, viewerCopy.downloadedMessage);
        return;
      }

      const documentPath = `${fs.dirs.DocumentDir}/${fileName}`;
      await config({
        fileCache: true,
        path: documentPath,
      }).fetch('GET', currentPdfUrl);

      Alert.alert(
        viewerCopy.downloadSuccessTitle,
        viewerCopy.downloadedMessage,
        [
          {
            text: t('common.ok', 'OK'),
          },
          {
            text: viewerCopy.openFile,
            onPress: () => {
              void Linking.openURL(`file://${documentPath}`);
            },
          },
        ],
      );
    } catch {
      Alert.alert(
        t('common.error', 'Error'),
        viewerCopy.downloadFailed,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.root}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={colors.gradientTop} />
                <Stop offset="100%" stopColor={colors.gradientBottom} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grad)" />
          </Svg>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentFull}>
              <View style={styles.handleBar} />

              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>
                    {getLocalizedBillType(bill?.billType, t)}{' '}
                    {isPdf
                      ? t('bills.mobile.viewer.pdf', 'PDF')
                      : isImage
                        ? t('bills.mobile.viewer.image', 'Image')
                        : t('bills.mobile.viewer.document', 'Document')}
                  </Text>
                  {bill && (
                    <Text style={styles.modalSubtitle}>
                      {formatDate(bill.createdOn)} • {formatAmount(bill.amount)}
                    </Text>
                  )}
                </View>
                <View style={styles.modalHeaderActions}>
                  {pdfUrl ? (
                    <TouchableOpacity
                      style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
                      onPress={handleDownload}
                      activeOpacity={0.7}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <DownloadIcon color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.closeText}>
                      {t('bills.mobile.viewer.done', 'Done')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.pdfContainer}>
                {!pdfUrl || !isSupportedDocument || error ? (
                  <View style={styles.pdfError}>
                    <PdfErrorIcon color={colors.danger} />
                    <Text style={styles.pdfErrorTitle}>
                      {t('bills.mobile.viewer.failedToLoad', 'Failed to load document')}
                    </Text>
                    <Text style={styles.pdfErrorText}>
                      {!pdfUrl
                        ? t(
                            'bills.mobile.viewer.unavailable',
                            'This bill document is not available right now.',
                          )
                        : !isSupportedDocument
                          ? t(
                              'bills.mobile.viewer.unsupported',
                              'This file type is not supported in the in-app viewer yet.',
                            )
                          : t(
                              'bills.mobile.viewer.tryAgain',
                              'Unable to load the bill document. Please try again.',
                            )}
                    </Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handleRetry}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.retryButtonText}>
                        {t('mobile.common.retry', 'Retry')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {isPdf ? (
                      <Pdf
                        key={pdfKey}
                        source={source}
                        style={styles.pdf}
                        trustAllCerts={false}
                        onLoadComplete={handleLoadComplete}
                        onError={handleError}
                        enablePaging
                        spacing={0}
                        fitPolicy={0}
                      />
                    ) : (
                      <Image
                        key={pdfKey}
                        source={{ uri: pdfUrl }}
                        style={styles.documentImage}
                        resizeMode="contain"
                        onLoad={handleLoadComplete}
                        onError={handleError}
                      />
                    )}
                    {loading && (
                      <View style={styles.pdfLoadingContainer}>
                        <ThemedLoader size="large" />
                        <Text style={styles.pdfLoadingText}>
                          {isPdf
                            ? t('bills.mobile.viewer.loadingPdf', 'Loading PDF...')
                            : t('bills.mobile.viewer.loadingDocument', 'Loading document...')}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={downloading}
        transparent
        animationType="fade"
        onRequestClose={() => null}
      >
        <View style={styles.root}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentFull}>
              <View style={styles.pdfLoadingContainer}>
                <ThemedLoader size="large" />
                <Text style={styles.pdfLoadingText}>
                  {viewerCopy.downloading}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default BillPdfModal;
