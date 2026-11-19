#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// 1 Cài đặt
#define DHT_PIN D1
#define LED1_PIN D2
#define LED2_PIN D3
#define LIGHT_PIN A0   // cảm biến ánh sáng (ESP8266 chỉ có 1 chân analog là A0)
const int ALERT_PIN[3] = {D5, D6, D7};

// Điền lại 6 giá trị cũ của bạn
const char* WIFI_SSID = "TEN_WIFI";
const char* WIFI_PASSWORD = "MAT_KHAU_WIFI";
const char* MQTT_SERVER = "IP_MAY_CHAY_MOSQUITTO";
const int MQTT_PORT = 1885;
const char* MQTT_USER = "TEN_MQTT";
const char* MQTT_PASSWORD = "MAT_KHAU_MQTT";

const char* SENSOR_TOPIC = "sensor_data";
const char* STATUS_TOPIC = "device_status";
const char* CONTROL_TOPIC = "device_control";
const int ALERT_MAX[3] = {11, 101, 1001};

DHT dht(DHT_PIN, DHT11);                  // (1) đưa ra ngoài
WiFiClient wifiClient;
PubSubClient client(wifiClient);

int dem = 1;
unsigned long lastSend = 0;               // (3) thêm
bool alert[3] = {false, false, false};
bool alertBlink[3] = {false, false, false};

void setup(){
    Serial.begin(115200);
    pinMode(LED1_PIN, OUTPUT);            // (5)
    pinMode(LED2_PIN, OUTPUT);
    for (int i = 0; i < 3; i++) pinMode(ALERT_PIN[i], OUTPUT);
    randomSeed(micros());
    dht.begin();

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) delay(500);

    client.setServer(MQTT_SERVER, MQTT_PORT);
    client.setCallback(onMessage);
}

void loop(){
    while(!client.connected()){           // (2)
        String clientId = "ESP8266-" + String(ESP.getChipId(), HEX);
        if(client.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)){
            client.subscribe(CONTROL_TOPIC);
        } else {
            delay(2000);
        }
    }
    client.loop();

    if(millis() - lastSend >= 300){
        lastSend = millis();
        dem++;

        // Nháy LED cảnh báo
        for(int i = 0; i < 3; i++){
            if(alert[i]){
                alertBlink[i] = !alertBlink[i];
            } else {
                alertBlink[i] = false;
            }
            digitalWrite(ALERT_PIN[i], alertBlink[i] ? HIGH : LOW);
        }

        // Gửi số đo cảm biến (10 x 300 ms = 3 giây)
        if(dem % 10 == 0){
            String json = "{\"temp\":" + String(dht.readTemperature(), 1);
            json += ",\"humid\":" + String(dht.readHumidity(), 1);
            json += ",\"light\":" + String(analogRead(LIGHT_PIN));   // số từ 0 đến 1023
            for(int i = 0; i < 3; i++){
                int value = random(0, ALERT_MAX[i] + 1);
                alert[i] = value * 2 > ALERT_MAX[i];
                json += ",\"s" + String(i + 1) + "\":" + String(value);
            }
            json += "}";
            dem = 0;
            client.publish(SENSOR_TOPIC, json.c_str());
        }
    }
}

void onMessage(char* topic, byte* payload, unsigned int length) {
  String command = "";
  for (unsigned int i = 0; i < length; i++) command += (char)payload[i];

  int led = command.charAt(3) - '0';   // "LED1_ON" → 1
  bool turnOn = command.endsWith("_ON");
  digitalWrite(led == 1 ? LED1_PIN : LED2_PIN, turnOn ? HIGH : LOW);

  client.publish(STATUS_TOPIC, ("ACK " + command).c_str());
}