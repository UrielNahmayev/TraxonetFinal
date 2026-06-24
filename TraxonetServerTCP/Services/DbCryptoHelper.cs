using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace TraxonetServer_TCP.Services
{
    public class DbCryptoHelper
    {
        private readonly byte[] _aesKey;
        private readonly byte[] _staticIV = new byte[16];

        public DbCryptoHelper(IConfiguration config)
        {
            var rsaPrivBase64 = config["EncryptionSettings:RsaPrivateKey"];
            var aesEncBase64 = config["EncryptionSettings:EncryptedAesKey"];

            using var rsa = RSA.Create(2048);
            rsa.ImportPkcs8PrivateKey(Convert.FromBase64String(rsaPrivBase64), out _);
            _aesKey = rsa.Decrypt(Convert.FromBase64String(aesEncBase64), RSAEncryptionPadding.OaepSHA256);
        }

        public string Encrypt(string plainText)
        {
            if (string.IsNullOrEmpty(plainText)) return plainText;
            using var aes = Aes.Create();
            aes.KeySize = 256;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.Key = _aesKey;
            aes.IV = _staticIV;

            using var encryptor = aes.CreateEncryptor();
            byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
            byte[] cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
            return Convert.ToBase64String(cipherBytes);
        }

        public string Decrypt(string cipherTextBase64)
        {
            if (string.IsNullOrEmpty(cipherTextBase64)) return cipherTextBase64;
            try
            {
                using var aes = Aes.Create();
                aes.KeySize = 256;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;
                aes.Key = _aesKey;
                aes.IV = _staticIV;

                using var decryptor = aes.CreateDecryptor();
                byte[] cipherBytes = Convert.FromBase64String(cipherTextBase64);
                byte[] plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
                return Encoding.UTF8.GetString(plainBytes);
            }
            catch
            {
                return cipherTextBase64;
            }
        }
    }
}
