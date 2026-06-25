import * as SQLite from 'expo-sqlite';

const DB_NAME = 'MenuApp.db';
let dbInstance = null;

export const openDatabase = async () => {
    if (dbInstance) return dbInstance;

    try {
        dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
        await createTables(dbInstance);
        return dbInstance;
    } catch (error) {
        console.error("Error al abrir la base de datos:", error);
        throw error;
    }
};

const createTables = async (db) => {
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            
            CREATE TABLE IF NOT EXISTS Categorias (
                id TEXT PRIMARY KEY NOT NULL,
                nombre TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Productos (
                id TEXT PRIMARY KEY NOT NULL,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                precio REAL,
                categoria_id TEXT NOT NULL,
                imagen TEXT,
                FOREIGN KEY (categoria_id) REFERENCES Categorias (id) ON DELETE CASCADE
            );
        `);
        console.log("✅ Tablas creadas con éxito");
    } catch (error) {
        console.error('❌ Error al crear tablas:', error);
    }
};

export const getDB = () => dbInstance;