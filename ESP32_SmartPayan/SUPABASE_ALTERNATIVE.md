# SmartPayan - Supabase Integration Alternative

If you prefer to use **Supabase** instead of Firebase, follow this guide.

## Why Supabase?

- Open-source Firebase alternative
- PostgreSQL database (more powerful than Firebase)
- Better pricing for larger projects
- RESTful API (easier for ESP32)
- Real-time subscriptions
- Built-in authentication

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in details:
   - **Name**: smartpayan
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait for project to be ready (~2 minutes)

### 2. Get API Credentials

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (use for ESP32)

### 3. Create Database Table

1. Go to **Table Editor**
2. Click **"Create a new table"**
3. Table name: `sensor_data`
4. Add columns:

| Column Name | Type | Default | Extra |
|-------------|------|---------|-------|
| id | int8 | auto-increment | Primary Key |
| created_at | timestamptz | now() | - |
| temperature | float8 | - | - |
| humidity | float8 | - | - |
| light_level | float8 | - | - |
| rain_analog | int4 | - | - |
| rain_detected | bool | false | - |
| state | text | 'retracted' | - |
| manual_override | bool | false | - |

5. Click **"Save"**

### 4. Create Commands Table

1. Create another table: `commands`
2. Add columns:

| Column Name | Type | Default | Extra |
|-------------|------|---------|-------|
| id | int8 | auto-increment | Primary Key |
| created_at | timestamptz | now() | - |
| action | text | '' | - |
| processed | bool | false | - |

### 5. Enable Realtime

1. Go to **Database → Replication**
2. Enable replication for both tables:
   - `sensor_data`
   - `commands`

---

## ESP32 Code for Supabase

### Required Library

Install **ArduinoJson** library:
- Open Arduino IDE
- Tools → Manage Libraries
- Search: "ArduinoJson"
- Install version 6.x

### Modified ESP32 Code

Create a new file: `SmartPayan_Supabase.ino`

