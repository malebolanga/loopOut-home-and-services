package com.loupeout.app;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DriverLocation")
public class DriverLocationPlugin extends Plugin {
    @PluginMethod
    public void start(PluginCall call) {
        String token = call.getString("token", "");
        String shuttleBaseUrl = call.getString("shuttleBaseUrl", "");
        String movingBaseUrl = call.getString("movingBaseUrl", "");
        String shuttleIds = call.getString("shuttleIds", "");
        String movingVehicleIds = call.getString("movingVehicleIds", "");
        if (token.isEmpty() || (shuttleIds.isEmpty() && movingVehicleIds.isEmpty())) {
            call.reject("An authenticated active shuttle or moving trip is required for background GPS.");
            return;
        }
        Intent intent = new Intent(getContext(), DriverLocationService.class)
            .putExtra(DriverLocationService.EXTRA_TOKEN, token)
            .putExtra(DriverLocationService.EXTRA_SHUTTLE_BASE_URL, shuttleBaseUrl)
            .putExtra(DriverLocationService.EXTRA_MOVING_BASE_URL, movingBaseUrl)
            .putExtra(DriverLocationService.EXTRA_SHUTTLE_IDS, shuttleIds)
            .putExtra(DriverLocationService.EXTRA_MOVING_IDS, movingVehicleIds);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) getContext().startForegroundService(intent);
        else getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), DriverLocationService.class));
        call.resolve();
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject state = new JSObject();
        state.put("running", DriverLocationService.isRunning());
        call.resolve(state);
    }
}
