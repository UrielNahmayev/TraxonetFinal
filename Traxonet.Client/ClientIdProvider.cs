using System;
using Microsoft.Win32;

namespace Traxonet.Client
{
    public static class ClientIdProvider
    {
        private const string RegistryPath = @"SOFTWARE\Traxonet";
        private const string ValueName = "ClientId";

        public static string GetOrCreateClientId()
        {
            using (var key = Registry.CurrentUser.CreateSubKey(RegistryPath))
            {
                var existing = key.GetValue(ValueName) as string;
                if (!string.IsNullOrEmpty(existing))
                    return existing;

                string newId = Guid.NewGuid().ToString();
                key.SetValue(ValueName, newId);
                return newId;
            }
        }
    }
}