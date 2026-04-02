namespace Traxonet.Client
{
    partial class MainForm
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
                components.Dispose();
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            this.SuspendLayout();

            // Form — matches web dashboard: linear-gradient(135deg, #000 0%, #1a0000 50%, #000 100%)
            this.Text = "TRAXONET - Monitor";
            this.Size = new Size(1100, 720);
            this.MinimumSize = new Size(900, 550);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.Black;
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 10F);
            this.Load += MainForm_Load;
            this.FormClosing += MainForm_FormClosing;

            // ===== Top Bar — matches web: sidebar-header style =====
            var topBar = new Panel
            {
                Dock = DockStyle.Top,
                Height = 60,
                BackColor = Color.FromArgb(5, 5, 5)
            };

            // Red bottom border for top bar — matches web: border-bottom: 2px solid #ff0000
            var topBarBorder = new Panel
            {
                Dock = DockStyle.Bottom,
                Height = 2,
                BackColor = Color.FromArgb(255, 0, 0)
            };
            topBar.Controls.Add(topBarBorder);

            var lblLogo = new Label
            {
                Text = "TRAXONET",
                Font = new Font("Segoe UI", 20F, FontStyle.Bold),
                ForeColor = Color.FromArgb(255, 0, 0),
                AutoSize = true,
                Location = new Point(20, 15)
            };

            lblWelcome = new Label
            {
                Text = "Welcome",
                Font = new Font("Segoe UI", 10F),
                ForeColor = Color.FromArgb(153, 153, 153),
                AutoSize = true,
                Location = new Point(210, 20)
            };

            btnLogout = new Button
            {
                Text = "Logout",
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(200, 0, 0),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 9F, FontStyle.Bold),
                Size = new Size(85, 34),
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Cursor = Cursors.Hand
            };
            btnLogout.FlatAppearance.BorderSize = 0;
            btnLogout.FlatAppearance.MouseOverBackColor = Color.FromArgb(255, 30, 30);
            btnLogout.Click += btnLogout_Click;
            btnLogout.Location = new Point(this.ClientSize.Width - 105, 13);


            topBar.Controls.AddRange(new Control[] { lblLogo, lblWelcome, btnLogout });

            // ===== Split Container =====
            var splitContainer = new SplitContainer
            {
                Dock = DockStyle.Fill,
                Orientation = Orientation.Vertical,
                SplitterDistance = 620,
                BackColor = Color.Black,
                SplitterWidth = 3,
                BorderStyle = BorderStyle.None
            };
            splitContainer.Panel1.BackColor = Color.Black;
            splitContainer.Panel2.BackColor = Color.Black;
            splitContainer.Panel1.Padding = new Padding(20, 15, 10, 15);
            splitContainer.Panel2.Padding = new Padding(10, 15, 20, 15);

            // ===== LEFT PANEL: Computer Data =====
            var lblLeftTitle = new Label
            {
                Text = "COMPUTER DATA",
                Font = new Font("Segoe UI", 15F, FontStyle.Bold),
                ForeColor = Color.FromArgb(255, 0, 0),
                Dock = DockStyle.Top,
                Height = 40,
                Padding = new Padding(0, 5, 0, 0)
            };

            // Left content in a card — matches web: rgba(0,0,0,0.9), border: 2px solid #ff0000, radius 12px
            var panelLeftCard = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.FromArgb(10, 10, 10),
                Padding = new Padding(20, 15, 20, 15)
            };

            // Scrollable inner panel
            var panelLeft = new Panel
            {
                Dock = DockStyle.Fill,
                AutoScroll = true,
                BackColor = Color.FromArgb(10, 10, 10)
            };

            int yPos = 5;

            lblMachineName = new Label
            {
                Text = "...",
                Font = new Font("Segoe UI", 16F, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(0, yPos),
                Size = new Size(550, 32),
                Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right
            };
            yPos += 44;

            // CPU Section
            var lblCpuHeader = CreateSectionHeader("PROCESSOR", yPos); yPos += 28;
            lblCpu = CreateValueLabel(yPos); yPos += 24;
            lblCpuUsage = CreateSubLabel(yPos); yPos += 34;

            // GPU Section
            var lblGpuHeader = CreateSectionHeader("GRAPHICS", yPos); yPos += 28;
            lblGpu = CreateValueLabel(yPos); yPos += 24;
            lblGpuDriver = CreateSubLabel(yPos); yPos += 34;

            // RAM Section
            var lblRamHeader = CreateSectionHeader("MEMORY", yPos); yPos += 28;
            lblRam = CreateValueLabel(yPos); yPos += 24;
            lblRamUsage = CreateSubLabel(yPos); yPos += 34;

            // Network Section
            var lblNetHeader = CreateSectionHeader("NETWORK", yPos); yPos += 28;
            lblIp = CreateValueLabel(yPos); yPos += 24;
            lblMac = CreateSubLabel(yPos); yPos += 34;

            // Drives Section
            var lblDriveHeader = CreateSectionHeader("STORAGE", yPos); yPos += 28;
            panelDrives = new Panel
            {
                Location = new Point(0, yPos),
                Size = new Size(540, 130),
                Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right
            };

            panelLeft.Controls.AddRange(new Control[]
            {
                lblMachineName,
                lblCpuHeader, lblCpu, lblCpuUsage,
                lblGpuHeader, lblGpu, lblGpuDriver,
                lblRamHeader, lblRam, lblRamUsage,
                lblNetHeader, lblIp, lblMac,
                lblDriveHeader, panelDrives
            });

            panelLeftCard.Controls.Add(panelLeft);
            splitContainer.Panel1.Controls.Add(panelLeftCard);
            splitContainer.Panel1.Controls.Add(lblLeftTitle);

            // ===== RIGHT PANEL: Authorized Emails =====
            var lblRightTitle = new Label
            {
                Text = "AUTHORIZED EMAILS",
                Font = new Font("Segoe UI", 15F, FontStyle.Bold),
                ForeColor = Color.FromArgb(255, 0, 0),
                Dock = DockStyle.Top,
                Height = 40,
                Padding = new Padding(0, 5, 0, 0)
            };

            var lblRightSub = new Label
            {
                Text = "Users with these emails can view this computer on the dashboard:",
                Font = new Font("Segoe UI", 9F),
                ForeColor = Color.FromArgb(153, 153, 153),
                Dock = DockStyle.Top,
                Height = 22
            };

            var panelRightCard = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.FromArgb(10, 10, 10),
                Padding = new Padding(15, 10, 15, 10)
            };

            panelUsers = new Panel
            {
                Dock = DockStyle.Fill,
                AutoScroll = true,
                BackColor = Color.FromArgb(10, 10, 10)
            };

            // Add email input row at the bottom
            var panelAddEmail = new Panel
            {
                Dock = DockStyle.Bottom,
                Height = 42,
                BackColor = Color.FromArgb(10, 10, 10),
                Padding = new Padding(0, 5, 0, 0)
            };

            txtAddEmail = new TextBox
            {
                Dock = DockStyle.Fill,
                BackColor = Color.FromArgb(18, 18, 18),
                ForeColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                Font = new Font("Segoe UI", 11F),
                PlaceholderText = "Enter email to authorize..."
            };

            btnAddEmail = new Button
            {
                Text = "Add",
                Dock = DockStyle.Right,
                Width = 70,
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(200, 0, 0),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnAddEmail.FlatAppearance.BorderSize = 0;
            btnAddEmail.FlatAppearance.MouseOverBackColor = Color.FromArgb(255, 30, 30);
            btnAddEmail.Click += btnAddEmail_Click;

            panelAddEmail.Controls.Add(txtAddEmail);
            panelAddEmail.Controls.Add(btnAddEmail);

            panelRightCard.Controls.Add(panelUsers);
            panelRightCard.Controls.Add(panelAddEmail);
            splitContainer.Panel2.Controls.Add(panelRightCard);
            splitContainer.Panel2.Controls.Add(lblRightSub);
            splitContainer.Panel2.Controls.Add(lblRightTitle);

            // ===== Status Bar — matches web: dark bottom bar =====
            var statusBar = new Panel
            {
                Dock = DockStyle.Bottom,
                Height = 32,
                BackColor = Color.FromArgb(5, 5, 5)
            };

            // Red top border for status bar
            var statusBorder = new Panel
            {
                Dock = DockStyle.Top,
                Height = 2,
                BackColor = Color.FromArgb(255, 0, 0)
            };
            statusBar.Controls.Add(statusBorder);

            lblStatusBar = new Label
            {
                Text = "Connecting...",
                ForeColor = Color.FromArgb(153, 153, 153),
                Font = new Font("Segoe UI", 9F),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleLeft,
                Padding = new Padding(15, 0, 0, 0)
            };
            statusBar.Controls.Add(lblStatusBar);

            this.Controls.Add(splitContainer);
            this.Controls.Add(statusBar);
            this.Controls.Add(topBar);

            this.ResumeLayout(false);
        }

        // Matches web: section headers in #ff0000, bold, with text-shadow feel
        private Label CreateSectionHeader(string text, int y)
        {
            return new Label
            {
                Text = text,
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                ForeColor = Color.FromArgb(255, 0, 0),
                Location = new Point(0, y),
                Size = new Size(540, 24),
                Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right
            };
        }

        // Matches web: card-value style — #ff0000, 20px, font-weight 600
        private Label CreateValueLabel(int y)
        {
            return new Label
            {
                Text = "...",
                Font = new Font("Segoe UI", 11F, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(0, y),
                Size = new Size(540, 22),
                Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right
            };
        }

        // Matches web: color #999
        private Label CreateSubLabel(int y)
        {
            return new Label
            {
                Text = "...",
                Font = new Font("Segoe UI", 9F),
                ForeColor = Color.FromArgb(153, 153, 153),
                Location = new Point(0, y),
                Size = new Size(540, 20),
                Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right
            };
        }

        private Label lblWelcome;
        private Button btnLogout;
        private Label lblMachineName;
        private Label lblCpu;
        private Label lblCpuUsage;
        private Label lblGpu;
        private Label lblGpuDriver;
        private Label lblRam;
        private Label lblRamUsage;
        private Label lblIp;
        private Label lblMac;
        private Panel panelDrives;
        private Panel panelUsers;
        private TextBox txtAddEmail;
        private Button btnAddEmail;
        private Label lblStatusBar;
    }
}
