// @flow
var bs58check = require('bs58check')
var secp256k1 = require('secp256k1')
var bigi = require('bigi')
var zcrypto = require('./crypto')
var zconfig = require('./config')

/*
 * Makes a private key
 * @param {String} phrase (Password phrase)
 * @return {Sting} Private key
 */
function mkPrivKey (phrase: string): string {
  return zcrypto.sha256(Buffer.from(phrase, 'utf-8'))
}

/*
 * Converts a private key to WIF format
 * @param {String} privKey (private key)
 * @param {boolean} toCompressed (Convert to WIF compressed key or nah)
 * @return {Sting} WIF format (uncompressed)
 */
function privKeyToWIF (privKey: string, toCompressed: boolean): string {
  toCompressed = toCompressed || false

  if (toCompressed) privKey = privKey + '01'

  return bs58check.encode(Buffer.from(zconfig.wif + privKey, 'hex'))
}

/*
 * Returns private key's public Key
 * @param {String} privKey (private key)
 * @param {boolean} toCompressed (Convert to public key compressed key or nah)
 * @return {Sting} Public Key (default: uncompressed)
 */
function privKeyToPubKey (privKey: string, toCompressed: boolean): string {
  toCompressed = toCompressed || false

  const pkBuffer = Buffer.from(privKey, 'hex')
  var publicKey = secp256k1.publicKeyCreate(pkBuffer, toCompressed)
  return publicKey.toString('hex')
}

/*
 * Given a WIF format pk, convert it back to the original pk
 * @param {String} privKey (private key)
 * @return {Sting} Public Key (uncompressed)
 */
function WIFToPrivKey (wifPk: string): string {
  var og = bs58check.decode(wifPk, 'hex').toString('hex')
  og = og.substr(2, og.length) // remove WIF format ('80')

  // remove the '01' at the end to 'compress it' during WIF conversion
  if (og.length > 64) {
    og = og.substr(0, 64)
  }

  return og
}

/*
 * Converts public key to zencash address
 * @param {String} pubKey (public key)
 * @return {Sting} zencash address
 */
function pubKeyToAddr (pubKey: string): string {
  const hash160 = zcrypto.hash160(Buffer.from(pubKey, 'hex'))
  return bs58check
    .encode(Buffer.from(zconfig.pubKeyHash + hash160, 'hex'))
    .toString('hex')
}

module.exports = {
  mkPrivKey: mkPrivKey,
  privKeyToWIF: privKeyToWIF,
  privKeyToPubKey: privKeyToPubKey,
  pubKeyToAddr: pubKeyToAddr,
  WIFToPrivKey: WIFToPrivKey
}