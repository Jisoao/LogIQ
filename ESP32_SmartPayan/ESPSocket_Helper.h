#ifndef ESPSOCKET_HELPER_H
#define ESPSOCKET_HELPER_H

#include <WiFi.h>

class WiFiHelper {
  private:
    const char* _wifiSSID;
    const char* _wifiPSWD;
    IPAddress _ipAddress;
    IPAddress _gateWay;
    IPAddress _subnetMask;
    IPAddress _dnsServer1;
    IPAddress _dnsServer2;

  public:
    bool isAPCreated = false;
    
    WiFiHelper();
    int begin(const char* wifiSSID);
    int begin(const char* wifiSSID, const char* wifiPSWD);
    void config(IPAddress localIp, IPAddress initGateway, IPAddress initSubnet, IPAddress initDns1, IPAddress initDns2);
    void config(IPAddress localIp, IPAddress initDns);
    bool isConnected();
    void connectWiFi();
    int disconnect(bool wifiOff = false, bool eraseAp = false, unsigned long timeoutLength = 0);
    IPAddress getLocalIP();
    IPAddress getSubnetMask();
    IPAddress getGateway();
    bool setMode(wifi_mode_t mode);
    bool createAP(const char *ssid, const char *passphrase = NULL, int channel = 1, int ssid_hidden = 0, 
                  int max_connection = 4, bool ftm_responder = false, wifi_auth_mode_t auth_mode = WIFI_AUTH_WPA2_PSK, 
                  wifi_cipher_type_t cipher = WIFI_CIPHER_TYPE_CCMP);
    bool softAPConfig(IPAddress local_ip, IPAddress gateway, IPAddress subnet, IPAddress dhcp_lease_start = INADDR_NONE, IPAddress dns = INADDR_NONE);
    String softAPSSID();
    IPAddress softAPIP();
    IPAddress softAPBroadcastIP();
    IPAddress softAPNetworkID();
    IPAddress softAPSubnetMask();
    uint8_t softAPSubnetCIDR();
    String softAPmacAddress();
    bool softAPdisconnect(bool wifioff = false);
};

class ESPTCPServer {
  private:
    uint16_t _serverPort;
    WiFiServer _server = WiFiServer(80);
    WiFiClient _tcpClient;
    String _recvData;

  public:
    ESPTCPServer(uint16_t initPort);
    void startServer();
    bool ScanClient();
    int send(String cmdToSend);
    String receive();
    void stopClient();
};

class ESPTCPClient {
  private:
    WiFiClient _tcpClient;
    String _recvData;

  public:
    int connect(IPAddress serverIP, uint16_t serverPort);
    int connect(const char *serverHost, uint16_t serverPort);
    bool isConnected();
    int send(String cmdToSend);
    String receive();
    void stopClient();
};

#endif
