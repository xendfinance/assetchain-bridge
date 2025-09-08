/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/assetchain_bridge_solana.json`.
 */
export type AssetchainBridgeSolana = {
  "address": "5Ff1K9UAT3RWqdZ24qcF3w3UNTvXWkfaqirQgWzgdsYb",
  "metadata": {
    "name": "assetchainBridgeSolana",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "fulfill",
      "discriminator": [
        143,
        2,
        52,
        206,
        174,
        164,
        247,
        72
      ],
      "accounts": [
        {
          "name": "tokenMint"
        },
        {
          "name": "emptyAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  102,
                  117,
                  108,
                  102,
                  105,
                  108,
                  108,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "nonce"
              },
              {
                "kind": "arg",
                "path": "_from_chain.byte"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "bridgeTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "feeAccount",
          "writable": true
        },
        {
          "name": "bridgeParams",
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  98,
                  114,
                  105,
                  100,
                  103,
                  101,
                  95,
                  112,
                  97,
                  114,
                  97,
                  109,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "fromChainData",
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  105,
                  110,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              },
              {
                "kind": "arg",
                "path": "_from_chain.byte"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "currentChain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        },
        {
          "name": "fromChain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "tokenMint"
        },
        {
          "name": "bridgeTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeAccount",
          "writable": true
        },
        {
          "name": "bridgeParams",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  98,
                  114,
                  105,
                  100,
                  103,
                  101,
                  95,
                  112,
                  97,
                  114,
                  97,
                  109,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "feeSend",
          "type": "u16"
        },
        {
          "name": "feeFulfill",
          "type": "u16"
        },
        {
          "name": "limitSend",
          "type": "u64"
        },
        {
          "name": "paused",
          "type": "bool"
        },
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "currentChain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        }
      ]
    },
    {
      "name": "send",
      "discriminator": [
        102,
        251,
        20,
        187,
        65,
        75,
        12,
        69
      ],
      "accounts": [
        {
          "name": "sendNonce",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  95,
                  110,
                  111,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "sendTx",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  110,
                  100,
                  95,
                  116,
                  120
                ]
              },
              {
                "kind": "arg",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "tokenMint"
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "send_nonce.nonce",
                "account": "userNonce"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "bridgeTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "feeAccount",
          "writable": true
        },
        {
          "name": "bridgeParams",
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  98,
                  114,
                  105,
                  100,
                  103,
                  101,
                  95,
                  112,
                  97,
                  114,
                  97,
                  109,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "toChainData",
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  105,
                  110,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              },
              {
                "kind": "arg",
                "path": "to_chain.byte"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "pubkey"
        },
        {
          "name": "tokenMint",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "to",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        },
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "toChain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        },
        {
          "name": "currentChain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        }
      ]
    },
    {
      "name": "setChainData",
      "discriminator": [
        214,
        54,
        247,
        40,
        78,
        208,
        151,
        153
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "chainData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  105,
                  110,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              },
              {
                "kind": "arg",
                "path": "_chain.byte"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenMint",
          "type": "pubkey"
        },
        {
          "name": "enabled",
          "type": "bool"
        },
        {
          "name": "exchangeRateFrom",
          "type": "u64"
        },
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "currentChain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        },
        {
          "name": "chain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        }
      ]
    },
    {
      "name": "setParams",
      "discriminator": [
        27,
        234,
        178,
        52,
        147,
        2,
        187,
        141
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "bridgeParams",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  98,
                  114,
                  105,
                  100,
                  103,
                  101,
                  95,
                  112,
                  97,
                  114,
                  97,
                  109,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "feeAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "tokenMint",
          "type": "pubkey"
        },
        {
          "name": "feeSend",
          "type": "u16"
        },
        {
          "name": "feeFulfill",
          "type": "u16"
        },
        {
          "name": "limitSend",
          "type": "u64"
        },
        {
          "name": "paused",
          "type": "bool"
        },
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "currentChain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "tokenMint"
        },
        {
          "name": "withdrawTokenAccount",
          "writable": true
        },
        {
          "name": "bridgeTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "version"
              },
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "_current_chain.byte"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "currentChain",
          "type": {
            "defined": {
              "name": "bytes32"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bridgeParams",
      "discriminator": [
        249,
        32,
        241,
        181,
        92,
        58,
        96,
        253
      ]
    },
    {
      "name": "bridgeSendTx",
      "discriminator": [
        29,
        194,
        22,
        87,
        127,
        246,
        127,
        151
      ]
    },
    {
      "name": "chainData",
      "discriminator": [
        70,
        133,
        31,
        188,
        8,
        245,
        216,
        203
      ]
    },
    {
      "name": "emptyAccount",
      "discriminator": [
        174,
        156,
        186,
        113,
        230,
        158,
        33,
        215
      ]
    },
    {
      "name": "userNonce",
      "discriminator": [
        235,
        133,
        1,
        243,
        18,
        135,
        88,
        224
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "sendFeeTooHigh"
    },
    {
      "code": 6001,
      "name": "fulfillFeeTooHigh"
    },
    {
      "code": 6002,
      "name": "exchangeRateZero"
    },
    {
      "code": 6003,
      "name": "bridgePaused"
    },
    {
      "code": 6004,
      "name": "chainDisabled"
    },
    {
      "code": 6005,
      "name": "amountTooLow"
    },
    {
      "code": 6006,
      "name": "withdrawZero"
    },
    {
      "code": 6007,
      "name": "sendLimitExceeded"
    },
    {
      "code": 6008,
      "name": "amountUneven"
    }
  ],
  "types": [
    {
      "name": "bridgeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeSend",
            "type": "u16"
          },
          {
            "name": "feeFulfill",
            "type": "u16"
          },
          {
            "name": "limitSend",
            "type": "u64"
          },
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "bridgeSendTx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initiator",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "to",
            "type": {
              "defined": {
                "name": "bytes32"
              }
            }
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "toChain",
            "type": {
              "defined": {
                "name": "bytes32"
              }
            }
          },
          {
            "name": "block",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bytes32",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "byte",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "chainData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "enabled",
            "type": "bool"
          },
          {
            "name": "exchangeRateFrom",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "emptyAccount",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "userNonce",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
