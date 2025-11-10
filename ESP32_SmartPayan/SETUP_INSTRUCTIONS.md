# SmartPayan - Complete Setup Instructions

## Table of Contents
1. [Hardware Setup](#hardware-setup)
2. [Arduino IDE Configuration](#arduino-ide-configuration)
3. [Library Installation](#library-installation)
4. [Firebase Setup](#firebase-setup)
5. [Code Configuration](#code-configuration)
6. [Upload and Testing](#upload-and-testing)
7. [Flutter Mobile App Integration](#flutter-mobile-app-integration)
8. [Troubleshooting](#troubleshooting)

---

## 1. Hardware Setup

### Required Components
- ESP32 Development Board
- DHT22 Temperature & Humidity Sensor
- BH1750 Light Sensor
- Rain Sensor Module
- L298N Motor Driver
- DC Motor (12V recommended)
- 12V Power Supply
- Jumper wires
- Breadboard (optional)

### Wiring
Follow the detailed wiring diagram in `WIRING_DIAGRAM.md`

**Quick Reference:**
```
DHT22 Data    → GPIO 4
BH1750 SDA    → GPIO 21
BH1750 SCL    → GPIO 22
Rain Analog   → GPIO 34
Rain Digital  → GPIO 35
Motor IN1     → GPIO 25
Motor IN2     → GPIO 26
Motor ENA     → GPIO 27
```

---

## 2. Arduino IDE Configuration

### Install Arduino IDE
1. Download Arduino IDE from: https://www.arduino.cc/en/software
2. Install version 2.0 or later

### Add ESP32 Board Support
1. Open Arduino IDE
2. Go to **File → Preferences**
3. In "Additional Board Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**
5. Go to **Tools → Board → Boards Manager**
6. Search for "esp32"
7. Install "esp32 by Espressif Systems" (version 2.0.0 or later)

### Select ESP32 Board
1. Go to **Tools → Board → ESP32 Arduino**
2. Select your ESP32 board (e.g., "ESP32 Dev Module")
3. Select the correct **Port** under **Tools → Port**

---

## 3. Library Installation

### Required Libraries

Install the following libraries via **Tools → Manage Libraries** (Library Manager):

#### 1. DHT Sensor Library
- **Name:** DHT sensor library
- **Author:** Adafruit
- **Version:** 1.4.4 or later
- Search: "DHT sensor library"

#### 2. Adafruit Unified Sensor
- **Name:** Adafruit Unified Sensor
- **Author:** Adafruit
- **Version:** 1.1.9 or later
- Search: "Adafruit Unified Sensor"

#### 3. BH1750 Library
- **Name:** BH1750
- **Author:** Christopher Laws
- **Version:** 1.3.0 or later
- Search: "BH1750"

#### 4. Firebase ESP32 Client
- **Name:** Firebase Arduino Client Library for ESP8266 and ESP32
- **Author:** Mobizt
- **Version:** 4.3.0 or later
- Search: "Firebase ESP32"

### Manual Library Installation (if needed)

If automatic installation fails:

1. **Download libraries:**
   - DHT: https://github.com/adafruit/DHT-sensor-library
   - BH1750: https://github.com/claws/BH1750
   - Firebase: https://github.com/mobizt/Firebase-ESP32

2. **Install manually:**
   - Extract ZIP files
   - Copy folders to: `Documents/Arduino/libraries/`
   - Restart Arduino IDE

---

## 4. Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `smartpayan` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Get Firebase Credentials

#### Option A: Using Realtime Database (Recommended for ESP32)

1. In Firebase Console, go to **Build → Realtime Database**
2. Click **"Create Database"**
3. Choose location (closest to you)
4. Start in **"Test mode"** (for development)
5. Click **"Enable"**

6. **Get Database URL:**
   - Copy the URL shown (e.g., `https://smartpayan-xxxxx.firebaseio.com`)
   - This is your `FIREBASE_HOST`

7. **Get Database Secret (Legacy Token):**
   - Go to **Project Settings** (gear icon)
   - Go to **Service accounts** tab
   - Click **"Database secrets"**
   - Click **"Show"** and copy the secret
   - This is your `FIREBASE_AUTH`

#### Option B: Using Authentication Token

1. Go to **Project Settings → Service accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Use the `private_key` value as `FIREBASE_AUTH`

### Configure Firebase Security Rules

For development, use these rules (⚠️ **Not for production!**):

```json
{
  "rules": {
    "smartpayan": {
      ".read": true,
      ".write": true
    }
  }
}
```

For production, implement proper authentication:

```json
{
  "rules": {
    "smartpayan": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Firebase Database Structure

Your database will have this structure:

```
smartpayan/
├── status: "online"
├── state: "retracted" | "extended" | "moving"
├── manualOverride: true | false
├── lastUpdate: timestamp
├── sensors/
│   ├── temperature: 25.5
│   ├── humidity: 60.0
│   ├── lightLevel: 500.0
│   ├── rainAnalog: 1024
│   └── rainDetected: false
├── commands/
│   └── action: "extend" | "retract" | "auto" | ""
├── notifications/
│   └── rainAlert: true | false
└── lastAction: "Extended clothesline"
```

---

## 5. Code Configuration

### Update WiFi Credentials

Open `SmartPayan_ESP32.ino` and modify:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Your WiFi name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Your WiFi password
```

### Update Firebase Credentials

```cpp
#define FIREBASE_HOST "smartpayan-xxxxx.firebaseio.com"  // Your Firebase URL (without https://)
#define FIREBASE_AUTH "your-database-secret-key"          // Your Firebase secret
```

### Adjust Sensor Thresholds (Optional)

Fine-tune these values based on your environment:

```cpp
#define RAIN_THRESHOLD 500     // Lower = more sensitive to rain
#define LIGHT_THRESHOLD 100    // Lux value for day/night detection
#define MOTOR_SPEED 200        // Motor speed (0-255)
```

### Adjust Motor Timing

Modify the delay in motor functions based on your clothesline length:

```cpp
delay(3000);  // 3 seconds - adjust for your setup
```

---

## 6. Upload and Testing

### Upload Code

1. Connect ESP32 to computer via USB
2. Select correct **Board** and **Port** in Arduino IDE
3. Click **Upload** button (→)
4. Wait for "Done uploading" message

### Monitor Serial Output

1. Open **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   === SmartPayan System Starting ===
   Initializing pins...
   ✓ Pins initialized
   Initializing sensors...
   ✓ DHT22 initialized
   ✓ BH1750 initialized
   Connecting to WiFi...
   ✓ WiFi connected!
   IP Address: 192.168.x.x
   ✓ Firebase initialized
   === System Ready ===
   ```

### Test Sensors

Watch the Serial Monitor for sensor readings every 5 seconds:

```
--- Sensor Readings ---
Temperature: 25.5 °C
Humidity: 60.0 %
Light Level: 500.0 lux
Rain Analog: 1024 | Rain Detected: NO
Current State: retracted
----------------------
```

### Test Motor Control

1. **Simulate rain:** Cover the rain sensor with wet cloth
2. Watch Serial Monitor for: `⚠ Rain detected! Retracting clothesline...`
3. Motor should activate

### Test Firebase Connection

1. Go to Firebase Console → Realtime Database
2. You should see data appearing under `smartpayan/`
3. Try manual control:
   - Set `/smartpayan/commands/action` to `"extend"`
   - Watch ESP32 respond

---

## 7. Flutter Mobile App Integration

### Firebase Configuration in Flutter

1. **Install FlutterFire CLI:**
   ```bash
   dart pub global activate flutterfire_cli
   ```

2. **Configure Firebase:**
   ```bash
   flutterfire configure
   ```

3. **Add dependencies to `pubspec.yaml`:**
   ```yaml
   dependencies:
     firebase_core: ^2.24.0
     firebase_database: ^10.4.0
     firebase_messaging: ^14.7.0
   ```

4. **Run:**
   ```bash
   flutter pub get
   ```

### Flutter Code Example

#### Initialize Firebase

```dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(MyApp());
}
```

#### Read Sensor Data

```dart
import 'package:firebase_database/firebase_database.dart';

class SmartPayanService {
  final DatabaseReference _dbRef = FirebaseDatabase.instance.ref('smartpayan');
  
  // Listen to sensor data
  Stream<DatabaseEvent> getSensorData() {
    return _dbRef.child('sensors').onValue;
  }
  
  // Get current state
  Future<String> getCurrentState() async {
    final snapshot = await _dbRef.child('state').get();
    return snapshot.value as String? ?? 'unknown';
  }
  
  // Send command to ESP32
  Future<void> sendCommand(String action) async {
    await _dbRef.child('commands/action').set(action);
  }
  
  // Extend clothesline
  Future<void> extendClothesline() async {
    await sendCommand('extend');
  }
  
  // Retract clothesline
  Future<void> retractClothesline() async {
    await sendCommand('retract');
  }
  
  // Enable auto mode
  Future<void> enableAutoMode() async {
    await sendCommand('auto');
  }
}
```

#### Display Sensor Data Widget

```dart
class SensorDataWidget extends StatelessWidget {
  final SmartPayanService _service = SmartPayanService();
  
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<DatabaseEvent>(
      stream: _service.getSensorData(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return CircularProgressIndicator();
        }
        
        final data = snapshot.data!.snapshot.value as Map<dynamic, dynamic>;
        
        return Column(
          children: [
            Text('Temperature: ${data['temperature']}°C'),
            Text('Humidity: ${data['humidity']}%'),
            Text('Light: ${data['lightLevel']} lux'),
            Text('Rain: ${data['rainDetected'] ? 'YES' : 'NO'}'),
          ],
        );
      },
    );
  }
}
```

#### Control Buttons

```dart
class ControlButtons extends StatelessWidget {
  final SmartPayanService _service = SmartPayanService();
  
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        ElevatedButton(
          onPressed: () => _service.extendClothesline(),
          child: Text('Extend'),
        ),
        ElevatedButton(
          onPressed: () => _service.retractClothesline(),
          child: Text('Retract'),
        ),
        ElevatedButton(
          onPressed: () => _service.enableAutoMode(),
          child: Text('Auto'),
        ),
      ],
    );
  }
}
```

### Push Notifications Setup

#### 1. Enable Firebase Cloud Messaging

1. In Firebase Console, go to **Project Settings**
2. Go to **Cloud Messaging** tab
3. Note the **Server Key**

#### 2. Add to Flutter

```yaml
dependencies:
  firebase_messaging: ^14.7.0
  flutter_local_notifications: ^16.3.0
```

#### 3. Notification Service

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();
  
  Future<void> initialize() async {
    // Request permission
    await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    
    // Get FCM token
    String? token = await _messaging.getToken();
    print('FCM Token: $token');
    
    // Listen for rain alerts
    FirebaseDatabase.instance
        .ref('smartpayan/notifications/rainAlert')
        .onValue
        .listen((event) {
      if (event.snapshot.value == true) {
        _showRainAlert();
        // Reset the alert
        FirebaseDatabase.instance
            .ref('smartpayan/notifications/rainAlert')
            .set(false);
      }
    });
  }
  
  void _showRainAlert() {
    _localNotifications.show(
      0,
      '⚠️ Rain Detected!',
      'SmartPayan has retracted the clothesline to protect your laundry.',
      NotificationDetails(
        android: AndroidNotificationDetails(
          'smartpayan_alerts',
          'SmartPayan Alerts',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
    );
  }
}
```

---

## 8. Troubleshooting

### ESP32 Not Connecting to WiFi

**Problem:** WiFi connection fails

**Solutions:**
- Verify SSID and password are correct
- Check WiFi signal strength
- Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Try moving ESP32 closer to router
- Check if router has MAC filtering enabled

### Sensors Not Reading

**Problem:** Sensor values are 0 or NaN

**Solutions:**

**DHT22:**
- Check wiring (VCC, GND, DATA)
- Add 10kΩ pull-up resistor between DATA and VCC
- Try different GPIO pin
- Wait 2 seconds after power-on before reading

**BH1750:**
- Verify I2C connections (SDA, SCL)
- Check I2C address (0x23 or 0x5C)
- Run I2C scanner to detect device
- Ensure 3.3V power supply

**Rain Sensor:**
- Adjust potentiometer on module
- Check analog/digital pin connections
- Test with water droplets

### Motor Not Running

**Problem:** Motor doesn't move

**Solutions:**
- Check 12V power supply to L298N
- Verify all motor driver connections
- Ensure ENA jumper is removed and connected to GPIO 27
- Check motor polarity
- Test motor directly with 12V
- Verify GPIO pins are correct in code

### Firebase Connection Issues

**Problem:** Data not appearing in Firebase

**Solutions:**
- Verify Firebase credentials (HOST and AUTH)
- Check Firebase security rules
- Ensure WiFi is connected
- Check Serial Monitor for error messages
- Verify Firebase URL format (no `https://` or trailing `/`)
- Try regenerating database secret

### I2C Scanner Code

If BH1750 is not detected, use this I2C scanner:

```cpp
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);  // SDA, SCL
  Serial.println("I2C Scanner");
}

void loop() {
  byte error, address;
  int devices = 0;
  
  Serial.println("Scanning...");
  
  for(address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.print("Device found at 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
      devices++;
    }
  }
  
  if (devices == 0)
    Serial.println("No I2C devices found");
  
  delay(5000);
}
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Brownout detector was triggered` | Insufficient power | Use better power supply (min 500mA) |
| `Failed to connect to Firebase` | Wrong credentials | Check FIREBASE_HOST and FIREBASE_AUTH |
| `Guru Meditation Error` | Code crash | Check array bounds, memory usage |
| `WiFi disconnected` | Weak signal | Move closer to router |

---

## Additional Resources

### Documentation
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [Firebase ESP32 Library](https://github.com/mobizt/Firebase-ESP32)
- [DHT Sensor Library](https://github.com/adafruit/DHT-sensor-library)
- [BH1750 Library](https://github.com/claws/BH1750)

### Useful Tools
- **Arduino IDE:** https://www.arduino.cc/en/software
- **Firebase Console:** https://console.firebase.google.com/
- **ESP32 Pinout Reference:** https://randomnerdtutorials.com/esp32-pinout-reference-gpios/

### Community Support
- Arduino Forum: https://forum.arduino.cc/
- ESP32 Forum: https://www.esp32.com/
- Firebase Community: https://firebase.google.com/community

---

## Next Steps

1. ✅ Complete hardware wiring
2. ✅ Upload and test ESP32 code
3. ✅ Verify Firebase connection
4. ✅ Test all sensors individually
5. ✅ Test motor control
6. ✅ Integrate with Flutter app
7. ✅ Set up push notifications
8. ✅ Deploy and monitor

---

## Safety Reminders

⚠️ **Important Safety Notes:**
- Always disconnect power before wiring
- Use proper voltage levels (3.3V for ESP32 GPIO)
- Add fuses to power lines
- Weatherproof all electronics
- Test in controlled environment first
- Never leave system unattended during initial testing

---

**Good luck with your SmartPayan project! 🌤️👕**
