import { it, expect, describe } from 'vitest';
import PrivateKey from "@relayx/crypto/lib/bitcoin/PrivateKey";
import { ProjectivePoint } from '@noble/secp256k1'
import { decrypt, encrypt } from './ecies'
import JSBI from 'jsbi';

const aliceKey = new PrivateKey(
  "L1Ejc5dAigm5XrM3mNptMEsNnHzS7s51YxU7J61ewGshZTKkbmzJ"
);
const bobKey = new PrivateKey(
  "KxfxrUXSMjJQcb3JgnaaA6MqsrKQ1nBSxvhuigdKRyFiEm6BZDgG"
);

function jsbiToNativeBigInt(jsbi: JSBI) {
    return BigInt(jsbi.toString());
}

describe("ECIES", function () {

  it("decrypts", async function () {
    const m1 = Buffer.from("this is my test message");
    expect(
     ( await decrypt(
        jsbiToNativeBigInt(aliceKey.bn),
          Buffer.from(
            "QklFMQOGFyMXLo9Qv047K3BYJhmnJgt58EC8skYP/R2QU/U0yXXHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbiaH4FsxKIOOvzolIFVAS0FplUmib2HnlAM1yP/iiPsU=",
            "base64"
          )
        ))
        .toString()
    ).toEqual(m1.toString());
    expect(
      (await decrypt(
        jsbiToNativeBigInt(bobKey.bn),
          Buffer.from(
            "QklFMQM55QTWSSsILaluEejwOXlrBs1IVcEB4kkqbxDz4Fap53XHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbvZJHgyAzxA6SoujduvJXv+A9ri3po9veilrmc8p6dwo=",
            "base64"
          )
        ))
        .toString()
    ).toEqual(m1.toString());
  });

  const message = "attack at dawn";
  const encrypted =
    "QklFMQM55QTWSSsILaluEejwOXlrBs1IVcEB4kkqbxDz4Fap56+ajq0hzmnaQJXwUMZ/DUNgEx9i2TIhCA1mpBFIfxWZy+sH6H+sqqfX3sPHsGu0ug==";
  const encBuf = Buffer.from(encrypted, "base64");

  it("encrypts", async function () {
    const ciphertext = await encrypt(
        jsbiToNativeBigInt(aliceKey.bn),
        ProjectivePoint.fromPrivateKey(jsbiToNativeBigInt(aliceKey.bn)),
        Buffer.from(message)
    );
    expect(Buffer.isBuffer(ciphertext)).toEqual(true);
    expect(ciphertext.toString("base64")).toEqual(encrypted);
  });

  it("correctly decrypts a message", async function () {
    const decrypted = (await decrypt(jsbiToNativeBigInt(bobKey.bn), encBuf)).toString();
    expect(decrypted).toEqual(message);
  });

  /*  it("correctly recovers a message", function () {
    const decrypted = aliceReloaded.decrypt(encBuf).toString();
    expect(decrypted).toEqual(message);
  });*/

  it("retrieves senders publickey from the encypted buffer", async function () {
    const decrypted = (await decrypt(jsbiToNativeBigInt(bobKey.bn), encBuf)).toString();
    // FIXME
    //    bob2._publicKey.toDER().should.deep.equal(aliceKey.publicKey.toDER());
    expect(decrypted).toEqual(message);
  });

  const message1 = "This is message from first sender";
  const message2 = "This is message from second sender";

  /*  it("decrypt messages from different senders", function () {
    var sender1 = ECIES().publicKey(bobKey.publicKey);
    var sender2 = ECIES().publicKey(bobKey.publicKey);
    var bob2 = ECIES().privateKey(bobKey);
    var decrypted1 = bob2.decrypt(sender1.encrypt(message1)).toString();
    var decrypted2 = bob2.decrypt(sender2.encrypt(message2)).toString();
    decrypted1.should.equal(message1);
    decrypted2.should.equal(message2);
  }); */
  it("roundtrips", async function () {
    const secret = "some secret message!!!";
    const e1 = await encrypt(
        jsbiToNativeBigInt(aliceKey.bn),
        ProjectivePoint.fromPrivateKey(jsbiToNativeBigInt(aliceKey.bn)),
        Buffer.from(secret)
    );
    const decrypted = (await decrypt(jsbiToNativeBigInt(bobKey.bn), e1)).toString();
    expect(decrypted).toEqual(secret);
  });
  /*
  it("roundtrips (no public key)", function () {
    alice.opts.noKey = true;
    bob.opts.noKey = true;
    var secret = "some secret message!!!";
    var encrypted = alice.encrypt(secret);
    var decrypted = bob.decrypt(encrypted).toString();
    decrypted.should.equal(secret);
  });
*/
  /*  it("roundtrips (short tag)", function () {
    alice.opts.shortTag = true;
    bob.opts.shortTag = true;
    var secret = "some secret message!!!";
    var encrypted = alice.encrypt(secret);
    var decrypted = bob.decrypt(encrypted).toString();
    decrypted.should.equal(secret);
  });*/

  /*  it("roundtrips (no public key & short tag)", function () {
    alice.opts.noKey = true;
    alice.opts.shortTag = true;
    bob.opts.noKey = true;
    bob.opts.shortTag = true;
    var secret = "some secret message!!!";
    var encrypted = alice.encrypt(secret);
    var decrypted = bob.decrypt(encrypted).toString();
    decrypted.should.equal(secret);
  });*/

  it("correctly fails if trying to decrypt a bad message", async function () {
    const e1 = Buffer.from(encBuf);
    e1[e1.length - 1] = 2;
    expect(async function () {
      return await decrypt(jsbiToNativeBigInt(bobKey.bn), e1);
    }).rejects.toThrow("Invalid checksum");
  });

  /*
  it("decrypting uncompressed keys", function () {
    var secret = "test";

    // test uncompressed
    var alicePrivateKey = bsv.PrivateKey.fromObject({
      bn: "1fa76f9c799ca3a51e2c7c901d3ba8e24f6d870beccf8df56faf30120b38f360",
      compressed: false,
      network: "livenet",
    });
    var alicePublicKey = bsv.PublicKey.fromPrivateKey(alicePrivateKey); // alicePrivateKey.publicKey
    alicePrivateKey.compressed.should.equal(false);

    var cypher1 = ECIES().privateKey(alicePrivateKey).publicKey(alicePublicKey);
    var encrypted = cypher1.encrypt(secret);

    var cypher2 = ECIES().privateKey(alicePrivateKey).publicKey(alicePublicKey);
    var decrypted = cypher2.decrypt(encrypted);
    secret.should.equal(decrypted.toString());
  });

  it("decrypting compressed keys", function () {
    var secret = "test";

    // test compressed
    var alicePrivateKey = bsv.PrivateKey.fromObject({
      bn: "1fa76f9c799ca3a51e2c7c901d3ba8e24f6d870beccf8df56faf30120b38f360",
      compressed: true,
      network: "livenet",
    });
    var alicePublicKey = bsv.PublicKey.fromPrivateKey(alicePrivateKey); // alicePrivateKey.publicKey
    alicePrivateKey.compressed.should.equal(true);

    var cypher1 = ECIES().privateKey(alicePrivateKey).publicKey(alicePublicKey);
    var encrypted = cypher1.encrypt(secret);

    var cypher2 = ECIES().privateKey(alicePrivateKey).publicKey(alicePublicKey);
    var decrypted = cypher2.decrypt(encrypted);
    secret.should.equal(decrypted.toString());
  });*/
});
