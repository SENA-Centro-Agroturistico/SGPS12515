void buscar_redes_wifi() {
  //-- Conexión a red wifi
  //-- Verificación de redes wifi disponibles
  int cant_redes = WiFi.scanNetworks();
  if (cant_redes > 0) {
    Serial.print(cant_redes);
    Serial.println(F(" redes encontradas"));
    for (int i = 0; i < cant_redes; i++) {
      String nombre_red_actual = WiFi.SSID(i);
      //-- Comparando con red almacenada --
      if (nombre_red_actual.equals(String(nom_wifi))) {
        i = cant_redes;
        WiFi.mode(WIFI_STA);
        delay(10);
        int long tiempo_max = millis();
        Serial.print(F("\nConectando con "));
        Serial.println(nom_wifi);
        WiFi.begin(nom_wifi, pass_wifi);
        while ((WiFi.status() != WL_CONNECTED) && (millis() - tiempo_max < 15000)) {
          Serial.print(F("."));
          parpadeo(1);
        }
        if (WiFi.status() == WL_CONNECTED) {
          Serial.println(F("Conectando ok"));
          delay(500);
          WiFi.setAutoReconnect(true);
          WiFi.persistent(true);
          fecha_internet();
        } else {
          Serial.println(F("Error conexión"));
        }
      }
    }
  } else {
    Serial.println(F("no se encontraron redes Wifi"));
  }
}

void reconnect() {
  Serial.println(F("Reconnect..."));
  byte intentos = 2;
  char id_mqtt[50];
  for (byte i = 0; i < intentos; i++) {
    String clientId = "SGPS12515-";
    clientId += String(random(0xffff), HEX);
    clientId.toCharArray(id_mqtt, 50);
    //Serial.print(F("id_mqtt: "));
    //Serial.println(id_mqtt);
    if (client.connect(id_mqtt, usuario_mqtt, pass_mqtt)) {
      // if (client.connect(id_mqtt)) {
      Serial.println("conectado MQTT");
      if (!envio_inicial) {
        String datos_ini = "{\"i\":\"GATEWAY_SENA_004\"}";
        Serial.println(datos_ini);
        client.publish(TOPIC_ALIVE, datos_ini.c_str());
        parpadeo(2);
        envio_inicial = true;
      }

      i = intentos;
      break;
    } else {
      Serial.print("Fallo MQTT, rc=");
      Serial.print(client.state());
      Serial.println(" intentando en 3s");
      delay(3000);
    }
  }
}