// Section 4: מדריך למשתמש
const H = require('./helpers');
const { push, h, he, code, spacer, pageBreak, image, diagram, infoBox, tbl2col, Paragraph, TextRun, AlignmentType } = H;

push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 400 },
    children: [new TextRun({ text: "פרק 4", bold: true, size: 80, font: "Arial", color: "C00000" })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "מדריך למשתמש", bold: true, size: 60, font: "Arial", color: "1F3864", rightToLeft: true })] }),
  pageBreak()
);

// 4.1 קבצי המערכת
push(
  h("4.1 קבצי המערכת — עץ קבצים", 1),
  he("פירוט עץ הקבצים של הפרויקט:"),
  spacer(),
  diagram(`
TraxonetFinal/
├── Traxonet/                          (Web App)
│   ├── Controllers/
│   │   ├── AccountController.cs
│   │   ├── ApiController.cs
│   │   ├── DashboardController.cs
│   │   └── HomeController.cs
│   ├── Data/
│   │   ├── ApplicationDbContext.cs
│   │   └── EncryptionConverter.cs
│   ├── Models/
│   │   ├── AlertEmail.cs
│   │   ├── AuthorizedEmail.cs
│   │   ├── Computer.cs
│   │   ├── ComputerPermission.cs
│   │   ├── Drive.cs
│   │   ├── ErrorViewModel.cs
│   │   ├── Threshold.cs
│   │   └── User.cs
│   ├── Services/
│   │   └── PasswordHasher.cs
│   ├── ViewModels/
│   │   └── DashboardViewModels.cs
│   ├── Views/
│   │   ├── Account/Login.cshtml
│   │   ├── Dashboard/Index.cshtml
│   │   ├── Home/{Index, Privacy, Welcome}.cshtml
│   │   ├── Shared/{_Layout, Error}.cshtml
│   │   └── _ViewImports.cshtml, _ViewStart.cshtml
│   ├── wwwroot/
│   │   └── downloads/TraxonetClient.zip
│   ├── appsettings.json
│   └── Program.cs
│
├── Traxonet.Client/                   (Windows Forms Client)
│   ├── ApiClient.cs
│   ├── ClientIdProvider.cs
│   ├── CryptoHelper.cs
│   ├── DataCollector.cs
│   ├── LoginForm.cs (+ .Designer.cs)
│   ├── MainForm.cs (+ .Designer.cs)
│   ├── Models.cs
│   ├── Program.cs
│   └── Sender.cs
│
├── TraxonetServerTCP/                 (TCP Server + Admin UI)
│   ├── Controllers/
│   │   ├── ApiController.cs
│   │   └── HomeController.cs
│   ├── Hubs/
│   │   └── LogHub.cs
│   ├── Models/
│   │   ├── ErrorViewModel.cs
│   │   ├── HardwareData.cs
│   │   └── PasswordHasher.cs
│   ├── Services/
│   │   ├── CryptoHelper.cs
│   │   ├── Database.cs
│   │   ├── DbCryptoHelper.cs
│   │   ├── LogService.cs
│   │   └── TcpServerService.cs
│   ├── Views/
│   │   ├── Home/{Index, Privacy}.cshtml
│   │   └── Shared/{_Layout, Error}.cshtml
│   ├── appsettings.json
│   └── Program.cs
│
├── gen_keys.cs                        (One-shot key generator)
├── keys.json                          (Generated output)
├── TraxonetFinal.sln                  (Solution file)
└── README.md
`),
  pageBreak()
);

