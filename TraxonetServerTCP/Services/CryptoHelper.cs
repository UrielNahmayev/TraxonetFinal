using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;

namespace TraxonetServer_TCP.Services
{
    public class CryptoHelper
    {
        private readonly RSA _rsa;

        public CryptoHelper()
        {
            _rsa = RSA.Create(2048);
        }

        // === RSA ===

        /// <summary>
        /// Exports the RSA public key as raw bytes (SubjectPublicKeyInfo format).
        /// </summary>
        public byte[] ExportRsaPublicKey()
        {
            return _rsa.ExportSubjectPublicKeyInfo();
        }

        /// <summary>
        /// Decrypts data that was encrypted with the RSA public key.
        /// </summary>
        public byte[] RsaDecrypt(byte[] encryptedData)
        {
            return _rsa.Decrypt(encryptedData, RSAEncryptionPadding.OaepSHA256);
        }

        // === AES ===

        /// <summary>
        /// Encrypts plaintext using AES-256-CBC.
        /// </summary>
        public static byte[] AesEncrypt(string plainText, byte[] key, byte[] iv)
        {
            using var aes = Aes.Create();
            aes.KeySize = 256;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.Key = key;
            aes.IV = iv;

            using var encryptor = aes.CreateEncryptor();
            byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
            return encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
        }

        /// <summary>
        /// Decrypts AES-256-CBC encrypted data back to plaintext.
        /// </summary>
        public static string AesDecrypt(byte[] cipherText, byte[] key, byte[] iv)
        {
            using var aes = Aes.Create();
            aes.KeySize = 256;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.Key = key;
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor();
            byte[] plainBytes = decryptor.TransformFinalBlock(cipherText, 0, cipherText.Length);
            return Encoding.UTF8.GetString(plainBytes);
        }

        // === Wire Protocol Helpers ===

        /// <summary>
        /// Writes a length-prefixed message to the stream.
        /// Format: [4 bytes big-endian length][data]
        /// </summary>
        public static async Task WriteLengthPrefixedAsync(NetworkStream stream, byte[] data)
        {
            byte[] lengthBytes = BitConverter.GetBytes(data.Length);
            if (BitConverter.IsLittleEndian)
                Array.Reverse(lengthBytes);

            await stream.WriteAsync(lengthBytes, 0, 4);
            await stream.WriteAsync(data, 0, data.Length);
            await stream.FlushAsync();
        }

        /// <summary>
        /// Reads a length-prefixed message from the stream.
        /// </summary>
        public static async Task<byte[]> ReadLengthPrefixedAsync(NetworkStream stream)
        {
            byte[] lengthBytes = new byte[4];
            int totalRead = 0;
            while (totalRead < 4)
            {
                int read = await stream.ReadAsync(lengthBytes, totalRead, 4 - totalRead);
                if (read == 0) throw new IOException("Connection closed while reading length prefix.");
                totalRead += read;
            }

            if (BitConverter.IsLittleEndian)
                Array.Reverse(lengthBytes);
            int length = BitConverter.ToInt32(lengthBytes, 0);

            if (length <= 0 || length > 10 * 1024 * 1024) // Max 10MB
                throw new IOException($"Invalid message length: {length}");

            byte[] data = new byte[length];
            totalRead = 0;
            while (totalRead < length)
            {
                int read = await stream.ReadAsync(data, totalRead, length - totalRead);
                if (read == 0) throw new IOException("Connection closed while reading data.");
                totalRead += read;
            }

            return data;
        }
    }
}
