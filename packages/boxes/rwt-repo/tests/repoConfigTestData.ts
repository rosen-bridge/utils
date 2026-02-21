export const repoConfigBox = {
  boxId: '79033fa1651c85c527bc49fb4dfa00b46e3745e1b318b15e7d09513011ce4856',
  transactionId:
    'cf5dc6aaecdb2215408315feaef8a35a2173d832a64f93bec87f8bae53831a07',
  blockId: '10c528e4df4101e1b1abe98ebf98390f452e2bd7e07fd1ba9c1634fd7d52f452',
  value: 1100000,
  index: 0,
  globalIndex: 9008822,
  creationHeight: 1382728,
  settlementHeight: 1382730,
  ergoTree:
    '100604000400040004000e20a2d7f41b79f98bcaef08214b9e6bf0f3b803e446a9ef5949da799739555165aa0402d803d601b2db6501fe730000d602b2db6308b2a5730100730200d603b2db6308a7730300ea02d196830301aedb63087201d901044d0e938c7204017304938c7202018c720301938c7202028c72030298b2e4c672010510730500ade4c67201041ad901040ecdee7204',
  ergoTreeConstants:
    '0: 0\n1: 0\n2: 0\n3: 0\n4: Coll(-94,-41,-12,27,121,-7,-117,-54,-17,8,33,75,-98,107,-16,-13,-72,3,-28,70,-87,-17,89,73,-38,121,-105,57,85,81,101,-86)\n5: 1',
  ergoTreeScript:
    '{\n  val box1 = CONTEXT.dataInputs(placeholder[Int](0))\n  val tuple2 = OUTPUTS(placeholder[Int](1)).tokens(placeholder[Int](2))\n  val tuple3 = SELF.tokens(placeholder[Int](3))\n  sigmaProp(\n    allOf(\n      Coll[Boolean](\n        box1.tokens.exists({(tuple4: (Coll[Byte], Long)) =\u003E tuple4._1 == placeholder[Coll[Byte]](4) }), tuple2._1 == tuple3._1, tuple2._2 == tuple3._2\n      )\n    )\n  ) && atLeast(box1.R5[Coll[Int]].get(placeholder[Int](5)), box1.R4[Coll[Coll[Byte]]].get.map({(coll4: Coll[Byte]) =\u003E proveDlog(decodePoint(coll4)) }))\n}',
  address:
    'prufxZid3SJMyUVhBMkLFHpReSPj7knVLihVSxxh55yh3X39NhP6cKMVYZYf6cFuP7267DEtkrWxFSbYqfX6zj2qY57ZBCNkFEQnJVGxvyjXnNJ1Nrj5YiymeX2SAb66uYfHxZJQTv9R7S6PE4vvnUp5oC4LbGaC4bo8HkGCUzpvpSLm9qeSzwFXdznsJketE6n6HLGLqNXQ3KZXNaG8',
  assets: [
    {
      tokenId:
        'a8b1007b8f9285441fe43da063793133d14ef7694e108a2b85aca3c5138ab24e',
      index: 0,
      amount: 1,
      name: 'RosenEthereumRepoConfigNFT-Pandora',
      decimals: 0,
      type: 'EIP-004',
    },
  ],
  additionalRegisters: {
    R4: {
      serializedValue: '1106d00f78022880dac409d00f',
      sigmaType: 'Coll[SLong]',
      renderedValue: '[1000,60,1,20,10000000,1000]',
    },
  },
  spentTransactionId: null,
  mainChain: true,
};

export const mockCommitmentRwtCount = 1000n;
export const mockMaxApproval = 20n;
export const mockMinApproval = 1n;
export const mockPercentage = 60;
export const mockCollateralErg = 10000000n;
export const mockCollateralRsn = 1000n;
