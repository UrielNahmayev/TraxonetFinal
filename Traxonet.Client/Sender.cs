using Newtonsoft.Json;
using System;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using static Traxonet.Client.Models;

public static class Sender
{
    internal static async Task SendAsync(HardwareData data, string host, int port)
    {
        string json = JsonConvert.SerializeObject(data);
        using var client = new TcpClient();
        await client.ConnectAsync(host, port);
        using NetworkStream stream = client.GetStream();

        // === STEP 1: Receive RSA Public Key from server ===
        byte[] rsaPublicKey = await Traxonet.Client.CryptoHelper.ReadLengthPrefixedAsync(stream);

        // === STEP 2: Generate AES key + IV, encrypt with RSA, send ===
        byte[] aesKey = Traxonet.Client.CryptoHelper.GenerateAesKey();
        byte[] aesIV = Traxonet.Client.CryptoHelper.GenerateAesIV();

        byte[] keyBundle = new byte[48];
        Buffer.BlockCopy(aesKey, 0, keyBundle, 0, 32);
        Buffer.BlockCopy(aesIV, 0, keyBundle, 32, 16);

        byte[] encryptedKeyBundle = Traxonet.Client.CryptoHelper.RsaEncrypt(keyBundle, rsaPublicKey);
        await Traxonet.Client.CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedKeyBundle);

        // === STEP 3: Encrypt JSON data with AES, send ===
        byte[] encryptedData = Traxonet.Client.CryptoHelper.AesEncrypt(json, aesKey, aesIV);
        await Traxonet.Client.CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedData);

        // === STEP 4: Read encrypted response (even if we don't use it) ===
        byte[] encryptedResponse = await Traxonet.Client.CryptoHelper.ReadLengthPrefixedAsync(stream);
        // Response is available if needed but hardware_data is fire-and-forget
    }
}
