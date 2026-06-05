# Anexo B – Manual de Instalación y Configuración del Sistema

## Introducción

El propósito de este documento es describir la configuración e instalación del **Sistema de Gestión de Socios del Club**, compuesto por dos partes:

- **Backend:** API RESTful desarrollada en .NET 8, con base de datos SQL Server, desplegada mediante Docker.
- **Frontend:** Aplicación web desarrollada en Next.js 14 con TypeScript y Tailwind CSS, que consume la API del backend.

---

## Objetivo de este manual

Indicar los pasos y procedimientos necesarios para llevar a cabo la configuración, instalación y puesta en marcha del sistema completo, desde la preparación del servidor hasta la verificación de su correcto funcionamiento.

---

## Dirigido a

Este manual está dirigido al usuario administrador de sistemas de la organización, así como a todo perfil técnico encargado de la instalación, configuración y mantenimiento del mismo.

---

## Lo que deben conocer

**Administrador de sistemas:** debe tener conocimientos profundos de la estructura y funcionamiento de la organización. Además es deseable que conozca aspectos fundamentales del sistema operativo del servidor (Linux o Windows Server), manejo de bases de datos mediante SQL, administración de contenedores Docker, conceptos de redes y direccionamiento IP, manejo de archivos de configuración JSON y conocimientos básicos de Node.js y gestión de variables de entorno.

---

## Especificaciones técnicas

### Hardware (servidor)

- CPU de al menos 2 GHz (se recomiendan 4 núcleos o más).
- 8 GB de memoria RAM como mínimo (se recomiendan 16 GB).
- 100 GB de disco duro disponible como mínimo (considerando espacio para la base de datos, backups y logs).
- Interfaz de red (Ethernet) con dirección IP estática asignada.
- Se recomienda contar con una UPS para evitar problemas energéticos en el servidor.

### Hardware (equipos cliente)

- Cualquier computadora, notebook o dispositivo móvil con acceso a un navegador web moderno.
- Conectividad de red hacia el servidor donde está alojado el sistema.

### Software (servidor)

| Componente | Versión mínima |
|---|---|
| Sistema operativo | Ubuntu 20.04 LTS / Windows Server 2019 |
| Docker Engine | 20.10 o superior |
| Docker Compose | v2.0 o superior |
| Node.js | 18.x LTS o superior |
| npm | 9.x o superior |

### Software (equipos cliente)

- Navegador web moderno: Google Chrome, Mozilla Firefox, Microsoft Edge o Safari (versiones actuales).
- No se requiere ninguna instalación adicional en los equipos cliente.

---

## Parte 1 – Instalación del Backend (API + Base de datos)

### 1.1 Requisitos previos

Verificar los requisitos mínimos de hardware y que el servidor cuente con red definida con IP estática. Instalar Docker Engine y Docker Compose según el sistema operativo:

**Ubuntu/Linux:**
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl enable docker
sudo systemctl start docker
```

**Windows Server:** instalar Docker Desktop con WSL 2 habilitado, disponible en [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

---

### 1.2 Obtener el código fuente del backend

**Opción A – Clonar el repositorio:**
```bash
git clone <URL_DEL_REPOSITORIO_BACKEND>
cd <carpeta-del-proyecto-backend>
```

**Opción B:** copiar manualmente la carpeta del proyecto al servidor.

---

### 1.3 Configurar `appsettings.json`

Editar el archivo de configuración principal y establecer obligatoriamente:

- Una contraseña segura para el usuario `sa` de SQL Server.
- Una clave secreta JWT fuerte (mínimo 32 caracteres).

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=sqlserver;Database=GestionSociosDB;User Id=sa;Password=<CONTRASEÑA_SEGURA>;"
  },
  "JwtSettings": {
    "SecretKey": "<CLAVE_JWT_MINIMO_32_CARACTERES>",
    "Issuer": "SistemaClub",
    "Audience": "SistemaClubClients"
  }
}
```

---

### 1.4 Desplegar contenedores

Construir la imagen de la API y levantar los contenedores:

```bash
docker compose up -d --build
```

Verificar que los contenedores estén activos:

```bash
docker ps
```

Deben aparecer dos contenedores en estado `Up`:
- `sqlserver`
- `sistema-club-api` (expone el puerto `8080`)

---

### 1.5 Inicializar la base de datos

Ejecutar el script SQL dentro del contenedor de SQL Server:

```bash
docker exec -i sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P <CONTRASEÑA_SEGURA> \
  -i /scripts/gestion_socios_db.sql
```

---

### 1.6 Verificar funcionamiento del backend

| Endpoint | URL |
|---|---|
| Estado de salud | `http://<IP_SERVIDOR>:8080/health` |
| Documentación Swagger | `http://<IP_SERVIDOR>:8080/` |

Ambos deben responder correctamente antes de continuar con la instalación del frontend.

