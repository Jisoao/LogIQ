# SmartPayan - ESP32 Wiring Diagram

## Components List
1. **ESP32 Development Board** (Main Controller)
2. **DHT22** - Temperature & Humidity Sensor
3. **BH1750** - Light Intensity Sensor (I2C)
4. **Rain Sensor Module** - Rain Detection
5. **DC Motor with L298N Motor Driver** - Clothesline Retraction/Extension
6. **5V Relay Module** (Optional - for additional control)
7. **Power Supply** - 12V for motor, 5V for ESP32

---

## Pin Connections

### ESP32 Pinout Reference
```
ESP32 GPIO Pins Used:
- GPIO 4  → DHT22 Data Pin
- GPIO 21 → BH1750 SDA (I2C Data)
- GPIO 22 → BH1750 SCL (I2C Clock)
- GPIO 34 → Rain Sensor Analog Output
- GPIO 35 → Rain Sensor Digital Output
- GPIO 25 → Motor Driver IN1 (Direction Control)
- GPIO 26 → Motor Driver IN2 (Direction Control)
- GPIO 27 → Motor Driver ENA (Speed Control - PWM)
- GND     → Common Ground
- 3.3V    → Sensor Power (DHT22, BH1750)
- 5V      → Rain Sensor Power
```

---

## Detailed Wiring Instructions

### 1. DHT22 Temperature & Humidity Sensor
```
DHT22 Pin 1 (VCC)  →  ESP32 3.3V
DHT22 Pin 2 (DATA) →  ESP32 GPIO 4
DHT22 Pin 3 (NC)   →  Not Connected
DHT22 Pin 4 (GND)  →  ESP32 GND

Note: Add a 10kΩ pull-up resistor between DATA and VCC
```

### 2. BH1750 Light Sensor (I2C)
```
BH1750 VCC  →  ESP32 3.3V
BH1750 GND  →  ESP32 GND
BH1750 SCL  →  ESP32 GPIO 22 (I2C Clock)
BH1750 SDA  →  ESP32 GPIO 21 (I2C Data)
BH1750 ADDR →  GND (for address 0x23) or VCC (for address 0x5C)
```

### 3. Rain Sensor Module
```
Rain Sensor VCC  →  ESP32 5V (or 3.3V if module supports it)
Rain Sensor GND  →  ESP32 GND
Rain Sensor AO   →  ESP32 GPIO 34 (Analog Output - for rain intensity)
Rain Sensor DO   →  ESP32 GPIO 35 (Digital Output - for rain detection)

Note: Adjust the potentiometer on the module to set detection threshold
```

### 4. L298N Motor Driver + DC Motor
```
L298N Motor Driver Connections:
- 12V Power Input  →  12V Power Supply (+)
- GND              →  Common Ground (ESP32 GND + Power Supply GND)
- 5V Output        →  Can power ESP32 if needed (remove jumper if using separate 5V)
- IN1              →  ESP32 GPIO 25
- IN2              →  ESP32 GPIO 26
- ENA              →  ESP32 GPIO 27 (PWM for speed control)
- OUT1             →  DC Motor Wire 1
- OUT2             →  DC Motor Wire 2

Motor Control Logic:
- IN1=HIGH, IN2=LOW  → Motor rotates forward (extend clothesline)
- IN1=LOW,  IN2=HIGH → Motor rotates backward (retract clothesline)
- IN1=LOW,  IN2=LOW  → Motor stops
- ENA PWM value      → Controls motor speed (0-255)
```

---

## Power Supply Recommendations

### Option 1: Dual Power Supply (Recommended)
- **12V Power Supply** → L298N Motor Driver (for DC motor)
- **5V USB Power** → ESP32 (via USB port or VIN pin)
- **Common Ground** → Connect all grounds together

### Option 2: Single 12V Power Supply
- **12V Power Supply** → L298N 12V input
- **L298N 5V Output** → ESP32 VIN pin (if L298N has 5V regulator)
- **Common Ground** → Connect all grounds together

---

## Circuit Diagram (ASCII Art)

```
                                    +12V Power Supply
                                         |
                                         |
                    +--------------------|--------------------+
                    |                    |                    |
                    |              L298N Motor Driver         |
                    |              +------------------+       |
                    |              |  12V    GND  5V  |       |
                    |              |   |      |    |  |       |
                    |              |   +------+----+  |       |
                    |              |                  |       |
    DC Motor <------|--------------|  OUT1      OUT2 |       |
                    |              |                  |       |
                    |              |  IN1  IN2  ENA   |       |
                    |              +---|---|-------|--+       |
                    |                  |   |       |          |
                    |                  |   |       |          |
                    |              +---|---|-------|----------+
                    |              |   |   |       |          |
                    |              | GPIO GPIO  GPIO          |
                    |              |  25   26    27           |
                    |              |                          |
                    |         ESP32 Development Board         |
                    |         +------------------------+      |
                    |         |                        |      |
                    |         | GPIO 4  ← DHT22 Data   |      |
                    |         | GPIO 21 ← BH1750 SDA   |      |
                    |         | GPIO 22 ← BH1750 SCL   |      |
                    |         | GPIO 34 ← Rain AO      |      |
                    |         | GPIO 35 ← Rain DO      |      |
                    |         |                        |      |
                    |         | 3.3V → Sensors VCC     |      |
                    |         | 5V   → Rain Sensor VCC |      |
                    |         | GND  → Common Ground   |      |
                    |         +------------------------+      |
                    |                    |                    |
                    +--------------------+--------------------+
                                         |
                                       GND (Common Ground)
```

---

## Safety Notes

1. **Common Ground**: Always connect all grounds together (ESP32, sensors, motor driver, power supplies)
2. **Voltage Levels**: ESP32 GPIO pins are 3.3V tolerant. Use level shifters if connecting 5V logic devices
3. **Motor Power**: Never power the motor directly from ESP32 - always use a motor driver
4. **Current Protection**: Add fuses to power lines to prevent overcurrent damage
5. **Reverse Polarity**: Add a diode across motor terminals to protect against back EMF
6. **Weatherproofing**: Ensure all electronics are properly enclosed and protected from moisture

---

## Testing Checklist

- [ ] Verify all power connections before powering on
- [ ] Test each sensor individually
- [ ] Test motor direction and speed control
- [ ] Verify I2C communication with BH1750
- [ ] Check rain sensor threshold adjustment
- [ ] Test WiFi connectivity
- [ ] Verify Firebase data transmission
- [ ] Test complete system integration

---

## Troubleshooting

**Motor not running:**
- Check 12V power supply
- Verify L298N connections
- Check GPIO pin assignments
- Ensure ENA jumper is removed and connected to GPIO 27

**Sensors not reading:**
- Verify power connections (3.3V/5V)
- Check I2C address for BH1750 (use I2C scanner)
- Verify DHT22 pull-up resistor
- Check GPIO pin numbers in code

**WiFi not connecting:**
- Verify SSID and password
- Check WiFi signal strength
- Ensure ESP32 is powered adequately (min 500mA)

