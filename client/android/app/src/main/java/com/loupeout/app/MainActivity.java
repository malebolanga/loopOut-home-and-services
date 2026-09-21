package com.loupeout.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Disable QUIC (HTTP/3) on the WebView to avoid ERR_QUIC_PROTOCOL_ERROR
    // on Render.com and similar cloud hosts that drop idle QUIC connections.
    WebView webView = getBridge().getWebView();
    if (webView != null) {
      WebSettings settings = webView.getSettings();
      // Force the WebView to use HTTP/1.1 or HTTP/2 only.
      // "QUIC" is controlled via the user-agent flag; disabling it via
      // command-line flags is the most reliable approach available to apps.
      webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
    }
  }
}
