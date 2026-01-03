export const collateralBoxInfo = {
  boxId: '69db72d1f14918acb5c442b8a891f204a4f813b169316bbefe86f5f0b88d5395',
  transactionId:
    '299f252d336f50acb89beb41fb81ebcca0dd1610a658d3404190ec4d71829ca2',
  blockId: '4cbf2c5bfde363895e1c557e6d35db3d622a068aac377d560c85f6f5acd6c67e',
  value: 10000000,
  index: 1,
  globalIndex: 18151734,
  creationHeight: 1688797,
  settlementHeight: 1688798,
  ergoTree:
    '101b04000400040204020e20ac7bbfff7ec3852afae13153a9a5b063ac26fc43a780aa3468cec8c9cdd176b30400040204020400040604000402040204020101050004060400050401010406040005040502040004060400d807d601b2a5730000d602b2a4730100d603db63087202d604998cb2db63087201730200028cb2720373030002d605e4c6a70505d6067304d607e4c6a7040e958f72047205d804d608db6308a7d6098cb2720873050001d60ab2a5730600d60bdb6308720ad19683090193c5a7c5b2a4730700938cb27203730800017206938cb2720373090001720993c1720ac1a7938cb2720b730a000172099591b17208730bd802d60cb2720b730c00d60db27208730d00ed938c720c018c720d01938c720c028c720d02730e93e4c6720a040e7207939ae4c6720a050572047205958f7204730fd801d60cb2db6308b2a5731000731100ed938c720c017207928c720c0273127313d801d608b2db6308b2a4731400731500d196830501938c7208017207928c7208027316939ae4c6720105057317e4c672020505938cb27203731800017206938cb27203731900018cb2db6308a7731a0001',
  ergoTreeConstants:
    '0: 0\n1: 0\n2: 1\n3: 1\n4: Coll(-84,123,-65,-1,126,-61,-123,42,-6,-31,49,83,-87,-91,-80,99,-84,38,-4,67,-89,-128,-86,52,104,-50,-56,-55,-51,-47,118,-77)\n5: 0\n6: 1\n7: 1\n8: 0\n9: 3\n10: 0\n11: 1\n12: 1\n13: 1\n14: true\n15: 0\n16: 3\n17: 0\n18: 2\n19: true\n20: 3\n21: 0\n22: 2\n23: 1\n24: 0\n25: 3\n26: 0',
  ergoTreeScript:
    '{\n  val box1 = OUTPUTS(placeholder[Int](0))\n  val box2 = INPUTS(placeholder[Int](1))\n  val coll3 = box2.tokens\n  val l4 = box1.tokens(placeholder[Int](2))._2 - coll3(placeholder[Int](3))._2\n  val l5 = SELF.R5[Long].get\n  val coll6 = placeholder[Coll[Byte]](4)\n  val coll7 = SELF.R4[Coll[Byte]].get\n  if (l4 \u003C l5) {(\n    val coll8 = SELF.tokens\n    val coll9 = coll8(placeholder[Int](5))._1\n    val box10 = OUTPUTS(placeholder[Int](6))\n    val coll11 = box10.tokens\n    sigmaProp(\n      allOf(\n        Coll[Boolean](\n          SELF.id == INPUTS(placeholder[Int](7)).id, coll3(placeholder[Int](8))._1 == coll6, coll3(\n            placeholder[Int](9)\n          )._1 == coll9, box10.value == SELF.value, coll11(placeholder[Int](10))._1 == coll9, if (coll8.size \u003E placeholder[Int](11)) {(\n            val tuple12 = coll11(placeholder[Int](12))\n            val tuple13 = coll8(placeholder[Int](13))\n            (tuple12._1 == tuple13._1) && (tuple12._2 == tuple13._2)\n          )} else { placeholder[Boolean](14) }, box10.R4[Coll[Byte]].get == coll7, box10.R5[Long].get + l4 == l5, if (l4 \u003C placeholder[Long](15)) {(\n            val tuple12 = OUTPUTS(placeholder[Int](16)).tokens(placeholder[Int](17))\n            (tuple12._1 == coll7) && (tuple12._2 \u003E= placeholder[Long](18))\n          )} else { placeholder[Boolean](19) }\n        )\n      )\n    )\n  )} else {(\n    val tuple8 = INPUTS(placeholder[Int](20)).tokens(placeholder[Int](21))\n    sigmaProp(\n      allOf(\n        Coll[Boolean](\n          tuple8._1 == coll7, tuple8._2 \u003E= placeholder[Long](22), box1.R5[Long].get + placeholder[Long](23) == box2.R5[Long].get, coll3(\n            placeholder[Int](24)\n          )._1 == coll6, coll3(placeholder[Int](25))._1 == SELF.tokens(placeholder[Int](26))._1\n        )\n      )\n    )\n  )}\n}',
  address:
    'ChTbcUHgBNqNMVjzUp9HtAxHMFLTWkVzMDWgkptiyNxaQXzwfEjEoUjXkcL81JRowPLk6j7UFSdUWYqbnTXJUzT9tJmiESe4y4e4QqHwMesAzFMmT13oyrLA5QZa8c6ySKeyVQnVnDKDJp92qhSNWrDmeD6n9ca2JSrWFpdYhyzfiPh3zvJk58Mo61YNKiKoF5XPRfNabzZgsm8fU3sBg7ehYrGA4p385HQza768HbzFNTfuUVa8nuuEVKzWbNPfJPPyGaHy3fCqQRaUyRGQbjg7rk1c3eb1Fv3QY4BEJBEmBcGRTfLTbatnV36gmFGJagbjYfRpYvHoZqkEzgpF8JBtcE9Jx4DwnxD75smUqANfMwYctUakhgNdMBv6gJgL7SuKnWYgYE9ohptFf258UjLVfi5yN7nRhpSt3FXdrnXbAZkL485ATxViMeC4Mz4MjMTftuPFFE9fByY1VAPM6jLtevn8J6hGJWft9gMeBfaXAjs5iiVWQyRBDbdtpSAyu4vUPpEfekextUSwnb35dVr99ayKDpBPuViUfHsqxYMAxDhQAVFatHcjRW4dPT7oCLg5He9T2YTA56zx',
  assets: [
    {
      tokenId:
        'fb2a47295e30289f3748eb35a325c11db5202b7420ee9588c67f7486de2662db',
      index: 0,
      amount: 1,
      name: 'RosenErgoAWC-Pandora',
      decimals: 0,
      type: 'EIP-004',
    },
    {
      tokenId:
        'd752bede1a85891fff344604431fd6dc30ba685b382f2e0fe15da8141d36e34e',
      index: 1,
      amount: 1000,
      name: 'RSN-Pandora',
      decimals: 3,
      type: 'EIP-004',
    },
  ],
  additionalRegisters: {
    R4: {
      serializedValue:
        '0e20163dd94c65197844769bc5cffbe329a6ca1fef23dcbd2dd0694de846c2094b4b',
      sigmaType: 'Coll[SByte]',
      renderedValue:
        '163dd94c65197844769bc5cffbe329a6ca1fef23dcbd2dd0694de846c2094b4b',
    },
    R5: {
      serializedValue: '05807d',
      sigmaType: 'SLong',
      renderedValue: '8000',
    },
  },
  spentTransactionId: null,
  mainChain: true,
};
