String get_hora_rtc() {
  // Serial.println(F("Consultando RTC"));
  //-- Formato "2024-09-05T23:09:46-0500" - YYYY-MM-DDThh:mm:ss-0500
  DateTime now = rtc.now();
  //-- Año --
  anio_ = now.year();
  //-- Mes --
  mes_ = now.month();
  String sMes_ = ceros_c(mes_);
  //-- Día --
  dia_ = now.day();
  String sDia_ = ceros_c(dia_);
  //-- Hora --
  hora_ = now.hour();
  String sHora_ = ceros_c(hora_);
  //-- Minuto --
  min_ = now.minute();
  String sMin_ = ceros_c(min_);
  //-- Segundo --
  seg_ = now.second();
  String sSeg_ = ceros_c(seg_);

  String fecha = String(anio_) + "-" + sMes_ + "-" + sDia_ + "T" + sHora_ + ":" + sMin_ + ":" + sSeg_ + "-0500";
  //Serial.println(fecha);

  //-- Verificación --
  if (anio_ > 2034 || anio_ < 2024) {
    Serial.println(F("Error fecha"));

    if (WiFi.status() == WL_CONNECTED) {
      fecha_internet();
    }

    return "2000-01-01T00:00:00-0500";
  } else {
    error_fecha = false;
  }
  return fecha;
}

String ceros_c(int a) {
  String b = String(a);
  if (a < 10) {
    b = "0" + b;
  }
  return b;
}

void fecha_internet() {
  // formato esperado: 2023,11,20,15,34,02
  Serial.println(F("Consultando hora internet"));
  HTTPClient http;
  http.begin(espClient, "http://hora.secadodecafe.online:2000");
  http.addHeader("Content-Type", "text/plain");
  int httpResponseCode = http.GET();
  if (httpResponseCode == 200) {
    //Serial.print("HTTP Response code: ");
    //Serial.println(httpResponseCode);
    String payload = http.getString();
    Serial.println(payload);
    DateTime now = rtc.now();
    int year_i = payload.substring(0, 4).toInt();
    int hora_i = payload.substring(11, 13).toInt();
    int min_i = payload.substring(14, 16).toInt();
    int mes_i = payload.substring(5, 7).toInt();
    int dia_i = payload.substring(8, 10).toInt();
    int seg_i = payload.substring(17).toInt();
    if ((anio_ != year_i) || (hora_ != hora_i) || (min_ > min_i + 2) || (min_ < min_i - 2)) {
      Serial.println(F("Actualizando RTC"));
      rtc.adjust(DateTime(year_i, mes_i, dia_i, hora_i, min_i, seg_i));
      //error_year = false;
      if (error_fecha) {
        String smes_i = ceros_c(mes_i);
        String sdia_i = ceros_c(dia_i);
        String shora_i = ceros_c(hora_i);
        String smin_i= ceros_c(min_i);
        String sseg_i = ceros_c(seg_i);
        fec_internet = String(year_i) + "-" + String(smes_i) + "-" + String(sdia_i) + "T" + String(shora_i) + ":" + String(smin_i) + ":" + String(sseg_i) + "-0500";
      }
    } else {
      Serial.println(F("No se requiere actualización"));
    }
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  http.end();

  if (WiFi.status() == WL_CONNECTED) {
    reconnect();
  }
}