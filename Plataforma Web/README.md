
# Monitoreo IoT SENA

    Una herramienta para mejorar la calidad de la producción de café mediante el cálculo preciso de la humedad en el proceso de secado solar.

## Instalación

    Para instalar este proyecto en un entorno Linux, sigue estos pasos:

**1. Instalar git en el servidor:**

    ```bash
    sudo apt-get update
    sudo apt-get install git
    ```

**2. Iniciar sesión en github**

**3. Clonar el repositorio en el server**

    ```bash
    git clone https://github.com/Jorge1825/Monitoreo_IoT_SENA.git
    ```

**4. Instalar docker en el server**

    ```bash
    sudo apt-get update
    sudo apt-get install docker.io
    ```

**5. Ejecutar el script de instalación**

    ```bash
    cd Monitoreo_IoT_SENA
    sudo bash config_initial.sh
    ```

**6. Configurar el archivo .env**

    Se debe configurar el archivo .env tanto de la api, front y archivo .env general. Podra encontrar un archivo de ejemplo en la carpeta de cada uno de los proyectos.


**7. Levantar los contenedores**

    ```bash
    sudo docker compose up --build -d
    ```

**8. Acceder a la aplicación de node-red**
    
    ``` URLSERVER:1700 ```

    Acceder a la aplicación de node-red usando las credenciales configuradas en init de la base de datos.
    Configurar el nodo de mqtt.
    Configurar los datos del bot de telegram.
    Configurar la api y credenciales del bot de whatsapp.
    Configurar el nodo de base de datos de influxdb.
    Guardar los cambios y desplegar.

**9. Escanear el código QR de la api de whatsapp**

    Escanear el código QR de la api de whatsapp para poder recibir mensajes.
    
    Para ver el qr de nuevo, usar el comando:
    ```bash
    docker compose logs -f
    ```

    Usando whatsapp escanear el código QR que se muestra en la terminal como si fuese agregar un nuevo dispositivo.

**10. Acceder a la aplicación de front**

    ``` URLSERVER:4000 ```


## Uso

Ingresar a la url cuando los contenedores estén corriendo

Dominio: https://secadodecafe.online

Frontend: http://165.227.126.18:5173

Backend: http://165.227.126.18:4000



