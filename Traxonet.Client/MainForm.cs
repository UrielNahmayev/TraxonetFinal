using static Traxonet.Client.Models;

namespace Traxonet.Client
{
    public partial class MainForm : Form
    {
        private ApiClient _api;
        private readonly UserInfo _currentUser;
        private readonly string _clientId;
        private string _serverHost;
        private System.Windows.Forms.Timer _sendTimer;
        private System.Windows.Forms.Timer _refreshTimer;
        private int _sendIntervalMs = 10000;
        private bool _isSending = false;

        public MainForm(UserInfo user, string serverHost)
        {
            _currentUser = user;
            _serverHost = serverHost;
            _api = new ApiClient(serverHost);
            _clientId = ClientIdProvider.GetOrCreateClientId();

            InitializeComponent();
            lblWelcome.Text = $"Welcome, {_currentUser.FullName}";

            _sendTimer = new System.Windows.Forms.Timer { Interval = _sendIntervalMs };
            _sendTimer.Tick += SendTimer_Tick;

            _refreshTimer = new System.Windows.Forms.Timer { Interval = 30000 };
            _refreshTimer.Tick += RefreshTimer_Tick;
        }

        private async void MainForm_Load(object sender, EventArgs e)
        {
            await RefreshComputerData();
            await RefreshEmailList();
            await RefreshSendInterval();

            _sendTimer.Start();
            _refreshTimer.Start();
            UpdateStatus("Connected", Color.FromArgb(0, 200, 0));
        }

        private async void SendTimer_Tick(object? sender, EventArgs e)
        {
            if (_isSending) return;
            _isSending = true;

            try
            {
                var data = await DataCollector.CollectAsync();
                data.OwnerUserId = _currentUser.Id;
                data.OwnerEmail = _currentUser.Email;
                await Sender.SendAsync(data, _serverHost, 5000);

                UpdateStatus("Data sent", Color.FromArgb(0, 200, 0));
                UpdateDataPanel(data);
            }
            catch (Exception ex)
            {
                UpdateStatus($"Send failed: {ex.Message}", Color.FromArgb(255, 80, 80));
            }
            finally
            {
                _isSending = false;
            }
        }

        private async void RefreshTimer_Tick(object? sender, EventArgs e)
        {
            await RefreshEmailList();
            await RefreshSendInterval();
        }

        private async Task RefreshComputerData()
        {
            try
            {
                var data = await DataCollector.CollectAsync();

                if (InvokeRequired)
                {
                    Invoke(() => UpdateDataPanel(data));
                }
                else
                {
                    UpdateDataPanel(data);
                }
            }
            catch { }
        }

        private void UpdateDataPanel(HardwareData data)
        {
            lblMachineName.Text = data.MachineName;
            lblCpu.Text = $"{data.Cpu}";
            lblCpuUsage.Text = $"Usage: {data.CpuUsage:F1}%  |  Temp: {data.CpuTemp:F0}°C";
            lblGpu.Text = $"{data.Gpu}";
            lblGpuDriver.Text = $"Driver: {data.GpuDriver}";
            lblRam.Text = $"Total: {data.TotalRam / (1024.0 * 1024 * 1024):F2} GB  |  Free: {data.FreeRam / (1024.0 * 1024 * 1024):F2} GB";
            lblRamUsage.Text = $"Usage: {data.RamUsage:F1}%";
            lblIp.Text = $"IP: {data.Ip}";
            lblMac.Text = $"MAC: {data.Mac}";

            panelDrives.Controls.Clear();
            int y = 0;
            if (data.Drives != null)
            {
                foreach (var drive in data.Drives)
                {
                    var totalGB = drive.TotalSize / (1024.0 * 1024 * 1024);
                    var freeGB = drive.FreeSpace / (1024.0 * 1024 * 1024);
                    var usedGB = totalGB - freeGB;
                    var usedPct = totalGB > 0 ? (usedGB / totalGB * 100) : 0;

                    var lbl = new Label
                    {
                        Text = $"{drive.DriveName}  —  {usedGB:F2} GB used / {totalGB:F2} GB ({usedPct:F0}% used)",
                        Location = new Point(0, y),
                        Size = new Size(panelDrives.Width - 10, 22),
                        ForeColor = usedPct > 90 ? Color.FromArgb(255, 80, 80) : Color.FromArgb(180, 180, 180),
                        Font = new Font("Segoe UI", 9.5F),
                        Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right
                    };
                    panelDrives.Controls.Add(lbl);
                    y += 24;
                }
            }
        }

