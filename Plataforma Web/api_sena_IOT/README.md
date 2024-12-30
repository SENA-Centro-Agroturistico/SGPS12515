# API SENA IoT

API para realizar consultas de los datos recibidos por los sensores y la gestión de usuarios del sistema.
## Instalación
Ya estando dentro de la carpeta de Monitoreo_IoT_SENA. Para instalar este proyecto, sigue estos pasos:

**1. Entrar a la carpeta de la api**

```bash
cd api_sena_IOT
```

**2. Construir imagen**
```bash
sudo docker build -t monitoreio_iot_sena-api:v1 .
```

**3. Ejecutar como un contenedor**
```bash
sudo docker run -d --name api -p 4000:4000 monitoreio_iot_sena-api:v1
```

## Uso
Consumir api con la siguiente url

http://165.227.126.18:4000/api/v1

## Detener y reiniciar
Para detener el contenedor de docker: 
```bash
sudo docker stop api
```

Iniciar el contenedor nuevamente:
```bash
sudo docker start api
```

Reiniciar el contenedor:
```bash
sudo docker restart api
```

## Rutas
### /v1/users
- **GET /:** Obtiene todos los usuarios registrados en el sistema.
- **GET /forgot-password/:email:** Solicita el envío de un correo con un enlace y token para restablecer la contraseña.
- **POST /create:** Crea un nuevo usuario en el sistema.
- **POST /login:** Inicia sesión y devuelve un token de acceso.
- **PUT /update:** Actualiza la información de un usuario existente.
- **PUT /new-password:** Modifica la contraseña tras completar el proceso de recuperación.

### /v1/farms
- **GET /:** Recupera todas las fincas registradas en el sistema.
- **POST /create:** Registra una nueva finca.
- **PUT /update:** Actualiza la información de una finca existente.

### /v1/sensorsDB
Información de sensores almacenadas en mongoDB
- **GET /:** Recupera todos los sensores del sistema.
- **POST /create:** Crea un nuevo sensor.
- **PUT /update:** Actualiza los datos de un sensor.

### /v1/sensors
Data de sensores almacenada en influxDB
- **GET /data:** Obtiene los datos registrados por los sensores.
- **GET /report:** Genera un informe con los datos de los sensores de una finca en el rango de fechas indicado.

## /v1/Whatsapp
- **GET /:** Obtiene el ID de un grupo de WhatsApp.
- **POST /sendMessage:** Envía un mensaje a través de WhatsApp.