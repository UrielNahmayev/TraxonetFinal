namespace Traxonet.Client
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            Application.ThreadException += (s, e) =>
            {
                MessageBox.Show(e.Exception.ToString(), "TRAXONET Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };
            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
            {
                MessageBox.Show(e.ExceptionObject.ToString(), "TRAXONET Fatal Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };

            try
            {
                ApplicationConfiguration.Initialize();

                while (true)
                {
                    using var loginForm = new LoginForm();
                    if (loginForm.ShowDialog() != DialogResult.OK || loginForm.LoggedInUser == null)
                        break;

                    using var mainForm = new MainForm(loginForm.LoggedInUser, loginForm.ServerHost);
                    var result = mainForm.ShowDialog();

                    if (result != DialogResult.Retry)
                        break;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.ToString(), "TRAXONET Startup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}