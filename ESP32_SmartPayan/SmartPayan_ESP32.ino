/*
 * SmartPayan: Weather-Adaptive IoT Clothes Drying System
 * 
 * This system automatically retracts and extends a clothesline based on
 * weather conditions (rain, sunlight, nighttime) using ESP32 and various sensors.
 * 
 * Components:
 * - ESP32 (Main Controller)
 * - DHT22 (Temperature & Humidity)
 * - BH1750 (Light Intensity)
 * - Rain Sensor Module
 * - DC Motor with L298N Driver
 * 
 * Features:
 * - Real-time weather monitoring
 * - Automatic clothesline control
 * - Firebase integration for mobile app
 * - Manual override capability
 */

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include "ESPSocket_Helper.h"

// ==================== PIN DEFINITIONS ====================
#define DHT_PIN 4              // DHT22 data pin
#define RAIN_ANALOG_PIN 34     // Rain sensor analog output
#define RAIN_DIGITAL_PIN 35    // Rain sensor digital output
#define MOTOR_IN1 25           // Motor driver IN1
#define MOTOR_IN2 26           // Motor driver IN2
#define MOTOR_ENA 27           // Motor driver ENA (PWM speed control)

// I2C pins for BH1750 (default ESP32 I2C)
#define I2C_SDA 21
#define I2C_SCL 22

// ==================== SENSOR OBJECTS ====================
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);
BH1750 lightMeter;

// ==================== WIFI CONFIGURATION ====================
const char* WIFI_SSID = "YOUR_WIFI_SSID";        // Replace with your WiFi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password

WiFiHelper wifiHelper;

// ==================== FIREBASE CONFIGURATION ====================
#define FIREBASE_HOST "your-project.firebaseio.com"  // Replace with your Firebase project URL
#define FIREBASE_AUTH "your-firebase-secret-key"      // Replace with your Firebase secret or token

FirebaseData firebaseData;
FirebaseConfig firebaseConfig;
FirebaseAuth firebaseAuth;

// ==================== SYSTEM CONSTANTS ====================
#define MOTOR_SPEED 200        // Motor speed (0-255)
#define RAIN_THRESHOLD 500     // Analog threshold for rain detection (adjust based on sensor)
#define LIGHT_THRESHOLD 100    // Light threshold in lux (below = night, above = day)
#define SENSOR_READ_INTERVAL 5000  // Read sensors every 5 seconds
#define FIREBASE_UPDATE_INTERVAL 10000  // Update Firebase every 10 seconds

// ==================== SYSTEM STATES ====================
enum ClotheslineState {
  EXTENDED,   // Clothesline is out (drying clothes)
  RETRACTED,  // Clothesline is in (protected from rain)
  MOVING      // Clothesline is currently moving
};

// ==================== GLOBAL VARIABLES ====================
ClotheslineState currentState = RETRACTED;
bool manualOverride = false;
unsigned long lastSensorRead = 0;
unsigned long lastFirebaseUpdate = 0;

// Sensor readings
float temperature = 0.0;
float humidity = 0.0;
float lightLevel = 0.0;
int rainAnalog = 0;
bool rainDetected = false;

// ==================== SETUP FUNCTION ====================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== SmartPayan System Starting ===");
  
  // Initialize pins
  initializePins();
  
  // Initialize sensors
  initializeSensors();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize Firebase
  initializeFirebase();
  
  // Initial motor state (retracted for safety)
  stopMotor();
  
  Serial.println("=== System Ready ===\n");
}

// ==================== MAIN LOOP ====================
void loop() {
  unsigned long currentMillis = millis();
  
  // Read sensors at regular intervals
  if (currentMillis - lastSensorRead >= SENSOR_READ_INTERVAL) {
    lastSensorRead = currentMillis;
    readAllSensors();
    printSensorReadings();
    
    // Make decision based on sensor data (if not in manual override)
    if (!manualOverride) {
      makeAutomaticDecision();
    }
  }
  
  // Update Firebase at regular intervals
  if (currentMillis - lastFirebaseUpdate >= FIREBASE_UPDATE_INTERVAL) {
    lastFirebaseUpdate = currentMillis;
    updateFirebase();
  }
  
  // Check for manual commands from Firebase
  checkFirebaseCommands();
  
  delay(100);  // Small delay to prevent watchdog issues
}

// ==================== INITIALIZATION FUNCTIONS ====================

