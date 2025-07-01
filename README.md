Guía Rápida para Ejecutar SmartFarma

Esta guía te ayudará a instalar lo necesario y poner en marcha la aplicación SmartFarma en tu computadora.
1. Lo Primero que Necesitas Instalar

SmartFarma usa dos programas principales que debes tener en tu PC:
1.1. Node.js (incluye npm)

Es el programa que permite que el código de SmartFarma funcione.

    ¿Cómo instalarlo?

        Ve a esta página: https://nodejs.org/

        Descarga la versión LTS (es la más estable).

        Abre el archivo que descargaste y sigue los pasos para instalarlo. Puedes dejar todas las opciones por defecto.

    ¿Cómo saber si ya lo tienes o si se instaló bien?

        Abre una terminal en tu PC (busca "CMD" o "PowerShell" en el menú de inicio y ábrelo).

        Escribe node -v y presiona Enter. Deberías ver un número de versión (ej: v18.17.1).

        Escribe npm -v y presiona Enter. Deberías ver otro número de versión (ej: 9.6.7).

1.2. PostgreSQL (la Base de Datos)

Es donde SmartFarma guarda toda la información (pacientes, medicamentos, ventas).

    ¿Cómo instalarlo?

        Ve a esta página: https://www.postgresql.org/download/

        Descarga el instalador para tu sistema operativo (Windows, macOS, etc.).

        Abre el archivo que descargaste y sigue los pasos para instalarlo.

        ¡MUY IMPORTANTE durante la instalación! Te pedirá una contraseña para el usuario postgres. ¡Escribe una contraseña que recuerdes bien, la necesitarás después!

        Asegúrate de que pgAdmin 4 esté marcado para instalarse también. Es una herramienta para ver la base de datos.

    ¿Cómo saber si se instaló bien?

        Busca y abre pgAdmin 4 en tus programas instalados.

        Te pedirá la contraseña que creaste para el usuario postgres. Ingresa esa contraseña.

2. Obtener el Código de SmartFarma

Tu amigo/a te dará un enlace de GitHub para descargar el proyecto.

    Instala Git: Si no lo tienes, descárgalo de https://git-scm.com/downloads y sigue las instrucciones de instalación.

    Clona el proyecto:

        Abre una terminal en tu PC (CMD o PowerShell).

        Ve a la carpeta donde quieras guardar el proyecto (ej: cd C:\Users\TuUsuario\Documents\Proyectos).

        Copia el enlace de GitHub que te dará tu amigo/a (será algo como https://github.com/tu_usuario/SmartFarma_Project.git).

        En la terminal, escribe git clone  y pega el enlace. Presiona Enter.

        git clone https://github.com/tu_usuario/SmartFarma_Project.git

        (Reemplaza el enlace con el que te den).

        Esto descargará una carpeta llamada SmartFarma_Project en tu PC.

3. Configurar la Base de Datos

Ahora necesitas preparar la base de datos para SmartFarma.

    Abre pgAdmin 4 y conéctate a tu servidor (si no lo has hecho).

    Crea la base de datos de SmartFarma:

        En el lado izquierdo de pgAdmin, haz clic derecho en Databases.

        Selecciona Create > Database....

        En el campo Database, escribe smartfarma_db (¡este nombre es exacto!).

        Haz clic en Save.

    Crea las tablas dentro de la base de datos:

        En el lado izquierdo, busca Databases > smartfarma_db > Schemas > public.

        Haz clic derecho en Tables.

        Selecciona Query Tool.

        Abre el archivo database_setup.sql que se encuentra en la carpeta SmartFarma_Project que acabas de clonar.

        Copia todo el contenido de ese archivo database_setup.sql en el editor de consultas de pgAdmin.

        Haz clic en el botón del rayo (Execute/Refresh) para ejecutar los comandos.

4. Poner en Marcha SmartFarma (Backend y Frontend)

Ahora que todo está instalado y configurado, vamos a "encender" la aplicación.

    Abre Visual Studio Code.

    Abre la carpeta principal del proyecto:

        Ve a File > Open Folder....

        Busca y selecciona la carpeta SmartFarma_Project (la que descargaste de GitHub).

4.1. Iniciar el Backend (el "cerebro")

    Abre una NUEVA Terminal en VS Code: Terminal > New Terminal.

    Ve a la carpeta del backend:

    cd smartfarma-backend

    (Presiona Enter).

    Instala las piezas del backend:

    npm install

    (Presiona Enter. Esto descarga librerías, puede tardar un poco).

    ¡Cambia la contraseña de la base de datos!

        Abre el archivo smartfarma-backend/index.js en VS Code.

        Busca la línea: password: 'TU_CONTRASEÑA_DE_POSTGRES',

        Cambia TU_CONTRASEÑA_DE_POSTGRES por la contraseña que pusiste al instalar PostgreSQL.

        Guarda el archivo index.js (Ctrl + S).

    Inicia el backend:

    node index.js

    (Presiona Enter).

        Deberías ver el mensaje: Servidor de SmartFarma escuchando en http://localhost:5000.

        ¡Deja esta terminal ABIERTA!

4.2. Iniciar el Frontend (la "interfaz")

    Abre OTRA NUEVA Terminal en VS Code: Terminal > New Terminal. (¡No cierres la del backend!).

    Ve a la carpeta del frontend:

    cd smartfarma-frontend

    (Presiona Enter).

    Instala las piezas del frontend:

    npm install

    (Presiona Enter. Esto descarga librerías de React, puede tardar un poco).

    Inicia el frontend:

    npm start

    (Presiona Enter).

        Esto abrirá automáticamente tu navegador en http://localhost:3000.

        En la terminal, verás Compiled successfully! y la dirección Local: http://localhost:3000.

        ¡Deja también esta terminal ABIERTA!

5. ¡Listo!

Ahora puedes usar SmartFarma en tu navegador visitando: http://localhost:3000