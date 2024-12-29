//-- FUNCIONES DE MANEJO DE PÁGINA WEB --
void paginaConfig() {
  //Serial.println("paginaConfig");
  server.send(200, "text/html", pagina + mensaje + paginafin);
}

void guardarConfig() {
  //Serial.println("guardarConfig");
  Serial.println(server.arg("s"));
  Serial.println(server.arg("p"));
  grabarEEPROM(E_NOM_WIFI, server.arg("s"));
  grabarEEPROM(E_PASS_WIFI, server.arg("p"));
  mensaje = "Configuracion Guardada... Reiniciando";
  delay(50);
  paginaConfig();
  delay(1500);
  ESP.reset();
  delay(100);
}

void escanear() {
  //Serial.println("escanear");
  //mensaje = "Buscando redes... Un momento por favor";
  //paginaConfig();
  int n = WiFi.scanNetworks();
  Serial.println(F("Escaneo terminado"));
  mensaje = "";
  if (n == 0) {
    Serial.println("No se encontraron redes inalámbricas");
    mensaje = "No se encontraron redes inalámbricas";
  } else {
    Serial.print(n);
    Serial.println(F(" Redes inalámbricas encontradas"));
    mensaje = "<p>Redes encontradas</p><br>";
    /*if (n > 10) {
      n = 10;
    }*/
    for (int i = 0; i < n; i++) {
      if (WiFi.RSSI(i) > -80) {
        mensaje = mensaje + "<div style='margin-bottom: 10px;'><a href='#' onclick='c(this)' data-ssid='" + WiFi.SSID(i) + "'>" + WiFi.SSID(i) + " (" + WiFi.RSSI(i) + " dBm)</a></div>";
        delay(10);
      }
      // agrega al STRING "mensaje" la información de las redes encontradas
      //mensaje = (mensaje) + "<p>" + String(i + 1) + ": " + WiFi.SSID(i) + " (" + WiFi.RSSI(i) + ") </p> \r\n";
    }
  }
  paginaConfig();
}

void handle_NotFound() {
  Serial.println("handle_NotFound");
  //server.send(404, "text/plain", "Not found");
}

void handleCaptivePortal() {
  if (!isCaptivePortal()) {
    return;
  }
  server.sendHeader("Location", String("http://") + toStringIp(server.client().localIP()), true);
  server.send(302, "text/html", "");
  server.client().stop();
}

bool isCaptivePortal() {
  String host = server.hostHeader();
  if (!host.equals("daimob.local")) {
    return true;
  }
  return false;
}

// Convierte la IP a String
String toStringIp(IPAddress ip) {
  String res = "";
  for (int i = 0; i < 4; i++) {
    res += String(ip[i]);
    if (i < 3) res += ".";
  }
  return res;
}