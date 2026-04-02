namespace Traxonet.Client
{
    public partial class LoginForm : Form
    {
        public UserInfo? LoggedInUser { get; private set; }
        public string ServerHost { get; private set; } = "127.0.0.1";

        public LoginForm()
        {
            InitializeComponent();
        }

        private void LoginForm_Load(object sender, EventArgs e)
        {
            LoadSettings();
        }

        private void tabLogin_Click(object sender, EventArgs e)
        {
            ShowLoginPanel();
        }

        private void tabRegister_Click(object sender, EventArgs e)
        {
            ShowRegisterPanel();
        }

        private void ShowLoginPanel()
        {
            panelLogin.Visible = true;
            panelRegister.Visible = false;
            tabLogin.ForeColor = Color.FromArgb(255, 0, 0);
            tabRegister.ForeColor = Color.FromArgb(102, 102, 102);
            tabLoginIndicator.BackColor = Color.FromArgb(255, 0, 0);
            tabRegisterIndicator.BackColor = Color.Transparent;
        }

        private void ShowRegisterPanel()
        {
            panelLogin.Visible = false;
            panelRegister.Visible = true;
            tabRegister.ForeColor = Color.FromArgb(255, 0, 0);
            tabLogin.ForeColor = Color.FromArgb(102, 102, 102);
            tabRegisterIndicator.BackColor = Color.FromArgb(255, 0, 0);
            tabLoginIndicator.BackColor = Color.Transparent;
        }

        private string GetTextValue(TextBox txt)
        {
            if (txt.Tag is string placeholder && txt.Text == placeholder)
                return "";
            return txt.Text.Trim();
        }

        private string GetServerHost()
        {
            var addr = txtServerAddress.Text.Trim();
            return string.IsNullOrEmpty(addr) ? "127.0.0.1" : addr;
        }

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            lblStatus.Text = "";

            var email = GetTextValue(txtLoginEmail);
            var password = GetTextValue(txtLoginPassword);

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                ShowStatus("All fields are required.", false);
                return;
            }

            try
            {
                btnLogin.Enabled = false;
                btnLogin.Text = "SIGNING IN...";

                var host = GetServerHost();
                var api = new ApiClient(host);
                var user = await api.LoginAsync(email, password);

                if (user != null)
                {
                    int? savedOwnerId = GetSavedOwnerId();
                    if (savedOwnerId.HasValue && savedOwnerId.Value != user.Id)
                    {
                        ShowStatus("This PC is locked to another account.", false);
                        return;
                    }

                    if (!savedOwnerId.HasValue)
                    {
                        SaveOwnerId(user.Id);
                    }

                    LoggedInUser = user;
                    ServerHost = host;
                    SaveSettings(email);
                    DialogResult = DialogResult.OK;
                    Close();
                }
                else
                {
                    ShowStatus("Invalid email or password.", false);
                }
            }
            catch
            {
                ShowStatus("Cannot connect to server.", false);
            }
            finally
            {
                btnLogin.Enabled = true;
                btnLogin.Text = "LOGIN";
            }
        }

        private async void btnRegister_Click(object sender, EventArgs e)
        {
            lblStatus.Text = "";

            var name = GetTextValue(txtRegName);
            var email = GetTextValue(txtRegEmail);
            var password = GetTextValue(txtRegPassword);
            var confirm = GetTextValue(txtRegConfirm);

            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                ShowStatus("All fields are required.", false);
                return;
            }

            if (password != confirm)
            {
                ShowStatus("Passwords do not match.", false);
                return;
            }

            try
            {
                btnRegister.Enabled = false;
                btnRegister.Text = "CREATING ACCOUNT...";

                var host = GetServerHost();
                var api = new ApiClient(host);
                var (success, message) = await api.RegisterAsync(name, email, password);

                if (success)
                {
                    ShowStatus("Account created! You can now sign in.", true);
                    ShowLoginPanel();
                    txtLoginEmail.Text = email;
                    txtLoginEmail.ForeColor = Color.White;
                    txtLoginPassword.Text = "";
                    txtLoginPassword.ForeColor = Color.White;
                    txtLoginPassword.Focus();
                }
                else
                {
                    ShowStatus(message, false);
                }
            }
            catch
            {
                ShowStatus("Cannot connect to server.", false);
            }
            finally
            {
                btnRegister.Enabled = true;
                btnRegister.Text = "REGISTER";
            }
        }

        private void ShowStatus(string text, bool success)
        {
            lblStatus.Text = text;
            lblStatus.ForeColor = success ? Color.FromArgb(0, 255, 0) : Color.FromArgb(255, 0, 0);
        }

        private void SaveSettings(string email)
        {
            try
            {
                var dir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "TraxonetClient");
                Directory.CreateDirectory(dir);
                var settings = new { LastEmail = email, ServerAddress = ServerHost };
                File.WriteAllText(
                    Path.Combine(dir, "login_settings.json"),
                    Newtonsoft.Json.JsonConvert.SerializeObject(settings));
            }
            catch { }
        }

        private void LoadSettings()
        {
            try
            {
                var path = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "TraxonetClient", "login_settings.json");
                if (File.Exists(path))
                {
                    dynamic settings = Newtonsoft.Json.JsonConvert.DeserializeObject(File.ReadAllText(path))!;
                    string email = (string)(settings.LastEmail ?? "");
                    string serverAddress = (string)(settings.ServerAddress ?? "");

                    if (!string.IsNullOrEmpty(email))
                    {
                        txtLoginEmail.Text = email;
                        txtLoginEmail.ForeColor = Color.White;
                    }

                    if (!string.IsNullOrEmpty(serverAddress))
                    {
                        txtServerAddress.Text = serverAddress;
                    }
                }
            }
            catch { }
        }
        private int? GetSavedOwnerId()
        {
            try
            {
                using var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Traxonet");
                if (key == null) return null;
                var val = key.GetValue("OwnerId");
                if (val != null && int.TryParse(val.ToString(), out int id))
                    return id;
            }
            catch { }
            return null;
        }

        private void SaveOwnerId(int userId)
        {
            try
            {
                using var key = Microsoft.Win32.Registry.CurrentUser.CreateSubKey(@"SOFTWARE\Traxonet");
                key.SetValue("OwnerId", userId);
            }
            catch { }
        }
    }
}