---

### 1.7 Seguridad y configuración inicial

- Cambiar inmediatamente las contraseñas de los usuarios iniciales de prueba.
- Completar la carga de datos del club (actividades y usuarios del personal) a través de los endpoints de la API.
- Abrir el puerto `8080` en el firewall para acceso de los clientes.
- Cerrar el puerto `1433` (SQL Server) hacia el exterior.
- Configurar reinicio automático de los contenedores:

```bash
docker update --restart unless-stopped sqlserver sistema-club-api
```

---

## Parte 2 – Instalación del Frontend (Aplicación Web)

### 2.1 Requisitos previos

El servidor o equipo donde se ejecutará el frontend debe tener instalado **Node.js 18 LTS o superior**.

**Verificar la versión instalada:**
```bash
node --version
npm --version
```

**Instalar Node.js en Ubuntu/Linux (si no está instalado):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

**Windows:** descargar e instalar desde [https://nodejs.org](https://nodejs.org) (versión LTS).

---

### 2.2 Obtener el código fuente del frontend

**Opción A – Clonar el repositorio:**
```bash
git clone <URL_DEL_REPOSITORIO_FRONTEND>
cd Frontend-Gestion-Socios-Club
```

**Opción B:** copiar manualmente la carpeta del proyecto al servidor o equipo de despliegue.

---

### 2.3 Instalar dependencias

Dentro de la carpeta del proyecto frontend, ejecutar:

```bash
npm install
```

Esto instalará todas las dependencias declaradas en `package.json`, incluyendo Next.js 14, React, Axios, Tailwind CSS, entre otras.

---

### 2.4 Configurar variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto frontend con el siguiente contenido:

```env
NEXT_PUBLIC_API_URL=http://<IP_SERVIDOR>:8080/api
```

Reemplazar `<IP_SERVIDOR>` con la dirección IP o dominio del servidor donde está corriendo el backend.

**Ejemplo:**
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:8080/api
```

> **Importante:** la variable debe comenzar con `NEXT_PUBLIC_` para que Next.js la exponga al navegador. Sin este archivo el sistema intentará conectarse a `http://localhost:5000/api` por defecto, lo que fallará en producción.

---

### 2.5 Construir la aplicación para producción

```bash
npm run build
```

Este comando compila y optimiza la aplicación. Una ejecución exitosa mostrará un resumen de las rutas generadas sin errores.

---

### 2.6 Iniciar el servidor frontend

```bash
npm start
```

Por defecto, el frontend quedará disponible en el **puerto 3000**.

**Acceso desde los equipos cliente:**
```
http://<IP_SERVIDOR>:3000
```

---

### 2.7 (Opcional) Ejecutar en modo desarrollo

Si se requiere ejecutar el sistema en modo de desarrollo para pruebas o depuración:

```bash
npm run dev
```

> No usar `npm run dev` en ambientes de producción. Utilizar siempre `npm run build` seguido de `npm start`.

---

### 2.8 Configurar reinicio automático del frontend (Linux)

Para que el frontend se reinicie automáticamente ante reinicios del servidor, se puede utilizar **PM2**:

**Instalar PM2:**
```bash
npm install -g pm2
```

**Iniciar la aplicación con PM2:**
```bash
pm2 start npm --name "sistema-club-frontend" -- start
pm2 save
pm2 startup
```

Ejecutar el comando que PM2 indique tras `pm2 startup` para habilitar el arranque automático.

---

### 2.9 Configurar firewall para el frontend

Abrir el puerto `3000` en el firewall del servidor para permitir el acceso de los equipos cliente:

**Ubuntu (UFW):**
```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

**Windows Server:** agregar una regla de entrada en el Firewall de Windows para el puerto TCP 3000.

---

## Verificación del sistema completo

Una vez desplegados ambos componentes, verificar el flujo completo:

1. Acceder desde un equipo cliente a `http://<IP_SERVIDOR>:3000`.
2. Ingresar con las credenciales del usuario administrador inicial.
3. Confirmar que el dashboard carga correctamente y que los datos del sistema son visibles.
4. Registrar un socio de prueba y verificar que se guarda correctamente.

Si alguno de estos pasos falla, revisar:
- Que el backend esté corriendo (`docker ps` y endpoint `/health`).
- Que el archivo `.env.local` apunte a la IP correcta del backend.
- Que el puerto `8080` sea accesible desde el servidor del frontend.

---

## Resumen de puertos utilizados

| Puerto | Componente | Acceso |
|---|---|---|
| `8080` | API Backend (.NET) | Clientes y frontend |
| `3000` | Frontend (Next.js) | Equipos cliente |
| `1433` | SQL Server | Solo interno (cerrado al exterior) |

---

## Resumen de variables de entorno del frontend

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API backend | `http://192.168.1.100:8080/api` |
