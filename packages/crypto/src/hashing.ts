import { fromNumber, fromBigInt, decodeAddress, encodeTxHash } from './encoding';
import bs58 from 'bs58';
import JSBI from 'jsbi';
import { Buffer } from 'buffer';
import { ecdsa } from './ecdsa';

function bufferOrB58(input?: Uint8Array | string): Uint8Array {
    if (typeof input === 'string') {
        return bs58.decode(input);
    }
    if (typeof input === 'undefined') {
        return new Uint8Array([]);
    }
    return input;
}

/**
 * Calculate hash of transaction
 * @param {object} tx Transaction
 * @return {Buffer} transaction hash
 */
export function hash(data: Buffer): Buffer {
    const h = ecdsa.hash();
    h.update(data);
    return Buffer.from(h.digest());
}

/**
 * Transaction body.
 * All fields except nonce, from, and chainIdHash are optional and will assume sensible defaults.
 */
export interface TxBody {
    nonce: number;
    from: string | Record<string, any>;
    chainIdHash: Uint8Array | string;
    amount?: string | number | JSBI | Record<string, any>;
    to?: null | string | Record<string, any>;
    payload?: null | Uint8Array;
    limit?: number;
    price?: string | number | JSBI | Record<string, any>;
    type?: number;
    sign?: string;
}

/**
 * Calculate hash of transaction
 * @param {object} tx Transaction
 * @param {string} encoding bytes (default), base58, base64
 * @return {Buffer | string} transaction hash. If encoding is bytes, the result is a Buffer, otherwise a string.
 */
export async function hashTransaction(tx: TxBody): Promise<string>;
export async function hashTransaction(tx: TxBody, encoding: string, includeSign?: boolean): Promise<Buffer | string>;
export async function hashTransaction(tx: TxBody, encoding: 'base64', includeSign?: boolean): Promise<string>;
export async function hashTransaction(tx: TxBody, encoding: 'base58', includeSign?: boolean): Promise<string>;
export async function hashTransaction(tx: TxBody, encoding: 'bytes', includeSign?: boolean): Promise<Buffer>;
export async function hashTransaction(tx: TxBody, encoding = 'base64', includeSign = true): Promise<Buffer | string> {
    // Amount defaults to zero if tx.amount is falsy
    let amount = '0';
    if (tx.amount) {
        const amountStr = tx.amount.toString().trim();
        if (amountStr !== '') {
            // Throw error if unit is given other than aer
            const amountUnit = amountStr.match(/\s*([^0-9]+)\s*/);
            if (amountUnit && amountUnit[1] !== 'aer') {
                throw Error(`Can only hash amounts provided in the base unit (aer), not '${tx.amount}'. Convert to aer or remove unit.`);
            }
            // Strip unit
            amount = amountStr.replace(/[^0-9]/g,'');
            // Throw error if amount is an empty string at this point (amount with unit but without value)
            if (amount === '') {
                throw Error(`Could not parse numeric value from amount '${tx.amount}'.`);
            }
        }
    }

    const items = [
        fromNumber(tx.nonce, 64),
        decodeAddress(tx.from.toString()),
        tx.to ? decodeAddress(tx.to.toString()) : Buffer.from([]),
        fromBigInt(amount!= '' ? amount : 0),
        tx.payload ? Buffer.from(tx.payload) : Buffer.from([]),
        fromNumber(tx.limit || 0, 64),
        fromBigInt(tx.price ? tx.price.toString() : 0),
        fromNumber(tx.type || 0, 32),
        Buffer.from(bufferOrB58(tx.chainIdHash))
    ];

    let data = Buffer.concat(items.map(item => Buffer.from(item)));

    if (includeSign && typeof tx.sign !== 'undefined') {
        data = Buffer.concat([data, Buffer.from(tx.sign, 'base64')]);
    }

    const result = hash(data);

    if (encoding == 'base64') {
        return Buffer.from(result).toString('base64');
    } else if (encoding == 'base58') {
        return encodeTxHash(Buffer.from(result));
    } else {
        return result;
    }
}
