// Section 7: נספחים — קוד מלא של כל המחלקות
const fs = require('fs');
const path = require('path');
const H = require('./helpers');
const { push, h, he, code, spacer, pageBreak, image, diagram, infoBox, tbl2col, Paragraph, TextRun, AlignmentType, PROJECT_ROOT } = H;

push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 400 },
    children: [new TextRun({ text: "פרק 7", bold: true, size: 80, font: "Arial", color: "C00000" })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "נספחים", bold: true, size: 60, font: "Arial", color: "1F3864", rightToLeft: true })] }),
  pageBreak()
);

push(
  h("נספח א' — הסבר על הטכנולוגיות העיקריות", 1),
  he("פרק זה מתאר את הטכנולוגיות העיקריות שנעשה בהן שימוש, ברמה שניתן להבין גם בלי רקע מקדים."),
  spacer(),
  h("ASP.NET Core", 2),
  he("ASP.NET Core הוא framework של Microsoft לבניית אפליקציות web. הוא תומך הן ב-MVC (Model-View-Controller) והן ב-REST APIs. בפרויקט, ה-Web App ושרת ה-TCP שניהם מבוססים עליו."),
  spacer(),
  h("Entity Framework Core", 2),
  he("EF Core הוא ORM (Object-Relational Mapper) — מאפשר לעבוד עם DB דרך אובייקטים של C# במקום שאילתות SQL ישירות. מתרגם LINQ ל-SQL אוטומטית."),
  spacer(),
  h("SignalR", 2),
  he("SignalR מאפשר תקשורת דו-כיוונית בין שרת לדפדפן בזמן אמת. משתמש ב-WebSocket אם זמין, או fallback ל-long polling. בפרויקט: שידור לוגי שרת לאדמין."),
  spacer(),
  h("WMI (Windows Management Instrumentation)", 2),
  he("WMI הוא ה-API של Windows לקבלת מידע על המערכת. מאפשר שאילתות נוסח SQL על אובייקטי מערכת ההפעלה (Win32_Processor, Win32_OperatingSystem וכו')."),
  spacer(),
  h("MySQL", 2),
  he("בסיס נתונים יחסי קוד-פתוח. תומך ב-SQL standard + תוספות (כמו ON DUPLICATE KEY UPDATE שמשמש לUPSERT)."),
  spacer(),
  h("RSA + AES (Hybrid Encryption)", 2),
  he("**RSA** הוא אלגוריתם הצפנה אסימטרי — שני מפתחות נפרדים (public + private). איטי אבל פותר את בעיית החילוף של מפתחות."),
  he("**AES** הוא אלגוריתם הצפנה סימטרי — מפתח אחד מצפין ומפענח. מהיר מאוד."),
  he("**Hybrid:** משתמשים ב-RSA רק כדי להעביר AES key, ואחר-כך כל ההצפנה ב-AES."),
  pageBreak()
);

