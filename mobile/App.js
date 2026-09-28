import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  BackHandler,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://loupeout-home-7rlt.onrender.com';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle hardware Android back button to navigate backwards in web history
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandlerSubscription.remove();
  }, [canGoBack]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Main WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        geolocationEnabled={true}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onLoadStart={() => {
          setLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setHasError(true);
          setErrorMessage(nativeEvent.description || 'Unable to connect to LoopOut.');
          setLoading(false);
        }}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.loadingText}>Loading LoopOut...</Text>
          </View>
        )}
      />

      {/* Floating loading overlay for subsequent page transitions */}
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color="#f59e0b" />
        </View>
      )}

      {/* Offline / Error Screen */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorTitle}>Connection Problem</Text>
          <Text style={styles.errorSub}>
            {errorMessage || 'Could not load LoopOut. Please check your internet connection.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 45,
    right: 16,
    zIndex: 99,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    zIndex: 100,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 9999,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
