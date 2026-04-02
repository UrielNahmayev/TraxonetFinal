using System;
using System.Collections.Generic;

namespace Traxonet.ViewModels
{
    public class DriveViewModel
    {
        public string DriveName { get; set; }
        public long TotalSize { get; set; }
        public long FreeSpace { get; set; }
        public double UsagePercent => TotalSize > 0 ? ((TotalSize - FreeSpace) / (double)TotalSize) * 100 : 0;
    }

    public class DashboardDeviceViewModel
    {
        public string ClientId { get; set; }
        public string Name { get; set; }
        public string IpAddress { get; set; }
        public string MacAddress { get; set; }
        public bool IsOnline { get; set; }
        public DateTime? LastSeen { get; set; }
        

        public string Cpu { get; set; }
        public int CpuCores { get; set; }
        public double? CpuUsage { get; set; }
        public double? CpuTemp { get; set; }
        

        public string Gpu { get; set; }
        public string GpuDriver { get; set; }
        

        public long TotalRam { get; set; }
        public long FreeRam { get; set; }
        public double? RamUsage { get; set; }
        

        public string Motherboard { get; set; }
        

        public List<DriveViewModel> Drives { get; set; } = new List<DriveViewModel>();
    }

    public class DashboardViewModel
    {
        public List<DashboardDeviceViewModel> Devices { get; set; }
        public string SelectedClientId { get; set; }
    }
}
