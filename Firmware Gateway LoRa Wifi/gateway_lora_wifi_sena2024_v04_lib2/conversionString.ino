String convertirDatosTH(String input) {

  // Crear un objeto JSON
  StaticJsonDocument<200> doc;

  // Separar el identificador "THL001"
  int firstComma = input.indexOf(',');

  // Si no hay comas, retorna vacío
  if (firstComma == -1) return "";

  // Asignar el ID al campo "i"
  doc["i"] = input.substring(0, firstComma);

  // Recorrer el resto de la cadena
  // Procesar los demás valores separados por comas
  int start = firstComma + 1;
  while (start < input.length()) {
    int nextComma = input.indexOf(',', start);

    // Si no hay más comas, tomamos el resto de la cadena
    String pair = (nextComma == -1) ? input.substring(start) : input.substring(start, nextComma);

    // Extraer la clave (primer carácter) y el valor (resto)
    String key = pair.substring(0, 1);
    float value = pair.substring(1).toFloat();

    // Agregar al JSON con dos decimales
    doc[key] = round(value * 100) / 100;

    // Mover al siguiente campo
    start = nextComma + 1;
    if (nextComma == -1) break;
  }

  String timeStamp = get_hora_rtc();
  if (error_fecha) {
    timeStamp = fec_internet;
  }
  doc["f"] = timeStamp;

  // Convertir JSON a string para devolver
  String output;
  serializeJson(doc, output);

  Serial.print("Convertido: ");
  Serial.println(output);
  return output;
}