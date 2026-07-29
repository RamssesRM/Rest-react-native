import { getDB } from "./database";

export const saveCategorias = async (categorias) => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const statement = await db.prepareAsync(`
            INSERT INTO categorias (id, nombre, estatus, imagen) VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                nombre=excluded.nombre, 
                estatus=excluded.estatus,
                imagen=excluded.imagen
        `);
        try {
            for (const cat of categorias) {
                await statement.executeAsync([cat.id, cat.nombre, cat.estatus ? 1 : 0, cat.imagen]);
            }
            console.log(`✅ Categorías sincronizadas`);
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
        const statement = await db.prepareAsync(`
            INSERT INTO productos (id, nombre, descripcion, precio, estatus, categoria_id, imagen) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                nombre=excluded.nombre, 
                descripcion=excluded.descripcion, 
                precio=excluded.precio, 
                estatus=excluded.estatus, 
                categoria_id=excluded.categoria_id, 
                imagen=excluded.imagen
        `);
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
            console.log(`✅ Productos sincronizados`);
        } finally {
            await statement.finalizeAsync();
        }
    } catch (error) {
        console.error('❌ Error guardando productos:', error);
        throw error;
    }
};

export const saveSingleProducto = async (prod) => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    const productoLimpio = {
        id: prod.id,
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        precio: parseFloat(prod.precio) || 0,
        estatus: prod.estatus === true || prod.estatus === 1 ? 1 : 0,
        categoria_id: prod.categoria_fk || prod.categoria_id || null,
        imagen: prod.imagen || null,
    };

    console.log('💾 Guardando producto:', JSON.stringify(productoLimpio));

    await db.runAsync(
        `INSERT INTO productos (id, nombre, descripcion, precio, estatus, categoria_id, imagen) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET 
             nombre=excluded.nombre, 
             descripcion=excluded.descripcion, 
             precio=excluded.precio, 
             estatus=excluded.estatus, 
             categoria_id=excluded.categoria_id, 
             imagen=excluded.imagen`,
        [
            productoLimpio.id,
            productoLimpio.nombre,
            productoLimpio.descripcion,
            productoLimpio.precio,
            productoLimpio.estatus,
            productoLimpio.categoria_id,
            productoLimpio.imagen,
        ]
    );

    const verificar = await db.getFirstAsync(
        'SELECT id, nombre, estatus, categoria_id FROM productos WHERE id = ?',
        [productoLimpio.id]
    );
    console.log('🔍 Verificación:', verificar ? `OK - ${verificar.nombre}` : '❌ NO ENCONTRADO');
};

export const deleteSingleProducto = async (id) => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    await db.runAsync(`UPDATE productos SET estatus = 0 WHERE id = ?`, [id]);
};

export const reactivarProducto = async (id) => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    await db.runAsync(`UPDATE productos SET estatus = 1 WHERE id = ?`, [id]);
};

export const getLocalProductos = async () => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');
    try {
        const productos = await db.getAllAsync('SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.categoria_id, c.nombre as categoria_nombre, p.estatus FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.estatus = 1');
        return productos;
    } catch (error) {
        console.error('❌ Error obteniendo productos locales:', error);
        return [];
    }
};

export const getLocalProductosInactivos = async () => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');
    try {
        const productos = await db.getAllAsync('SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.categoria_id, c.nombre as categoria_nombre, p.estatus FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.estatus = 0');
        return productos;
    } catch (error) {
        console.error('❌ Error obteniendo productos inactivos:', error);
        return [];
    }
};

export const getLocalCategorias = async () => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const categorias = await db.getAllAsync(`
            SELECT id, nombre, imagen 
            FROM categorias 
            WHERE estatus = 1
        `);
        console.log(`📦 ${categorias.length} categorías cargadas desde SQLite`);
        return categorias;
    } catch (error) {
        console.error('❌ Error obteniendo categorías locales:', error);
        return [];
    }
};

export const getProductosByCategoria = async (categoriaId) => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const productos = await db.getAllAsync(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.categoria_id, c.nombre as categoria_nombre, p.estatus 
             FROM productos p 
             LEFT JOIN categorias c ON p.categoria_id = c.id 
             WHERE p.categoria_id = ? AND p.estatus = 1`,
            [categoriaId]
        );
        return productos;
    } catch (error) {
        console.error('❌ Error obteniendo productos por categoría:', error);
        return [];
    }
};

export const getCategoriaById = async (categoriaId) => {
    const db = getDB();
    if (!db) throw new Error('DB no inicializada');

    try {
        const result = await db.getFirstAsync(
            'SELECT id, nombre, imagen FROM categorias WHERE id = ? AND estatus = 1',
            [categoriaId]
        );
        return result;
    } catch (error) {
        console.error('❌ Error obteniendo categoría:', error);
        return null;
    }
};