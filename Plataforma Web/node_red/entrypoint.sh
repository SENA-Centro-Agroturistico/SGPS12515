#!/bin/sh
#!/bin/sh

echo "Iniciando el script de entrada..."

# Crear las carpetas si no existen
echo "Creando las carpetas necesarias..." && mkdir -p /data && mkdir -p /usr/src/node-red

# Cambiar al directorio de trabajo
echo "Cambiando al directorio /data..." && cd /data

# Instalar dependencias específicas de Node-RED
echo "Instalando dependencias específicas de Node-RED..." && npm install node-red@4.0.2 node-red-contrib-influxdb@~0.7.0 node-red-contrib-telegrambot@~16.0.2 node-red-dashboard@~3.6.5 @types/node

echo "Cambiando al directorio /usr/src/node-red..." && cd /usr/src/node-red

# Instalar express-rate-limit
echo "Instalando express-rate-limit..." && npm install express-rate-limit mongodb bcrypt && trap stop SIGINT SIGTERM

stop() {
    echo "Deteniendo el proceso..."
    kill $CHILD_PID
    wait $CHILD_PID
}

echo "Iniciando Node-RED..." && /usr/local/bin/node $NODE_OPTIONS node_modules/node-red/red.js --userDir /data $FLOWS "${@}" & CHILD_PID="$!" && wait "${CHILD_PID}"