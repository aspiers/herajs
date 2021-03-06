export {
    encodeAddress,
    decodeAddress,
    encodePrivateKey,
    decodePrivateKey,
} from './encoding';

export {
    createIdentity,
    identityFromPrivateKey as identifyFromPrivateKey, // DEPRECATED (legacy typo)
    identityFromPrivateKey,
    addressFromPublicKey,
    publicKeyFromAddress,
    decryptPrivateKey,
    encryptPrivateKey,
} from './keys';

export {
    signMessage,
    signTransaction,
    verifySignature,
    verifyTxSignature,
} from './signing';

export {
    hash,
    hashTransaction,
} from './hashing';

export {
    generateMnemonic,
    mnemonicToSeed,
    privateKeyFromSeed,
    privateKeysFromSeed,
    privateKeyFromMnemonic,
    privateKeysFromMnemonic,
} from './seed';

export {
    identityFromKeystore,
    keystoreFromPrivateKey,
} from './keystore';