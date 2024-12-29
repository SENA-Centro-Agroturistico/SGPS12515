byte readVcc() {
  ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  delay(2); // Wait for Vref to settle
  ADCSRA |= _BV(ADSC); // Start conversion
  while (bit_is_set(ADCSRA, ADSC)); // measuring
  uint8_t low = ADCL; // must read ADCL first - it then locks ADCH
  uint8_t high = ADCH; // unlocks both
  long result = (high << 8) | low;
  result = 1125300L / result; // Calculate Vcc (in mV); 1125300 = 1.1*1023*1000
  //---- Mapeando los valores maximos y minimos de operacion: 2900 es un minimo 3300 es un maximo
  if (result < B_MIN) result = B_MIN;
  if (result > 3300) result = 3300;
  //Serial.println(result);
  //----- convierte el rango de 2900mV-3400mV a 0% a 100%
  byte bateria = map(result, B_MIN, 3300, 0, 100);
  return bateria;
  //String voltaje = String(result);
  //return voltaje; // Vcc in millivolts
}

void parpadeo(byte veces, byte tiempo) {
  for (byte i = 0; i < veces; i++) {
    digitalWrite(PIN_LED, HIGH);
    delay(tiempo);
    digitalWrite(PIN_LED, LOW);
    delay(tiempo);
  }
}