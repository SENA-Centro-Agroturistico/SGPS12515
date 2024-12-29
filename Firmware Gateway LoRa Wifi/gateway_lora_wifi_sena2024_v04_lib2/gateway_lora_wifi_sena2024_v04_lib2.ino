/*
    Definición de pines: 
    GPIO4 - RXD - Hacia TX del E32
    GPIO5 - TXD - Hacía RX del E32
    GPIO14 - JP1 - M0
    GPIO12 - JP2 - M1
    GPIO02 - JP3 - AUX
    GPIO13 - PULSO DE CONFIGURACIÓN CON RESISTENCIA DE PULLUP
    GPIO15 - LED DE ESTADO
*/

//-- LIBRERÍAS --
//-- LoRa --
#include "Arduino.h"
#include "LoRa_E32.h"
//-- Wifi --
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266mDNS.h>
//-- MQTT --
#include <PubSubClient.h>
//-- Manejo del tiempo --
#include <TimeLib.h>
#include <Wire.h>
#include "RTClib.h"
//-- Memoria EEPROM --
#include <EEPROM.h>
#include <ArduinoJson.h>

//-- CONSTANTES Y VARIABLES --
#define PIN_RXD 4  //-- hacia TXD del E32
#define PIN_TXD 5  //-- hacia RXD del E32
#define PIN_LED 15
#define PIN_AX 2
#define PIN_CONFIG 13
#define VERSION "0.4"

#define PIN_SDA 12
#define PIN_SCL 14

//-- Definición de posiciones en memoria (Se asumen 50 caracteres por variable) --
#define E_NOM_WIFI 0
#define E_PASS_WIFI 50
#define E_SERVIDOR_MQTT 100
#define E_USUARIO_MQTT 150
#define E_PASS_MQTT 200
#define E_TOPIC 250

#define TOPIC_BA "senaiot/bascula"
#define TOPIC_TH "senaiot/termohigrometro"
#define TOPIC_ALIVE "senaiot/gateways"

//-- Tiempo máximo para configuración de red wifi (3 min) --
#define tMaxConfigWifi 180000

//-- Variables Wifi --
char nom_wifi[50];
char pass_wifi[50];

//-- Variables MQTT --
char servidor_mqtt[50] = "mqtt.secadodecafe.online";
// IPAddress mqttIP(168, 227, 126, 18);

char usuario_mqtt[50];
char pass_mqtt[50];
char topic[50];
int puerto_mqtt;

bool envio_inicial = false;

//-- Variables medición batería --
ADC_MODE(ADC_VCC);
float voltaje;
bool bat_baja = false;

bool error_fecha = false;

String fec_internet;

//-- Variables de tiempo --
int anio_, mes_, dia_, hora_, min_, seg_;

unsigned long t_verifica_wifi;
unsigned long t_parpadeo;
unsigned long t_reset_esp;
unsigned long wifiConfigMillis;

//-- Variable de configuración --
byte cont_config = 0;

//-- Variable (estructura) que llega de los sensores
String la_data;

//-- Variables de la página web --
String pagina = "<!DOCTYPE html>"
                "<html>"
                "<head>"
                "<title>Configuración WiFi</title>"
                "<meta charset='UTF-8'>"
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                "<style>body{text-align:center;font-family:verdana}a:link,a:visited,a:active {text-decoration: none;font-weight: bold;}.input1{padding-left:5px;border:1px solid #F5821F;height:25px;width:100%;border-radius:7px;margin:15px 0}.btn{border:0;border-radius:.3rem;background-color:#F5821F;color:#fff;line-height:2.4rem;font-size:1.2rem;width:100%;margin-top:30px}.container{text-align:left;display:inline-block;min-width:260px;padding:10px;margin:0 10%}.header{text-align:center}</style>"
                "<script>function c(l) {document.getElementById('s').value = l.getAttribute('data-ssid') || l.innerText || l.textContent;document.getElementById('p').value = '';};function f() { var x = document.getElementById('p'); x.type === 'password' ? x.type = 'text' : x.type = 'password'; }</script>"
                "</head>"
                "<body>"
                "<div class='header'>"
                "<h2>Configuración WIFI</h2>"
                // "<h3>Daimob</h3>"
                "<h3>SENA - SGPS12515</h3>"
                "<a class='escanear' href='escanear'>Encontrar redes</a>"
                "</div>"
                "<div class='container'>"
                "<form action='guardarConfig' method='get' novalidate>"
                "SSID:"
                "<input class='input1' autocorrect='off' autocapitalize='none' id='s' name='s' type='text' maxlength='45'>"
                "Password:"
                "<input class='input1' autocorrect='off' autocapitalize='none' id='p' name='p' type='text' maxlength='45'>"
                //"<input type='checkbox' onclick='f()'> Mostrar contraseña"
                "<input style='margin-bottom: 15px;' class='btn' type='submit' value='GUARDAR' />"
                "</form>";

