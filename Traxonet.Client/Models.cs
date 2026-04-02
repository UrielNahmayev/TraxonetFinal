using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Traxonet.Client
{
    internal class Models
    {
        public class HardwareData
        {
            [JsonProperty("machineName")] public string MachineName { get; set; }
            [JsonProperty("motherboard")] public string Motherboard { get; set; }
            [JsonProperty("cpu")] public string Cpu { get; set; }
            [JsonProperty("gpu")] public string Gpu { get; set; }
            [JsonProperty("cpuCores")] public int CpuCores { get; set; }
            [JsonProperty("logicalProcessors")] public int LogicalProcessors { get; set; }
            [JsonProperty("cpuTemp")] public float CpuTemp { get; set; }
            [JsonProperty("cpuUsage")] public float CpuUsage { get; set; }
            [JsonProperty("gpuDriver")] public string GpuDriver { get; set; }
            [JsonProperty("totalRam")] public long TotalRam { get; set; }
            [JsonProperty("freeRam")] public long FreeRam { get; set; }
            [JsonProperty("ramUsage")] public float RamUsage { get; set; }
            [JsonProperty("ip")] public string Ip { get; set; }
            [JsonProperty("mac")] public string Mac { get; set; }
            [JsonProperty("drives")] public List<DriveData> Drives { get; set; } = new();
            [JsonProperty("clientId")] public string ClientId { get; set; }



            [JsonProperty("authorizedEmails")] public List<string> AuthorizedEmails { get; set; } = new();
            [JsonProperty("alertEmails")] public List<string> AlertEmails { get; set; } = new();
            [JsonProperty("thresholds")] public ThresholdData Thresholds { get; set; }
            [JsonProperty("ownerUserId")] public int? OwnerUserId { get; set; }
            [JsonProperty("ownerEmail")] public string OwnerEmail { get; set; }

        }

        public class DriveData
        {
            [JsonProperty("driveName")] public string DriveName { get; set; }
            [JsonProperty("totalSize")] public long TotalSize { get; set; }
            [JsonProperty("freeSpace")] public long FreeSpace { get; set; }
        }

        public class ThresholdData
        {
            [JsonProperty("maxCpuTemp")] public float? MaxCpuTemp { get; set; }
            [JsonProperty("maxCpuUsage")] public float? MaxCpuUsage { get; set; }
            [JsonProperty("maxRamUsage")] public float? MaxRamUsage { get; set; }
            [JsonProperty("minFreeSpace")] public long? MinFreeSpace { get; set; }
        }
    }
}
