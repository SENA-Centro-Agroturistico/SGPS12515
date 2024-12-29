#include "HX711.h"
#include <EEPROM.h>

#define PIN_DT A0
#define PIN_SCK A1

#define EE_OFFSET_50 0
#define EE_ESCALA_50 50

float peso_conocido = 147;
float escala;
byte contador_intentos = 0;
long suma_offset = 0;
float array_escalas[21];

float sum_escala;
float escala_promedio;


HX711 scale;

void setup() {
  Serial.begin(9600);
  Serial.println(F("\nPruebas iniciales báscula"));
  scale.begin(PIN_DT, PIN_SCK);
  for (byte j = 0; j < 5; j++) {
    delay(50);
    if (scale.is_ready()) {
      scale.set_scale();
      scale.tare(10);
      break;
    }
  }
}

void loop() {
  if (scale.is_ready()) {
    //**************************************************************************************
    //**************************************************************************************
    //**************************************************************************************
    //**************************************************************************************
    Serial.println("\n\n************************************");
    Serial.print(F("UBIQUE PESO CONOCIDO"));
    for (byte i = 0; i < 8; i++) {
      Serial.print(F("."));
      delay(1000);
    }
    Serial.println();
    long reading = scale.get_value(20);
    Serial.print("\nResultado lectura: ");
    Serial.println(reading);
    escala = reading / peso_conocido;
    Serial.print(F("Escala: "));
    Serial.println(escala);
    delay(1000);

    //**************************************************************************************
    //**************************************************************************************
    //**************************************************************************************
    //**************************************************************************************

    Serial.println(F("\nRetire el peso conocido"));
    Serial.print(F("Tarando báscula"));
    for (byte i = 0; i < 7; i++) {
      Serial.print(F("."));
      delay(1000);
    }
    scale.tare(10);
    Serial.println();
    //-- lectura del ADC del HX711 (promedio de 20 lecturas);
    long lectura_offset = scale.read_average(20);
    suma_offset += lectura_offset;
    Serial.print("Offset leído: ");
    Serial.println(lectura_offset);



    array_escalas[contador_intentos] = escala;
    contador_intentos++;
    Serial.print("Ciclo número: ");
    Serial.println(contador_intentos);

    //**************************************************************************************
    //**************************************************************************************
    //**************************************************************************************
    //**************************************************************************************


    if (contador_intentos == 10) {
      sum_escala = 0;
      for (byte i = 0; i < 10; i++) {
        sum_escala += array_escalas[i];
      }
      escala_promedio = sum_escala / 10;
      float offset_prom = suma_offset / 10;
      Serial.println("**********************************");
      Serial.print("ESCALA PROMEDIO: ");
      Serial.println(escala_promedio);
      Serial.println("**********************************");
      Serial.print("OFFSET PROMEDIO: ");
      Serial.println(offset_prom);
      Serial.println("**********************************");
      Serial.println("");

      //-- Guardando la nueva escala en memoria --
      String escala_guardar = String(escala_promedio);
      byte long_escala = escala_guardar.length();
      char inchar[50];
      escala_guardar.toCharArray(inchar, long_escala + 1);
      if (inchar[0] != 0) {
        for (int i = 0; i < long_escala; i++) {
          EEPROM.write(EE_ESCALA_50 + i, inchar[i]);
        }
        for (int i = long_escala; i < 50; i++) {
          EEPROM.write(EE_ESCALA_50 + i, 255);
        }
      }

      //-- Guardando el nuevo offset --

      String offset_guardar = String(offset_prom);
      byte long_offset = offset_guardar.length();
      char inchar2[50];
      offset_guardar.toCharArray(inchar2, long_offset + 1);
      if (inchar2[0] != 0) {
        for (int i = 0; i < long_offset; i++) {
          EEPROM.write(EE_OFFSET_50 + i, inchar2[i]);
        }
        for (int i = long_offset; i < 50; i++) {
          EEPROM.write(EE_OFFSET_50 + i, 255);
        }
      }

      delay(520000);

      contador_intentos = 0;
      sum_escala = 0;
    }


  } else {
    Serial.println("HX711 no encontrado");
  }
  delay(1000);
}
