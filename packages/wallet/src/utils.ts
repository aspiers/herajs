import { AccountSpec } from './models/account';
import { TypedEventEmitter } from '@elderapo/typed-event-emitter';

/**
 * Returns the next interval to use for exponential backoff.
 * This curve yields every value 4 times before doubling in the next step.
 * The function is :code:`multiplier * 2**Math.floor(n/4)`.
 * By default (multiplier = 1s), the intervals reach ca. 1 minute (total time elapsed ca. 4 minutes) after step 24,
 * so it is advised to declare a timeout after a certain number of steps.
 * @param n step on the interval curve
 * @param multiplier multiplier, default 1000 (1s)
 */
export function backoffIntervalStep(n: number, multiplier = 1000): number {
    return multiplier * 2**Math.floor(n/4);
}

/**
 * Serializes accountSpec, e.g. { chainId: 'foo', address: 'bar' } => foo/bar
 * @param accountSpec 
 */
export function serializeAccountSpec(accountSpec: AccountSpec): string {
    const chainId = typeof accountSpec.chainId === 'undefined' ? '' : accountSpec.chainId;
    return `${chainId}/${accountSpec.address}`;
}

/**
 * Deserializes accountSpec, e.g. foo/bar => { chainId: 'foo', address: 'bar' }.
 * If string has no /, uses whole string as address with empty chainId.
 * @param accountSpec 
 */
export function deserializeAccountSpec(serialized: string): AccountSpec {
    const parts = serialized.split('/');
    if (parts.length === 1) {
        return {
            address: serialized
        };
    }
    if (parts.length === 2 && parts[0] === '') {
        return {
            address: parts[1]
        };
    }
    return {
        address: parts[1],
        chainId: parts[0]
    };
}

/**
 * A simple extension of the native Map using stringified objects as keys.
 * The order of object properties matters.
 */
export class HashMap<K, V> {
    private map: Map<string, V> = new Map();

    private hash(key: K): string {
        return typeof key === 'string' ? key : JSON.stringify(key);
    }

    set(key: K, value: V): this {
        this.map.set(this.hash(key), value);
        return this;
    }

    get(key: K): V | undefined {
        return this.map.get(this.hash(key));
    }

    has(key: K): boolean {
        return this.map.has(this.hash(key));
    }

    delete(key: K): boolean {
        return this.map.delete(this.hash(key));
    }

    clear(): void {
        this.map.clear();
    }

    values() {
        return this.map.values();
    }

    keys() {
        return this.map.keys();
    }

    get size() {
        return this.map.size;
    }
}

export class PausableTypedEventEmitter<T> extends TypedEventEmitter<T> {
    paused: boolean = true;

    resume(): void {
        if (!this.paused) return;
        this.paused = false;
    }

    pause(): void {
        if (this.paused) return;
        this.paused = true;
    }
}

export interface Constructor<T> {
    new (...args : any[]): T;
}

export function isConstructor<T>(arg: T | Constructor<T>): arg is Constructor<T> {
    return (typeof arg === 'function');
}

/**
 * Access a property using dot syntax
 * Example: propPath({ a: { b: 1 }}, 'a.b') => 1
 * @param obj 
 * @param path 
 */
export function propPath(obj: any, path: string): any {
    if (typeof obj === 'undefined') return undefined;
    const dotIndex = path.indexOf('.');
    if (dotIndex !== -1) {
        if (typeof obj !== 'object') return undefined;
        const [firstSegment, rest] = [path.slice(0, dotIndex), path.slice(dotIndex + 1)];
        return propPath(obj[firstSegment], rest);
    }
    return obj[path];
}