"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNextCode = generateNextCode;
const db_1 = require("../db");
/**
 * Generates the next sequential code for a given prefix.
 * Example: prefix='PDK', table='khach_hang', column='ma_phieu' → 'PDK001'
 */
async function generateNextCode(prefix, table, column) {
    const result = await (0, db_1.query)(`SELECT ${column} FROM ${table} WHERE ${column} LIKE $1 ORDER BY ${column} DESC LIMIT 1`, [`${prefix}%`]);
    if (result.rows.length === 0) {
        return `${prefix}001`;
    }
    const lastCode = result.rows[0][column];
    const lastNumber = parseInt(lastCode.replace(prefix, ''), 10);
    const nextNumber = lastNumber + 1;
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}