String paginafin = "</div>"
                   "</body>"
                   "</html>";

String mensaje = "";

String fpagina() {
  return pagina;
}
String fpaginafin() {
  return paginafin;
}

//-- Direcciones para Página web --
IPAddress local_ip(192, 168, 1, 1);
IPAddress ip_gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);

//-- DECLARACIONES --
ESP8266WebServer server(80);
WiFiClient espClient;
PubSubClient client(espClient);
RTC_DS1307 rtc;
LoRa_E32 e32ttl(PIN_RXD, PIN_TXD);

//**********************************************************************************
//                                  SETUP
//**********************************************************************************
void setup() {
  Serial.begin(9600);
  Serial.print(F("\nGateway LoRa/Wifi SGPS-12515 LIB2 V "));
  Serial.println(VERSION);

  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_CONFIG, INPUT_PULLUP);

  //-- Inicia el transceiver --
  e32ttl.begin();
  //-- Define tamaño memoria EEPROM --
  EEPROM.begin(512);
  //-- Inicia protocolo I2C para uso de RTC --
  Wire.begin(PIN_SDA, PIN_SCL);

  if (!rtc.begin()) {
    Serial.println(F("ESP no encuentra RTC"));
  } else {
    Serial.println(F("RTC ok ESP"));
  }

  if (!rtc.isrunning()) {
    Serial.println(F("RTC no funciona!"));
    error_fecha = true;
  } else {
    Serial.println(F("RTC en funcionamiento"));
    delay(100);
    Serial.println(get_hora_rtc());
  }

  String s_nom_wifi, s_pass_wifi;

  s_nom_wifi = leerEEPROM(E_NOM_WIFI);
  if (s_nom_wifi.length() < 3) {
    s_nom_wifi = "senawifi";
  }

  s_pass_wifi = leerEEPROM(E_PASS_WIFI);
  if (s_pass_wifi.length() < 3) {
    s_pass_wifi = "senawifi1234";
  }

  String s_servidor_mqtt = "mqtt.secadodecafe.online";
  //String s_topic = "senaiot/sgps12515";
  String s_usuario_mqtt = "mosquitto";
  String s_pass_mqtt = "mosquitto";

  s_nom_wifi.toCharArray(nom_wifi, 50);
  s_pass_wifi.toCharArray(pass_wifi, 50);
  //s_servidor_mqtt.toCharArray(servidor_mqtt, 50);
  s_usuario_mqtt.toCharArray(usuario_mqtt, 50);
  s_pass_mqtt.toCharArray(pass_mqtt, 50);
  //s_topic.toCharArray(topic, 50);
  puerto_mqtt = 1603;

  Serial.print(F("servidor_mqtt: "));
  Serial.println(servidor_mqtt);
  Serial.print(F("nom_wifi: "));
  Serial.println(nom_wifi);
  Serial.print(F("pass_wifi: "));
  Serial.println(pass_wifi);
  Serial.print(F("usuario_mqtt: "));
  Serial.println(usuario_mqtt);
  Serial.print(F("pass_mqtt: "));
  Serial.println(pass_mqtt);
  //Serial.print(F("topic: "));
  //Serial.println(topic);
  Serial.print(F("puerto_mqtt: "));
  Serial.println(puerto_mqtt);

  client.setServer(servidor_mqtt, puerto_mqtt);

  buscar_redes_wifi();

  /*if (WiFi.status() == WL_CONNECTED) {
    reconnect();
  }*/

  t_parpadeo = millis();
  t_verifica_wifi = millis();
  wifiConfigMillis = millis();
}

