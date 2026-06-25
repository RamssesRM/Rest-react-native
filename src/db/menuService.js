import { getDB } from "./database";

export const saveCategorias = async (categorias) => {
    // ✅ CORREGIDO: Agregué los paréntesis ()
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const statement = await db.prepareAsync(
            `INSERT OR REPLACE INTO Categorias (id, nombre) VALUES (?, ?)`
        );
        try {
            for (const cat of categorias) {
                await statement.executeAsync([cat.id, cat.nombre]);
            }
            console.log(`✅ ${categorias.length} categorías guardadas`);
        } finally {
            await statement.finalizeAsync();
        }
    } catch (error) {
        console.error('❌ Error guardando Categorias:', error);
        throw error;
    }
};

export const saveProductos = async (productos) => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const statement = await db.prepareAsync(
            `INSERT OR REPLACE INTO Productos (id, nombre, descripcion, precio, categoria_id, imagen) VALUES (?, ?, ?, ?, ?, ?);`
        );
        try {
            for (const prod of productos) {
                await statement.executeAsync([
                    prod.id,
                    prod.nombre,
                    prod.descripcion,
                    parseFloat(prod.precio),
                    prod.categoria_fk, // Asegúrate que coincida con tu API
                    prod.imagen
                ]);
            }
            console.log(`✅ ${productos.length} productos guardados`);
        } finally {
            await statement.finalizeAsync();
        }
    } catch (error) {
        // ✅ CORREGIDO: Ahora 'error' sí existe en este catch
        console.error('❌ Error guardando productos:', error);
        throw error;
    }
};

export const getLocalProductos = async () => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const productos = await db.getAllAsync(`
            SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, c.nombre as categoria_nombre
            FROM Productos p
            JOIN Categorias c ON p.categoria_id = c.id
        `);
        console.log(`📦 ${productos.length} productos cargados desde SQLite`);
        return productos;
    } catch (error) {
        console.error('❌ Error obteniendo productos locales:', error);
        return [];
    }
};