        private async Task RefreshEmailList()
        {
            try
            {
                var emails = await _api.GetAuthorizedEmailsAsync(_clientId);

                if (InvokeRequired)
                {
                    Invoke(() => UpdateEmailPanel(emails));
                }
                else
                {
                    UpdateEmailPanel(emails);
                }
            }
            catch { }
        }

        private void UpdateEmailPanel(List<string> emails)
        {
            panelUsers.Controls.Clear();
            int y = 5;

            foreach (var email in emails)
            {
                var lblEmail = new Label
                {
                    Text = email,
                    Location = new Point(5, y + 3),
                    Size = new Size(panelUsers.Width - 90, 24),
                    ForeColor = Color.FromArgb(200, 200, 200),
                    Font = new Font("Segoe UI", 10F),
                    Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right
                };

                panelUsers.Controls.Add(lblEmail);

                if (email.Trim().ToLower() != "traxonetisrael@gmail.com")
                {
                    var btnRemove = new Button
                    {
                        Text = "✕",
                        Tag = email,
                        Location = new Point(panelUsers.Width - 75, y),
                        Size = new Size(55, 28),
                        FlatStyle = FlatStyle.Flat,
                        BackColor = Color.FromArgb(80, 0, 0),
                        ForeColor = Color.FromArgb(255, 100, 100),
                        Font = new Font("Segoe UI", 9F, FontStyle.Bold),
                        Cursor = Cursors.Hand,
                        Anchor = AnchorStyles.Top | AnchorStyles.Right
                    };
                    btnRemove.FlatAppearance.BorderSize = 0;
                    btnRemove.Click += RemoveEmail_Click;
                    panelUsers.Controls.Add(btnRemove);
                }

                y += 34;
            }

            if (emails.Count == 0)
            {
                panelUsers.Controls.Add(new Label
                {
                    Text = "No authorized emails yet.",
                    ForeColor = Color.Gray,
                    Location = new Point(5, 5),
                    Size = new Size(panelUsers.Width - 10, 30),
                    Font = new Font("Segoe UI", 10F)
                });
            }
        }

        private async void RemoveEmail_Click(object? sender, EventArgs e)
        {
            if (sender is not Button btn || btn.Tag is not string email) return;

            try
            {
                await _api.RemoveAuthorizedEmailAsync(_clientId, email);
                UpdateStatus($"Removed {email}", Color.FromArgb(255, 180, 0));
                await RefreshEmailList();
            }
            catch
            {
                UpdateStatus("Failed to remove email", Color.FromArgb(255, 80, 80));
            }
        }

        private async void btnAddEmail_Click(object? sender, EventArgs e)
        {
            var email = txtAddEmail.Text.Trim();
            if (string.IsNullOrEmpty(email) || !email.Contains("@"))
            {
                UpdateStatus("Enter a valid email address", Color.FromArgb(255, 80, 80));
                return;
            }

            try
            {
                await _api.AddAuthorizedEmailAsync(_clientId, email);
                txtAddEmail.Text = "";
                UpdateStatus($"Added {email}", Color.FromArgb(0, 200, 0));
                await RefreshEmailList();
            }
            catch
            {
                UpdateStatus("Failed to add email", Color.FromArgb(255, 80, 80));
            }
        }

        private async Task RefreshSendInterval()
        {
            try
            {
                var settings = await _api.GetSettingsAsync(_clientId);
                var newMs = settings.Interval * 1000;
                if (newMs != _sendIntervalMs && newMs >= 1000)
                {
                    _sendIntervalMs = newMs;
                    _sendTimer.Interval = _sendIntervalMs;
                }

                if (!string.IsNullOrEmpty(settings.ServerAddress) && settings.ServerAddress != _serverHost)
                {
                    _serverHost = settings.ServerAddress;
                    _api = new ApiClient(_serverHost);
                    UpdateStatus($"Server address updated: {_serverHost}", Color.FromArgb(0, 200, 0));
                }
            }
            catch { }
        }

        private void UpdateStatus(string text, Color color)
        {
            if (InvokeRequired)
            {
                Invoke(() => { lblStatusBar.Text = text; lblStatusBar.ForeColor = color; });
            }
            else
            {
                lblStatusBar.Text = text;
                lblStatusBar.ForeColor = color;
            }
        }


        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            _sendTimer?.Stop();
            _refreshTimer?.Stop();
        }

        private void btnLogout_Click(object sender, EventArgs e)
        {
            _sendTimer?.Stop();
            _refreshTimer?.Stop();
            DialogResult = DialogResult.Retry;
            Close();
        }
    }
}