//**********************************************************************************
//                                  LOOP
//**********************************************************************************

void loop() {

  client.loop();

  //-- INDICADOR --
  if (millis() - t_parpadeo > 3000) {
    if (digitalRead(PIN_CONFIG)) {
      cont_config++;
    } else {
      cont_config = 0;
    }

    if (cont_config == 2) {
      digitalWrite(PIN_LED, HIGH);
      //Serial.println("AQUÍ INICIA LA PÁGINA WEB");
      // Configuración del WiFi en modo AP (Access Point)
      WiFi.softAPConfig(local_ip, ip_gateway, subnet);
      WiFi.softAP("senaWIFI");

      // Inicialización del mDNS para ingresar daimob.local
      if (MDNS.begin("sena")) {
        //Serial.println("MDNS responder started");
      } else {
        Serial.println("error MDNS");
      }
      //-- Carga página web ---
      server.on("/", paginaConfig);
      server.on("/guardarConfig", guardarConfig);
      server.on("/escanear", escanear);
      //server.onNotFound(handle_NotFound);
      server.onNotFound(handleCaptivePortal);
      server.begin();
      Serial.println("HTTP server iniciado");
      // Añadir servicio mDNS
      MDNS.addService("http", "tcp", 80);

      wifiConfigMillis = millis();
      while (millis() - wifiConfigMillis < tMaxConfigWifi) {
        //-- tiene 3 minutos para configurar, luego sale.
        server.handleClient();
        MDNS.update();
      }
    }
    if (WiFi.status() == WL_CONNECTED) {
      parpadeo(1);
    } else {
      parpadeo(2);
    }
    t_parpadeo = millis();
  }

  //-- CONEXIÓN WIFI Y MQTT --
  if (millis() - t_verifica_wifi > 60000) {
    if ((WiFi.status() != WL_CONNECTED)) {
      //-- No está conectado a red wifi --
      buscar_redes_wifi();
    } else {
      //-- Si está conectado a Wifi se verifica que está conectado a MQTT
      if (!client.connected()) {
        Serial.println(F("Sin conexión a MQTT"));
        reconnect();
      }
    }
    t_verifica_wifi = millis();
  }

  //-- RECEPCIÓN DE DATOS --
  ResponseContainer rs = e32ttl.receiveMessage();
  if (rs.status.code == 1) {
    String datos_rec = rs.data;
    int longitud_datos = datos_rec.length();
    if (longitud_datos > 9) {
      if (client.connected()) {
        String sTopic;
        String dataConvert;
        Serial.print(F("\nRecibido: "));
        Serial.println(datos_rec);
        dataConvert = datos_rec;

        if (dataConvert.startsWith("TH")) {
          datos_rec = convertirDatosTH(dataConvert);
          sTopic = "senaiot/termohigrometro";
          sTopic.toCharArray(topic, 50);
          client.publish(topic, datos_rec.c_str());
          parpadeo(2);
        } else if (dataConvert.startsWith("BA")) {
          datos_rec = convertirDatosTH(dataConvert);
          sTopic = "senaiot/bascula";
          sTopic.toCharArray(topic, 50);
          client.publish(topic, datos_rec.c_str());
          parpadeo(2);
        } else if (dataConvert.charAt(0) == '{' && dataConvert.charAt(dataConvert.length() - 1 == '}')) {
          //-- verifica que sea un JSON válido --
          StaticJsonDocument<200> doc1;
          DeserializationError error1 = deserializeJson(doc1, dataConvert);
          if (!error1) {
            //-- es json valido --
            sTopic = "senaiot/json";
            sTopic.toCharArray(topic, 50);
            client.publish(topic, dataConvert.c_str());
            parpadeo(2);
          } else {
            Serial.println("JSON no válido");
          }
        }
      } else {
        Serial.println(F("Sin conexión MQTT"));
        parpadeo(3);
      }
    }
  }
  delay(100);
}


void parpadeo(byte veces) {
  for (byte i = 0; i < veces; i++) {
    digitalWrite(PIN_LED, HIGH);
    delay(50);
    digitalWrite(PIN_LED, LOW);
    delay(50);
  }
}