void initializePins() {
  Serial.println("Initializing pins...");
  
  // Motor control pins
  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
  pinMode(MOTOR_ENA, OUTPUT);
  
  // Rain sensor pins
  pinMode(RAIN_ANALOG_PIN, INPUT);
  pinMode(RAIN_DIGITAL_PIN, INPUT);
  
  Serial.println("✓ Pins initialized");
}

void initializeSensors() {
  Serial.println("Initializing sensors...");
  
  // Initialize DHT22
  dht.begin();
  Serial.println("✓ DHT22 initialized");
  
  // Initialize I2C for BH1750
  Wire.begin(I2C_SDA, I2C_SCL);
  
  // Initialize BH1750
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("✓ BH1750 initialized");
  } else {
    Serial.println("✗ BH1750 initialization failed!");
  }
  
  Serial.println("✓ All sensors initialized");
}

void connectToWiFi() {
  Serial.println("Connecting to WiFi...");
  Serial.print("SSID: ");
  Serial.println(WIFI_SSID);
  
  wifiHelper.begin(WIFI_SSID, WIFI_PASSWORD);
  wifiHelper.connectWiFi();
  
  if (wifiHelper.isConnected()) {
    Serial.println("✓ WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(wifiHelper.getLocalIP());
  } else {
    Serial.println("✗ WiFi connection failed!");
  }
}

void initializeFirebase() {
  Serial.println("Initializing Firebase...");
  
  // Configure Firebase
  firebaseConfig.host = FIREBASE_HOST;
  firebaseConfig.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  // Initialize Firebase
  Firebase.begin(&firebaseConfig, &firebaseAuth);
  Firebase.reconnectWiFi(true);
  
  // Set timeout
  firebaseData.setBSSLBufferSize(1024, 1024);
  firebaseData.setResponseSize(1024);
  
  Serial.println("✓ Firebase initialized");
  
  // Send initial status
  Firebase.setString(firebaseData, "/smartpayan/status", "online");
  Firebase.setString(firebaseData, "/smartpayan/state", "retracted");
}

// ==================== SENSOR READING FUNCTIONS ====================

void readAllSensors() {
  // Read DHT22 (Temperature & Humidity)
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  // Check if DHT22 reading failed
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("✗ Failed to read from DHT22!");
    temperature = 0.0;
    humidity = 0.0;
  }
  
  // Read BH1750 (Light Level)
  lightLevel = lightMeter.readLightLevel();
  if (lightLevel < 0) {
    Serial.println("✗ Failed to read from BH1750!");
    lightLevel = 0.0;
  }
  
  // Read Rain Sensor
  rainAnalog = analogRead(RAIN_ANALOG_PIN);
  rainDetected = digitalRead(RAIN_DIGITAL_PIN) == LOW;  // LOW = rain detected
  
  // Additional check: if analog value is below threshold, it's raining
  if (rainAnalog < RAIN_THRESHOLD) {
    rainDetected = true;
  }
}

void printSensorReadings() {
  Serial.println("\n--- Sensor Readings ---");
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
  
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  
  Serial.print("Light Level: ");
  Serial.print(lightLevel);
  Serial.println(" lux");
  
  Serial.print("Rain Analog: ");
  Serial.print(rainAnalog);
  Serial.print(" | Rain Detected: ");
  Serial.println(rainDetected ? "YES" : "NO");
  
  Serial.print("Current State: ");
  Serial.println(getStateString(currentState));
  Serial.println("----------------------\n");
}

// ==================== DECISION LOGIC ====================

void makeAutomaticDecision() {
  /*
   * Decision Logic:
   * 1. If rain is detected → RETRACT immediately
   * 2. If it's nighttime (low light) → RETRACT
   * 3. If it's sunny and no rain → EXTEND
   * 4. If humidity is very high (>90%) → Consider retracting
   */
  
  bool shouldRetract = false;
  bool shouldExtend = false;
  
  // Priority 1: Rain detection (highest priority)
  if (rainDetected) {
    Serial.println("⚠ Rain detected! Retracting clothesline...");
    shouldRetract = true;
  }
  // Priority 2: Nighttime detection
  else if (lightLevel < LIGHT_THRESHOLD) {
    Serial.println("🌙 Nighttime detected. Retracting clothesline...");
    shouldRetract = true;
  }
  // Priority 3: High humidity (might rain soon)
  else if (humidity > 90) {
    Serial.println("💧 Very high humidity. Retracting as precaution...");
    shouldRetract = true;
  }
  // Good conditions: Sunny and dry
  else if (lightLevel >= LIGHT_THRESHOLD && !rainDetected && humidity < 80) {
    Serial.println("☀ Good drying conditions. Extending clothesline...");
    shouldExtend = true;
  }
  
  // Execute decision
  if (shouldRetract && currentState != RETRACTED) {
    retractClothesline();
  } else if (shouldExtend && currentState != EXTENDED) {
    extendClothesline();
  }
}

