
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
#include <HX711.h>
#include "LowPower.h"
#include <EEPROM.h>

//-- CONSTANTES Y VARIABLES --

#define PIN_RX 5
#define PIN_TX 4
#define PIN_M0 2
#define PIN_M1 3
#define PIN_AX 6
#define PIN_LED 7
#define VERSION "0.8"
#define PIN_DT A0
#define PIN_SCK A1
#define PIN_CFG 9

#define ESCALA 2026.11
#define OFFSET -918401
#define B_MIN 2900

#define SERIAL "BAL002"

#define EE_OFFSET_50 0
#define EE_ESCALA_50 50

float offset;
float escala;
bool tare_done;
float masa;
bool sin_calibracion = false;

struct Message {
  char la_data[50];
} message;

HX711 scale;
LoRa_E32 e32ttl(PIN_RX, PIN_TX, PIN_AX, PIN_M0, PIN_M1);

//**********************************************************************************
//                                  SETUP
//**********************************************************************************

void setup() {

  Serial.begin(9600);
  Serial.print("\nBascula IoT SGPS 12515 V");
  Serial.println(VERSION);

  //-- inicia input --
  pinMode(PIN_CFG, INPUT_PULLUP);

  //-- inicia báscula --
  scale.begin(PIN_DT, PIN_SCK);

  //-- inicia radio LoRa --
  e32ttl.begin();
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

  byte lectura_escala;
  String strLectura_escala;
  for (int i = EE_ESCALA_50; i < EE_ESCALA_50 + 50; i++) {
    lectura_escala = EEPROM.read(i);
    if (lectura_escala != 255) {
      strLectura_escala += (char)lectura_escala;
    }
  }
  escala = strLectura_escala.toFloat();

  if (escala != 0) {
    scale.set_scale(escala);
    //scale.tare();
    Serial.print("ESCALA almacenada: ");
    Serial.println(escala);
  } else {
    Serial.print("BÁSCULA SIN CALIBRACIÓN");
    sin_calibracion = true;
    scale.set_scale(ESCALA);
  }

  //-- leyendo OFFSET desde EEPROM --
  byte lectura;
  String strLectura;
  for (int i = EE_OFFSET_50; i < EE_OFFSET_50 + 50; i++) {
    lectura = EEPROM.read(i);
    if (lectura != 255) {
      strLectura += (char)lectura;
    }
  }
  offset = strLectura.toFloat();

  if (offset != 0) {
    scale.set_offset(offset);
    Serial.print("OFFSET almacenado: ");
    Serial.println(offset);
  } else {
    offset = scale.get_offset();
    Serial.print("SIN OFFSET: ");
    Serial.println(offset);
  }

  //Serial.println(scale.read());
  tare_done = false;
}

//**********************************************************************************
//                                  LOOP
//**********************************************************************************

void loop() {
  if (!sin_calibracion) {

    byte modo_inicial = digitalRead(PIN_CFG);
    if (modo_inicial) {
      if (!tare_done) {
        long suma_offset = 0;
        for (byte i = 0; i < 5; i++) {
          suma_offset += scale.read_average(20);
          //scale.tare();
          parpadeo(2, 100);
          Serial.println(".");
          if (i == 4) {
            Serial.println();
            offset = suma_offset / 5;
            Serial.print("Nuevo offset: ");
            Serial.println(offset);
            scale.set_offset(offset);
            //-- Guardando el nuevo offset en memoria --
            String offset_guardar = String(offset);
            byte long_offset = offset_guardar.length();
            char inchar[50];
            offset_guardar.toCharArray(inchar, long_offset + 1);
            if (inchar[0] != 0) {
              for (int i = 0; i < long_offset; i++) {
                EEPROM.write(EE_OFFSET_50 + i, inchar[i]);
              }
              for (int i = long_offset; i < 50; i++) {
                EEPROM.write(EE_OFFSET_50 + i, 255);
              }
            }
            Serial.println("Offset almacenado con éxito");
            tare_done = true;
          }
        }
      } else {
        //tare_done = true;
        digitalWrite(PIN_LED, HIGH);
      }
    } else {
      //-- funcionamiento normal --
      masa = scale.get_units(20);
      byte bat = readVcc();


      if (masa < 2) {
        masa = 0.0;
        //scale.tare();
        scale.set_offset(offset);
      }
      digitalWrite(PIN_LED, LOW);
      tare_done = false;

      String d = SERIAL;
      d.concat(",m");
      d.concat(String(masa, 0));
      d.concat(",b");
      d.concat(String(bat));

      d.toCharArray(message.la_data, 50);

      Serial.print(F("Enviado: "));
      Serial.println(message.la_data);

      ResponseStatus rs = e32ttl.sendFixedMessage(0, 3, 4, &message, sizeof(Message));
      parpadeo(1, 100);
      scale.power_down();
      //-- 230 ciclos son aproximadamente 20 minutos.
      for (byte i = 0; i < 230; i++) {
        LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
        delay(100);
        if (modo_inicial) {
          break;
        }
      }
      scale.power_up();
      delay(100);
    }
  } else {
    parpadeo(10, 50);
  }




  // float masa = scale.get_units(20);
  // byte bat = readVcc();

  // Serial.println(scale.read());
  // Serial.println(scale.get_offset());

  // if (masa < 0) {
  //   masa = 0.0;
  //   //scale.tare();
  //   scale.set_offset(OFFSET);
  // }

  // String d = "BAL002,m";
  // d.concat(String(masa, 0));
  // d.concat(",b");
  // d.concat(String(bat));

  // d.toCharArray(message.la_data, 50);

  // Serial.print(F("Enviado: "));
  // Serial.println(message.la_data);

  // ResponseStatus rs = e32ttl.sendFixedMessage(0, 3, 4, &message, sizeof(Message));

  // digitalWrite(PIN_LED, HIGH);
  // delay(100);
  // digitalWrite(PIN_LED, LOW);
  // for (byte i = 0; i < 150; i++) {
  //   LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
  // }
}