```cpp
/*
 * SmartPayan with Supabase Integration
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>

// ==================== PIN DEFINITIONS ====================
#define DHT_PIN 4
#define RAIN_ANALOG_PIN 34
#define RAIN_DIGITAL_PIN 35
#define MOTOR_IN1 25
#define MOTOR_IN2 26
#define MOTOR_ENA 27
#define I2C_SDA 21
#define I2C_SCL 22

// ==================== SENSOR OBJECTS ====================
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;

// ==================== WIFI CONFIGURATION ====================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ==================== SUPABASE CONFIGURATION ====================
const char* SUPABASE_URL = "https://xxxxx.supabase.co";  // Your project URL
const char* SUPABASE_KEY = "your-service-role-key";      // Your service_role key

// ==================== SYSTEM CONSTANTS ====================
#define MOTOR_SPEED 200
#define RAIN_THRESHOLD 500
#define LIGHT_THRESHOLD 100
#define SENSOR_READ_INTERVAL 5000
#define SUPABASE_UPDATE_INTERVAL 10000
#define COMMAND_CHECK_INTERVAL 3000

// ==================== SYSTEM STATES ====================
enum ClotheslineState {
  EXTENDED,
  RETRACTED,
  MOVING
};

// ==================== GLOBAL VARIABLES ====================
ClotheslineState currentState = RETRACTED;
bool manualOverride = false;
unsigned long lastSensorRead = 0;
unsigned long lastSupabaseUpdate = 0;
unsigned long lastCommandCheck = 0;

float temperature = 0.0;
float humidity = 0.0;
float lightLevel = 0.0;
int rainAnalog = 0;
bool rainDetected = false;

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SmartPayan with Supabase ===");
  
  initializePins();
  initializeSensors();
  connectToWiFi();
  
  stopMotor();
  
  // Send initial status
  updateSupabase();
  
  Serial.println("=== System Ready ===\n");
}

// ==================== MAIN LOOP ====================
void loop() {
  unsigned long currentMillis = millis();
  
  // Read sensors
  if (currentMillis - lastSensorRead >= SENSOR_READ_INTERVAL) {
    lastSensorRead = currentMillis;
    readAllSensors();
    printSensorReadings();
    
    if (!manualOverride) {
      makeAutomaticDecision();
    }
  }
  
  // Update Supabase
  if (currentMillis - lastSupabaseUpdate >= SUPABASE_UPDATE_INTERVAL) {
    lastSupabaseUpdate = currentMillis;
    updateSupabase();
  }
  
  // Check for commands
  if (currentMillis - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
    lastCommandCheck = currentMillis;
    checkSupabaseCommands();
  }
  
  delay(100);
}

// ==================== INITIALIZATION ====================
void initializePins() {
  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
  pinMode(MOTOR_ENA, OUTPUT);
  pinMode(RAIN_ANALOG_PIN, INPUT);
  pinMode(RAIN_DIGITAL_PIN, INPUT);
}

void initializeSensors() {
  dht.begin();
  Wire.begin(I2C_SDA, I2C_SCL);
  lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n✓ WiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// ==================== SENSOR READING ====================
void readAllSensors() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  if (isnan(temperature) || isnan(humidity)) {
    temperature = 0.0;
    humidity = 0.0;
  }
  
  lightLevel = lightMeter.readLightLevel();
  if (lightLevel < 0) lightLevel = 0.0;
  
  rainAnalog = analogRead(RAIN_ANALOG_PIN);
  rainDetected = digitalRead(RAIN_DIGITAL_PIN) == LOW;
  
  if (rainAnalog < RAIN_THRESHOLD) {
    rainDetected = true;
  }
}

void printSensorReadings() {
  Serial.println("\n--- Sensor Readings ---");
  Serial.printf("Temperature: %.1f°C\n", temperature);
  Serial.printf("Humidity: %.1f%%\n", humidity);
  Serial.printf("Light: %.1f lux\n", lightLevel);
  Serial.printf("Rain: %s\n", rainDetected ? "YES" : "NO");
  Serial.printf("State: %s\n", getStateString(currentState));
  Serial.println("----------------------\n");
}

// ==================== DECISION LOGIC ====================
void makeAutomaticDecision() {
  bool shouldRetract = false;
  bool shouldExtend = false;
  
  if (rainDetected) {
    Serial.println("⚠ Rain detected!");
    shouldRetract = true;
  }
  else if (lightLevel < LIGHT_THRESHOLD) {
    Serial.println("🌙 Nighttime");
    shouldRetract = true;
  }
  else if (humidity > 90) {
    Serial.println("💧 High humidity");
    shouldRetract = true;
  }
  else if (lightLevel >= LIGHT_THRESHOLD && !rainDetected && humidity < 80) {
    Serial.println("☀ Good conditions");
    shouldExtend = true;
  }
  
  if (shouldRetract && currentState != RETRACTED) {
    retractClothesline();
  } else if (shouldExtend && currentState != EXTENDED) {
    extendClothesline();
  }
}

// ==================== MOTOR CONTROL ====================
void extendClothesline() {
  Serial.println(">>> Extending...");
  currentState = MOVING;
  
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);
  analogWrite(MOTOR_ENA, MOTOR_SPEED);
  delay(3000);
  
  stopMotor();
  currentState = EXTENDED;
  Serial.println("✓ Extended");
}

void retractClothesline() {
  Serial.println("<<< Retracting...");
  currentState = MOVING;
  
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);
  analogWrite(MOTOR_ENA, MOTOR_SPEED);
  delay(3000);
  
  stopMotor();
  currentState = RETRACTED;
  Serial.println("✓ Retracted");
}

void stopMotor() {
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, LOW);
  analogWrite(MOTOR_ENA, 0);
}

// ==================== SUPABASE FUNCTIONS ====================
void updateSupabase() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi disconnected");
    return;
  }
  
  HTTPClient http;
  
  // Prepare JSON data
  StaticJsonDocument<512> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["light_level"] = lightLevel;
  doc["rain_analog"] = rainAnalog;
  doc["rain_detected"] = rainDetected;
  doc["state"] = getStateString(currentState);
  doc["manual_override"] = manualOverride;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  // Send POST request to Supabase
  String url = String(SUPABASE_URL) + "/rest/v1/sensor_data";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  http.addHeader("Prefer", "return=minimal");
  
  int httpCode = http.POST(jsonData);
  
  if (httpCode > 0) {
    Serial.printf("✓ Supabase updated (HTTP %d)\n", httpCode);
  } else {
    Serial.printf("✗ Supabase error: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
}

void checkSupabaseCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  
  // Get unprocessed commands
  String url = String(SUPABASE_URL) + 
               "/rest/v1/commands?processed=eq.false&order=created_at.desc&limit=1";
  
  http.begin(url);
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error && doc.size() > 0) {
      String action = doc[0]["action"].as<String>();
      int commandId = doc[0]["id"].as<int>();
      
      Serial.printf("📱 Command received: %s\n", action.c_str());
      
      if (action == "extend") {
        manualOverride = true;
        extendClothesline();
      }
      else if (action == "retract") {
        manualOverride = true;
        retractClothesline();
      }
      else if (action == "auto") {
        manualOverride = false;
      }
      
      // Mark command as processed
      markCommandProcessed(commandId);
    }
  }
  
  http.end();
}

void markCommandProcessed(int commandId) {
  HTTPClient http;
  
  String url = String(SUPABASE_URL) + "/rest/v1/commands?id=eq." + String(commandId);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  
  String jsonData = "{\"processed\":true}";
  http.PATCH(jsonData);
  http.end();
}

// ==================== HELPER ====================
const char* getStateString(ClotheslineState state) {
  switch (state) {
    case EXTENDED: return "extended";
    case RETRACTED: return "retracted";
    case MOVING: return "moving";
    default: return "unknown";
  }
}
```

