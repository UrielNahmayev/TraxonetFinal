using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Traxonet.Data
{
    public class EncryptionConverter : ValueConverter<string, string>
    {
        private static byte[] _aesKey;
        private static readonly byte[] _staticIV = new byte[16];

        public EncryptionConverter(IConfiguration config)
            : base(
                v => Encrypt(v),
                v => Decrypt(v))
        {
            if (_aesKey == null)
            {
                var rsaPrivBase64 = config["EncryptionSettings:RsaPrivateKey"];
                var aesEncBase64 = config["EncryptionSettings:EncryptedAesKey"];

                if (!string.IsNullOrEmpty(rsaPrivBase64) && !string.IsNullOrEmpty(aesEncBase64))
                {
                    using var rsa = RSA.Create(2048);
                    rsa.ImportPkcs8PrivateKey(Convert.FromBase64String(rsaPrivBase64), out _);
                    _aesKey = rsa.Decrypt(Convert.FromBase64String(aesEncBase64), RSAEncryptionPadding.OaepSHA256);
                }
            }
        }

        private static string Encrypt(string plainText)
        {
            if (string.IsNullOrEmpty(plainText) || _aesKey == null) return plainText;
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

        private static string Decrypt(string cipherTextBase64)
        {
            if (string.IsNullOrEmpty(cipherTextBase64) || _aesKey == null) return cipherTextBase64;
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
                return cipherTextBase64; // In case it's not encrypted
            }
        }
    }
}
