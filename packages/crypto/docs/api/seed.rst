==============
Keys from seed
==============

Key generation from seeds follows BIP39/BIP44.

The derivation path used here by default is :code:`m/44'/441'/0'/0/n`, but you can supply a custom one.

Mnemonic seed
=============

BIP39 mnemonic seed phrases

.. js:autofunction:: privateKeysFromMnemonic
.. js:autofunction:: privateKeyFromMnemonic
.. js:autofunction:: generateMnemonic
.. js:autofunction:: mnemonicToSeed

Raw seed
========
.. js:autofunction:: privateKeysFromSeed
.. js:autofunction:: privateKeyFromSeed

.. js:autoclass:: Options
   :members: