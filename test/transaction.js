var zerojs = require('..')
var chai = require('chai')
var expect = chai.expect

it('serializeTx() and desrializeTx() should be deterministic', function () {

  var txobj = zerojs.transaction.createRawTx(
    [{
      txid: '2704a392f88573cb26775e6cf394e4039b430a2375becac454e3e57c88aed59d',
      vout: 0,
      scriptPubKey: '76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20ebd78933082d25d56a47d471ee5d57793454cf3d2787f77c21f9964b02000000034f2902b4'
    }],
    [{address: 't1dmkK8t4PWQwWLaRx63R4U1ZYEXXJn9XBS', satoshis: 100000}]
  )
  var txobj_serialized = zerojs.transaction.serializeTx(txobj)
  var txobj_deserialized = zerojs.transaction.deserializeTx(txobj_serialized)

  // Remove prevScriptPubKey since it's not really an attribute
  for (var i = 0; i < txobj.ins.length; i++) {
    txobj.ins[i].prevScriptPubKey = ''
  }

  expect(txobj_serialized).to.equal('01000000019dd5ae887ce5e354c4cabe75230a439b03e494f36c5e7726cb7385f892a304270000000000ffffffff01a0860100000000001976a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac00000000')
  expect(txobj_deserialized).to.deep.equal(txobj)
})

it('signTx() should be deterministic', function () {

  var txobj = zerojs.transaction.createRawTx(
    [{
      txid: '59982119a451a162afc05d6ffe7c332a8c467d006b3bf95e9ff43599b4ed3d38',
      vout: 0,
      scriptPubKey: '76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20c243be1a6b3d319e40e89b159235a320a1cd50d35c2e52bc79e94b990100000003d92c02b4'
    }],
    [{address: 't1dmkK8t4PWQwWLaRx63R4U1ZYEXXJn9XBS', satoshis: 1000000}]
  )

  const compressPubKey = true
  const SIGHASH_ALL = 1
  var signedobj = zerojs.transaction.signTx(txobj, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c', compressPubKey, SIGHASH_ALL)
  var signed_serialized = zerojs.transaction.serializeTx(signedobj)

  expect(signed_serialized).to.equal('0100000001383dedb49935f49f5ef93b6b007d468c2a337cfe6f5dc0af62a151a419219859000000006a47304402207a9d2c6ffb1dc921cf69787370b4abf4fdc00a195c374098c0ba9ec118c3b45502205083576fd5dec264031e79a54451a8f16e464f5c94530aa339f69dd617710e400121038a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2ffffffff0140420f00000000001976a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac00000000')
})

it('NULL_DATA() should be deterministic', function () {

  var txobj = zerojs.transaction.createRawTx(
    [{
      txid: '59982119a451a162afc05d6ffe7c332a8c467d006b3bf95e9ff43599b4ed3d38',
      vout: 0,
      scriptPubKey: '76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20c243be1a6b3d319e40e89b159235a320a1cd50d35c2e52bc79e94b990100000003d92c02b4'
    }],
    [{address: null, satoshis: 1000000, data: 'hello world'}]
  )

  const compressPubKey = true
  const SIGHASH_ALL = 1
  var signedobj = zerojs.transaction.signTx(txobj, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c', compressPubKey, SIGHASH_ALL)
  var signed_serialized = zerojs.transaction.serializeTx(signedobj)

  expect(signed_serialized).to.equal('0100000001383dedb49935f49f5ef93b6b007d468c2a337cfe6f5dc0af62a151a419219859000000006b483045022100a9a659720902f9e3233f0768431d70d2902729b1cde3361aef874552784c731a022009c9ee101cc26145ddfa20223511faca5b04fa7fac71564c6ab0729dfd9750250121038a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2ffffffff0140420f00000000000d6a0b68656c6c6f20776f726c6400000000')
})

it('multiSign() for x-of-5 should be deterministic', function () {
  var privKeysWIF = [
    'cT3PtbJfU3VVDR9xp667eqqojDhytDbLGkEjTVZ9fDjXYr73FUE4',
    'cNHYho4iuSjiTwR9J56g5HT9SbkXP5Fs2Pq4qM97FTpjGT4psJ4u',
    'cUgD3WxGu6WFC2yyFv6jubxcHGkid62sp77M5HE2aYgsj6FcFcyW',
    'cTs2Zm57Bd18UPiT5JH1shbSd4XBBvdipCebMtwcnrZDH2sh2px2',
    'cPSDZ6VjeLEsSx6JYetJAajN1p5L5Vod8k5haQH9s2M4nyS48NnW']
  var privKeys = privKeysWIF.map((x) => zerojs.address.WIFToPrivKey(x))
  var pubKeys = privKeys.map((x) => zerojs.address.privKeyToPubKey(x, true))
   var addresses = pubKeys.map((x) => zerojs.address.pubKeyToAddr(x, '1d25'))
  var redeemScript = zerojs.address.mkMultiSigRedeemScript(pubKeys, 2, 5)
   var multiSigAddress = zerojs.address.multiSigRSToAddress(redeemScript, '1cba')


  var txobj = zerojs.transaction.createRawTx(
    [{
      txid: 'd6f04de4f1ab745d8d7d3d6846b718b3bef4baf857af4f26e3847162317982d9',
      vout: 0,
      scriptPubKey: ''
    }],
    [{address: 'tmDJPDgfg5ziZwCdKon2VDwtukfrp9yMAHS', satoshis: 5000000000}
    ]
  )

  // Prepare our signatures for mutli-sig
  var sig1 = zerojs.transaction.multiSign(txobj, 0, privKeys[0], redeemScript)
  var sig2 = zerojs.transaction.multiSign(txobj, 0, privKeys[1], redeemScript)
  var tx0 = zerojs.transaction.applyMultiSignatures(txobj, 0, [sig1, sig2], redeemScript)

  // Serialize the transaction
  var serializedTx = zerojs.transaction.serializeTx(tx0)

  expect(serializedTx).to.equal('0100000001d9827931627184e3264faf57f8baf4beb318b746683d7d8d5d74abf1e44df0d600000000fd410100473044022018b4f1f5d66010ab72a2c7bf2a44e76246c59fb7fbfbfe78f764493a19ae081b02200df3d4bd9c78dae669fb03204a53f6f125ab4575606231a9afe02173206af9b201483045022100cb8c6e7c9e4ceb73bcbfe3f809f5fe13c28e9c7118f7a9cf58f5ee0f262fb887022012ef27eab403954447da28ff5af59ed1a629a1ba08ef3822c320ce661a810ca5014cad522103e05e33c3322eebb714a070b3a3d8c4d8df24afaa954b73588fb93d225459a8ec21036e8b46ab143d44946080dfe980ff4b17df278e49bae86002c613b23732b20af32103184c5dad8794b6d9b129748e4bb6f7cc56de42bc05e48f2a09521f8018e637e12103b9119362574b8ce5812f72f23e9bca338a90c4f47dfd0dbb3b9e7aa596b422ad2102d52494ff1c42d4e5dd81bc4940368e15137bb62f0963300217291d11682ccc2255aeffffffff0100f2052a010000001976a914ab523674d9f2ed5a0b300aeb072fc09801363f9f88ac00000000')
})

it('multiSign() and applyMultiSignatures() and should be deterministic', function () {
  var privKeysWIF = ['KxvE58rxEwckkCjemDVdMDp7wzgosnyX1oyjzWmrcAVpV7EaZdSP', 'L5bpskJWAGGWR1GA9SJkCQ2ndHkezqm8GuoWaBesrrwnsa1roSN6', 'L2sjwCsdZQmckKkTKGDqhKcWtbe3EU2FL4N1YHpD2SC1GhHRhqxF']

  var priv1 = zerojs.address.WIFToPrivKey(privKeysWIF[0])
  var priv2 = zerojs.address.WIFToPrivKey(privKeysWIF[1])
  var priv3 = zerojs.address.WIFToPrivKey(privKeysWIF[2])

  var redeemScript = '522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53ae'


  var txobj = zerojs.transaction.createRawTx(
    [{
      txid: 'f5f324064de9caab9353674c59f1c3987ca997bf5882a41a722686883e089581',
      vout: 0,
      scriptPubKey: ''
    }],
    [{address: 't14oHp2v54vfmdgQ3v3SNuQga8JKHTNi2a1', satoshis: 10000}]
  )

  // Signatures Must be in order
  var sig1 = zerojs.transaction.multiSign(txobj, 0, priv3, redeemScript)
  var sig2 = zerojs.transaction.multiSign(txobj, 0, priv2, redeemScript)

  expect(sig1).to.equal('304402200f15811d9116230ff14d2b5af3014f7d42e7e1ffb280169b3dc003f02d78039302201d0e33ffd19d9aaafce0c1bbff1913ad244678e963f65bd493a7502d7eb65fa501')
  expect(sig2).to.equal('304402205fd2a39a83fbe6c8a2e188ef7af2f259bc5bd205ff2f965066a55b0a1e4afb6f022011ec5f1c568ec8b70e41fe353ca5a2cc53c1a12678950efaad21c2f836423c5901')

  var tx0 = zerojs.transaction.applyMultiSignatures(txobj, 0, [sig1, sig2], redeemScript)

  var serializedTx = zerojs.transaction.serializeTx(tx0)

  expect(serializedTx).to.equal('01000000018195083e888626721aa48258bf97a97c98c3f1594c675393abcae94d0624f3f500000000fc0047304402200f15811d9116230ff14d2b5af3014f7d42e7e1ffb280169b3dc003f02d78039302201d0e33ffd19d9aaafce0c1bbff1913ad244678e963f65bd493a7502d7eb65fa50147304402205fd2a39a83fbe6c8a2e188ef7af2f259bc5bd205ff2f965066a55b0a1e4afb6f022011ec5f1c568ec8b70e41fe353ca5a2cc53c1a12678950efaad21c2f836423c59014c69522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53aeffffffff0110270000000000001976a914964f1832d9aa7e943d5dd8f84862393b935bbbad88ac00000000')

  var deserializedTx = {
    version: 1,
    locktime: 0,
    ins: [ {
      output: { hash: 'f5f324064de9caab9353674c59f1c3987ca997bf5882a41a722686883e089581', vout: 0 },
      script: '0047304402200f15811d9116230ff14d2b5af3014f7d42e7e1ffb280169b3dc003f02d78039302201d0e33ffd19d9aaafce0c1bbff1913ad244678e963f65bd493a7502d7eb65fa50147304402205fd2a39a83fbe6c8a2e188ef7af2f259bc5bd205ff2f965066a55b0a1e4afb6f022011ec5f1c568ec8b70e41fe353ca5a2cc53c1a12678950efaad21c2f836423c59014c69522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53ae',
      sequence: 'ffffffff',
      prevScriptPubKey: ''
    } ],
    outs: [ { satoshis: 10000, script: '76a914964f1832d9aa7e943d5dd8f84862393b935bbbad88ac' } ]
  }

  expect(zerojs.transaction.deserializeTx(serializedTx)).to.deep.equal(deserializedTx)
})
