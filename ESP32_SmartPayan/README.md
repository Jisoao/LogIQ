# SmartPayan: Weather-Adaptive IoT Clothes Drying System

<div align="center">

![SmartPayan](https://img.shields.io/badge/SmartPayan-IoT%20Project-blue)
![ESP32](https://img.shields.io/badge/ESP32-Microcontroller-green)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange)
![Flutter](https://img.shields.io/badge/Flutter-Mobile%20App-blue)

**An intelligent IoT-based automatic clothesline system that protects your laundry from rain and optimizes drying conditions.**

</div>

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Hardware Components](#hardware-components)
- [Software Stack](#software-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Mobile App Integration](#mobile-app-integration)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**SmartPayan** is an IoT-based automatic clothesline designed to intelligently react to environmental changes. It uses an ESP32 microcontroller as the main control unit, connecting various sensors and actuators to protect laundry from rain and optimize drying conditions. Through Wi-Fi connectivity, the system transmits real-time environmental data to a user interface, allowing remote monitoring and control.

### Objectives
1. ✅ Automatically retract and extend the clothesline depending on weather conditions
2. ✅ Monitor real-time humidity and temperature for optimal drying performance
3. ✅ Notify users through mobile app when rain is detected
4. ✅ Minimize manual intervention in the laundry drying process

---

## ✨ Features

### Automatic Weather Detection
- **Rain Detection**: Instantly retracts clothesline when rain is detected
- **Light Sensing**: Detects day/night cycles for optimal drying
- **Temperature & Humidity Monitoring**: Tracks environmental conditions
- **Smart Decision Making**: AI-based logic for automatic control

### Remote Control & Monitoring
- **Real-time Dashboard**: View live sensor data on mobile app
- **Manual Override**: Control clothesline remotely from anywhere
- **Push Notifications**: Instant alerts when rain is detected
- **Historical Data**: Track weather patterns and system performance

### Safety & Reliability
- **Automatic Protection**: Immediate response to rain detection
- **Manual Control**: Override automatic mode when needed
- **Status Monitoring**: Real-time system health checks
- **Error Handling**: Robust error detection and recovery

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SMARTPAYAN SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   SENSORS    │──────│     ESP32    │──────│  MOTOR   │  │
│  │              │      │  Controller  │      │  DRIVER  │  │
│  │ • DHT22      │      │              │      │          │  │
│  │ • BH1750     │      │   WiFi       │      │ DC Motor │  │
│  │ • Rain       │      │   Enabled    │      │          │  │
│  └──────────────┘      └──────┬───────┘      └──────────┘  │
│                                │                             │
│                                │ WiFi                        │
│                                │                             │
│                        ┌───────▼────────┐                    │
│                        │    FIREBASE    │                    │
│                        │  Realtime DB   │                    │
│                        └───────┬────────┘                    │
│                                │                             │
│                                │ Internet                    │
│                                │                             │
│                        ┌───────▼────────┐                    │
│                        │  FLUTTER APP   │                    │
│                        │  (Android/iOS) │                    │
│                        │                │                    │
│                        │ • Dashboard    │                    │
│                        │ • Controls     │                    │
│                        │ • Notifications│                    │
│                        └────────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Hardware Components

| Component | Model | Purpose | Quantity |
|-----------|-------|---------|----------|
| **Microcontroller** | ESP32 Dev Board | Main controller with WiFi | 1 |
| **Temperature/Humidity** | DHT22 | Environmental monitoring | 1 |
| **Light Sensor** | BH1750 | Day/night detection | 1 |
| **Rain Sensor** | Rain Sensor Module | Rain detection | 1 |
| **Motor Driver** | L298N | DC motor control | 1 |
| **DC Motor** | 12V DC Motor | Clothesline mechanism | 1 |
| **Power Supply** | 12V/2A Adapter | System power | 1 |
| **Miscellaneous** | Jumper wires, breadboard | Connections | - |

### Total Estimated Cost: ~$30-40 USD

---

## 💻 Software Stack

### Embedded System (ESP32)
- **Language**: C++ (Arduino Framework)
- **IDE**: Arduino IDE 2.0+
- **Libraries**:
  - `WiFi.h` - WiFi connectivity
  - `FirebaseESP32.h` - Firebase integration
  - `DHT.h` - DHT22 sensor
  - `BH1750.h` - Light sensor
  - `Wire.h` - I2C communication

### Backend
- **Firebase Realtime Database** - Real-time data sync
- **Firebase Cloud Messaging** - Push notifications

### Mobile App
- **Framework**: Flutter
- **Language**: Dart
- **Packages**:
  - `firebase_core` - Firebase initialization
  - `firebase_database` - Realtime database
  - `firebase_messaging` - Push notifications
  - `flutter_local_notifications` - Local notifications

---

## 🚀 Quick Start

### Prerequisites
- Arduino IDE 2.0 or later
- ESP32 board support installed
- Firebase account
- Flutter SDK (for mobile app)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartpayan.git
   cd smartpayan/ESP32_SmartPayan
   ```

2. **Install Arduino libraries**
   - Open Arduino IDE
   - Install required libraries (see `SETUP_INSTRUCTIONS.md`)

3. **Configure WiFi and Firebase**
   - Open `SmartPayan_ESP32.ino`
   - Update WiFi credentials
   - Update Firebase credentials

4. **Upload to ESP32**
   - Connect ESP32 via USB
   - Select board and port
   - Click Upload

5. **Set up mobile app**
   - See `SETUP_INSTRUCTIONS.md` for Flutter setup

### Detailed Setup
For complete setup instructions, see **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)**

For wiring diagrams, see **[WIRING_DIAGRAM.md](WIRING_DIAGRAM.md)**

---

## 📁 Project Structure

```
ESP32_SmartPayan/
├── SmartPayan_ESP32.ino        # Main ESP32 code
├── ESPSocket_Helper.h          # WiFi helper header
├── ESPSocket_Helper.cpp        # WiFi helper implementation (provided)
├── WIRING_DIAGRAM.md           # Hardware wiring guide
├── SETUP_INSTRUCTIONS.md       # Complete setup guide
└── README.md                   # This file
```

---

## 🔄 How It Works

### Automatic Mode Logic

```
┌─────────────────────────────────────────────────────────┐
│                   DECISION FLOWCHART                     │
└─────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Read Sensors│
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Rain Detected?│
                    └──────┬───────┘
                           │
                    ┌──────▼──────┐
                    │     YES     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   RETRACT   │◄─────┐
                    │ Clothesline │      │
                    └─────────────┘      │
                                         │
                    ┌──────────────┐     │
                    │      NO      │     │
                    └──────┬───────┘     │
                           │             │
                    ┌──────▼───────┐     │
                    │  Nighttime?  │     │
                    │ (Low Light)  │     │
                    └──────┬───────┘     │
                           │             │
                    ┌──────▼──────┐      │
                    │     YES     │──────┘
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │      NO     │
                    └──────┬──────┘
                           │
                    ┌──────▼───────┐
                    │ High Humidity│
                    │   (>90%)?    │
                    └──────┬───────┘
                           │
                    ┌──────▼──────┐      ┌─────────────┐
                    │     YES     │──────┤   RETRACT   │
                    └─────────────┘      └─────────────┘
                           │
                    ┌──────▼──────┐
                    │      NO     │
                    └──────┬──────┘
                           │
                    ┌──────▼───────┐
                    │ Good Drying  │
                    │  Conditions? │
                    │ (Sunny & Dry)│
                    └──────┬───────┘
                           │
                    ┌──────▼──────┐
                    │     YES     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   EXTEND    │
                    │ Clothesline │
                    └─────────────┘
```

### Data Flow

1. **Sensor Reading** (Every 5 seconds)
   - DHT22 reads temperature and humidity
   - BH1750 reads light intensity
   - Rain sensor checks for moisture

2. **Decision Making**
   - ESP32 processes sensor data
   - Applies decision logic
   - Controls motor accordingly

3. **Firebase Update** (Every 10 seconds)
   - Uploads sensor readings
   - Updates system state
   - Checks for manual commands

4. **Mobile App**
   - Displays real-time data
   - Sends control commands
   - Receives notifications

---

## 📱 Mobile App Integration

### Firebase Database Structure

```json
{
  "smartpayan": {
    "status": "online",
    "state": "retracted",
    "manualOverride": false,
    "lastUpdate": 1234567890,
    "sensors": {
      "temperature": 25.5,
      "humidity": 60.0,
      "lightLevel": 500.0,
      "rainAnalog": 1024,
      "rainDetected": false
    },
    "commands": {
      "action": ""
    },
    "notifications": {
      "rainAlert": false
    },
    "lastAction": "Extended clothesline"
  }
}
```

### Available Commands

Send these commands via Firebase to control the system:

| Command | Action | Path |
|---------|--------|------|
| `"extend"` | Extend clothesline | `/smartpayan/commands/action` |
| `"retract"` | Retract clothesline | `/smartpayan/commands/action` |
| `"auto"` | Enable automatic mode | `/smartpayan/commands/action` |

### Flutter Code Example

```dart
// Send command to extend clothesline
await FirebaseDatabase.instance
    .ref('smartpayan/commands/action')
    .set('extend');

// Listen to sensor data
FirebaseDatabase.instance
    .ref('smartpayan/sensors')
    .onValue
    .listen((event) {
  final data = event.snapshot.value as Map;
  print('Temperature: ${data['temperature']}°C');
});
```

---

## 🎯 Use Cases

### Residential
- **Home laundry**: Protect clothes from unexpected rain
- **Apartment balconies**: Automated drying in limited space
- **Vacation homes**: Remote monitoring and control

### Commercial
- **Laundromats**: Automated outdoor drying areas
- **Hotels**: Efficient laundry management
- **Hostels**: Shared drying facilities

---

## 🔮 Future Enhancements

- [ ] Weather API integration for rain prediction
- [ ] Solar panel for off-grid operation
- [ ] Multiple clothesline support
- [ ] Machine learning for pattern recognition
- [ ] Voice assistant integration (Alexa, Google Home)
- [ ] Energy consumption monitoring
- [ ] Wind speed sensor for strong wind detection
- [ ] UV index monitoring for fabric protection

---

## 🐛 Troubleshooting

Common issues and solutions are documented in **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md#8-troubleshooting)**

Quick fixes:
- **WiFi not connecting**: Check SSID/password, ensure 2.4GHz network
- **Sensors not reading**: Verify wiring and power supply
- **Motor not running**: Check 12V power and L298N connections
- **Firebase not updating**: Verify credentials and security rules

---

## 📚 Documentation

- **[WIRING_DIAGRAM.md](WIRING_DIAGRAM.md)** - Complete hardware wiring guide
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Step-by-step setup instructions
- **Code Comments** - Inline documentation in source code

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

**CPE-ELECT 1 Team**
- Your Name - *Initial work*

---

## 🙏 Acknowledgments

- Instructor for providing ESPSocket_Helper library
- Adafruit for DHT sensor library
- Christopher Laws for BH1750 library
- Mobizt for Firebase ESP32 library
- ESP32 community for support and resources

---

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Contact: your.email@example.com

---

<div align="center">

**Made with ❤️ for CPE-ELECT 1**

⭐ Star this repo if you find it helpful!

</div>
