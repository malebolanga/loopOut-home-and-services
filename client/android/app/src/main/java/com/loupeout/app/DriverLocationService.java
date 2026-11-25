package com.loupeout.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class DriverLocationService extends Service implements LocationListener {
    static final String EXTRA_TOKEN = "token";
    static final String EXTRA_SHUTTLE_BASE_URL = "shuttleBaseUrl";
    static final String EXTRA_MOVING_BASE_URL = "movingBaseUrl";
    static final String EXTRA_SHUTTLE_IDS = "shuttleIds";
    static final String EXTRA_MOVING_IDS = "movingVehicleIds";
    private static final String CHANNEL_ID = "loopout_driver_location";
    private static volatile boolean running = false;
    private LocationManager locationManager;
    private String token = "", shuttleBaseUrl = "", movingBaseUrl = "", shuttleIds = "", movingIds = "";
    private long lastSentAt = 0L;

    static boolean isRunning() { return running; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            token = intent.getStringExtra(EXTRA_TOKEN) == null ? "" : intent.getStringExtra(EXTRA_TOKEN);
            shuttleBaseUrl = intent.getStringExtra(EXTRA_SHUTTLE_BASE_URL) == null ? "" : intent.getStringExtra(EXTRA_SHUTTLE_BASE_URL);
            movingBaseUrl = intent.getStringExtra(EXTRA_MOVING_BASE_URL) == null ? "" : intent.getStringExtra(EXTRA_MOVING_BASE_URL);
            shuttleIds = intent.getStringExtra(EXTRA_SHUTTLE_IDS) == null ? "" : intent.getStringExtra(EXTRA_SHUTTLE_IDS);
            movingIds = intent.getStringExtra(EXTRA_MOVING_IDS) == null ? "" : intent.getStringExtra(EXTRA_MOVING_IDS);
        }
        createChannel();
        startForeground(2401, trackingNotification());
        running = true;
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            stopSelf();
            return START_NOT_STICKY;
        }
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        try { locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 5000L, 5f, this); }
        catch (SecurityException ignored) { stopSelf(); }
        return START_STICKY;
    }

    @Override public void onLocationChanged(Location location) {
        if (location == null || location.getAccuracy() > 100 || System.currentTimeMillis() - lastSentAt < 5000L) return;
        lastSentAt = System.currentTimeMillis();
        final double lat = location.getLatitude(), lng = location.getLongitude(), accuracy = location.getAccuracy();
        new Thread(() -> {
            for (String id : shuttleIds.split("\\|")) if (!id.trim().isEmpty()) sendPut(shuttleBaseUrl + "/update-location/" + id.trim(), "{\"lat\":" + lat + ",\"lng\":" + lng + ",\"accuracy\":" + accuracy + ",\"isLive\":true,\"currentStatus\":\"en_route\"}");
            for (String id : movingIds.split("\\|")) if (!id.trim().isEmpty()) sendPut(movingBaseUrl + "/" + id.trim() + "/live-location", "{\"currentCoordinates\":{\"lat\":" + lat + ",\"lng\":" + lng + ",\"accuracy\":" + accuracy + ",\"locationSource\":\"gps\"}}");
        }).start();
    }

    private void sendPut(String endpoint, String json) {
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(endpoint).openConnection();
            connection.setRequestMethod("PUT"); connection.setConnectTimeout(12000); connection.setReadTimeout(12000);
            connection.setRequestProperty("Authorization", "Bearer " + token); connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);
            try (OutputStream stream = connection.getOutputStream()) { stream.write(json.getBytes("UTF-8")); }
            connection.getResponseCode(); connection.disconnect();
        } catch (Exception ignored) { }
    }

    private Notification trackingNotification() {
        Intent launch = new Intent(this, MainActivity.class);
        PendingIntent pending = PendingIntent.getActivity(this, 0, launch, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return new NotificationCompat.Builder(this, CHANNEL_ID).setSmallIcon(com.loupeout.app.R.mipmap.ic_launcher).setContentTitle("LoopOut driver GPS is active").setContentText("Sharing your live location during an active trip.").setContentIntent(pending).setOngoing(true).setCategory(NotificationCompat.CATEGORY_SERVICE).build();
    }
    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Driver live location", NotificationManager.IMPORTANCE_LOW);
            ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(channel);
        }
    }
    @Override public void onDestroy() { if (locationManager != null) locationManager.removeUpdates(this); running = false; super.onDestroy(); }
    @Override public IBinder onBind(Intent intent) { return null; }
}
