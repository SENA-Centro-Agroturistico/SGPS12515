# Frontend SENA IoT

Frontend para obtener los datos en formato JSON los cuales se mostrarán en gráficas y tablas de datos para que el usuario pueda visualizar el comportamiento de los sensores.

## Instalación
Ya estando dentro de la carpeta de Monitoreo_IoT_SENA. Para instalar este proyecto, sigue estos pasos:

**1. Entrar a la carpeta del frontend**

```bash
cd front_sena_IOT
```

**2. Construir imagen**
```bash
sudo docker build -t monitoreio_iot_sena-front:v1 .
```

**3. Ejecutar como un contenedor**
```bash
sudo docker run -d --name api -p 5173:8080 monitoreio_iot_sena-front:v1
```

**IMPORTANTE:** se necesita que la api esté corriendo para poder iniciar sesión y obtener datos.

## Uso
Ingresar a la url:

http://165.227.126.18:5173

## Detener y reiniciar
Para detener el contenedor de docker: 
```bash
sudo docker stop front
```

Iniciar el contenedor nuevamente:
```bash
sudo docker start front
```

Reiniciar el contenedor:
```bash
sudo docker restart front
```