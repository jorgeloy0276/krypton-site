# 🐍 CHULETA COMPLETA: Flask + MySQL + MVC + POO
## CRUD · Paginación · Búsqueda · JSON API · Export PDF · Tailwind CSS

---

## 📋 ÍNDICE PASO A PASO

1. [Estructura del Proyecto](#1-estructura-del-proyecto)
2. [Instalación de Dependencias](#2-instalación-de-dependencias)
3. [Configuración de la Base de Datos](#3-configuración-de-la-base-de-datos)
4. [Configuración de la App (`config.py`)](#4-configuración-de-la-app)
5. [Inicialización del Paquete (`__init__.py`)](#5-inicialización-del-paquete)
6. [Modelo (Model)](#6-modelo-model)
7. [Controlador (Controller)](#7-controlador-controller)
8. [Rutas (Routes / Blueprint)](#8-rutas-routes--blueprint)
9. [Vistas con Tailwind CSS](#9-vistas-con-tailwind-css)
10. [JSON API Endpoints](#10-json-api-endpoints)
11. [Export a PDF](#11-export-a-pdf)
12. [Paginación y Búsqueda](#12-paginación-y-búsqueda)
13. [Punto de Entrada (`run.py`)](#13-punto-de-entrada)
14. [Variables de Entorno (`.env`)](#14-variables-de-entorno)
15. [Resumen de Comandos](#15-resumen-de-comandos)

---

## 1. ESTRUCTURA DEL PROYECTO

```
mi_proyecto/
│
├── app/                        # Paquete principal de la aplicación
│   ├── __init__.py             # Inicializa Flask, DB, Blueprints
│   ├── config.py               # Configuración (dev, prod, test)
│   │
│   ├── models/                 # Capa M del MVC — lógica de datos y BD
│   │   ├── __init__.py
│   │   └── producto_model.py   # Clase ProductoModel (POO)
│   │
│   ├── controllers/            # Capa C del MVC — lógica de negocio
│   │   ├── __init__.py
│   │   └── producto_controller.py
│   │
│   ├── routes/                 # Blueprints — define las URLs
│   │   ├── __init__.py
│   │   └── producto_routes.py
│   │
│   ├── templates/              # Capa V del MVC — Jinja2 + Tailwind
│   │   ├── base.html           # Layout base con Tailwind CDN
│   │   └── productos/
│   │       ├── index.html      # Lista con paginación y búsqueda
│   │       ├── crear.html      # Formulario de creación
│   │       └── editar.html     # Formulario de edición
│   │
│   └── static/                 # Archivos estáticos (CSS, JS, imágenes)
│       └── css/
│           └── custom.css
│
├── .env                        # Variables de entorno (NO subir a Git)
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── requirements.txt            # Dependencias del proyecto
└── run.py                      # Punto de entrada de la aplicación
```

---

## 2. INSTALACIÓN DE DEPENDENCIAS

### requirements.txt
```txt
Flask==3.0.3
Flask-MySQLdb==2.0.0          # Conector MySQL para Flask (usa mysqlclient)
mysqlclient==2.2.4            # Driver MySQL nativo (más rápido que pymysql)
python-dotenv==1.0.1          # Carga variables del archivo .env
reportlab==4.2.2              # Generación de PDFs
```

### Comandos de instalación
```bash
# 1. Crear entorno virtual (SIEMPRE hacerlo)
python -m venv venv

# 2. Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# NOTA: mysqlclient puede requerir dependencias del sistema:
# Ubuntu/Debian: sudo apt-get install python3-dev default-libmysqlclient-dev build-essential
# macOS:         brew install mysql-client
# Windows:       usar pymysql como alternativa (ver nota al final)
```

### Alternativa con PyMySQL (Windows/sin compilar)
```bash
pip install Flask Flask-PyMySQL python-dotenv reportlab
```
```python
# En app/__init__.py agregar al inicio:
import pymysql
pymysql.install_as_MySQLdb()  # Hace que PyMySQL se comporte como MySQLdb
```

---

## 3. CONFIGURACIÓN DE LA BASE DE DATOS

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS mi_proyecto_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mi_proyecto_db;

-- Tabla de ejemplo: productos
CREATE TABLE productos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100)    NOT NULL,
    descripcion TEXT,
    precio      DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    stock       INT             NOT NULL DEFAULT 0,
    activo      TINYINT(1)      NOT NULL DEFAULT 1,
    creado_en   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    actualizado DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos de prueba
INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
    ('Laptop HP', 'Procesador i5, 8GB RAM, 256GB SSD', 899.99, 15),
    ('Mouse Inalámbrico', 'Logitech M305, batería AAA', 29.99, 50),
    ('Teclado Mecánico', 'Cherry MX Red, retroiluminado', 129.99, 20),
    ('Monitor 24"', 'Full HD 1080p, 75Hz, IPS', 199.99, 10),
    ('Auriculares', 'Sony WH-1000XM4, cancelación de ruido', 349.99, 8);
```

---

## 4. CONFIGURACIÓN DE LA APP

### app/config.py
```python
# config.py — Centraliza TODA la configuración de la app
# Patrón: clase base + clases por entorno (desarrollo, producción, pruebas)

import os
from dotenv import load_dotenv

# Carga las variables del archivo .env al inicio
load_dotenv()

class Config:
    """
    Configuración BASE compartida por todos los entornos.
    Las subclases heredan estos valores y pueden sobreescribirlos.
    """
    # Clave secreta para sesiones y seguridad CSRF
    # os.urandom(24) genera una clave aleatoria en producción
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'clave-secreta-por-defecto-cambiar'

    # ── Configuración de MySQL con Flask-MySQLdb ──────────────────────────
    MYSQL_HOST     = os.environ.get('MYSQL_HOST',     'localhost')
    MYSQL_PORT     = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER     = os.environ.get('MYSQL_USER',     'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB       = os.environ.get('MYSQL_DB',       'mi_proyecto_db')
    MYSQL_CURSORCLASS = 'DictCursor'   # Retorna filas como diccionarios {col: valor}

    # ── Paginación por defecto ────────────────────────────────────────────
    ITEMS_POR_PAGINA = int(os.environ.get('ITEMS_POR_PAGINA', 10))

    # ── Carpeta de exports ────────────────────────────────────────────────
    EXPORT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'exports')


class DevelopmentConfig(Config):
    """Configuración para desarrollo local: debug activado."""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Configuración para producción: debug desactivado, seguridad máxima."""
    DEBUG = False
    TESTING = False
    # En producción siempre usa una SECRET_KEY fuerte generada con:
    # python -c "import secrets; print(secrets.token_hex(32))"


class TestingConfig(Config):
    """Configuración para pruebas unitarias: usa una BD separada."""
    TESTING = True
    DEBUG = True
    MYSQL_DB = 'mi_proyecto_test_db'


# Diccionario que mapea nombres de entorno a clases de configuración
# Se usa en app/__init__.py: config[os.environ.get('FLASK_ENV', 'development')]
config = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'testing':     TestingConfig,
    'default':     DevelopmentConfig
}
```

---

## 5. INICIALIZACIÓN DEL PAQUETE

### app/__init__.py
```python
# app/__init__.py — El corazón de la aplicación Flask
# Aquí se crea la instancia de Flask, se configura la BD y se registran Blueprints

import os
from flask import Flask
from flask_mysqldb import MySQL

# ── Instancia global de MySQL ─────────────────────────────────────────────────
# Se crea aquí (fuera de create_app) para poder importarla en los modelos
# SIN necesidad de importar la app completa (evita imports circulares)
mysql = MySQL()


def create_app(entorno=None):
    """
    Application Factory Pattern:
    En lugar de crear la app como variable global, usamos una función.
    Ventajas:
      - Permite crear múltiples instancias (útil para testing)
      - Evita imports circulares
      - Configuración más flexible por entorno
    
    Args:
        entorno (str): 'development', 'production' o 'testing'
    
    Returns:
        Flask: Instancia configurada de la aplicación
    """
    # Crea la instancia de Flask
    # __name__ le dice a Flask dónde buscar templates y static
    app = Flask(__name__)

    # ── Cargar configuración ──────────────────────────────────────────────
    from app.config import config

    # Detecta el entorno desde variable de entorno o usa el parámetro
    entorno_activo = entorno or os.environ.get('FLASK_ENV', 'default')
    app.config.from_object(config[entorno_activo])

    # Crear carpeta de exports si no existe
    os.makedirs(app.config['EXPORT_FOLDER'], exist_ok=True)

    # ── Inicializar extensiones ───────────────────────────────────────────
    # init_app() conecta la extensión con ESTA instancia de Flask
    mysql.init_app(app)

    # ── Registrar Blueprints (módulos de rutas) ───────────────────────────
    # Cada Blueprint es un módulo independiente de rutas
    # url_prefix agrega un prefijo a todas las rutas del blueprint
    from app.routes.producto_routes import productos_bp
    app.register_blueprint(productos_bp, url_prefix='/productos')

    # Aquí puedes registrar más blueprints:
    # from app.routes.usuario_routes import usuarios_bp
    # app.register_blueprint(usuarios_bp, url_prefix='/usuarios')

    # ── Ruta raíz → redirige al módulo principal ──────────────────────────
    from flask import redirect, url_for

    @app.route('/')
    def index():
        """Redirige la raíz al listado de productos."""
        return redirect(url_for('productos.listar'))

    # ── Manejadores de errores ────────────────────────────────────────────
    @app.errorhandler(404)
    def pagina_no_encontrada(e):
        from flask import render_template
        return render_template('errores/404.html'), 404

    @app.errorhandler(500)
    def error_interno(e):
        from flask import render_template
        return render_template('errores/500.html'), 500

    return app
```

### app/models/__init__.py
```python
# app/models/__init__.py — Hace que 'models' sea un paquete Python
# Puede estar vacío o importar los modelos para acceso conveniente
```

### app/controllers/__init__.py
```python
# app/controllers/__init__.py — Hace que 'controllers' sea un paquete Python
```

### app/routes/__init__.py
```python
# app/routes/__init__.py — Hace que 'routes' sea un paquete Python
```

---

## 6. MODELO (Model)

```python
# app/models/producto_model.py
# Capa M del MVC: acceso a la base de datos con POO
# El modelo NO conoce Flask ni rutas; solo trabaja con datos

from app import mysql  # Importa la instancia global de MySQL


class ProductoModel:
    """
    Modelo de datos para la tabla 'productos'.
    
    Patrón: cada método es una operación CRUD sobre la BD.
    Se usa DictCursor → cada fila es un dict {columna: valor}
    
    NOTA sobre cursors:
      - cursor() crea el cursor para ejecutar SQL
      - cursor.execute(sql, params) ejecuta con parámetros seguros (evita SQL injection)
      - cursor.fetchall()  → lista de todas las filas
      - cursor.fetchone()  → una sola fila o None
      - mysql.connection.commit() → confirma INSERT/UPDATE/DELETE
    """

    # ── READ (con paginación y búsqueda) ──────────────────────────────────

    @staticmethod
    def obtener_todos(pagina=1, por_pagina=10, busqueda=''):
        """
        Obtiene productos con paginación y búsqueda.
        
        Args:
            pagina (int): Número de página actual (empieza en 1)
            por_pagina (int): Registros por página
            busqueda (str): Texto para filtrar por nombre o descripción
        
        Returns:
            tuple: (lista_productos, total_registros)
        """
        cursor = mysql.connection.cursor()

        # Calcula el OFFSET para SQL: página 1 → offset 0, página 2 → offset 10...
        offset = (pagina - 1) * por_pagina

        # ── Construir query con búsqueda opcional ─────────────────────────
        # %s es el placeholder seguro de MySQLdb (NO uses f-strings con inputs del usuario)
        if busqueda:
            # LIKE con wildcards % para búsqueda parcial
            termino = f'%{busqueda}%'
            sql_datos = """
                SELECT id, nombre, descripcion, precio, stock, activo, creado_en
                FROM productos
                WHERE activo = 1
                  AND (nombre LIKE %s OR descripcion LIKE %s)
                ORDER BY id DESC
                LIMIT %s OFFSET %s
            """
            sql_total = """
                SELECT COUNT(*) AS total FROM productos
                WHERE activo = 1
                  AND (nombre LIKE %s OR descripcion LIKE %s)
            """
            cursor.execute(sql_datos,  (termino, termino, por_pagina, offset))
            productos = cursor.fetchall()   # Lista de dicts

            cursor.execute(sql_total, (termino, termino))
            total = cursor.fetchone()['total']   # Número entero
        else:
            sql_datos = """
                SELECT id, nombre, descripcion, precio, stock, activo, creado_en
                FROM productos
                WHERE activo = 1
                ORDER BY id DESC
                LIMIT %s OFFSET %s
            """
            sql_total = "SELECT COUNT(*) AS total FROM productos WHERE activo = 1"

            cursor.execute(sql_datos, (por_pagina, offset))
            productos = cursor.fetchall()

            cursor.execute(sql_total)
            total = cursor.fetchone()['total']

        cursor.close()
        return productos, total

    @staticmethod
    def obtener_por_id(id):
        """
        Obtiene UN producto por su ID.
        
        Returns:
            dict|None: Producto como diccionario, o None si no existe
        """
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT * FROM productos WHERE id = %s AND activo = 1",
            (id,)   # IMPORTANTE: siempre pasar tupla, incluso con 1 parámetro → (id,)
        )
        producto = cursor.fetchone()   # dict o None
        cursor.close()
        return producto

    @staticmethod
    def obtener_todos_sin_paginar():
        """
        Obtiene TODOS los productos activos (para exports PDF/JSON completos).
        
        Returns:
            list: Lista de dicts con todos los productos
        """
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT * FROM productos WHERE activo = 1 ORDER BY nombre ASC"
        )
        productos = cursor.fetchall()
        cursor.close()
        return productos

    # ── CREATE ────────────────────────────────────────────────────────────

    @staticmethod
    def crear(nombre, descripcion, precio, stock):
        """
        Inserta un nuevo producto en la BD.
        
        Returns:
            int: ID del nuevo registro (lastrowid)
        """
        cursor = mysql.connection.cursor()
        cursor.execute(
            """
            INSERT INTO productos (nombre, descripcion, precio, stock)
            VALUES (%s, %s, %s, %s)
            """,
            (nombre, descripcion, precio, stock)
        )
        mysql.connection.commit()   # ← OBLIGATORIO para INSERT/UPDATE/DELETE
        nuevo_id = cursor.lastrowid  # ID del registro recién insertado
        cursor.close()
        return nuevo_id

    # ── UPDATE ────────────────────────────────────────────────────────────

    @staticmethod
    def actualizar(id, nombre, descripcion, precio, stock):
        """
        Actualiza un producto existente.
        
        Returns:
            int: Número de filas afectadas (0 = no encontró el registro)
        """
        cursor = mysql.connection.cursor()
        cursor.execute(
            """
            UPDATE productos
            SET nombre = %s, descripcion = %s, precio = %s, stock = %s
            WHERE id = %s AND activo = 1
            """,
            (nombre, descripcion, precio, stock, id)
        )
        mysql.connection.commit()
        filas_afectadas = cursor.rowcount   # Cuántas filas se modificaron
        cursor.close()
        return filas_afectadas

    # ── DELETE (soft delete) ──────────────────────────────────────────────

    @staticmethod
    def eliminar(id):
        """
        Soft delete: marca el producto como inactivo en lugar de borrarlo.
        Ventaja: conserva el historial de datos, permite recuperar registros.
        
        Returns:
            int: Número de filas afectadas
        """
        cursor = mysql.connection.cursor()
        cursor.execute(
            "UPDATE productos SET activo = 0 WHERE id = %s",
            (id,)
        )
        mysql.connection.commit()
        filas_afectadas = cursor.rowcount
        cursor.close()
        return filas_afectadas

    # ── DELETE PERMANENTE (usar con precaución) ───────────────────────────

    @staticmethod
    def eliminar_permanente(id):
        """Elimina físicamente el registro. Usar solo en admin o testing."""
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM productos WHERE id = %s", (id,))
        mysql.connection.commit()
        cursor.close()
```

---

## 7. CONTROLADOR (Controller)

```python
# app/controllers/producto_controller.py
# Capa C del MVC: lógica de negocio
# El controlador conecta el Modelo con las Vistas
# Valida datos, llama al modelo y decide qué responder

from flask import (
    render_template,   # Renderiza un template Jinja2
    redirect,          # Redirige a otra URL
    url_for,           # Genera URL a partir del nombre de función
    request,           # Objeto con datos del request (form, args, json)
    flash,             # Mensajes flash para el usuario (requiere SECRET_KEY)
    jsonify,           # Convierte dict/lista a respuesta JSON
    current_app,       # Referencia a la app Flask actual
    send_file          # Envía un archivo como descarga
)
import os
import io
from app.models.producto_model import ProductoModel


class ProductoController:
    """
    Controlador para el módulo de Productos.
    Cada método maneja una acción específica del CRUD.
    """

    # ── READ — Listar con paginación y búsqueda ───────────────────────────

    @staticmethod
    def listar():
        """
        GET /productos/
        Lista productos con paginación y búsqueda.
        """
        # request.args.get() lee parámetros de la URL: ?pagina=2&busqueda=laptop
        pagina   = request.args.get('pagina',   1,   type=int)   # type=int convierte automáticamente
        busqueda = request.args.get('busqueda', '',  type=str).strip()
        por_pagina = current_app.config['ITEMS_POR_PAGINA']

        # Obtener datos del modelo
        productos, total = ProductoModel.obtener_todos(pagina, por_pagina, busqueda)

        # Calcular datos de paginación
        import math
        total_paginas = math.ceil(total / por_pagina) if total > 0 else 1

        return render_template(
            'productos/index.html',
            productos=productos,
            pagina=pagina,
            total_paginas=total_paginas,
            total=total,
            busqueda=busqueda,
            por_pagina=por_pagina
        )

    # ── CREATE ────────────────────────────────────────────────────────────

    @staticmethod
    def crear_get():
        """GET /productos/crear — Muestra el formulario de creación."""
        return render_template('productos/crear.html')

    @staticmethod
    def crear_post():
        """
        POST /productos/crear — Procesa el formulario de creación.
        Valida datos y llama al modelo si todo es correcto.
        """
        # request.form contiene los datos del formulario HTML (POST)
        nombre      = request.form.get('nombre', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        precio_str  = request.form.get('precio', '0').strip()
        stock_str   = request.form.get('stock', '0').strip()

        # ── Validación ────────────────────────────────────────────────────
        errores = []

        if not nombre:
            errores.append('El nombre es obligatorio.')
        elif len(nombre) > 100:
            errores.append('El nombre no puede superar 100 caracteres.')

        try:
            precio = float(precio_str)
            if precio < 0:
                errores.append('El precio no puede ser negativo.')
        except ValueError:
            errores.append('El precio debe ser un número válido.')
            precio = 0

        try:
            stock = int(stock_str)
            if stock < 0:
                errores.append('El stock no puede ser negativo.')
        except ValueError:
            errores.append('El stock debe ser un número entero.')
            stock = 0

        # Si hay errores, volver al formulario con los mensajes
        if errores:
            for error in errores:
                flash(error, 'error')   # Categoría 'error' para estilizar en Jinja
            return render_template('productos/crear.html',
                                   form_data=request.form)   # Repoblar el formulario

        # Sin errores → guardar en BD
        try:
            nuevo_id = ProductoModel.crear(nombre, descripcion, precio, stock)
            flash(f'Producto "{nombre}" creado exitosamente (ID: {nuevo_id}).', 'success')
            return redirect(url_for('productos.listar'))
        except Exception as e:
            flash(f'Error al guardar: {str(e)}', 'error')
            return render_template('productos/crear.html', form_data=request.form)

    # ── READ ONE ──────────────────────────────────────────────────────────

    @staticmethod
    def detalle(id):
        """GET /productos/<id> — Ver detalle de un producto."""
        producto = ProductoModel.obtener_por_id(id)

        if not producto:
            flash('Producto no encontrado.', 'error')
            return redirect(url_for('productos.listar'))

        return render_template('productos/detalle.html', producto=producto)

    # ── UPDATE ────────────────────────────────────────────────────────────

    @staticmethod
    def editar_get(id):
        """GET /productos/<id>/editar — Muestra formulario de edición."""
        producto = ProductoModel.obtener_por_id(id)

        if not producto:
            flash('Producto no encontrado.', 'error')
            return redirect(url_for('productos.listar'))

        return render_template('productos/editar.html', producto=producto)

    @staticmethod
    def editar_post(id):
        """POST /productos/<id>/editar — Procesa la edición."""
        producto = ProductoModel.obtener_por_id(id)
        if not producto:
            flash('Producto no encontrado.', 'error')
            return redirect(url_for('productos.listar'))

        nombre      = request.form.get('nombre', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        precio_str  = request.form.get('precio', '0').strip()
        stock_str   = request.form.get('stock', '0').strip()

        # Reusar lógica de validación (en proyectos grandes, extraer a función separada)
        errores = []
        if not nombre:
            errores.append('El nombre es obligatorio.')

        try:
            precio = float(precio_str)
        except ValueError:
            errores.append('Precio inválido.')
            precio = 0

        try:
            stock = int(stock_str)
        except ValueError:
            errores.append('Stock inválido.')
            stock = 0

        if errores:
            for e in errores:
                flash(e, 'error')
            return render_template('productos/editar.html',
                                   producto={**producto,
                                             'nombre': nombre,
                                             'descripcion': descripcion,
                                             'precio': precio_str,
                                             'stock': stock_str})

        filas = ProductoModel.actualizar(id, nombre, descripcion, precio, stock)
        if filas > 0:
            flash(f'Producto "{nombre}" actualizado correctamente.', 'success')
        else:
            flash('No se realizaron cambios.', 'warning')

        return redirect(url_for('productos.listar'))

    # ── DELETE ────────────────────────────────────────────────────────────

    @staticmethod
    def eliminar(id):
        """
        POST /productos/<id>/eliminar
        El formulario HTML usa POST porque DELETE no es estándar en forms HTML.
        """
        producto = ProductoModel.obtener_por_id(id)
        if not producto:
            flash('Producto no encontrado.', 'error')
            return redirect(url_for('productos.listar'))

        ProductoModel.eliminar(id)
        flash(f'Producto "{producto["nombre"]}" eliminado.', 'success')
        return redirect(url_for('productos.listar'))

    # ── JSON API ──────────────────────────────────────────────────────────

    @staticmethod
    def api_listar():
        """
        GET /productos/api/
        Retorna todos los productos en formato JSON (sin paginación para simplificar).
        Añade paginación si busqueda y pagina son enviados como query params.
        """
        busqueda   = request.args.get('busqueda', '', type=str)
        pagina     = request.args.get('pagina',   1,  type=int)
        por_pagina = current_app.config['ITEMS_POR_PAGINA']

        productos, total = ProductoModel.obtener_todos(pagina, por_pagina, busqueda)

        import math
        return jsonify({
            'status':  'ok',
            'data':    productos,
            'meta': {
                'total':        total,
                'pagina':       pagina,
                'por_pagina':   por_pagina,
                'total_paginas': math.ceil(total / por_pagina) if total else 1
            }
        })

    @staticmethod
    def api_obtener(id):
        """GET /productos/api/<id> — Retorna un producto como JSON."""
        producto = ProductoModel.obtener_por_id(id)
        if not producto:
            # HTTP 404 con mensaje JSON
            return jsonify({'status': 'error', 'mensaje': 'No encontrado'}), 404

        return jsonify({'status': 'ok', 'data': producto})

    @staticmethod
    def api_crear():
        """
        POST /productos/api/
        Espera JSON en el body: {"nombre": "...", "precio": ..., ...}
        """
        datos = request.get_json()   # Parsea el body como JSON

        if not datos:
            return jsonify({'status': 'error', 'mensaje': 'Body JSON requerido'}), 400

        nombre      = datos.get('nombre', '').strip()
        descripcion = datos.get('descripcion', '')
        precio      = datos.get('precio', 0)
        stock       = datos.get('stock', 0)

        if not nombre:
            return jsonify({'status': 'error', 'mensaje': 'nombre es requerido'}), 422

        nuevo_id = ProductoModel.crear(nombre, descripcion, float(precio), int(stock))
        return jsonify({
            'status':  'ok',
            'mensaje': 'Producto creado',
            'id':      nuevo_id
        }), 201   # 201 Created

    @staticmethod
    def api_actualizar(id):
        """PUT /productos/api/<id> — Actualiza un producto."""
        if not ProductoModel.obtener_por_id(id):
            return jsonify({'status': 'error', 'mensaje': 'No encontrado'}), 404

        datos = request.get_json()
        if not datos:
            return jsonify({'status': 'error', 'mensaje': 'Body JSON requerido'}), 400

        nombre      = datos.get('nombre', '').strip()
        descripcion = datos.get('descripcion', '')
        precio      = float(datos.get('precio', 0))
        stock       = int(datos.get('stock', 0))

        ProductoModel.actualizar(id, nombre, descripcion, precio, stock)
        return jsonify({'status': 'ok', 'mensaje': 'Actualizado correctamente'})

    @staticmethod
    def api_eliminar(id):
        """DELETE /productos/api/<id> — Elimina (soft) un producto."""
        if not ProductoModel.obtener_por_id(id):
            return jsonify({'status': 'error', 'mensaje': 'No encontrado'}), 404

        ProductoModel.eliminar(id)
        return jsonify({'status': 'ok', 'mensaje': 'Eliminado correctamente'})

    # ── EXPORT PDF ────────────────────────────────────────────────────────

    @staticmethod
    def exportar_pdf():
        """
        GET /productos/exportar/pdf
        Genera un PDF con todos los productos usando ReportLab
        y lo envía al navegador como descarga.
        """
        from reportlab.lib.pagesizes   import letter, landscape
        from reportlab.lib             import colors
        from reportlab.lib.styles      import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units       import inch
        from reportlab.platypus        import (SimpleDocTemplate, Table, TableStyle,
                                               Paragraph, Spacer, HRFlowable)

        # Obtener todos los productos (sin paginación para el export completo)
        productos = ProductoModel.obtener_todos_sin_paginar()

        # ── Crear PDF en memoria (no en disco) ────────────────────────────
        # io.BytesIO() crea un buffer en RAM → no crea archivos temporales
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),   # Horizontal para tablas anchas
            rightMargin=30, leftMargin=30,
            topMargin=40,   bottomMargin=30
        )

        # ── Estilos ───────────────────────────────────────────────────────
        estilos = getSampleStyleSheet()
        estilo_titulo = ParagraphStyle(
            'Titulo',
            parent=estilos['Title'],
            fontSize=18,
            textColor=colors.HexColor('#1e3a5f'),
            spaceAfter=6
        )
        estilo_subtitulo = ParagraphStyle(
            'Subtitulo',
            parent=estilos['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=12
        )

        # ── Contenido del PDF (lista de "flowables") ──────────────────────
        contenido = []

        # Título
        contenido.append(Paragraph('Reporte de Productos', estilo_titulo))
        from datetime import datetime
        fecha = datetime.now().strftime('%d/%m/%Y %H:%M')
        contenido.append(Paragraph(f'Generado el: {fecha} &nbsp;|&nbsp; Total: {len(productos)} productos',
                                   estilo_subtitulo))
        contenido.append(HRFlowable(width='100%', thickness=1,
                                    color=colors.HexColor('#e5e7eb'), spaceAfter=12))

        # ── Tabla de datos ─────────────────────────────────────────────────
        # Cabeceras
        cabeceras = ['#', 'Nombre', 'Descripción', 'Precio ($)', 'Stock', 'Estado']
        filas = [cabeceras]

        for p in productos:
            # Truncar descripción larga para que quepa en la celda
            desc = (p['descripcion'] or '')[:80]
            if len(p['descripcion'] or '') > 80:
                desc += '...'

            filas.append([
                str(p['id']),
                p['nombre'],
                desc,
                f"{float(p['precio']):.2f}",
                str(p['stock']),
                'Activo' if p['activo'] else 'Inactivo'
            ])

        tabla = Table(filas, colWidths=[0.5*inch, 2.2*inch, 3.5*inch, 1.2*inch, 0.8*inch, 1*inch])

        # Estilo visual de la tabla
        estilo_tabla = TableStyle([
            # Cabecera
            ('BACKGROUND',   (0,0), (-1,0),  colors.HexColor('#1e3a5f')),
            ('TEXTCOLOR',    (0,0), (-1,0),  colors.white),
            ('FONTNAME',     (0,0), (-1,0),  'Helvetica-Bold'),
            ('FONTSIZE',     (0,0), (-1,0),  11),
            ('BOTTOMPADDING',(0,0), (-1,0),  8),
            ('TOPPADDING',   (0,0), (-1,0),  8),
            # Filas alternas (zebra striping)
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f3f4f6')]),
            # Texto
            ('FONTNAME',     (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE',     (0,1), (-1,-1), 9),
            ('TOPPADDING',   (0,1), (-1,-1), 5),
            ('BOTTOMPADDING',(0,1), (-1,-1), 5),
            # Bordes
            ('GRID',         (0,0), (-1,-1), 0.5, colors.HexColor('#d1d5db')),
            ('BOX',          (0,0), (-1,-1), 1,   colors.HexColor('#1e3a5f')),
            # Alineación numérica
            ('ALIGN',        (0,0), (0,-1),  'CENTER'),  # ID centrado
            ('ALIGN',        (3,1), (4,-1),  'RIGHT'),   # Precio y stock a la derecha
        ])
        tabla.setStyle(estilo_tabla)
        contenido.append(tabla)

        # Construir PDF
        doc.build(contenido)

        # ── Enviar el buffer como descarga ────────────────────────────────
        buffer.seek(0)   # Rebobinar el buffer al inicio antes de leer
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,   # Fuerza descarga (no mostrar en navegador)
            download_name=f'productos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        )
```

---

## 8. RUTAS (Routes / Blueprint)

```python
# app/routes/producto_routes.py
# Define las URLs del módulo y las conecta con el controlador
# Blueprint = módulo de rutas registrable en la app

from flask import Blueprint
from app.controllers.producto_controller import ProductoController

# Crea el Blueprint con:
#   nombre: 'productos' (se usa en url_for('productos.listar'))
#   __name__: dónde buscar templates de este módulo
productos_bp = Blueprint('productos', __name__)

# ── Rutas de VISTAS (HTML) ────────────────────────────────────────────────────

# GET  /productos/        → Listar productos (paginado + búsqueda)
productos_bp.add_url_rule('/',            'listar',      ProductoController.listar,     methods=['GET'])

# GET  /productos/crear   → Formulario de creación
# POST /productos/crear   → Procesar creación
productos_bp.add_url_rule('/crear',       'crear_get',   ProductoController.crear_get,  methods=['GET'])
productos_bp.add_url_rule('/crear',       'crear_post',  ProductoController.crear_post, methods=['POST'])

# GET  /productos/<id>    → Ver detalle
productos_bp.add_url_rule('/<int:id>',   'detalle',     ProductoController.detalle,    methods=['GET'])

# GET  /productos/<id>/editar → Formulario de edición
# POST /productos/<id>/editar → Procesar edición
productos_bp.add_url_rule('/<int:id>/editar',   'editar_get',  ProductoController.editar_get,  methods=['GET'])
productos_bp.add_url_rule('/<int:id>/editar',   'editar_post', ProductoController.editar_post, methods=['POST'])

# POST /productos/<id>/eliminar → Eliminar (soft)
productos_bp.add_url_rule('/<int:id>/eliminar', 'eliminar',    ProductoController.eliminar,    methods=['POST'])

# ── Rutas de API JSON ─────────────────────────────────────────────────────────

# GET  /productos/api/        → Listar (JSON)
# POST /productos/api/        → Crear (JSON)
productos_bp.add_url_rule('/api/',          'api_listar',     ProductoController.api_listar,     methods=['GET'])
productos_bp.add_url_rule('/api/',          'api_crear',      ProductoController.api_crear,      methods=['POST'])

# GET    /productos/api/<id>  → Obtener uno (JSON)
# PUT    /productos/api/<id>  → Actualizar (JSON)
# DELETE /productos/api/<id>  → Eliminar (JSON)
productos_bp.add_url_rule('/api/<int:id>',  'api_obtener',    ProductoController.api_obtener,    methods=['GET'])
productos_bp.add_url_rule('/api/<int:id>',  'api_actualizar', ProductoController.api_actualizar, methods=['PUT'])
productos_bp.add_url_rule('/api/<int:id>',  'api_eliminar',   ProductoController.api_eliminar,   methods=['DELETE'])

# ── Export ────────────────────────────────────────────────────────────────────

# GET /productos/exportar/pdf → Descargar PDF
productos_bp.add_url_rule('/exportar/pdf',  'exportar_pdf',   ProductoController.exportar_pdf,   methods=['GET'])
```

---

## 9. VISTAS CON TAILWIND CSS

### app/templates/base.html
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block titulo %}Mi App Flask{% endblock %} | Sistema</title>

    <!-- Tailwind CSS CDN — Para producción usar CLI o PurgeCSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body { font-family: 'Inter', sans-serif; }
        /* Transiciones suaves en los flash messages */
        .flash-msg { animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } }
    </style>

    {% block estilos %}{% endblock %}
</head>
<body class="bg-gray-50 min-h-screen">

    <!-- ── Navbar ─────────────────────────────────────────────────── -->
    <nav class="bg-blue-900 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-8">
                    <a href="/" class="text-xl font-bold tracking-tight hover:text-blue-200 transition">
                        🏢 Mi Sistema
                    </a>
                    <div class="hidden md:flex space-x-4">
                        <a href="{{ url_for('productos.listar') }}"
                           class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition
                                  {% if request.blueprint == 'productos' %}bg-blue-700{% endif %}">
                            📦 Productos
                        </a>
                        <!-- Agrega más módulos aquí -->
                    </div>
                </div>
                <div class="text-sm text-blue-200">Sistema de Gestión v1.0</div>
            </div>
        </div>
    </nav>

    <!-- ── Flash Messages ─────────────────────────────────────────── -->
    {% with mensajes = get_flashed_messages(with_categories=true) %}
        {% if mensajes %}
            <div class="max-w-7xl mx-auto px-4 pt-4 space-y-2">
                {% for categoria, mensaje in mensajes %}
                    <div class="flash-msg flex items-center p-4 rounded-lg border
                        {% if categoria == 'success' %}bg-green-50 border-green-200 text-green-800
                        {% elif categoria == 'error'  %}bg-red-50   border-red-200   text-red-800
                        {% elif categoria == 'warning'%}bg-yellow-50 border-yellow-200 text-yellow-800
                        {% else %}bg-blue-50 border-blue-200 text-blue-800{% endif %}">
                        <span class="mr-2">
                            {% if categoria == 'success' %}✅
                            {% elif categoria == 'error'  %}❌
                            {% elif categoria == 'warning'%}⚠️
                            {% else %}ℹ️{% endif %}
                        </span>
                        {{ mensaje }}
                    </div>
                {% endfor %}
            </div>
        {% endif %}
    {% endwith %}

    <!-- ── Contenido principal ────────────────────────────────────── -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {% block contenido %}{% endblock %}
    </main>

    <!-- ── Footer ─────────────────────────────────────────────────── -->
    <footer class="mt-16 bg-white border-t border-gray-200 py-6">
        <div class="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            Sistema Flask · MVC · MySQL · Tailwind CSS
        </div>
    </footer>

    {% block scripts %}{% endblock %}
</body>
</html>
```

### app/templates/productos/index.html
```html
{% extends 'base.html' %}

{% block titulo %}Productos{% endblock %}

{% block contenido %}
<div class="space-y-6">

    <!-- ── Encabezado de página ──────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">📦 Productos</h1>
            <p class="mt-1 text-sm text-gray-500">
                {{ total }} producto{% if total != 1 %}s{% endif %} encontrado{% if total != 1 %}s{% endif %}
            </p>
        </div>
        <div class="flex gap-3">
            <!-- Botón Exportar PDF -->
            <a href="{{ url_for('productos.exportar_pdf') }}"
               class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white
                      rounded-lg text-sm font-medium hover:bg-red-700 transition shadow-sm">
                📄 Exportar PDF
            </a>
            <!-- Botón Nuevo producto -->
            <a href="{{ url_for('productos.crear_get') }}"
               class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                      rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                ➕ Nuevo Producto
            </a>
        </div>
    </div>

    <!-- ── Buscador ──────────────────────────────────────────────── -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <form method="GET" action="{{ url_for('productos.listar') }}" class="flex gap-3">
            <div class="flex-1 relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input type="text" name="busqueda" value="{{ busqueda }}"
                       placeholder="Buscar por nombre o descripción..."
                       class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <button type="submit"
                    class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
                           hover:bg-blue-700 transition">
                Buscar
            </button>
            {% if busqueda %}
            <a href="{{ url_for('productos.listar') }}"
               class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition">
                ✕ Limpiar
            </a>
            {% endif %}
        </form>
    </div>

    <!-- ── Tabla de productos ─────────────────────────────────────── -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {% if productos %}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Descripción</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                    {% for p in productos %}
                    <tr class="hover:bg-blue-50 transition">
                        <td class="px-4 py-3 text-sm text-gray-500 font-mono">#{{ p.id }}</td>
                        <td class="px-4 py-3">
                            <div class="text-sm font-semibold text-gray-900">{{ p.nombre }}</div>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">
                            {{ p.descripcion or '—' }}
                        </td>
                        <td class="px-4 py-3 text-sm text-right font-semibold text-green-700">
                            ${{ "%.2f"|format(p.precio|float) }}
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                {% if p.stock > 10 %}bg-green-100 text-green-800
                                {% elif p.stock > 0 %}bg-yellow-100 text-yellow-800
                                {% else %}bg-red-100 text-red-800{% endif %}">
                                {{ p.stock }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <div class="flex items-center justify-center gap-2">
                                <a href="{{ url_for('productos.editar_get', id=p.id) }}"
                                   class="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-md
                                          hover:bg-amber-200 transition font-medium">
                                    ✏️ Editar
                                </a>
                                <!-- Formulario de eliminación (POST para seguridad) -->
                                <form method="POST"
                                      action="{{ url_for('productos.eliminar', id=p.id) }}"
                                      onsubmit="return confirm('¿Eliminar «{{ p.nombre }}»?')">
                                    <button type="submit"
                                            class="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-md
                                                   hover:bg-red-200 transition font-medium">
                                        🗑️ Eliminar
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>

        <!-- ── Paginación ─────────────────────────────────────────── -->
        {% if total_paginas > 1 %}
        <div class="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row
                    items-center justify-between gap-3 bg-gray-50">
            <p class="text-sm text-gray-600">
                Página <strong>{{ pagina }}</strong> de <strong>{{ total_paginas }}</strong>
                &nbsp;·&nbsp; {{ total }} registros totales
            </p>
            <div class="flex items-center gap-1">
                <!-- Primera página -->
                {% if pagina > 1 %}
                <a href="{{ url_for('productos.listar', pagina=1, busqueda=busqueda) }}"
                   class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md
                          hover:bg-gray-50 transition">«</a>
                <!-- Anterior -->
                <a href="{{ url_for('productos.listar', pagina=pagina-1, busqueda=busqueda) }}"
                   class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md
                          hover:bg-gray-50 transition">‹</a>
                {% endif %}

                <!-- Páginas numeradas (ventana de 5 páginas alrededor de la actual) -->
                {% set inicio = [pagina - 2, 1] | max %}
                {% set fin    = [pagina + 2, total_paginas] | min %}
                {% for n in range(inicio, fin + 1) %}
                    {% if n == pagina %}
                    <span class="px-3 py-1.5 text-sm bg-blue-600 text-white border
                                 border-blue-600 rounded-md font-semibold">{{ n }}</span>
                    {% else %}
                    <a href="{{ url_for('productos.listar', pagina=n, busqueda=busqueda) }}"
                       class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md
                              hover:bg-gray-50 transition">{{ n }}</a>
                    {% endif %}
                {% endfor %}

                <!-- Siguiente / Última -->
                {% if pagina < total_paginas %}
                <a href="{{ url_for('productos.listar', pagina=pagina+1, busqueda=busqueda) }}"
                   class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md
                          hover:bg-gray-50 transition">›</a>
                <a href="{{ url_for('productos.listar', pagina=total_paginas, busqueda=busqueda) }}"
                   class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md
                          hover:bg-gray-50 transition">»</a>
                {% endif %}
            </div>
        </div>
        {% endif %}

        {% else %}
        <!-- Sin resultados -->
        <div class="text-center py-16">
            <div class="text-5xl mb-4">📭</div>
            <h3 class="text-lg font-semibold text-gray-700">Sin productos</h3>
            <p class="text-gray-500 mt-1">
                {% if busqueda %}
                    No se encontraron resultados para <strong>"{{ busqueda }}"</strong>.
                {% else %}
                    Aún no hay productos. ¡Crea el primero!
                {% endif %}
            </p>
            <a href="{{ url_for('productos.crear_get') }}"
               class="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg
                      text-sm hover:bg-blue-700 transition">
                ➕ Crear Producto
            </a>
        </div>
        {% endif %}
    </div>
</div>
{% endblock %}
```

### app/templates/productos/crear.html
```html
{% extends 'base.html' %}
{% block titulo %}Nuevo Producto{% endblock %}

{% block contenido %}
<div class="max-w-2xl mx-auto">
    <!-- Encabezado con breadcrumb -->
    <nav class="flex mb-6 text-sm text-gray-500">
        <a href="{{ url_for('productos.listar') }}" class="hover:text-blue-600">Productos</a>
        <span class="mx-2">/</span>
        <span class="text-gray-900 font-medium">Nuevo</span>
    </nav>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">➕ Nuevo Producto</h1>

        <!-- form_data repobla el formulario si hubo error de validación -->
        <form method="POST" action="{{ url_for('productos.crear_post') }}" class="space-y-5">

            <!-- Nombre -->
            <div>
                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span class="text-red-500">*</span>
                </label>
                <input type="text" id="nombre" name="nombre" required maxlength="100"
                       value="{{ form_data.nombre if form_data else '' }}"
                       placeholder="Ej: Laptop HP 15"
                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <!-- Descripción -->
            <div>
                <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                </label>
                <textarea id="descripcion" name="descripcion" rows="3"
                          placeholder="Descripción del producto..."
                          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 resize-none">{{ form_data.descripcion if form_data else '' }}</textarea>
            </div>

            <!-- Precio y Stock en grid -->
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="precio" class="block text-sm font-medium text-gray-700 mb-1">
                        Precio ($) <span class="text-red-500">*</span>
                    </label>
                    <input type="number" id="precio" name="precio" required
                           step="0.01" min="0" placeholder="0.00"
                           value="{{ form_data.precio if form_data else '' }}"
                           class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                                  focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">
                        Stock <span class="text-red-500">*</span>
                    </label>
                    <input type="number" id="stock" name="stock" required
                           step="1" min="0" placeholder="0"
                           value="{{ form_data.stock if form_data else '' }}"
                           class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                                  focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-2">
                <button type="submit"
                        class="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold
                               hover:bg-blue-700 transition">
                    💾 Guardar Producto
                </button>
                <a href="{{ url_for('productos.listar') }}"
                   class="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold
                          hover:bg-gray-200 transition text-center">
                    ✕ Cancelar
                </a>
            </div>
        </form>
    </div>
</div>
{% endblock %}
```

---

## 10. JSON API ENDPOINTS

```
# Resumen de endpoints de la API REST

GET    /productos/api/             → Lista paginada
                                     Params: ?pagina=1&busqueda=laptop
                                     Response: { status, data[], meta{total, pagina, ...} }

POST   /productos/api/             → Crear
                                     Body JSON: { nombre, descripcion, precio, stock }
                                     Response: { status, mensaje, id }   HTTP 201

GET    /productos/api/<id>         → Obtener uno
                                     Response: { status, data{...} }

PUT    /productos/api/<id>         → Actualizar
                                     Body JSON: { nombre, descripcion, precio, stock }
                                     Response: { status, mensaje }

DELETE /productos/api/<id>         → Eliminar (soft)
                                     Response: { status, mensaje }
```

### Ejemplo de llamada con fetch (JavaScript)
```javascript
// ── GET con paginación ──────────────────────────────────────────────────
const res = await fetch('/productos/api/?pagina=1&busqueda=laptop');
const { data, meta } = await res.json();
console.log(`Total: ${meta.total}, Página: ${meta.pagina}/${meta.total_paginas}`);

// ── POST Crear ──────────────────────────────────────────────────────────
const nuevo = await fetch('/productos/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Tablet Samsung', precio: 299.99, stock: 5 })
});
const resultado = await nuevo.json();
console.log('Creado ID:', resultado.id);

// ── DELETE ──────────────────────────────────────────────────────────────
await fetch(`/productos/api/3`, { method: 'DELETE' });
```

### Ejemplo con curl (terminal)
```bash
# Listar
curl http://localhost:5000/productos/api/

# Crear
curl -X POST http://localhost:5000/productos/api/ \
     -H "Content-Type: application/json" \
     -d '{"nombre":"Mouse Gamer","precio":49.99,"stock":20}'

# Actualizar
curl -X PUT http://localhost:5000/productos/api/1 \
     -H "Content-Type: application/json" \
     -d '{"nombre":"Mouse Gamer Pro","precio":59.99,"stock":15,"descripcion":"RGB"}'

# Eliminar
curl -X DELETE http://localhost:5000/productos/api/1
```

---

## 11. EXPORT A PDF

La función `exportar_pdf()` en el controlador usa **ReportLab** y genera el PDF en memoria (`io.BytesIO`) sin escribir archivos en disco. Acceso: `GET /productos/exportar/pdf`

**Flujo:**
1. `ProductoModel.obtener_todos_sin_paginar()` → todos los registros
2. Se crea `io.BytesIO()` como buffer en RAM
3. `SimpleDocTemplate(buffer, ...)` → escribe el PDF al buffer
4. `buffer.seek(0)` → rebobina el puntero al inicio
5. `send_file(buffer, as_attachment=True)` → envía como descarga

---

## 12. PAGINACIÓN Y BÚSQUEDA

**SQL para paginación:**
```sql
-- Datos de la página
SELECT * FROM tabla
WHERE condicion
ORDER BY id DESC
LIMIT {por_pagina} OFFSET {(pagina-1) * por_pagina};

-- Total de registros (para calcular total_paginas)
SELECT COUNT(*) AS total FROM tabla WHERE condicion;
```

**Python — cálculo de página:**
```python
import math

total_paginas = math.ceil(total / por_pagina)   # Redondear hacia arriba
offset        = (pagina - 1) * por_pagina       # Registro inicial

# Validar que la página no esté fuera de rango
pagina = max(1, min(pagina, total_paginas))
```

**URL con búsqueda + paginación:**
```
/productos/?pagina=2&busqueda=laptop
```
La búsqueda se pasa en cada enlace de paginación para no perderla al cambiar de página.

---

## 13. PUNTO DE ENTRADA

### run.py
```python
# run.py — Punto de entrada de la aplicación
# Ejecutar con: python run.py

import os
from app import create_app

# Crea la instancia de la app usando el entorno definido en .env
# Si FLASK_ENV no está definido, usa 'development' por defecto
app = create_app(os.environ.get('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # debug=True → recarga automática al guardar, muestra errores detallados
    # host='0.0.0.0' → acepta conexiones desde cualquier IP (útil en red local)
    # port=5000 → puerto por defecto de Flask
    app.run(
        debug=app.config['DEBUG'],
        host=os.environ.get('FLASK_HOST', '127.0.0.1'),
        port=int(os.environ.get('FLASK_PORT', 5000))
    )
```

---

## 14. VARIABLES DE ENTORNO

### .env
```ini
# .env — Variables de entorno (NO subir a Git)
# Copiar .env.example como .env y ajustar los valores

FLASK_ENV=development
FLASK_HOST=127.0.0.1
FLASK_PORT=5000

SECRET_KEY=cambia-esto-por-una-clave-secreta-larga-y-aleatoria

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_password_aqui
MYSQL_DB=mi_proyecto_db

ITEMS_POR_PAGINA=10
```

### .gitignore
```gitignore
# Python
venv/
__pycache__/
*.pyc
*.pyo
.pytest_cache/

# Variables de entorno (NUNCA subir)
.env

# Exports generados
exports/

# IDEs
.vscode/
.idea/
*.swp
```

---

## 15. RESUMEN DE COMANDOS

```bash
# ── Setup inicial del proyecto ────────────────────────────────────────────────
git init
python -m venv venv
source venv/bin/activate           # Linux/Mac
# venv\Scripts\activate            # Windows

pip install -r requirements.txt
cp .env.example .env               # Copiar y editar con tus datos

# ── Base de datos ─────────────────────────────────────────────────────────────
mysql -u root -p < schema.sql      # Crear BD y tablas

# ── Ejecutar la app ───────────────────────────────────────────────────────────
python run.py                      # Puerto 5000 por defecto
# o con Flask CLI:
flask --app run run --debug

# ── URLs disponibles ──────────────────────────────────────────────────────────
# http://localhost:5000/                  → Redirige a /productos/
# http://localhost:5000/productos/        → Lista con paginación y búsqueda
# http://localhost:5000/productos/crear   → Formulario de creación
# http://localhost:5000/productos/api/    → API JSON
# http://localhost:5000/productos/exportar/pdf → Descarga PDF

# ── Para adaptar a un nuevo módulo (ej: Categorías) ───────────────────────────
# 1. Crear: app/models/categoria_model.py      (copiar plantilla de producto_model)
# 2. Crear: app/controllers/categoria_controller.py
# 3. Crear: app/routes/categoria_routes.py
# 4. Registrar blueprint en app/__init__.py:
#      from app.routes.categoria_routes import categorias_bp
#      app.register_blueprint(categorias_bp, url_prefix='/categorias')
# 5. Crear templates: app/templates/categorias/index.html, crear.html, editar.html
# 6. Crear tabla SQL correspondiente
```

---

## 📌 NOTAS ADICIONALES

### Valores de `creado_en` como JSON
Si `creado_en` es un objeto `datetime` de Python, `jsonify` no lo serializa automáticamente. Solución:
```python
# En app/__init__.py, después de crear la app:
from flask.json.provider import DefaultJSONProvider
from datetime import datetime

class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        return super().default(obj)

app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)
```

### Patrón para escalar a múltiples módulos
```
models/      → un archivo por tabla:  producto_model.py, usuario_model.py
controllers/ → uno por módulo:        producto_controller.py, usuario_controller.py
routes/      → uno por Blueprint:     producto_routes.py, usuario_routes.py
templates/   → carpeta por módulo:    productos/, usuarios/
```

### Seguridad básica
- **Nunca** usar f-strings para construir SQL → usar `%s` con parámetros
- **Nunca** subir `.env` a Git → agregarlo al `.gitignore`
- En producción usar `SECRET_KEY` generada con `secrets.token_hex(32)`
- Habilitar HTTPS en producción (usar nginx o gunicorn + certbot)