// 4.2 התקנת המערכת
push(
  h("4.2 התקנת המערכת", 1),
  h("4.2.1 הסביבה הנדרשת", 2),
  tbl2col("רכיב", "גרסה / דרישה", [
    ["מערכת הפעלה — Server", "Windows 10/11 או Windows Server 2019+"],
    ["מערכת הפעלה — Client", "Windows 10/11 (64-bit)"],
    [".NET SDK", "8.0 או חדש יותר"],
    [".NET Runtime", "8.0"],
    ["MySQL Server", "8.0+"],
    ["Visual Studio", "2022 Community Edition (לפיתוח/בנייה)"],
    ["זיכרון מינימלי", "4 GB RAM"],
    ["זיכרון מומלץ", "8 GB RAM"],
    ["שטח דיסק", "1 GB"],
    ["רשת", "TCP port 5000 פתוח על השרת"],
  ]),
  spacer(),
  h("4.2.2 הכלים הנדרשים", 2),
  he("**1.** .NET 8 SDK — https://dotnet.microsoft.com/download/dotnet/8.0"),
  he("**2.** MySQL Installer — https://dev.mysql.com/downloads/installer/"),
  he("**3.** Visual Studio 2022 Community — https://visualstudio.microsoft.com/"),
  he("**4.** MySQL Workbench — https://dev.mysql.com/downloads/workbench/ (אופציונלי)"),
  spacer(),
  h("4.2.3 מיקומי קבצים", 2),
  he("**הקוד מקור:** `C:\\Users\\<user>\\source\\repos\\TraxonetFinal\\`"),
  he("**Built executables:**"),
  he("**•** Client: `Traxonet.Client\\bin\\Debug\\net8.0-windows\\Traxonet.Client.exe`"),
  he("**•** TCP Server: `TraxonetServerTCP\\bin\\Debug\\net8.0\\TraxonetServerTCP.exe`"),
  he("**•** Web App: `Traxonet\\bin\\Debug\\net8.0\\Traxonet.exe`"),
  spacer(),
  he("**Configuration:** `appsettings.json` בכל פרויקט."),
  he("**Client downloads zip:** `Traxonet\\wwwroot\\downloads\\TraxonetClient.zip`"),
  he("**Encryption keys:** ב-`appsettings.json` תחת \"EncryptionSettings\"."),
  spacer(),
  he("**נתוני משתמש שמורים בלקוח:**"),
  he("**•** `%LocalAppData%\\TraxonetClient\\login_settings.json` — אימייל אחרון + ServerAddress."),
  he("**•** `HKCU\\SOFTWARE\\Traxonet\\ClientId` — ה-GUID של המחשב."),
  he("**•** `HKCU\\SOFTWARE\\Traxonet\\OwnerId` — ה-UserId של בעל המחשב."),
  pageBreak()
);

// 4.2.4 נתונים התחלתיים
push(
  h("4.2.4 נתונים התחלתיים נדרשים", 2),
  he("**שלב 1: יצירת DB ב-MySQL**"),
  code(`mysql -u root -p
> CREATE DATABASE traxonet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> EXIT;`),
  he("**שלב 2: עדכון appsettings.json של שני הפרויקטים**"),
  code(`{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=traxonet_db;User=root;Password=<your-password>;"
  },
  "EncryptionSettings": {
    "RsaPrivateKey": "...",
    "EncryptedAesKey": "..."
  }
}`),
  spacer(),
  he("**שלב 3: יצירת מפתחות הצפנה**"),
  code(`cd C:\\Users\\<user>\\source\\repos\\TraxonetFinal
dotnet script gen_keys.cs
# יוצר keys.json — העתק את התוכן ל-appsettings.json של שני הפרויקטים`),
  spacer(),
  he("**שלב 4: יצירת משתמש admin (אופציונלי)**"),
  he("פתח את הלקוח, לחץ Register, הזן `traxonetisrael@gmail.com` כאימייל ובחר סיסמה. זה ה-admin email המוטמע בקוד."),
  spacer(),
  h("4.2.5 ארכיטקטורת מינימום", 2),
  diagram(`
מינימום: מחשב יחיד
+-------------------------------+
|       Windows 10/11 PC        |
|  +---------------------+      |
|  |  MySQL 8 (localhost)|      |
|  +---------------------+      |
|  +---------------------+      |
|  |  TCP Server + Web   |      |
|  +---------------------+      |
|  +---------------------+      |
|  |   Client (test)     |      |
|  +---------------------+      |
+-------------------------------+

מומלץ: שרת + לקוחות מפוזרים
+-------------------+      +-------------------+
|  Server Machine   |      |   Client PC 1     |
|  - MySQL 8        |<-----+   Traxonet.Client |
|  - TCP Server     |      +-------------------+
|  - Web App        |      +-------------------+
+-------------------+<-----+   Client PC 2     |
        ^                  +-------------------+
        |                  +-------------------+
        +------------------+   Admin Browser   |
                           +-------------------+
`),
  pageBreak()
);