// ==================== MOTOR CONTROL FUNCTIONS ====================

void extendClothesline() {
  Serial.println(">>> Extending clothesline...");
  currentState = MOVING;
  
  // Rotate motor forward
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);
  analogWrite(MOTOR_ENA, MOTOR_SPEED);
  
  // Run motor for a specific duration (adjust based on your setup)
  delay(3000);  // 3 seconds to fully extend
  
  stopMotor();
  currentState = EXTENDED;
  Serial.println("✓ Clothesline extended");
  
  // Update Firebase
  Firebase.setString(firebaseData, "/smartpayan/state", "extended");
  Firebase.setString(firebaseData, "/smartpayan/lastAction", "Extended clothesline");
}

void retractClothesline() {
  Serial.println("<<< Retracting clothesline...");
  currentState = MOVING;
  
  // Rotate motor backward
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);
  analogWrite(MOTOR_ENA, MOTOR_SPEED);
  
  // Run motor for a specific duration (adjust based on your setup)
  delay(3000);  // 3 seconds to fully retract
  
  stopMotor();
  currentState = RETRACTED;
  Serial.println("✓ Clothesline retracted");
  
  // Update Firebase
  Firebase.setString(firebaseData, "/smartpayan/state", "retracted");
  Firebase.setString(firebaseData, "/smartpayan/lastAction", "Retracted clothesline");
  
  // Send notification trigger
  Firebase.setBool(firebaseData, "/smartpayan/notifications/rainAlert", true);
}

void stopMotor() {
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, LOW);
  analogWrite(MOTOR_ENA, 0);
}

// ==================== FIREBASE FUNCTIONS ====================

void updateFirebase() {
  if (!wifiHelper.isConnected()) {
    Serial.println("✗ WiFi disconnected. Reconnecting...");
    wifiHelper.connectWiFi();
    return;
  }
  
  Serial.println("Updating Firebase...");
  
  // Update sensor data
  Firebase.setFloat(firebaseData, "/smartpayan/sensors/temperature", temperature);
  Firebase.setFloat(firebaseData, "/smartpayan/sensors/humidity", humidity);
  Firebase.setFloat(firebaseData, "/smartpayan/sensors/lightLevel", lightLevel);
  Firebase.setInt(firebaseData, "/smartpayan/sensors/rainAnalog", rainAnalog);
  Firebase.setBool(firebaseData, "/smartpayan/sensors/rainDetected", rainDetected);
  
  // Update system state
  Firebase.setString(firebaseData, "/smartpayan/state", getStateString(currentState));
  Firebase.setBool(firebaseData, "/smartpayan/manualOverride", manualOverride);
  
  // Update timestamp
  Firebase.setInt(firebaseData, "/smartpayan/lastUpdate", millis() / 1000);
  
  Serial.println("✓ Firebase updated");
}

void checkFirebaseCommands() {
  // Check for manual control commands from mobile app
  if (Firebase.getString(firebaseData, "/smartpayan/commands/action")) {
    String command = firebaseData.stringData();
    
    if (command == "extend") {
      Serial.println("📱 Manual command: EXTEND");
      manualOverride = true;
      extendClothesline();
      Firebase.setString(firebaseData, "/smartpayan/commands/action", "");
    } 
    else if (command == "retract") {
      Serial.println("📱 Manual command: RETRACT");
      manualOverride = true;
      retractClothesline();
      Firebase.setString(firebaseData, "/smartpayan/commands/action", "");
    }
    else if (command == "auto") {
      Serial.println("📱 Manual command: AUTO MODE");
      manualOverride = false;
      Firebase.setString(firebaseData, "/smartpayan/commands/action", "");
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

String getStateString(ClotheslineState state) {
  switch (state) {
    case EXTENDED:
      return "extended";
    case RETRACTED:
      return "retracted";
    case MOVING:
      return "moving";
    default:
      return "unknown";
  }
}
