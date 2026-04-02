using System;
using System.Security.Cryptography;
using System.Text.Json;
using System.IO;

var rsa = RSA.Create(2048);
var privateKeyBytes = rsa.ExportPkcs8PrivateKey();

var aesKey = new byte[32];
RandomNumberGenerator.Fill(aesKey);
var encryptedAes = rsa.Encrypt(aesKey, RSAEncryptionPadding.OaepSHA256);

var config = new {
    EncryptionSettings = new {
        RsaPrivateKey = Convert.ToBase64String(privateKeyBytes),
        EncryptedAesKey = Convert.ToBase64String(encryptedAes)
    }
};

File.WriteAllText("keys.json", JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true }));