---

## Flutter Integration with Supabase

### 1. Install Supabase Flutter Package

```yaml
dependencies:
  supabase_flutter: ^2.0.0
```

### 2. Initialize Supabase

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://xxxxx.supabase.co',
    anonKey: 'your-anon-key',
  );
  
  runApp(MyApp());
}

final supabase = Supabase.instance.client;
```

### 3. Read Sensor Data

```dart
class SmartPayanService {
  // Get latest sensor data
  Future<Map<String, dynamic>> getLatestSensorData() async {
    final response = await supabase
        .from('sensor_data')
        .select()
        .order('created_at', ascending: false)
        .limit(1)
        .single();
    
    return response;
  }
  
  // Listen to real-time updates
  Stream<List<Map<String, dynamic>>> sensorDataStream() {
    return supabase
        .from('sensor_data')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .limit(1);
  }
  
  // Send command
  Future<void> sendCommand(String action) async {
    await supabase.from('commands').insert({
      'action': action,
      'processed': false,
    });
  }
}
```

### 4. Display Data Widget

```dart
class SensorDataWidget extends StatelessWidget {
  final SmartPayanService _service = SmartPayanService();
  
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: _service.sensorDataStream(),
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return CircularProgressIndicator();
        }
        
        final data = snapshot.data!.first;
        
        return Column(
          children: [
            Text('Temperature: ${data['temperature']}°C'),
            Text('Humidity: ${data['humidity']}%'),
            Text('Light: ${data['light_level']} lux'),
            Text('Rain: ${data['rain_detected'] ? 'YES' : 'NO'}'),
            Text('State: ${data['state']}'),
          ],
        );
      },
    );
  }
}
```

### 5. Control Buttons

```dart
class ControlButtons extends StatelessWidget {
  final SmartPayanService _service = SmartPayanService();
  
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        ElevatedButton(
          onPressed: () => _service.sendCommand('extend'),
          child: Text('Extend'),
        ),
        ElevatedButton(
          onPressed: () => _service.sendCommand('retract'),
          child: Text('Retract'),
        ),
        ElevatedButton(
          onPressed: () => _service.sendCommand('auto'),
          child: Text('Auto'),
        ),
      ],
    );
  }
}
```

---

## Advantages of Supabase

✅ **RESTful API** - Easier HTTP requests from ESP32  
✅ **PostgreSQL** - More powerful queries and data types  
✅ **Real-time** - Built-in real-time subscriptions  
✅ **Open Source** - Self-hostable if needed  
✅ **Better pricing** - More generous free tier  
✅ **Row Level Security** - Better security control  

---

## Comparison: Firebase vs Supabase

| Feature | Firebase | Supabase |
|---------|----------|----------|
| Database | NoSQL (JSON) | PostgreSQL (SQL) |
| Real-time | Yes | Yes |
| ESP32 Integration | Native library | HTTP REST API |
| Free Tier | 1GB storage | 500MB storage, 2GB bandwidth |
| Pricing | Pay as you go | More predictable |
| Open Source | No | Yes |
| Self-hosting | No | Yes |

---

## Troubleshooting Supabase

**HTTP 401 Unauthorized:**
- Check API key is correct
- Use `service_role` key for ESP32 (not `anon` key)

**HTTP 400 Bad Request:**
- Verify JSON format
- Check column names match database

**No data appearing:**
- Check table name is correct
- Verify RLS (Row Level Security) policies
- Disable RLS for testing: Table → Settings → Disable RLS

**Real-time not working:**
- Enable replication: Database → Replication
- Check table is published

---

## Conclusion

Both Firebase and Supabase work great for SmartPayan. Choose based on your needs:

- **Choose Firebase if:** You want easier ESP32 integration with native library
- **Choose Supabase if:** You prefer SQL, open-source, or better pricing