// 4.3 משתמשי המערכת
push(
  h("4.3 משתמשי המערכת — אופן הפעלה", 1),
  he("פרק זה מציג איך להפעיל את המערכת לכל סוג משתמש."),
  spacer(),
  h("4.3.1 משתמש קצה — בעל מחשב מנוטר", 2),
  he("**שלב 1: התקנת הלקוח**"),
  he("**1.** הורד את `TraxonetClient.zip` מ-`https://<server-address>/Home/DownloadClient`."),
  he("**2.** חלץ ל-`C:\\Program Files\\TraxonetClient\\`."),
  he("**3.** הפעל את `Traxonet.Client.exe` בלחיצה כפולה."),
  spacer(),
  he("**שלב 2: התחברות ראשונית**"),
  he("**1.** במסך ה-Login, לחץ על tab \"Register\"."),
  he("**2.** מלא: FullName, Email, Password, Confirm Password."),
  he("**3.** עדכן את \"Server Address\" אם השרת לא localhost."),
  he("**4.** לחץ \"REGISTER\". הופעת הודעה ירוקה \"Account created!\"."),
  he("**5.** חזור ל-tab \"Login\" וההתחבר."),
  image("client_login.png.png", "מסך ההתחברות של הלקוח", 480, 360),
  spacer(),
  he("**שלב 3: שימוש ב-MainForm**"),
  he("**1.** ה-MainForm יציג את פרטי המחשב — CPU, RAM, GPU, drives."),
  he("**2.** הוסף אימיילים שיוכלו לראות את המחשב שלך ב-Dashboard."),
  he("**3.** השאר את האפליקציה פתוחה ברקע — היא תשלח נתונים אוטומטית."),
  image("client_monitor.png.png", "מסך הראשי של הלקוח", 520, 380),
  spacer(),
  he("**שלב 4: צפייה ב-Dashboard**"),
  he("**1.** פתח דפדפן ב-`https://<server-address>:7034`."),
  he("**2.** התחבר עם אותם credentials."),
  he("**3.** לחץ \"Open Dashboard\" במסך ה-Welcome."),
  he("**4.** המחשב שלך יופיע ב-sidebar."),
  he("**5.** הגדר ספי התראה ב-Settings section."),
  he("**6.** הוסף אימיילים שיקבלו התראות במייל."),
  image("server_dashboard.png.png", "Dashboard", 580, 400),
  pageBreak()
);

