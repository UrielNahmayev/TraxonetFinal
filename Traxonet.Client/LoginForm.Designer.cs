namespace Traxonet.Client
{
    partial class LoginForm
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

            this.Text = "Traxonet - Login & Register";
            this.Size = new Size(520, 720);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(10, 0, 0);
            this.ForeColor = Color.White;
            this.Font = new Font("Segoe UI", 10F);
            this.Load += LoginForm_Load;

            // Red border frame
            var borderPanel = new Panel
            {
                Size = new Size(454, 644),
                Location = new Point(33, 28),
                BackColor = Color.FromArgb(255, 0, 0)
            };

            // Main container
            var containerPanel = new Panel
            {
                Size = new Size(450, 640),
                Location = new Point(35, 30),
                BackColor = Color.FromArgb(8, 8, 8)
            };

            // Red accent bar at top
            var topAccent = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(450, 4),
                BackColor = Color.FromArgb(255, 0, 0)
            };


            // Title
            var lblTitle = new Label
            {
                Text = "TRAXONET",
                Font = new Font("Segoe UI", 30F, FontStyle.Bold),
                ForeColor = Color.FromArgb(255, 0, 0),
                TextAlign = ContentAlignment.MiddleCenter,
                Location = new Point(0, 30),
                Size = new Size(450, 55),
                BackColor = Color.Transparent
            };

            // Tab border line
            var tabBorderLine = new Panel
            {
                Location = new Point(0, 138),
                Size = new Size(450, 2),
                BackColor = Color.FromArgb(255, 0, 0)
            };

            // Login tab
            tabLogin = new Button
            {
                Text = "Login",
                Location = new Point(0, 100),
                Size = new Size(225, 38),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.Transparent,
                ForeColor = Color.FromArgb(255, 0, 0),
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                Cursor = Cursors.Hand,
                TextAlign = ContentAlignment.MiddleCenter
            };
            tabLogin.FlatAppearance.BorderSize = 0;
            tabLogin.FlatAppearance.MouseOverBackColor = Color.FromArgb(20, 5, 5);
            tabLogin.Click += tabLogin_Click;

            // Register tab
            tabRegister = new Button
            {
                Text = "Register",
                Location = new Point(225, 100),
                Size = new Size(225, 38),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.Transparent,
                ForeColor = Color.FromArgb(102, 102, 102),
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                Cursor = Cursors.Hand,
                TextAlign = ContentAlignment.MiddleCenter
            };
            tabRegister.FlatAppearance.BorderSize = 0;
            tabRegister.FlatAppearance.MouseOverBackColor = Color.FromArgb(20, 5, 5);
            tabRegister.Click += tabRegister_Click;

            // Tab underline indicators
            tabLoginIndicator = new Panel
            {
                Location = new Point(0, 138),
                Size = new Size(225, 3),
                BackColor = Color.FromArgb(255, 0, 0)
            };
            tabRegisterIndicator = new Panel
            {
                Location = new Point(225, 138),
                Size = new Size(225, 3),
                BackColor = Color.Transparent
            };

            // ===== LOGIN PANEL =====
            panelLogin = new Panel
            {
                Location = new Point(30, 160),
                Size = new Size(390, 300),
                BackColor = Color.Transparent
            };

            var lblLoginEmail = CreateFieldLabel("Email", new Point(0, 10));
            txtLoginEmail = CreateStyledTextBox(new Point(0, 38));
            SetPlaceholder(txtLoginEmail, "Enter your email");

            var lblLoginPass = CreateFieldLabel("Password", new Point(0, 88));
            txtLoginPassword = CreateStyledTextBox(new Point(0, 116));
            txtLoginPassword.UseSystemPasswordChar = true;
            SetPlaceholder(txtLoginPassword, "Enter your password");

            var lblServerAddr = CreateFieldLabel("Server Address", new Point(0, 166));
            txtServerAddress = CreateStyledTextBox(new Point(0, 194));
            txtServerAddress.Text = "127.0.0.1";

            btnLogin = CreateRedButton("LOGIN", new Point(0, 250));
            btnLogin.Click += btnLogin_Click;

            panelLogin.Controls.AddRange(new Control[] {
                lblLoginEmail, txtLoginEmail,
                lblLoginPass, txtLoginPassword,
                lblServerAddr, txtServerAddress,
                btnLogin
            });

            // ===== REGISTER PANEL =====
            panelRegister = new Panel
            {
                Location = new Point(30, 160),
                Size = new Size(390, 400),
                BackColor = Color.Transparent,
                Visible = false
            };

            var lblRegName = CreateFieldLabel("Full Name", new Point(0, 0));
            txtRegName = CreateStyledTextBox(new Point(0, 28));
            SetPlaceholder(txtRegName, "Enter your full name");

            var lblRegEmail = CreateFieldLabel("Email", new Point(0, 73));
            txtRegEmail = CreateStyledTextBox(new Point(0, 101));
            SetPlaceholder(txtRegEmail, "Enter your email");

            var lblRegPass = CreateFieldLabel("Password", new Point(0, 146));
            txtRegPassword = CreateStyledTextBox(new Point(0, 174));
            txtRegPassword.UseSystemPasswordChar = true;
            SetPlaceholder(txtRegPassword, "Create a password");

            var lblRegConfirm = CreateFieldLabel("Confirm Password", new Point(0, 219));
            txtRegConfirm = CreateStyledTextBox(new Point(0, 247));
            txtRegConfirm.UseSystemPasswordChar = true;
            SetPlaceholder(txtRegConfirm, "Confirm your password");

            btnRegister = CreateRedButton("REGISTER", new Point(0, 305));
            btnRegister.Click += btnRegister_Click;

            panelRegister.Controls.AddRange(new Control[] {
                lblRegName, txtRegName,
                lblRegEmail, txtRegEmail,
                lblRegPass, txtRegPassword,
                lblRegConfirm, txtRegConfirm,
                btnRegister
            });

            // Status label
            lblStatus = new Label
            {
                Location = new Point(30, 600),
                Size = new Size(390, 28),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 9F),
                TextAlign = ContentAlignment.MiddleCenter,
                BackColor = Color.Transparent
            };

            // Add controls — reverse z-order
            containerPanel.Controls.Add(lblStatus);
            containerPanel.Controls.Add(panelRegister);
            containerPanel.Controls.Add(panelLogin);
            containerPanel.Controls.Add(tabLoginIndicator);
            containerPanel.Controls.Add(tabRegisterIndicator);
            containerPanel.Controls.Add(tabBorderLine);
            containerPanel.Controls.Add(tabRegister);
            containerPanel.Controls.Add(tabLogin);
            containerPanel.Controls.Add(lblTitle);
            containerPanel.Controls.Add(topAccent);

            this.Controls.Add(containerPanel);
            this.Controls.Add(borderPanel);
            containerPanel.BringToFront();

            this.ResumeLayout(false);
        }

        private TextBox CreateStyledTextBox(Point location)
        {
            return new TextBox
            {
                Location = location,
                Size = new Size(390, 36),
                BackColor = Color.FromArgb(18, 18, 18),
                ForeColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                Font = new Font("Segoe UI", 12F)
            };
        }

        private void SetPlaceholder(TextBox txt, string placeholder)
        {
            txt.Tag = placeholder;
            txt.Text = placeholder;
            txt.ForeColor = Color.FromArgb(102, 102, 102);
            txt.GotFocus += (s, e) =>
            {
                if (txt.Text == (string)txt.Tag)
                {
                    txt.Text = "";
                    txt.ForeColor = Color.White;
                }
            };
            txt.LostFocus += (s, e) =>
            {
                if (string.IsNullOrEmpty(txt.Text))
                {
                    txt.Text = (string)txt.Tag;
                    txt.ForeColor = Color.FromArgb(102, 102, 102);
                }
            };
        }

        private Label CreateFieldLabel(string text, Point location)
        {
            return new Label
            {
                Text = text,
                Location = location,
                Size = new Size(390, 22),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 11F, FontStyle.Bold),
                BackColor = Color.Transparent
            };
        }

        private Button CreateRedButton(string text, Point location)
        {
            var btn = new Button
            {
                Text = text,
                Location = location,
                Size = new Size(390, 48),
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.FromArgb(220, 0, 0),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 13F, FontStyle.Bold),
                Cursor = Cursors.Hand,
                TextAlign = ContentAlignment.MiddleCenter
            };
            btn.FlatAppearance.BorderSize = 0;
            btn.FlatAppearance.MouseOverBackColor = Color.FromArgb(255, 20, 20);
            btn.FlatAppearance.MouseDownBackColor = Color.FromArgb(180, 0, 0);
            return btn;
        }

        private Button tabLogin;
        private Button tabRegister;
        private Panel tabLoginIndicator;
        private Panel tabRegisterIndicator;
        private Panel panelLogin;
        private Panel panelRegister;
        private TextBox txtLoginEmail;
        private TextBox txtLoginPassword;
        private Button btnLogin;
        private TextBox txtRegName;
        private TextBox txtRegEmail;
        private TextBox txtRegPassword;
        private TextBox txtRegConfirm;
        private Button btnRegister;
        private Label lblStatus;
        private TextBox txtServerAddress;
    }
}