// Now load each .cs file and append
const APPENDIX_FILES = [
  // Traxonet.Client
  { rel: "Traxonet.Client/Program.cs", project: "Traxonet.Client" },
  { rel: "Traxonet.Client/ClientIdProvider.cs", project: "Traxonet.Client" },
  { rel: "Traxonet.Client/CryptoHelper.cs", project: "Traxonet.Client" },
  { rel: "Traxonet.Client/DataCollector.cs", project: "Traxonet.Client" },
  { rel: "Traxonet.Client/Sender.cs", project: "Traxonet.Client" },
  { rel: "Traxonet.Client/ApiClient.cs", project: "Traxonet.Client" },
  { rel: "Traxonet.Client/Models.cs", project: "Traxonet.Client" },
  { rel: "Traxonet.Client/LoginForm.cs", project: "Traxonet.Client" },
  { rel: "Traxonet.Client/MainForm.cs", project: "Traxonet.Client" },
  // TraxonetServerTCP
  { rel: "TraxonetServerTCP/Program.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Services/CryptoHelper.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Services/TcpServerService.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Services/Database.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Services/DbCryptoHelper.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Services/LogService.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Hubs/LogHub.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Controllers/ApiController.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Controllers/HomeController.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Models/HardwareData.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Models/PasswordHasher.cs", project: "TraxonetServerTCP" },
  { rel: "TraxonetServerTCP/Models/ErrorViewModel.cs", project: "TraxonetServerTCP" },
  // Traxonet (Web App)
  { rel: "Traxonet/Program.cs", project: "Traxonet" },
  { rel: "Traxonet/Data/ApplicationDbContext.cs", project: "Traxonet" },
  { rel: "Traxonet/Data/EncryptionConverter.cs", project: "Traxonet" },
  { rel: "Traxonet/Services/PasswordHasher.cs", project: "Traxonet" },
  { rel: "Traxonet/Models/Computer.cs", project: "Traxonet" },
  { rel: "Traxonet/Models/User.cs", project: "Traxonet" },
  { rel: "Traxonet/Models/Threshold.cs", project: "Traxonet" },
  { rel: "Traxonet/Models/AuthorizedEmail.cs", project: "Traxonet" },
  { rel: "Traxonet/Models/AlertEmail.cs", project: "Traxonet" },
  { rel: "Traxonet/Models/Drive.cs", project: "Traxonet" },
  { rel: "Traxonet/Models/ComputerPermission.cs", project: "Traxonet" },
  { rel: "Traxonet/Models/ErrorViewModel.cs", project: "Traxonet" },
  { rel: "Traxonet/Controllers/AccountController.cs", project: "Traxonet" },
  { rel: "Traxonet/Controllers/DashboardController.cs", project: "Traxonet" },
  { rel: "Traxonet/Controllers/HomeController.cs", project: "Traxonet" },
  { rel: "Traxonet/Controllers/ApiController.cs", project: "Traxonet" },
  { rel: "Traxonet/ViewModels/DashboardViewModels.cs", project: "Traxonet" },
  // Root
  { rel: "gen_keys.cs", project: "Root" },
];

push(
  h("נספח ב' — קוד מלא של המחלקות", 1),
  he("פרק זה מכיל את הקוד המלא של כל קובץ .cs בפרויקט, מסודר לפי תת-פרויקט. כל קובץ מוצג עם שמו המלא ואחריו הקוד עצמו."),
  spacer(),
  he(`**סה"כ קבצים: ${APPENDIX_FILES.length}**`),
  spacer(),
  h("הערה על תיעוד הקוד (XML Documentation)", 2),
  he("כלל הקוד בפרויקט מתועד בתקן התיעוד הרשמי של #C — הערות XML Documentation. זהו אותו פורמט שבו מתועדות ספריות ה-NET. עצמן, והוא מאפשר לסביבת הפיתוח (Visual Studio) להציג את ההסברים בחלונית ה-IntelliSense בזמן הכתיבה, וכן להפיק מהקוד תיעוד אוטומטי."),
  he("כל מחלקה וכל מתודה בפרויקט מלוות בבלוק תיעוד הבנוי מהתגיות הבאות:"),
  he("● **<summary>** — תיאור תמציתי של תפקיד המחלקה או המתודה: מה היא עושה ולמה היא קיימת."),
  he("● **<param>** — הסבר על כל פרמטר: מה הוא מייצג ואילו ערכים צפויים בו."),
  he("● **<returns>** — מה המתודה מחזירה, כולל התנהגות במקרי כשל."),
  he("● **<remarks>** — תנאי קדם (Precondition) ותנאי אחר (Postcondition): מה חייב להתקיים לפני הקריאה למתודה, ומה מובטח שיתקיים אחריה. תיעוד בסגנון 'חוזה' (Design by Contract) זה מבהיר במדויק את גבולות האחריות של כל רכיב."),
  he("בנוסף לבלוקי התיעוד, שולבו הערות שורה (//) בנקודות שבהן הקוד מממש לוגיקה לא-טריוויאלית — למשל שלבי לחיצת היד הקריפטוגרפית, מנגנון ה-Reentrancy Guard בטיימר, או הסיבה לבחירת IV סטטי בהצפנת מסד הנתונים."),
  pageBreak()
);

let currentProject = null;
APPENDIX_FILES.forEach((f, idx) => {
  if (f.project !== currentProject) {
    currentProject = f.project;
    push(h(`קבצי פרויקט: ${currentProject}`, 1), spacer());
  }
  push(h(`${idx + 1}. ${f.rel}`, 2));
  try {
    const fullPath = path.join(PROJECT_ROOT, f.rel);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    push(...code(fileContent));
  } catch (e) {
    push(he(`(שגיאה בטעינת הקובץ: ${e.message})`));
  }
  push(pageBreak());
});