push(
  h("4.3.2 משתמש מורשה — צפייה במחשבים של אחרים", 2),
  he("מסך ההתחברות של ה-Web App דומה בעיצובו למסך ה-Client אבל בדפדפן. ניתן לראות בו את שני הטאבים — Login ו-Register — עם רקע כהה ועיצוב גרדיאנט אדום."),
  image("web_login.png.png", "מסך ההתחברות ב-Web App — מבט מהדפדפן", 520, 380),
  spacer(),
  he("**שלב 1:** המשתמש שהוא בעלי המחשב מוסיף את האימייל שלך לרשימת \"Authorized Emails\" ב-MainForm או ב-Dashboard. ההוספה נכנסת לתוקף מיד — אין צורך ב-restart כלשהו."),
  he("**שלב 2:** פתח דפדפן בכתובת `https://<server-address>:7034`. הדפדפן יציג את מסך ה-Login של ה-Web App, אותו זה שמופיע באיור למעלה."),
  he("**שלב 3:** התחבר עם credentials שלך, או הירשם אם אין לך עדיין חשבון. שים לב שאתה צריך להירשם דרך אחת מהאפליקציות (Client או Web) — שתיהן ניגשות לאותו מסד נתונים."),
  he("**שלב 4:** ב-Dashboard, ה-Sidebar יציג את כל המחשבים שאתה מורשה אליהם. כל מחשב מופיע ככרטיס עם שם, IP, ונקודה ירוקה/אפורה שמציינת אם הוא Online (שולח נתונים ב-5 דקות האחרונות) או Offline."),
  he("**שלב 5:** לחץ על מחשב כדי לראות את הפרטים שלו. הגרפים בצד ימין מתעדכנים אוטומטית — RAM doughnut, Temperature bar ו-CPU gauge."),
  he("**שלב 6:** אם תרצה להסיר את עצמך מצפייה — לחץ \"Remove from my list\" באזור ה-Settings. הפעולה הזו מסירה את האימייל שלך מטבלת ה-AuthorizedEmails של המחשב.") ,
  image("server_dashboard.png.png", "Dashboard מלא עם רשימת מחשבים, גרפים והגדרות", 580, 400),
  spacer(),
  h("4.3.3 אדמין — מנהל המערכת", 2),
  he("מסך ה-Admin UI של ה-TCP Server מציע ניהול מלא של המערכת. הוא מורכב משני panels — לוגים בזמן אמת בצד שמאל וניהול מסד נתונים בצד ימין — עם עיצוב כהה שדומה לכלי DevOps מקצועיים."),
  image("server_dashboard.png.png", "ממשק הניהול של אדמין — שני panels עם logs בצד שמאל ו-DB בצד ימין", 580, 400),
  spacer(),
  he("**שלב 1: גישה ל-Admin UI**"),
  he("פתח דפדפן ב-`https://<server-address>:7150` — זה הפורט של ה-TCP Server's Admin UI. הפורט שונה מ-Dashboard הרגיל (7034) כי מדובר ב-2 פרויקטים נפרדים שרצים על אותו מחשב.") ,
  spacer(),
  he("**שלב 2: צפייה בלוגים בזמן אמת**"),
  he("בחלק השמאלי של המסך — Server Console. כל פעולה של לקוח/משתמש מופיעה מיד."),
  he("Auto-scroll מופעל כברירת מחדל. כפתור \"Clear\" מנקה את ה-console."),
  spacer(),
  he("**שלב 3: ניהול משתמשים**"),
  he("**1.** לחץ ב-tab \"Users\"."),
  he("**2.** ראה רשימת משתמשים: Id, FullName, Email, CreatedAt."),
  he("**3.** ליד כל משתמש: כפתורים \"Reset Password\" ו-\"Delete\"."),
  spacer(),
  he("**שלב 4: ניהול מחשבים**"),
  he("**1.** tab \"Computers\"."),
  he("**2.** רואים רשימת מחשבים עם MachineName גלוי. שאר השדות מסומנים כ-\"*\" (מוגן)."),
  he("**3.** Delete מסיר את המחשב + cascade ל-emails, drives, thresholds."),
  spacer(),
  he("**שלב 5: ניהול אימיילים, drives, thresholds**"),
  he("**•** tab \"Emails\" — רואה את כל ה-authorized emails."),
  he("**•** tab \"Drives\" — סטטיסטיקת כוננים."),
  he("**•** tab \"Thresholds\" — הספים שנקבעו לכל מחשב."),
  spacer(),
  h("4.3.4 הוראות הפעלה כלליות", 2),
  he("**הפעלה ראשונה של השרת:**"),
  he("**1.** וודא ש-MySQL Service רץ."),
  he("**2.** הפעל את TCP Server (`dotnet run` ב-תיקיית TraxonetServerTCP)."),
  he("**3.** הפעל את Web App (`dotnet run` ב-תיקיית Traxonet)."),
  he("**4.** הפעל את הלקוחות."),
  spacer(),
  he("**עצירת המערכת:**"),
  he("**1.** סגור את כל הלקוחות."),
  he("**2.** Ctrl+C ב-Web App."),
  he("**3.** Ctrl+C ב-TCP Server."),
  spacer(),
  h("4.3.5 פתרון בעיות נפוצות", 2),
  he("**\"Cannot connect to server\":** וודא ש-TCP Server רץ ופורט 5000 פתוח. בדוק ב-`netstat -an | findstr :5000`."),
  he("**\"This PC is locked to another account\":** הריצה הקודמת של המשתמש נשמרה ב-Registry. מחק את `HKCU\\SOFTWARE\\Traxonet\\OwnerId` באמצעות `regedit`."),
  he("**\"Failed to send email\":** וודא ש-SMTP credentials תקינים. Gmail דורש App Password."),
  he("**\"DB connection failed\":** בדוק את ה-connection string ב-appsettings.json."),
  pageBreak()
);
