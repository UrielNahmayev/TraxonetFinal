using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Management;
using System.Threading.Tasks;
using LibreHardwareMonitor.Hardware;
using static Traxonet.Client.Models;

namespace Traxonet.Client
{
    public static class DataCollector
    {
        internal static async Task<HardwareData> CollectAsync()
        {
            var data = new HardwareData
            {
                MachineName = Environment.MachineName,
                ClientId = ClientIdProvider.GetOrCreateClientId()
            };


            try
            {
                using var searcher = new ManagementObjectSearcher("select * from Win32_Processor");
                foreach (ManagementObject obj in searcher.Get())
                {
                    data.CpuCores = Convert.ToInt32(obj["NumberOfCores"]);
                    data.LogicalProcessors = Convert.ToInt32(obj["NumberOfLogicalProcessors"]);
                    data.Cpu = obj["Name"]?.ToString();
                }
            }
            catch { }


            try
            {
                ulong totalBytes = 0;
                using var searcher = new ManagementObjectSearcher("select * from Win32_PhysicalMemory");
                foreach (ManagementObject obj in searcher.Get())
                    totalBytes += (ulong)obj["Capacity"];

                data.TotalRam = (long)totalBytes;

                using var os = new ManagementObjectSearcher("SELECT FreePhysicalMemory FROM Win32_OperatingSystem");
                foreach (ManagementObject obj in os.Get())
                {
                    float freeKB = float.Parse(obj["FreePhysicalMemory"].ToString());
                    data.FreeRam = (long)(freeKB * 1024);
                    float totalGB = data.TotalRam / (1024f * 1024f * 1024f);
                    float freeGB = data.FreeRam / (1024f * 1024f * 1024f);
                    data.RamUsage = totalGB > 0 ? (1 - (freeGB / totalGB)) * 100f : 0f;
                }
            }
            catch { }


            try
            {
                using var disks = new ManagementObjectSearcher("select * from Win32_LogicalDisk WHERE DriveType=3");
                foreach (ManagementObject obj in disks.Get())
                {
                    data.Drives.Add(new DriveData
                    {
                        DriveName = obj["DeviceID"]?.ToString(),
                        FreeSpace = Convert.ToInt64(obj["FreeSpace"] ?? 0),
                        TotalSize = Convert.ToInt64(obj["Size"] ?? 0),
                    });
                }
            }
            catch { }


            try
            {
                using var gpu = new ManagementObjectSearcher("select * from Win32_VideoController");
                foreach (ManagementObject obj in gpu.Get())
                {
                    data.GpuDriver = obj["DriverVersion"]?.ToString();
                    data.Gpu = obj["Name"]?.ToString();
                    break;
                }
            }
            catch { }


            try
            {
                using var net = new ManagementObjectSearcher("select * from Win32_NetworkAdapterConfiguration WHERE IPEnabled=true");
                foreach (ManagementObject obj in net.Get())
                {
                    string[] ips = (string[])obj["IPAddress"];
                    data.Ip = ips?.FirstOrDefault();
                    data.Mac = obj["MACAddress"]?.ToString();
                    break;
                }
            }
            catch { }


            data.CpuUsage = await GetCpuUsageAsync();


            data.CpuTemp = GetCpuTemp();


            try
            {
                var computer = new LibreHardwareMonitor.Hardware.Computer()
                {
                    IsCpuEnabled = true,
                    IsGpuEnabled = true,
                    IsMotherboardEnabled = true
                };
                computer.Open();
                foreach (var hw in computer.Hardware)
                {
                    hw.Update();
                    if (hw.HardwareType.ToString().ToLower().Contains("motherboard"))
                        data.Motherboard = hw.Name;
                }
                computer.Close();
            }
            catch { }

            return data;
        }

        private static async Task<float> GetCpuUsageAsync()
        {
            try
            {
                using var cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
                cpuCounter.NextValue();
                await Task.Delay(1000);
                return cpuCounter.NextValue();
            }
            catch
            {
                return -1f;
            }
        }

        private static float GetCpuTemp()
        {
            try
            {
                using var searcher = new ManagementObjectSearcher(@"root\WMI", "SELECT * FROM MSAcpi_ThermalZoneTemperature");
                foreach (ManagementObject obj in searcher.Get())
                {
                    double t = Convert.ToDouble(obj["CurrentTemperature"].ToString());
                    return (float)Math.Round((t / 10) - 273.15);
                }
            }
            catch { }
            return -1f;
        }
    }
}