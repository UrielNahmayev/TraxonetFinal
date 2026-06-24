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

        byte[] rsaPublicKey = await Traxonet.Client.CryptoHelper.ReadLengthPrefixedAsync(stream);

        byte[] aesKey = Traxonet.Client.CryptoHelper.GenerateAesKey();
        byte[] aesIV = Traxonet.Client.CryptoHelper.GenerateAesIV();

        byte[] keyBundle = new byte[48];
        Buffer.BlockCopy(aesKey, 0, keyBundle, 0, 32);
        Buffer.BlockCopy(aesIV, 0, keyBundle, 32, 16);

        byte[] encryptedKeyBundle = Traxonet.Client.CryptoHelper.RsaEncrypt(keyBundle, rsaPublicKey);
        await Traxonet.Client.CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedKeyBundle);

        byte[] encryptedData = Traxonet.Client.CryptoHelper.AesEncrypt(json, aesKey, aesIV);
        await Traxonet.Client.CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedData);

        byte[] encryptedResponse = await Traxonet.Client.CryptoHelper.ReadLengthPrefixedAsync(stream);
    }
}
