# Guía de ejecución

1. Clonar el repositorio
```
git clone https://github.com/beatrizacuna/checkbook-app.git
```

2. Ir a la raíz del directorio
```
cd checkbook-app
```

3. Entorno de ejecución venv
```
python -m venv venv source venv/bin/activate
source venv/bin/activate
```

4. Crear .env con tus credenciales en la raíz del directorio
```
DATABASE_URL=postgresql://postgresuser:postgrespassword@db:5432/checks_db
POSTGRES_USER=postgresuser
POSTGRES_PASSWORD=postgrespassword
POSTGRES_DB=checks_db
```

5. Ejecutar aplicación en la raíz del directorio con docker inicializado
```
docker compose up --build
```

6. Instalar dependencias
```
npm install axios
npm install react-router-dom
```

7. En una consola diferente, ejecutar los siguientes comandos
```
cd frontend/bank-app
npm start
```
