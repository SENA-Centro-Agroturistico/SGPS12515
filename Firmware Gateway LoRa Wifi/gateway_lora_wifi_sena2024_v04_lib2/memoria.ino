void grabarEEPROM(int addr, String a) {
  int tamano = a.length();
  char inchar[50];
  a.toCharArray(inchar, tamano + 1);
  if (inchar[0] != 0) {
    for (int i = 0; i < tamano; i++) {
      EEPROM.write(addr + i, inchar[i]);
    }
    for (int i = tamano; i < 50; i++) {
      EEPROM.write(addr + i, 255);
    }
    EEPROM.commit();
  }
}

String leerEEPROM(int addr) {
  byte lectura;
  String strLectura;
  for (int i = addr; i < addr + 50; i++) {
    lectura = EEPROM.read(i);
    if (lectura != 255) {
      strLectura += (char)lectura;
    }
  }
  return strLectura;
}