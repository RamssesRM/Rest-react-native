import { getDB } from "./database";

export const saveCategorias = async (categorias) => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        // ✅ CAMBIO 1: Usamos OR IGNORE para no borrar categorías que ya existen
        const statement = await db.prepareAsync(
            `INSERT OR IGNORE INTO categorias (id, nombre, estatus) VALUES (?, ?, ?)`
        );
        try {
            for (const cat of categorias) {
                await statement.executeAsync([cat.id, cat.nombre, cat.estatus ? 1 : 0]);
            }
            console.log(`✅ ${categorias.length} categorías guardadas/ignoradas`);
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
        // ✅ CAMBIO 2: Tabla en minúscula y OR IGNORE (más seguro)
        const statement = await db.prepareAsync(
            `INSERT OR REPLACE INTO productos (id, nombre, descripcion, precio, estatus, categoria_id, imagen) VALUES (?, ?, ?, ?, ?, ?, ?);`
        );
        try {
            for (const prod of productos) {
                await statement.executeAsync([
                    prod.id,
                    prod.nombre,
                    prod.descripcion,
                    parseFloat(prod.precio),
                    prod.estatus ? 1 : 0,
                    prod.categoria_fk, 
                    prod.imagen
                ]);
            }
            console.log(`✅ ${productos.length} productos guardados`);
        } finally {
            await statement.finalizeAsync();
        }
    } catch (error) {
        console.error('❌ Error guardando productos:', error);
        throw error;
    }
};

export const getLocalCategorias = async () => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const categorias = await db.getAllAsync(`
            SELECT id, nombre FROM Categorias ORDER BY nombre ASC
        `);
        console.log(`📦 ${categorias.length} categorías cargadas desde SQLite`);
        return categorias;
    } catch (error) {
        console.error('❌ Error obteniendo categorías locales:', error);
        return [];
    }
};

export const getLocalProductos = async () => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const productos = await db.getAllAsync(`
            SELECT 
                p.id, 
                p.nombre, 
                p.descripcion, 
                p.precio, 
                p.imagen, 
                c.nombre as categoria_nombre, 
                p.estatus  -- ✅ CAMBIO 3: ESPECIFICAR 'p.estatus' PARA EVITAR EL ERROR AMBIGUO
            FROM productos p  -- ✅ Tabla en minúscula
            LEFT JOIN categorias c ON p.categoria_id = c.id -- ✅ Tabla en minúscula
        `);
        console.log(`📦 ${productos.length} productos cargados desde SQLite`);
        return productos;
    } catch (error) {
        console.error('❌ Error obteniendo productos locales:', error);
        return [];
    }
};