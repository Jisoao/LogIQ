# SmartPayan ESP32 Refactoring Notes

## Changes Made

### 1. Firebase Integration Removed
All Firebase-related code has been commented out and replaced with placeholder functions:

#### Removed/Commented:
- `#include <FirebaseESP32.h>` - Firebase library include
- `FIREBASE_HOST` and `FIREBASE_AUTH` - Firebase configuration constants
- `FirebaseData`, `FirebaseConfig`, `FirebaseAuth` - Firebase objects
- `InitializeFirebase()` - Firebase initialization function
- `UpdateFirebase()` - Firebase data update function
- `CheckFirebaseCommands()` - Firebase command checking function

#### Replaced With:
- `UpdateData()` - Placeholder for WebSocket/HTTP data transmission
- `CheckManualCommands()` - Placeholder for WebSocket/HTTP command reception
- Comments indicating where WebSocket integration should be implemented

### 2. Naming Convention Changes

#### Functions (PascalCase):
- `initializePins()` → `InitializePins()`
- `initializeSensors()` → `InitializeSensors()`
- `connectToWiFi()` → `ConnectToWiFi()`
- `readAllSensors()` → `ReadAllSensors()`
- `printSensorReadings()` → `PrintSensorReadings()`
- `makeAutomaticDecision()` → `MakeAutomaticDecision()`
- `extendClothesline()` → `ExtendClothesline()`
- `retractClothesline()` → `RetractClothesline()`
- `stopMotor()` → `StopMotor()`
- `updateFirebase()` → `UpdateData()` (also renamed)
- `checkFirebaseCommands()` → `CheckManualCommands()` (also renamed)
- `getStateString()` → `GetStateString()`

#### Variables (camelCase):
All variables were already in camelCase format:
- `currentState`
- `manualOverride`
- `lastSensorRead`
- `lastDataUpdate` (renamed from `lastFirebaseUpdate`)
- `temperature`
- `humidity`
- `lightLevel`
- `rainAnalog`
- `rainDetected`

### 3. System Constants Updated
- `FIREBASE_UPDATE_INTERVAL` → `DATA_UPDATE_INTERVAL`
- `lastFirebaseUpdate` → `lastDataUpdate`

## Next Steps for Integration

To complete the WebSocket integration, implement the following:

1. **UpdateData() Function**:
   - Send sensor data via WebSocket or HTTP POST
   - Format: JSON with temperature, humidity, lightLevel, rainAnalog, rainDetected, currentState
   - Target: Python Flask/FastAPI backend

2. **CheckManualCommands() Function**:
   - Receive commands via WebSocket or HTTP GET
   - Parse commands: "extend", "retract", "auto"
   - Update `manualOverride` flag accordingly

3. **WebSocket Client Setup**:
   - Use ArduinoWebsockets library
   - Connect to backend WebSocket server
   - Handle real-time bidirectional communication

## Code Structure

The code now follows a consistent naming convention:
- **PascalCase** for all function names
- **camelCase** for all variable names
- **UPPER_SNAKE_CASE** for constants and pin definitions

All Firebase functionality is preserved in comments for reference if needed in the future.
