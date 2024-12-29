/*
    Definición de pines
    IO4 - TXD - Hacia RX del E32
    IO5 - RXD - Hacia TX del E32
    IO2 - JP1 - M0
    IO3 - JP2 - M1
    IO6 - JP3 - AUX

    IO7 - LED DE ESTADO

    A0 - DT  DE HX-711
    A1 - SCK DE HX-711


    Pines libres
    IO9
    IO8
    A2
*/

//-- LIBRERÍAS --

// #include <SoftwareSerial.h>
#include "Arduino.h"
#include "LoRa_E32.h"
#include "DHT.h"
#include <Wire.h>
#include <LTR390.h>
#include "LowPower.h"


//-- CONSTANTES Y VARIABLES --

#define PIN_RX 5
#define PIN_TX 4
#define PIN_M0 2
#define PIN_M1 3
#define PIN_AX 6
#define PIN_LED 7
#define DHTPIN 9
#define DHTTYPE DHT11
#define VERSION "0.4"
#define B_MIN 2900
#define I2C_ADDRESS 0x53

#define SERIAL "THL003"

float h, t, l, u;

struct Message {
  char la_data[50];
} message;

DHT dht(DHTPIN, DHTTYPE);
LTR390 ltr390(I2C_ADDRESS);
LoRa_E32 e32ttl(PIN_RX, PIN_TX, PIN_AX, PIN_M0, PIN_M1);

//**********************************************************************************
//                                  SETUP
//**********************************************************************************

void setup() {

  Serial.begin(9600);
  Serial.print("\nSensor de ambiente SGPS 12515 V");
  Serial.println(VERSION);

  Wire.begin();
  if (!ltr390.init()) {
    Serial.println(F("Error sensor UV"));
  } else {
    Serial.println(F("Sensor uv ok"));
  }
  ltr390.setMode(LTR390_MODE_ALS);
  ltr390.setGain(LTR390_GAIN_3);
  Serial.print("Gain : ");
  switch (ltr390.getGain()) {
    case LTR390_GAIN_1: Serial.println(1); break;
    case LTR390_GAIN_3: Serial.println(3); break;
    case LTR390_GAIN_6: Serial.println(6); break;
    case LTR390_GAIN_9: Serial.println(9); break;
    case LTR390_GAIN_18: Serial.println(18); break;
  }

  ltr390.setResolution(LTR390_RESOLUTION_18BIT);
  Serial.print("Resolution : ");
  switch (ltr390.getResolution()) {
    case LTR390_RESOLUTION_13BIT: Serial.println(13); break;
    case LTR390_RESOLUTION_16BIT: Serial.println(16); break;
    case LTR390_RESOLUTION_17BIT: Serial.println(17); break;
    case LTR390_RESOLUTION_18BIT: Serial.println(18); break;
    case LTR390_RESOLUTION_19BIT: Serial.println(19); break;
    case LTR390_RESOLUTION_20BIT: Serial.println(20); break;
  }

  Serial.print(F("iniciando radio lora: "));
  Serial.println(e32ttl.begin());
  ResponseStructContainer c;
  c = e32ttl.getConfiguration();
  Configuration configuration = *(Configuration*)c.data;
  configuration.ADDL = 0x01;
  configuration.ADDH = 0x00;
  configuration.CHAN = 0x02;
  configuration.OPTION.fixedTransmission = FT_FIXED_TRANSMISSION;
  e32ttl.setConfiguration(configuration, WRITE_CFG_PWR_DWN_SAVE);
  //printParameters(configuration);
  c.close();

  //-- Declaración de pin LED
  pinMode(PIN_LED, OUTPUT);

  //-- Inicia Sensor TH --
  dht.begin();
}


//**********************************************************************************
//                                  LOOP
//**********************************************************************************

void loop() {

  t = dht.readTemperature();
  h = dht.readHumidity();

  String d = SERIAL;

  if (!isnan(h) && !isnan(t) && h > 0 && h <= 100 && t > -10 && t < 60) {
    d.concat(",h");
    d.concat(String(h, 1));
    d.concat(",t");
    d.concat(String(t, 1));
  }

  if (ltr390.newDataAvailable()) {
    l = ltr390.getLux();
    ltr390.setGain(LTR390_GAIN_18);
    ltr390.setResolution(LTR390_RESOLUTION_20BIT);
    ltr390.setMode(LTR390_MODE_UVS);
    if (l > 99999) l = 99999.0;
    // d.concat(",\"l\":");
    d.concat(",l");
    d.concat(String(l, 1));
    delay(1000);
  } else {
    Serial.println(F("no data disponible 1"));
  }

  if (ltr390.newDataAvailable()) {
    u = ltr390.getUVI();
    // d.concat(",\"u\":");
    d.concat(",u");
    d.concat(String(u, 2));
    ltr390.setMode(LTR390_MODE_ALS);
    ltr390.setGain(LTR390_GAIN_6);
    ltr390.setResolution(LTR390_RESOLUTION_18BIT);
  } else {
    Serial.println(F("no data disponible 2"));
  }

  byte bat = readVcc();
  d.concat(",b");
  d.concat(String(bat));

  d.toCharArray(message.la_data, 50);
  //Serial.println(d);
  Serial.println(message.la_data);

  ResponseStatus rs = e32ttl.sendFixedMessage(0, 3, 4, &message, sizeof(Message));

  digitalWrite(PIN_LED, HIGH);
  delay(100);
  digitalWrite(PIN_LED, LOW);
  //-- 150 ciclos de 8 segundos = 20 minutos entre transmisiones.
  for (byte i = 0; i < 230; i++) {
    LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
  }

  
}
