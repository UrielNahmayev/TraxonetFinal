The Download button serves 'TraxonetClientSetup.exe' — a single self-contained installer
(built with Inno Setup) that installs the Traxonet Client, creates Start Menu / Desktop
shortcuts, and registers an uninstaller. The client runs elevated (requireAdministrator).

To rebuild the installer after changing the client:
1. Publish the client as a single self-contained exe (win-x64, PublishSingleFile).
2. Recompile Traxonet.Client/installer with Inno Setup (ISCC) so it picks up the new exe.
