// Section 3: מימוש הפרויקט
const H = require('./helpers');
const { push, h, he, code, spacer, pageBreak, image, diagram, infoBox, tbl2col, Paragraph, TextRun, AlignmentType } = H;

push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 400 },
    children: [new TextRun({ text: "פרק 3", bold: true, size: 80, font: "Arial", color: "C00000" })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "מימוש הפרויקט", bold: true, size: 60, font: "Arial", color: "1F3864", rightToLeft: true })] }),
  pageBreak()
);

// 3.1 - Part A: Modules and classes
push(
  h("3.1 חלק א' — מודולים ומחלקות", 1),
  he("פרק זה מפרט את כל המודולים והמחלקות שמרכיבים את המערכת."),
  spacer(),
  h("3.1.1 מודולים מיובאים (NuGet packages)", 2),
  h("מודולים ב-Traxonet.Client", 3),
  tbl2col("שם המודול", "תיאור", [
    ["LibreHardwareMonitorLib v0.9.4", "גישה לסנסורי חומרה (motherboard, temperatures)"],
    ["Newtonsoft.Json v13.0.3", "סריאליזציה של JSON"],
    ["System.Management (built-in)", "WMI access"],
    ["System.Net.Sockets (built-in)", "TCP communication"],
    ["System.Security.Cryptography (built-in)", "RSA, AES, RandomNumberGenerator"],
  ]),
  spacer(),
  h("מודולים ב-TraxonetServerTCP", 3),
  tbl2col("שם המודול", "תיאור", [
    ["MySql.Data", "ADO.NET driver ל-MySQL"],
    ["Microsoft.AspNetCore.SignalR.Common", "SignalR Hub"],
    ["Newtonsoft.Json", "סריאליזציה של JSON"],
    ["System.Net.Sockets", "TcpListener, TcpClient"],
    ["System.Net.Mail", "SmtpClient לשליחת אימיילים"],
  ]),
  spacer(),
  h("מודולים ב-Traxonet (Web App)", 3),
  tbl2col("שם המודול", "תיאור", [
    ["Pomelo.EntityFrameworkCore.MySql", "EF Core provider ל-MySQL"],
    ["Microsoft.EntityFrameworkCore", "ORM"],
    ["Microsoft.AspNetCore.Authentication.Cookies", "Cookie-based authentication"],
    ["Microsoft.AspNetCore.Mvc", "MVC framework"],
  ]),
  pageBreak()
);


// ---------- 3.1.2 Client classes ----------
push(
  h("3.1.2 מחלקות שפיתחתי בצד הלקוח (Traxonet.Client)", 2),
  he("בפרק זה תיעוד מלא של כל מחלקה במערכת: תפקידה וההיגיון שמאחוריה, טבלת השדות והתכונות שלה, וטבלת המתודות עם תיאור מה כל מתודה מבצעת. המחלקות מקובצות לפי שלושת רכיבי המערכת — סוכן הלקוח, שרת ה-TCP ואפליקציית ה-Web — באותו סדר שבו הקבצים מופיעים בנספח הקוד (נספח ב')."),
  spacer(),

  h("מחלקה: Program", 3),
  he("**תפקיד:** נקודת הכניסה של סוכן הלקוח. רושמת מטפלי חריגות גלובליים (כך ששגיאה לא צפויה מציגה חלון הודעה במקום קריסה שקטה), ומריצה את לולאת החיים של האפליקציה: חלון התחברות, ואחריו החלון הראשי. כאשר החלון הראשי נסגר עם DialogResult.Retry (המשתמש לחץ Logout) — חלון ההתחברות מוצג שוב; כל תוצאה אחרת מסיימת את האפליקציה."),
  he("**שדות ותכונות:** אין (מחלקה סטטית)."),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["Main()", "נקודת הכניסה ([STAThread]). רושמת מטפלי ThreadException ו-UnhandledException, מאתחלת את תצורת ה-WinForms, ומריצה את לולאת LoginForm → MainForm עד יציאה."],
  ]),
  spacer(),

  h("מחלקה: ClientIdProvider", 3),
  he("**תפקיד:** מספקת מזהה ייחודי וקבוע למחשב. המזהה (GUID) נוצר פעם אחת ונשמר ב-Registry של Windows, כך שאותו מחשב שומר על אותה זהות בין הפעלות והתחברויות — וזה מה שמאפשר לשרת לבצע UPSERT לרשומת מחשב אחת במקום ליצור כפילויות."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["RegistryPath (const string)", "נתיב המפתח ב-Registry:‏ SOFTWARE\\Traxonet תחת HKEY_CURRENT_USER."],
    ["ValueName (const string)", "שם הערך השומר את המזהה: ClientId."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["GetOrCreateClientId()", "מחזירה string. אם קיים מזהה ב-Registry — מחזירה אותו; אחרת מייצרת GUID חדש, שומרת אותו ומחזירה. תנאי אחר: כל קריאה עתידית באותו מחשב תחזיר את אותו מזהה."],
  ]),
  spacer(),

  h("מחלקה: CryptoHelper (צד לקוח)", 3),
  he("**תפקיד:** מרכזת את כל הפרימיטיבים הקריפטוגרפיים של הסוכן: הצפנת RSA במפתח הציבורי של השרת (להעברת מפתח ה-AES), הצפנת AES-256-CBC של ה-payload, ומסגור הודעות בקידומת אורך (Length-Prefixed Framing) מעל זרם ה-TCP."),
  he("**שדות ותכונות:** אין (מחלקה סטטית)."),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["RsaEncrypt(data, rsaPublicKey)", "מצפינה בלוק נתונים קטן במפתח הציבורי של השרת עם ריפוד OAEP-SHA256. משמשת פעם אחת בכל סשן להעברת חבילת המפתח (AES key + IV)."],
    ["GenerateAesKey()", "מחזירה מפתח AES אקראי באורך 32 בתים (256 ביט), מיוצר על-ידי ה-CSPRNG של מערכת ההפעלה."],
    ["GenerateAesIV()", "מחזירה וקטור אתחול (IV) אקראי באורך 16 בתים."],
    ["AesEncrypt(plainText, key, iv)", "מצפינה מחרוזת UTF-8 ב-AES-256 במצב CBC עם ריפוד PKCS7. מחזירה את בייטי ההצפנה."],
    ["AesDecrypt(cipherText, key, iv)", "מפענחת payload שהתקבל מהשרת חזרה למחרוזת. זורקת CryptographicException אם המפתח שגוי או שהמידע שובש."],
    ["WriteLengthPrefixedAsync(stream, data)", "כותבת הודעה לזרם: קודם 4 בתים של אורך (Big-Endian) ואז ה-payload. כך הצד המקבל יודע בדיוק היכן ההודעה מסתיימת."],
    ["ReadLengthPrefixedAsync(stream)", "קוראת הודעה שלמה אחת: קוראת את 4 בתי האורך ואז בדיוק את מספר הבתים שהוכרז, בלולאה. דוחה אורכים לא הגיוניים (מעל 10MB) — הגנה מפני מתקפת הצפת זיכרון."],
  ]),
  spacer(),

  h("מחלקה: DataCollector", 3),
  he("**תפקיד:** אוספת תמונת חומרה מלאה של המחשב באמצעות WMI‏ (Windows Management Instrumentation), מוני ביצועים (Performance Counters) וספריית LibreHardwareMonitor. כל תת-איסוף עטוף ב-try/catch נפרד, כך שחיישן אחד שלא זמין לעולם לא מפיל את הדגימה כולה — המדד פשוט יישאר בערך ברירת מחדל (או 1- עבור ניצולת וטמפרטורה)."),
  he("**שדות ותכונות:** אין (מחלקה סטטית)."),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["CollectAsync()", "מחזירה Task<HardwareData> — מחזור דגימה שלם: מעבד (Win32_Processor), זיכרון (Win32_PhysicalMemory + Win32_OperatingSystem), כוננים קבועים בלבד (Win32_LogicalDisk עם DriveType=3), כרטיס מסך, זהות רשת (IP/MAC), ניצולת מעבד, טמפרטורה ולוח אם. אורכת לפחות שנייה בגלל דגימת ה-CPU."],
    ["GetCpuUsageAsync()", "מודדת ניצולת מעבד עם המונה % Processor Time. הדגימה הראשונה של המונה תמיד 0, ולכן המתודה דוגמת, ממתינה שנייה, ומחזירה את הדגימה השנייה. בכשל מחזירה 1-."],
    ["GetCpuTemp()", "קוראת טמפרטורה מ-MSAcpi_ThermalZoneTemperature (אזור תרמי ACPI). הערך הגולמי הוא בעשיריות קלווין ולכן מחולק ב-10 ומוסט ב-273.15 לצלזיוס. מחזירה 1- כשאין חיישן זמין."],
  ]),
  spacer(),

  h("מחלקה: Sender", 3),
  he("**תפקיד:** שולחת תמונת חומרה אחת לשרת על גבי חיבור חדש ומוצפן במלואו. כל שליחה מבצעת את לחיצת היד הקריפטוגרפית מאפס — מפתח AES חדש לכל הודעה — כך שחשיפת הודעה אחת לעולם לא חושפת אחרות."),
  he("**שדות ותכונות:** אין (מחלקה סטטית)."),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["SendAsync(data, host, port)", "זרימת השליחה המלאה: (1) קבלת המפתח הציבורי של השרת, (2) יצירת AES key+IV טריים ושליחתם מוצפנים ב-RSA כחבילת 48 בתים, (3) שליחת ה-JSON מוצפן ב-AES, (4) המתנה לאישור מוצפן מהשרת. כשל רשת מתגלגל ל-MainForm שמציג אותו ומנסה שוב בטיק הבא."],
  ]),
  spacer(),

  h("מחלקה: ApiClient", 3),
  he("**תפקיד:** ערוץ הבקשה/תשובה של הסוכן מול השרת. בעוד Sender דוחף תמונות חומרה חד-כיווניות, מחלקה זו שולחת בקשות מסוגים שונים (התחברות, הרשמה, ניהול מיילים, סנכרון הגדרות) ומפענחת את תשובות ה-JSON. כל בקשה פותחת חיבור מוצפן משלה באותה לחיצת יד היברידית."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_host (string)", "כתובת השרת."],
    ["_port (int)", "פורט ה-TCP של השרת (ברירת מחדל 5000)."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["SendRequestAsync(request)", "מתודת הליבה (private): מסרילת את הבקשה ל-JSON, מבצעת את לחיצת היד המלאה, שולחת מוצפן, קוראת ומפענחת את התשובה ומחזירה JObject."],
    ["LoginAsync(email, password)", "שולחת בקשת login. מחזירה UserInfo בהצלחה או null בדחייה. הסיסמה לעולם לא נשמרת בצד הלקוח."],
    ["RegisterAsync(fullName, email, password)", "שולחת בקשת register. מחזירה (Success, Message) — כולל סיבת כשל ידידותית כמו אימייל תפוס."],
    ["GetAuthorizedEmailsAsync(clientId)", "שולפת את רשימת המיילים המורשים לצפות במחשב זה."],
    ["AddAuthorizedEmailAsync(clientId, email)", "מעניקה לכתובת מייל הרשאת צפייה במחשב."],
    ["RemoveAuthorizedEmailAsync(clientId, email)", "מסירה הרשאת צפייה."],
    ["GetSettingsAsync(clientId)", "מושכת את תצורת הניטור מהשרת (תדירות + כתובת יעד). לעולם לא זורקת — בכשל מחזירה ברירות מחדל בטוחות (10 שניות, localhost) כדי שהסוכן ימשיך לפעול על ההגדרות האחרונות."],
  ]),
  spacer(),

  h("מחלקה: UserInfo", 3),
  he("**תפקיד:** DTO של זהות המשתמש המחובר, כפי שחוזרת מהתחברות מוצלחת."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["Id (int)", "מזהה המשתמש במסד הנתונים."],
    ["FullName (string)", "שם התצוגה המלא."],
    ["Email (string)", "כתובת המייל (מזהה ההתחברות)."],
  ]),
  he("**מתודות:** אין (POCO)."),
  spacer(),

  h("מחלקה: Models.HardwareData (צד לקוח)", 3),
  he("**תפקיד:** ה-DTO המרכזי של המערכת — תמונת החומרה המלאה שנשלחת לשרת בכל מחזור דגימה, ה-payload של הודעת hardware_data. כל מאפיין נושא [JsonProperty] כדי ששמות השדות ב-JSON יישארו קבועים (camelCase) ותואמים לצד השרת."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["MachineName, Motherboard, Cpu, Gpu, GpuDriver", "מחרוזות זיהוי החומרה: שם המחשב, לוח האם, המעבד, כרטיס המסך וגרסת הדרייבר."],
    ["CpuCores, LogicalProcessors", "מספר ליבות פיזיות ומעבדים לוגיים."],
    ["CpuTemp, CpuUsage (float)", "טמפרטורת וניצולת המעבד; 1- מסמן שאין קריאה."],
    ["TotalRam, FreeRam (long), RamUsage (float)", "זיכרון כולל ופנוי בבתים, ואחוז ניצולת מחושב."],
    ["Ip, Mac (string)", "זהות הרשת של המחשב."],
    ["Drives (List<DriveData>)", "דוח קיבולת לכל כונן קבוע."],
    ["ClientId (string)", "המזהה הקבוע מ-ClientIdProvider — מפתח ה-UPSERT בשרת."],
    ["AuthorizedEmails, AlertEmails (List<string>)", "המיילים המורשים לצפייה והנמענים להתראות."],
    ["Thresholds (ThresholdData)", "ספי ההתראה של המחשב."],
    ["OwnerUserId (int?), OwnerEmail (string)", "זהות בעל המחשב — הבסיס למנגנון נעילת הבעלים (Owner Lock)."],
  ]),
  he("**מתודות:** אין (POCO)."),
  spacer(),

  h("מחלקה: Models.DriveData", 3),
  he("**תפקיד:** דוח קיבולת של כונן קבוע יחיד, חלק מרשימת Drives שבתמונת החומרה."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["DriveName (string)", "אות הכונן (למשל C:)."],
    ["TotalSize (long)", "קיבולת כוללת בבתים."],
    ["FreeSpace (long)", "שטח פנוי בבתים."],
  ]),
  spacer(),

  h("מחלקה: Models.ThresholdData", 3),
  he("**תפקיד:** ספי ההתראה של מחשב אחד. ערך null פירושו \"לא הוגדר סף\" — והשרת מדלג על הבדיקה המתאימה לחלוטין."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["MaxCpuTemp (float?)", "טמפרטורת מעבד מקסימלית במעלות צלזיוס לפני שליחת התראה."],
    ["MaxCpuUsage (float?)", "אחוז ניצולת מעבד מקסימלי."],
    ["MaxRamUsage (float?)", "אחוז ניצולת זיכרון מקסימלי."],
    ["MinFreeSpace (long?)", "שטח דיסק פנוי מינימלי בבתים."],
  ]),
  pageBreak(),

  h("מחלקה: LoginForm (partial)", 3),
  he("**תפקיד:** חלון האימות של הסוכן, עם שני פאנלים בסגנון לשוניות: התחברות והרשמה. אוכפת את מנגנון נעילת הבעלים — ברגע שמשתמש התחבר לראשונה במחשב, המזהה שלו נשמר ב-Registry וכל ניסיון התחברות של חשבון אחר באותה עמדה נדחה. זוכרת את המייל וכתובת השרת האחרונים בין הרצות."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["LoggedInUser (UserInfo?)", "המשתמש המאומת לאחר התחברות מוצלחת; null עד אז."],
    ["ServerHost (string)", "כתובת השרת שההתחברות בוצעה מולה; מועברת ל-MainForm."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["LoginForm_Load(...)", "בטעינת החלון — משחזרת את המייל וכתובת השרת השמורים, כך שמשתמש חוזר מקליד רק סיסמה."],
    ["tabLogin_Click / tabRegister_Click", "מעבר בין פאנל ההתחברות לפאנל ההרשמה (כולל צביעת הלשונית הפעילה)."],
    ["ShowLoginPanel() / ShowRegisterPanel()", "מציגות את הפאנל המתאים ומעדכנות את אינדיקטור הלשונית."],
    ["GetTextValue(txt)", "מחזירה את הטקסט האמיתי של תיבה — מתייחסת לטקסט placeholder (שמור ב-Tag) כקלט ריק."],
    ["GetServerHost()", "קוראת את שדה כתובת השרת עם fallback ל-localhost כשהשדה ריק."],
    ["btnLogin_Click(...)", "טיפול בכפתור LOGIN: ולידציה, אימות מול השרת, ואכיפת נעילת הבעלים. בהתחברות הראשונה במחשב — המשתמש הופך לבעלים; אחר-כך רק הוא יכול להתחבר. בהצלחה — הדיאלוג נסגר עם DialogResult.OK."],
    ["btnRegister_Click(...)", "טיפול בכפתור REGISTER: ולידציה (כולל התאמת סיסמאות), יצירת החשבון בשרת, ובחזרה לפאנל ההתחברות עם המייל החדש ממולא."],
    ["ShowStatus(text, success)", "מציגה הודעת סטטוס — ירוקה להצלחה, אדומה לשגיאה."],
    ["SaveSettings(email) / LoadSettings()", "שמירה וטעינה של המייל וכתובת השרת האחרונים בקובץ login_settings.json תחת LocalAppData."],
    ["GetSavedOwnerId() / SaveOwnerId(userId)", "קריאה ושמירה של מזהה הבעלים ב-Registry‏ (HKCU\\SOFTWARE\\Traxonet\\OwnerId) — מצב נעילת הבעלים."],
  ]),
  spacer(),

  h("מחלקה: MainForm (partial)", 3),
  he("**תפקיד:** החלון הראשי של הסוכן אחרי התחברות. מציג את נתוני החומרה החיים של המחשב ומנהל את רשימת המיילים המורשים. שני טיימרים של Windows Forms מניעים את העבודה ברקע: טיימר השליחה דוגם ומשדר נתונים בתדירות המוגדרת, וטיימר הרענון (כל 30 שניות) מושך שינויי תצורה מהשרת — כך עריכות בלוח הבקרה נכנסות לתוקף בלי להפעיל מחדש את הסוכן."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_api (ApiClient)", "ערוץ הבקשות לשרת; נוצר מחדש כשכתובת השרת משתנה מרחוק."],
    ["_currentUser (UserInfo)", "המשתמש שהתחבר בעמדה (הבעלים)."],
    ["_clientId (string)", "המזהה הקבוע של המחשב."],
    ["_serverHost (string)", "כתובת השרת הנוכחית; ניתנת לעדכון מרחוק דרך get_settings."],
    ["_sendTimer / _refreshTimer (Timer)", "טיימר מחזור האיסוף-שליחה וטיימר סנכרון התצורה."],
    ["_sendIntervalMs (int)", "תדירות השליחה במילישניות (ברירת מחדל 10 שניות, נקבעת מרחוק)."],
    ["_isSending (bool)", "דגל ה-Reentrancy Guard — true בזמן מחזור שליחה פעיל."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["MainForm_Load(...)", "בטעינה: תמונת חומרה ראשונית, טעינת רשימת המיילים, סנכרון התדירות מהשרת — ורק אז הפעלת שני הטיימרים."],
    ["SendTimer_Tick(...)", "מחזור ניטור אחד: איסוף תמונה, חתימתה בזהות הבעלים, שליחה לשרת ועדכון התצוגה. דגל _isSending מונע חפיפת מחזורים — האיסוף אורך מעל שנייה, ובלעדיו אינטרוול קצר היה צובר מחזורים חופפים."],
    ["RefreshTimer_Tick(...)", "סנכרון התצורה כל 30 שניות: רענון רשימת המיילים ומשיכת הגדרות עדכניות."],
    ["RefreshComputerData()", "איסוף תמונה לתצוגה בלבד (ללא שליחה), עם Invoke ל-thread של ה-UI בעת הצורך."],
    ["UpdateDataPanel(data)", "מרנדרת תמונת חומרה לפאנל: מעבד, כרטיס מסך, זיכרון, רשת, ושורה לכל כונן. כונן מעל 90% תפוסה נצבע אדום."],
    ["RefreshEmailList() / UpdateEmailPanel(emails)", "שליפת רשימת המיילים מהשרת ובנייה דינמית של הפאנל — שורה לכל מייל עם כפתור הסרה (כתובת המערכת המובנית אינה ניתנת להסרה)."],
    ["RemoveEmail_Click / btnAddEmail_Click", "הסרה והוספה של מייל מורשה, כולל ולידציה בסיסית של הכתובת ורענון הרשימה."],
    ["RefreshSendInterval()", "מושכת הגדרות מהשרת ומחילה אותן חי: שינוי תדירות מכוון מחדש את הטיימר; שינוי כתובת שרת מחליף את ה-ApiClient ומפנה את כל התעבורה — מנגנון הקונפיגורציה מרחוק בפעולה."],
    ["UpdateStatus(text, color)", "כתיבת הודעה צבעונית לשורת הסטטוס, עם Invoke בקריאה מרקע."],
    ["MainForm_FormClosing / btnLogout_Click", "עצירת הטיימרים בסגירה; ב-Logout החלון נסגר עם DialogResult.Retry שמחזיר את Program.Main למסך ההתחברות."],
  ]),
  pageBreak()
);

// ---------- 3.1.3 Server classes ----------
push(
  h("3.1.3 מחלקות צד השרת (TraxonetServerTCP)", 2),

  h("מחלקה: Program (שרת)", 3),
  he("**תפקיד:** נקודת הכניסה של שרת הליבה. בונה מארח ASP.NET Core שמריץ שני דברים זה לצד זה: מאזין ה-TCP לסוכנים (כשירות רקע) ואתר ה-Admin UI עם ה-SignalR Hub לשידור לוגים חי. רושמת את ה-LogService וה-Database כסינגלטונים משותפים וממפה את צינור ה-HTTP."),
  he("**שדות ותכונות:** אין."),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["Main(args)", "רושמת MVC + SignalR, יוצרת LogService ו-Database משותפים, מפעילה את TcpServerService כ-HostedService, ממפה את /logHub ואת נתיב ה-MVC, ומריצה את המארח."],
  ]),
  spacer(),

  h("מחלקה: CryptoHelper (צד שרת)", 3),
  he("**תפקיד:** המקבילה השרתית ל-CryptoHelper של הלקוח. מחזיקה את זוג מפתחות ה-RSA-2048 של השרת (נוצר פעם אחת לכל חיי התהליך — המפתח הפרטי לעולם לא עוזב את האובייקט) ומספקת את אותם AES ומסגור הודעות, כך ששני הצדדים מדברים פורמט חוט זהה."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_rsa (RSA, private)", "זוג מפתחות ה-RSA-2048 של השרת."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["ExportRsaPublicKey()", "מייצאת את המפתח הציבורי בפורמט SubjectPublicKeyInfo‏ (DER) — הדבר הראשון שנשלח לכל לקוח מתחבר."],
    ["RsaDecrypt(encryptedData)", "מפענחת במפתח הפרטי את חבילת המפתח של הלקוח (48 בתים: AES key + IV) עם ריפוד OAEP-SHA256."],
    ["AesEncrypt / AesDecrypt (static)", "הצפנה ופענוח AES-256-CBC של בקשות ותשובות עם מפתח הסשן מלחיצת היד."],
    ["WriteLengthPrefixedAsync / ReadLengthPrefixedAsync (static)", "אותו מסגור בקידומת אורך כמו בלקוח, כולל מגבלת 10MB נגד מתקפות הצפת זיכרון."],
  ]),
  spacer(),

  h("מחלקה: TcpServerService : BackgroundService", 3),
  he("**תפקיד:** לב השרת — שירות רקע שמאזין על פורט 5000, מבצע את לחיצת היד הקריפטוגרפית מול כל סוכן מתחבר, מנתב כל בקשה מפוענחת למטפל המתאים ומחזיר תשובת JSON מוצפנת. כל חיבור לקוח מטופל ב-Task משלו, כך שעשרות סוכנים מטופלים במקביל. בנוסף מעבירה כל שורת לוג בזמן אמת ל-Admin UI דרך SignalR."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_db (Database)", "שכבת הגישה לנתונים."],
    ["_log (LogService)", "שירות הלוגים המרכזי."],
    ["_hubContext (IHubContext<LogHub>)", "ההקשר לדחיפת לוגים לדפדפנים המחוברים."],
    ["_crypto (CryptoHelper)", "מחזיק את מפתחות ה-RSA ללחיצת היד."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["(בנאי)", "מזריק את התלויות, מייצר את זוג מפתחות ה-RSA, ונרשם לאירוע OnNewLog כך שכל לוג נדחף מיידית לכל הדפדפנים (ReceiveLog) — מנגנון ה-SignalR Forwarding."],
    ["ExecuteAsync(stoppingToken)", "הלולאה הראשית: מוודאת סכמת DB, פותחת TcpListener על 5000, ומקבלת לקוחות עד כיבוי. כל לקוח נמסר ל-HandleClient על Task נפרד — לקוח איטי לא חוסם את לולאת הקבלה."],
    ["HandleClient(client)", "שירות חיבור מקצה לקצה: שליחת מפתח ציבורי → קבלת חבילת AES מוצפנת ב-RSA (עם בדיקת אורך 48 בתים) → קבלה ופענוח של הבקשה → ניתוב → תשובה מוצפנת באותו מפתח סשן. הפרוטוקול הוא בקשה אחת לחיבור; timeout של 15 שניות מונע מלקוח תקוע להחזיק Task לנצח."],
    ["HandleMessage(type, message)", "נתב הפרוטוקול: switch על שדה type. סוג לא מוכר נופל למטפל hardware_data. כל חריגת מטפל הופכת לתשובת שגיאה ב-JSON — בקשה גרועה אחת לא תפיל את השרת."],
    ["HandleLogin(message)", "ולידציה + אימות מול ה-DB (השוואת hash עם מלח). מחזירה את זהות המשתמש בהצלחה."],
    ["HandleRegister(message)", "ולידציה + יצירת חשבון (גיבוב עם מלח טרי, דחיית מייל כפול)."],
    ["HandleGetEmails / HandleAddEmail / HandleRemoveEmail", "ניהול הרשאות הצפייה של מחשב: שליפה, הוספה והסרה של מייל מורשה."],
    ["HandleGetSettings(message)", "מחזירה את תצורת הניטור (תדירות + כתובת יעד) — צד המשיכה של מנגנון הקונפיגורציה מרחוק."],
    ["HandleHardwareData(message)", "המטפל בהודעה הנפוצה ביותר: דה-סריאליזציה של תמונת החומרה והעברתה ל-ProcessHardwareData — ‏UPSERT, עדכון כוננים, בדיקת ספים והתראות."],
  ]),
  pageBreak(),

  h("מחלקה: Database", 3),
  he("**תפקיד:** שכבת הגישה לנתונים של השרת, כתובה ישירות מעל ADO.NET‏ (MySql.Data) לתפוקה מרבית בנתיב הקליטה החם. מרכזת את כל ה-SQL בשרת: מיגרציות סכמה, צינור ה-UPSERT של נתוני חומרה, אימות משתמשים, ניהול הרשאות מייל, בדיקת ספים ומנגנון התראות ה-SMTP עם ה-Cooldown. שדות מזהים מוצפנים במנוחה דרך DbCryptoHelper, וכל שאילתה משתמשת בפרמטרים — לעולם לא בשרשור מחרוזות — מה שחוסם SQL Injection בתכנון."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_connectionString (string)", "מחרוזת ההתחברות ל-MySQL."],
    ["_log (LogService)", "לוגים תפעוליים."],
    ["ADMIN_EMAIL (const)", "כתובת האדמין המובנית — תמיד מורשית ולעולם לא ניתנת להסרה."],
    ["SMTP_HOST/PORT/USER/PASS, FROM_EMAIL (const)", "תצורת שרת הדואר היוצא (Gmail עם App Password, STARTTLS על פורט 587)."],
    ["ALERT_COOLDOWN_MINUTES (const)", "מינימום דקות בין התראות לאותו מחשב (5)."],
    ["lastAlertTime (static Dictionary)", "חותמת ההתראה האחרונה לכל מחשב — מצב ה-Cooldown."],
    ["_crypto (DbCryptoHelper)", "מצפין/מפענח עמודות רגישות."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["GetConnection()", "פותחת חיבור MySQL חדש לכל פעולה ונשענת על Connection Pooling של ADO.NET ליעילות."],
    ["EnsureSchema()", "מיגרציות אידמפוטנטיות בעלייה: הרחבת עמודות טקסט (ציפר ארוך מהמקור) והוספת עמודות שנוספו אחרי הסכמה המקורית (send_interval_seconds, owner_user_id, server_address) — רק אם אינן קיימות."],
    ["InsertComputer(data)", "ה-UPSERT האטומי המרכזי: INSERT ... ON DUPLICATE KEY UPDATE לפי client_id. מחשב חדש מקבל שורה, מחשב מוכר מתעדכן — בלי בדיקת קיום נפרדת, כך ששני דיווחים מקבילים לא ייצרו כפילות. שדות מזהים מוצפנים לפני הכתיבה."],
    ["InsertDrives(clientId, drives)", "UPSERT לדוח הקיבולת של כל כונן לפי (client_id, drive_name)."],
    ["InsertAuthorizedEmails / InsertAlertEmails", "החלפה מלאה של רשימת המיילים (מחיקה ואז הכנסה) — הרשימה שנשלחה היא מקור האמת."],
    ["InsertThresholds(clientId, thresholds)", "UPSERT לספי ההתראה; null נשמר כ-NULL שמשמעותו \"אין סף\"."],
    ["CheckThresholdsAndNotify(data)", "משווה את מדדי התמונה לספים (מהתמונה או מה-DB): טמפרטורה, ניצולת מעבד, ניצולת זיכרון ושטח דיסק פנוי. כל חריגה מצטברת לרשימה שמועברת לצינור ההתראות."],
    ["SendEmailAlerts(data, alerts)", "אוכפת את ה-Cooldown: אם נשלחה התראה למחשב זה ב-5 הדקות האחרונות — לא נשלח כלום (הסוכן מדווח כל כמה שניות; בלי זה חריגה מתמשכת הייתה מציפה תיבות במאות כפילויות). אחרת שולחת מייל לכל נמען ומאתחלת את השעון."],
    ["SendEmail(to, subject, body)", "שליחת מייל בודד דרך Gmail SMTP. כשלים נרשמים ולא נזרקים — תקלת דואר לא תשבור קליטת נתונים."],
    ["LoginUser(email, password)", "שולפת hash+salt לפי המייל ומאמתת. הסיסמה הגלויה לעולם לא מושווית ישירות."],
    ["RegisterUser(fullName, email, password)", "דוחה מייל כפול, מגבבת עם מלח טרי ומכניסה את הרשומה. מחזירה את מזהה המשתמש החדש."],
    ["GetAuthorizedEmails / AddAuthorizedEmail / RemoveAuthorizedEmail", "ניהול הרשאות הצפייה. ההוספה אידמפוטנטית ומנרמלת את הכתובת; כתובת האדמין מוגנת מהסרה."],
    ["GetSettings(clientId)", "שולפת את תצורת הניטור של מחשב, עם ברירות מחדל כשאין שורה."],
    ["ProcessHardwareData(data)", "צינור הקליטה השלם לתמונה אחת: UPSERT מחשב → עדכון כוננים → הבטחת הרשאת אדמין ובעלים → בדיקת ספים והתראות. נקודת הכניסה היחידה שהמטפל קורא לכל דיווח."],
    ["GetAllUsers/Computers/Emails/Drives/Thresholds", "שאילתות ה-Admin UI. שדות רגישים מוחזרים ממוסכים (*) — האדמין רואה אילו מחשבים קיימים בלי הפרטים הרגישים שלהם (פרטיות בתכנון)."],
    ["DeleteUser / ResetPassword / DeleteComputer", "פעולות הניהול: מחיקת חשבון, איפוס סיסמה (hash+salt חדשים), ומחיקת מחשב כולל כל טבלאות הבת לשמירת שלמות הנתונים."],
  ]),
  pageBreak(),

  h("מחלקה: DbCryptoHelper", 3),
  he("**תפקיד:** הצפנת עמודות מסד הנתונים במנוחה (שמות מחשבים, כתובות IP/MAC, דגמי חומרה). מפתח ה-AES של הנתונים שמור בקונפיגורציה רק בצורה מוצפנת-RSA ונפתח עם המפתח הפרטי בעלייה — כך שמפתח הנתונים הגלוי לעולם לא מופיע בקובץ. נעשה שימוש מכוון ב-IV סטטי: זה הופך את ההצפנה לדטרמיניסטית, כך שאותו plaintext מניב תמיד אותו ciphertext — וחיפושי שוויון ב-SQL על עמודות מוצפנות ממשיכים לעבוד."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_aesKey (byte[])", "מפתח הנתונים הפתוח — חי בזיכרון בלבד."],
    ["_staticIV (byte[16])", "וקטור אתחול קבוע (אפסים) להצפנה דטרמיניסטית."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["(בנאי)(config)", "קורא מהקונפיגורציה את המפתח הפרטי ואת מפתח ה-AES המוצפן (EncryptionSettings) ומפענח את האחרון בראשון."],
    ["Encrypt(plainText)", "מצפינה ערך עמודה ב-AES-256-CBC ומחזירה Base64 לאחסון ב-VARCHAR. ריק/null עוברים כמו שהם."],
    ["Decrypt(cipherTextBase64)", "מפענחת חזרה. ערך שאינו ציפר תקין (שורה ישנה מלפני ההצפנה) מוחזר כמו שהוא במקום לקרוס — תאימות לאחור למיגרציה."],
  ]),
  spacer(),

  h("מחלקה: LogEntry", 3),
  he("**תפקיד:** רשומת לוג אחת: מתי, מה, ובאיזו חומרה."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["Timestamp (DateTime)", "מועד הכתיבה."],
    ["Message (string)", "טקסט ההודעה."],
    ["Level (string)", "רמת החומרה: INFO / SUCCESS / WARN / ERROR."],
  ]),
  spacer(),

  h("מחלקה: LogService", 3),
  he("**תפקיד:** הלוג המרכזי של השרת בזיכרון. בטוח לריבוי תהליכונים (מבוסס ConcurrentQueue — מטפלי לקוחות רבים כותבים במקביל), מוגבל ל-500 הרשומות האחרונות, וניתן לצפייה: אירוע OnNewLog הוא שמזין את שידור ה-SignalR החי ל-Admin UI."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_logs (ConcurrentQueue<LogEntry>)", "מאגר הלוג התחום (הישנות נזרקות ראשונות)."],
    ["MAX_LOGS (const = 500)", "תקרת הרשומות בזיכרון."],
    ["OnNewLog (event)", "מורם לכל רשומה חדשה; ה-SignalR Forwarder מנוי עליו."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["Log(message, level)", "מוסיפה רשומה, גוזמת את המאגר ל-500, ומפעילה את המנויים."],
    ["Info / Success / Warn / Error (message)", "קיצורים לכל רמת חומרה (SUCCESS ירוק, ERROR אדום ב-Admin UI)."],
    ["GetRecentLogs(count)", "מחזירה את הרשומות האחרונות — משמשת למילוי-לאחור של תצוגת הלוג כשדפדפן מתחבר."],
  ]),
  spacer(),

  h("מחלקה: LogHub : Hub (SignalR)", 3),
  he("**תפקיד:** ה-Hub שמאחורי תצוגת הלוגים החיה (ממופה ב-/logHub). הרשומות החיות נדחפות על-ידי TcpServerService דרך ה-HubContext; המחלקה עצמה מטפלת ברגע ההתחברות — שידור ההיסטוריה כדי שדפדפן שנפתח לא יהיה ריק."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_logService (LogService)", "שירות הלוג עם מאגר הרשומות האחרונות."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["OnConnectedAsync()", "בעת התחברות דפדפן — משדרת לאותו מתקשר בלבד את היסטוריית הלוג (הודעות ReceiveLog), ומשלימה את החיבור. מכאן והלאה הוא מקבל רשומות חדשות בשידור חי."],
  ]),
  pageBreak(),

  h("מחלקה: ApiController (שרת, REST)", 3),
  he("**תפקיד:** ה-REST API שמאחורי ה-Admin UI (נתיבים תחת ‎/api). חושף נקודות קריאה לכל ישות (לוגים, משתמשים, מחשבים, מיילים, כוננים, ספים) ואת פעולות הניהול: מחיקת משתמשים ומחשבים, איפוס סיסמאות והסרת הרשאות מייל. כל נקודה מחזירה מעטפת JSON אחידה עם דגל הצלחה, ופעולות הרסניות נרשמות ללוג התפעולי."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_db (Database)", "שכבת הנתונים המשותפת."],
    ["_log (LogService)", "שירות הלוג המשותף."],
  ]),
  he("**מתודות (נקודות קצה):**"),
  tbl2col("נקודת קצה", "תיאור", [
    ["GET /api/logs", "הרשומות האחרונות לתצוגת הלוג (טעינה ראשונית/גיבוי לצד SignalR)."],
    ["GET /api/users", "כל המשתמשים הרשומים למסך ניהול המשתמשים."],
    ["DELETE /api/users/{id}", "מחיקת חשבון לצמיתות; נרשם כ-Warn לצורכי ביקורת."],
    ["POST /api/users/reset-password", "איפוס סיסמה למשתמש (זרימת השחזור של האדמין); hash+salt חדשים."],
    ["GET /api/computers", "כל המחשבים המנוטרים (שדות רגישים ממוסכים)."],
    ["DELETE /api/computers/{clientId}", "הסרת מחשב שיצא משימוש כולל כל רשומות הבת."],
    ["GET /api/emails", "כל זוגות (מחשב, מייל מורשה) למסך ההרשאות."],
    ["DELETE /api/emails", "הסרת הרשאת מייל אחת (כתובת האדמין מוגנת)."],
    ["GET /api/drives ‏/ GET /api/thresholds", "רשימות הכוננים והספים (ערכים ממוסכים)."],
  ]),
  spacer(),

  h("מחלקה: ResetPasswordRequest", 3),
  he("**תפקיד:** גוף הבקשה של POST ‎/api/users/reset-password."),
  tbl2col("שדה", "תיאור", [
    ["UserId (int)", "מזהה המשתמש שסיסמתו מאופסת."],
    ["NewPassword (string)", "הסיסמה החדשה (מגובבת לפני אחסון)."],
  ]),
  spacer(),

  h("מחלקה: HomeController (שרת)", 3),
  he("**תפקיד:** מגישה את דפי ה-Admin UI: הדף הראשי (שהנתונים החיים בו מגיעים בצד הלקוח דרך SignalR ונקודות ה-API), דף הפרטיות ודף השגיאה."),
  tbl2col("מתודה", "תיאור", [
    ["Index()", "הדף הראשי — לוגים חיים וטבלאות ניהול."],
    ["Privacy()", "דף מידע על פרטיות."],
    ["Error()", "דף שגיאה הנושא את מזהה הבקשה לצורכי אבחון; ה-Cache מנוטרל כדי ששגיאות לא יוגשו מיושנות."],
  ]),
  spacer(),

  h("מחלקות: HardwareData / DriveData / ThresholdData (שרת)", 3),
  he("**תפקיד:** המראה השרתית של תמונת החומרה — ה-DTO שאליו מפוענחת הודעת hardware_data. שמות ה-JsonProperty זהים אחד-לאחד לאלה של הלקוח, וזה מה ששומר על תאימות החוט בין שני הצדדים. השדות זהים לגרסת הלקוח (ראו 3.1.2), בתוספת היותם הקלט הישיר לצינור הקליטה: ClientId הוא מפתח ה-UPSERT, ‏OwnerEmail מקבל אוטומטית הרשאת צפייה, ו-Thresholds משמשים לבדיקת החריגות."),
  spacer(),

  h("מחלקה: PasswordHasher (שרת)", 3),
  he("**תפקיד:** גיבוב סיסמאות ב-HMAC-SHA512 עם מלח ייחודי לכל משתמש. סיסמאות לעולם לא נשמרות ולא מושוות גלויות: ההרשמה שומרת (hash, salt) וההתחברות מחשבת מחדש את הגיבוב מהסיסמה שסופקה ומהמלח השמור. המלח הייחודי מסכל מתקפות Rainbow Table — סיסמאות זהות מניבות גיבובים שונים למשתמשים שונים."),
  tbl2col("מתודה", "תיאור", [
    ["CreatePasswordHash(password, out hash, out salt)", "מייצרת מפתח אקראי טרי (128 בתים) המשמש כמלח ומחשבת את ה-HMAC-SHA512 של הסיסמה תחתיו."],
    ["VerifyPassword(password, storedHash, storedSalt)", "מחשבת מחדש את הגיבוב תחת המלח השמור ומשווה לגיבוב השמור. מחזירה bool."],
  ]),
  spacer(),

  h("מחלקה: ErrorViewModel (שרת)", 3),
  he("**תפקיד:** מודל התצוגה של דף השגיאה — נושא את מזהה הבקשה שנכשלה כדי שדיווח משתמש יוכל להיות מוצלב מול לוגי השרת. שדות: RequestId‏ (string?), ‏ShowRequestId‏ (bool מחושב)."),
  pageBreak()
);

// ---------- 3.1.4 Web App classes ----------
push(
  h("3.1.4 מחלקות צד אפליקציית הרשת (Traxonet Web App)", 2),

  h("Program (top-level statements)", 3),
  he("**תפקיד:** נקודת הכניסה של לוח הבקרה. מגדירה את צינור ה-ASP.NET Core המלא: MVC, ‏DbContext של EF Core מעל MySQL‏ (Pomelo), סשן של 30 דקות, ואימות מבוסס עוגיות שהעוגייה שלו תחומה לסשן (MaxAge = null) — סגירת הדפדפן מנתקת. מוודאת שהמסד והטבלאות קיימים (EnsureCreated) לפני הגשת בקשות, והאתר נפתח על דף ההתחברות."),
  spacer(),

  h("מחלקה: ApplicationDbContext : DbContext", 3),
  he("**תפקיד:** שער ה-ORM של אפליקציית ה-Web לאותו מסד נתונים שהשרת כותב אליו. חושפת DbSet לכל טבלה, וב-OnModelCreating מצמידה את ה-EncryptionConverter לכל עמודה רגישה של Computer — מה שהופך את ההצפנה במנוחה לשקופה לחלוטין: ה-Controllers קוראים וכותבים plaintext, וציפר הוא מה שמגיע בפועל למסד."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_config (IConfiguration)", "הקונפיגורציה — מועברת לממיר ההצפנה עבור המפתחות."],
    ["Users / Computers / AuthorizedEmails / Drives / Thresholds / AlertEmails / ComputerPermissions (DbSet)", "שבעת ה-DbSets — אחד לכל טבלה במסד."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["OnModelCreating(modelBuilder)", "מחברת את EncryptionConverter לשבע התכונות הרגישות של Computer (שם מחשב, מעבד, כרטיס מסך, IP, ‏MAC, לוח אם, דרייבר). הממיר ותצורת המפתח חייבים להיות זהים ל-DbCryptoHelper של השרת — שני התהליכים חולקים את אותן טבלאות."],
  ]),
  spacer(),

  h("מחלקה: EncryptionConverter : ValueConverter<string, string>", 3),
  he("**תפקיד:** מימוש ההצפנה השקופה ברמת ה-ORM (אלגוריתם 9 בפרק האלגוריתמים): כל ערך שנכתב לעמודה ממירה מוצפן ביציאה ומפוענח בכניסה — אפס שינויים בקוד ה-Controllers. מפתח ה-AES נפתח פעם אחת (static) מצורתו המוצפנת-RSA בקונפיגורציה — אותה סכמת מפתחות כמו בשרת. ה-IV הסטטי שומר על דטרמיניסטיות כדי ששאילתות שוויון ימשיכו לעבוד."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_aesKey (static byte[])", "מפתח הנתונים הפתוח, משותף לכל מופעי הממיר."],
    ["_staticIV (static byte[16])", "וקטור אתחול קבוע להצפנה דטרמיניסטית."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["(בנאי)(config)", "מגדיר model→provider = Encrypt ו-provider→model = Decrypt, ובבנייה הראשונה פותח את מפתח ה-AES מהקונפיגורציה. בהיעדר מפתחות — הממיר מתנוון למעבר ישיר (סביבת פיתוח לא מוגדרת נשארת שמישה)."],
    ["Encrypt(plainText) (static)", "מצפינה ערך תכונה ומחזירה Base64 לאחסון."],
    ["Decrypt(cipherTextBase64) (static)", "מפענחת חזרה; ערכים שאינם ציפר תקין (שורות ישנות) מוחזרים כמו שהם."],
  ]),
  spacer(),

  h("מחלקה: PasswordHasher (Web)", 3),
  he("**תפקיד:** זהה אלגוריתמית ל-PasswordHasher של שרת ה-TCP‏ (HMAC-SHA512 עם מלח לכל משתמש) — ולכן חשבון שנרשם דרך אפליקציה אחת יכול להתחבר דרך השנייה. המתודות: CreatePasswordHash ו-VerifyPassword, כמתואר ב-3.1.3."),
  pageBreak(),

  h("מחלקות הישויות (Entity Models)", 3),
  he("שבע מחלקות ישות ממופות לטבלאות המסד באמצעות Attributes‏ ([Table], ‏[Key], ‏[Column]). אלו מחלקות POCO ללא מתודות — הערך שלהן הוא המיפוי המדויק והאילוצים ברמת המסד:"),
  spacer(),
  he("**Computer — טבלת computers:**"),
  tbl2col("שדה", "תיאור", [
    ["ClientId (PK)", "המזהה הקבוע של המחשב — המפתח הראשי."],
    ["MachineName, Motherboard, Cpu, Gpu, GpuDriver, IpAddress, MacAddress", "שדות הזיהוי — כולם מוצפנים במנוחה דרך הממיר."],
    ["CpuCores, LogicalProcessors, CpuTemp, CpuUsage, TotalRam, FreeRam, RamUsage", "המדדים המספריים מהדיווח האחרון."],
    ["TimeSent (DateTime)", "מועד הדיווח האחרון — ממנו נגזר סטטוס מקוון/לא-מקוון (סף 5 דקות)."],
    ["OwnerUserId (int?)", "מזהה הבעלים — זהות נעילת הבעלים; null בשורות ישנות."],
  ]),
  spacer(),
  he("**User — טבלת המשתמשים:** Id‏ (PK), ‏FullName, ‏Email (ייחודי), ‏PasswordHash + PasswordSalt (חומר הגיבוב בלבד — לעולם לא סיסמה גלויה), CreatedAt."),
  he("**Threshold — טבלת thresholds:** ‏ClientId‏ (PK), ארבעת הספים (nullable — ‏null = אין סף), SendIntervalSeconds (ברירת מחדל 10) ו-ServerAddress — שתי ההגדרות שהסוכן מושך ב-get_settings."),
  he("**AuthorizedEmail — טבלת emails:** מפתח ראשי מורכב (ClientId, Email) — כפילות הרשאה בלתי אפשרית ברמת המסד."),
  he("**AlertEmail — טבלת alert_emails:** אותו מבנה עם מפתח מורכב — מנוי של כתובת על התראות מחשב."),
  he("**Drive — טבלת drives:** ‏Id רץ (PK), ‏ClientId, ‏DriveName, ‏TotalSize, ‏FreeSpace — דוח הקיבולת האחרון של כל כונן."),
  he("**ComputerPermission — טבלת computer_permissions:** הענקת גישה מפורשת של משתמש למחשב, כולל מי העניק (GrantedByUserId) ומתי (GrantedAt) — שובל ביקורת. אינדקס ייחודי על (ClientId, UserId) מונע הענקות כפולות. זהו אחד משלושת מקורות ההרשאה של אלגוריתם 10."),
  spacer(),
  he("**ErrorViewModel:** מודל דף השגיאה (RequestId + ShowRequestId), זהה למקבילה בשרת."),
  pageBreak(),

  h("מחלקה: AccountController : Controller", 3),
  he("**תפקיד:** האימות של לוח הבקרה: הרשמה, התחברות מבוססת עוגייה והתנתקות. בהתחברות מוצלחת נחתם ClaimsPrincipal הנושא את מזהה המשתמש, שמו והמייל שלו לסכמת Cookies — ה-Claims האלה הם מה שכל Controller אחר קורא כדי לדעת מי גולש."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_context (ApplicationDbContext)", "הקשר המסד של EF Core."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["Login() [GET]", "מציגה את דף ההתחברות/הרשמה המשולב. מבקר מאומת מנותב ישר ל-Welcome; הודעה מ-TempData (כמו \"הרשמה הצליחה\") מוצגת."],
    ["Register(fullName, email, password, confirmPassword) [POST]", "יוצרת חשבון: ולידציית שדות, התאמת סיסמאות, דחיית מייל תפוס, אחסון עם hash+salt טריים, וחזרה לדף ההתחברות עם הודעת הצלחה."],
    ["Login(email, password) [POST]", "מאמתת מול הגיבוב השמור. אותה הודעת שגיאה גנרית מוחזרת למייל לא קיים ולסיסמה שגויה — מניעת מניית חשבונות (Account Enumeration). בהצלחה — חתימת ה-Claims לעוגייה וניתוב ל-Welcome."],
    ["Logout() [POST]", "מנתקת מסכמת העוגיות וחוזרת לדף ההתחברות."],
  ]),
  spacer(),

  h("מחלקה: HomeController (Web) : Controller", 3),
  he("**תפקיד:** דפי הנחיתה של לוח הבקרה, למשתמשים מאומתים בלבד ([Authorize] ברמת המחלקה)."),
  tbl2col("מתודה", "תיאור", [
    ["Index()", "דף הבית הבסיסי."],
    ["Welcome()", "דף קבלת הפנים שאחרי ההתחברות — הסבר על המערכת וקישורים ללוח הבקרה ולהורדת הסוכן."],
    ["GoToDashboard()", "מסמנת בסשן שהמשתמש עבר דרך Welcome (לוח הבקרה בודק את הדגל) ומנתבת פנימה."],
    ["DownloadClient()", "מגישה את חבילת הסוכן (wwwroot/downloads/TraxonetClient.zip) כהורדת קובץ, או 404 עם הנחיה כשהחבילה חסרה."],
  ]),
  spacer(),

  h("מחלקה: DashboardController : Controller", 3),
  he("**תפקיד:** לב לוח הבקרה (מאומתים בלבד). מרנדרת את תצוגת הניטור, מגישה את נקודות ה-JSON שהדף סוקר (poll) לעדכונים חיים, מנהלת הגדרות ונמעני התראות לכל מחשב — וממשת את אלגוריתם ההרשאה משלושה מקורות שקובע בדיוק אילו מחשבים המשתמש הנוכחי רשאי לראות."),
  he("**שדות ותכונות:**"),
  tbl2col("שדה", "תיאור", [
    ["_db (ApplicationDbContext)", "הקשר המסד של EF Core."],
  ]),
  he("**מתודות:**"),
  tbl2col("מתודה", "תיאור", [
    ["Index(clientId) [GET]", "דף הניטור הראשי. מי שלא עבר דרך Welcome מנותב לשם (דגל סשן). התצוגה מקבלת את המכשירים המורשים, עם המחשב המבוקש (או הראשון) נבחר."],
    ["GetDevices() [GET]", "נקודת ה-polling שמאחורי הדשבורד החי: המכשירים המורשים עם המדדים העדכניים כ-JSON. הדף קורא לה כל כמה שניות לרענון הגרפים בלי טעינת עמוד."],
    ["GetDeviceSettings(clientId) [GET]", "תצורת מחשב אחד לפאנל ההגדרות: ספים (שטח פנוי מומר מבתים ל-GB לתצוגה), תדירות, כתובת שרת ונמעני ההתראות."],
    ["SaveSettings(request) [POST]", "שמירת ספים והגדרות סוכן (UPSERT — יוצרת שורה אם חסרה). GB נשמר כבתים; ערכים לא תקינים נופלים לברירות מחדל. הסוכן קולט את השינוי בסנכרון get_settings הבא — זרימת הקונפיגורציה מרחוק."],
    ["AddAlertEmail(request) [POST]", "מנוי כתובת על התראות מחשב; אידמפוטנטית."],
    ["RemoveAlertEmail(request) [POST]", "ביטול מנוי; כתובת המערכת המובנית מוגנת מהסרה."],
    ["RemoveMyAccess(clientId) [POST]", "המשתמש מסיר את הגישה של עצמו: מחיקת הרשאת המייל, איפוס הבעלות (אם הוא הבעלים) ומחיקת שורת ההרשאה המפורשת — שלושת מקורות ההרשאה בבת אחת, והמחשב נעלם מהדשבורד שלו."],
    ["GetAuthorizedDevices() (private)", "אלגוריתם ההרשאה משלושה מקורות: משתמש רואה מחשב אם (1) המייל שלו ברשימת המורשים, או (2) יש לו ComputerPermission מפורשת, או (3) הוא הבעלים. שלוש הקבוצות מאוחדות ומסוננות מכפילויות; האדמין רואה הכול. כל מחשב מורשה מוקרן ל-ViewModel (הפענוח קורה שקוף דרך הממיר), סטטוס מקוון נגזר מדיווח בן פחות מ-5 דקות, והכוננים מוצמדים."],
  ]),
  spacer(),

  h("מחלקות הבקשות של ה-Dashboard", 3),
  tbl2col("מחלקה", "תיאור", [
    ["SaveSettingsRequest", "גוף SaveSettings: ‏ClientId, ארבעת הספים (nullable), MinFreeSpaceGB (ב-GB), ‏SendIntervalSeconds, ‏ServerAddress."],
    ["AlertEmailRequest", "גוף נקודות ההתראות: זוג (ClientId, Email) למנוי או ביטול."],
    ["RemoveAccessRequest", "גוף קריאת הסרת גישה: ClientId בלבד."],
  ]),
  spacer(),

  h("מחלקה: ApiController (Web) : ControllerBase", 3),
  he("**תפקיד:** ה-REST API של אפליקציית ה-Web (נתיבים תחת ‎/api) — ממשק JSON לאותן פעולות שהאתר מציע. בנוי על ControllerBase עם [ApiController], כך ששגיאות Model Binding מטופלות אוטומטית."),
  tbl2col("נקודת קצה", "תיאור", [
    ["POST /api/login", "אימות לפי מייל וסיסמה; אותה שגיאה גנרית לשני סוגי הכשל (מניעת מניית חשבונות). 200/400/401."],
    ["POST /api/register", "יצירת חשבון; מייל תפוס מוחזר כ-409 Conflict."],
    ["GET /api/users", "כל המשתמשים (לעולם ללא חומר סיסמאות)."],
    ["GET /api/emails/{clientId}", "המיילים המורשים של מחשב."],
    ["POST /api/emails/{clientId}", "הרשאת מייל (אידמפוטנטית, מנרמלת את הכתובת)."],
    ["DELETE /api/emails/{clientId}", "הסרת הרשאה; 404 כשאינה קיימת."],
    ["GET /api/settings/{clientId}", "ספים ותדירות של מחשב עם ברירות מחדל."],
  ]),
  he("**מחלקות עזר:** ‏LoginRequest, ‏RegisterRequest (גופי הבקשות), UserResponse (זהות ציבורית: Id, ‏FullName, ‏Email), ‏EmailRequest, ‏SettingsResponse (ארבעת הספים + תדירות)."),
  spacer(),

  h("מחלקות ה-ViewModels", 3),
  he("**תפקיד:** ההקרנות מוכנות-התצוגה שה-Views מקבלים — נתונים מפוענחים, שדות מחושבים, ואפס לוגיקת גישה לנתונים."),
  tbl2col("מחלקה", "תיאור", [
    ["DriveViewModel", "כונן בתצוגה: שם, קיבולת, פנוי — ו-UsagePercent מחושב שמניע את פס ההתקדמות."],
    ["DashboardDeviceViewModel", "מחשב בתצוגה: כל המדדים בשטוח, IsOnline נגזר (דיווח בן פחות מ-5 דקות), LastSeen, ורשימת DriveViewModel."],
    ["DashboardViewModel", "השורש של דף הדשבורד: Devices (המכשירים המורשים) + SelectedClientId."],
  ]),
  spacer(),

  h("תוכנית עזר: gen_keys (קובץ שורש)", 3),
  he("**תפקיד:** סקריפט חד-פעמי (top-level statements) שמייצר את חומר המפתחות להצפנה במנוחה: זוג RSA-2048 חדש (מפתח-העל) ומפתח AES-256 אקראי שמיוצא אך ורק בצורה מוצפנת-RSA. הפלט, keys.json, מכיל את בלוק EncryptionSettings שמועתק ל-appsettings.json של שרת ה-TCP ושל אפליקציית ה-Web — כך ששני התהליכים פותחים את אותו מפתח נתונים בדיוק. מפתח ה-AES הגלוי לעולם לא נוגע בדיסק."),
  pageBreak()
);

// 3.2 Part B: Code snippets
push(
  h("3.2 חלק ב' — קטעי קוד מרכזיים", 1),
  he("בפרק זה אציג קטעי קוד של היכולות המרכזיות שדנו בהן בפרק האפיון, יחד עם הסבר על כל קטע."),
  spacer(),
  h("קטע 1: ה-handshake הקריפטוגרפי (Sender.SendAsync)", 2),
  he("**הסבר:** זה הקטע שמבצע את כל ה-handshake בצד הלקוח — מקבל RSA public key, יוצר AES key+IV, שולח אותם מוצפנים, ואז שולח את ה-payload."),
  code(`public static async Task SendAsync(HardwareData data, string host, int port)
{
    // שלב 1: סריאליזציה של הנתונים ל-JSON
    string json = JsonConvert.SerializeObject(data);

    // שלב 2: פתיחת חיבור TCP
    using var client = new TcpClient();
    await client.ConnectAsync(host, port);
    using NetworkStream stream = client.GetStream();

    // שלב 3: קבלת המפתח הציבורי של RSA מהשרת
    byte[] rsaPublicKey = await CryptoHelper.ReadLengthPrefixedAsync(stream);

    // שלב 4: יצירת מפתח AES + IV אקראיים
    byte[] aesKey = CryptoHelper.GenerateAesKey();
    byte[] aesIV = CryptoHelper.GenerateAesIV();

    // שלב 5: יצירת bundle של 48 בייט (32 key + 16 IV)
    byte[] keyBundle = new byte[48];
    Buffer.BlockCopy(aesKey, 0, keyBundle, 0, 32);
    Buffer.BlockCopy(aesIV, 0, keyBundle, 32, 16);

    // שלב 6: הצפנת ה-bundle עם RSA ושליחה
    byte[] encryptedKeyBundle = CryptoHelper.RsaEncrypt(keyBundle, rsaPublicKey);
    await CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedKeyBundle);

    // שלב 7: הצפנת ה-JSON עם AES ושליחה
    byte[] encryptedData = CryptoHelper.AesEncrypt(json, aesKey, aesIV);
    await CryptoHelper.WriteLengthPrefixedAsync(stream, encryptedData);

    // שלב 8: קריאת תגובה (לא משתמשים בה)
    byte[] encryptedResponse = await CryptoHelper.ReadLengthPrefixedAsync(stream);
}`),
  spacer(),

  h("קטע 2: Length-prefixed framing (CryptoHelper)", 2),
  he("**הסבר:** הפונקציה שקוראת הודעה באורך משתנה מ-TCP. מטפלת ב-partial reads ובendianness."),
  code(`public static async Task<byte[]> ReadLengthPrefixedAsync(NetworkStream stream)
{
    // קריאת 4 בייט אורך
    byte[] lengthBytes = new byte[4];
    int totalRead = 0;
    while (totalRead < 4)
    {
        int read = await stream.ReadAsync(lengthBytes, totalRead, 4 - totalRead);
        if (read == 0) throw new IOException("Connection closed while reading length prefix.");
        totalRead += read;
    }

    // המרה מ-big-endian (network byte order)
    if (BitConverter.IsLittleEndian)
        Array.Reverse(lengthBytes);
    int length = BitConverter.ToInt32(lengthBytes, 0);

    // בדיקת שפיות — לא יותר מ-10MB
    if (length <= 0 || length > 10 * 1024 * 1024)
        throw new IOException($"Invalid message length: {length}");

    // קריאת הנתונים עצמם בלולאה
    byte[] data = new byte[length];
    totalRead = 0;
    while (totalRead < length)
    {
        int read = await stream.ReadAsync(data, totalRead, length - totalRead);
        if (read == 0) throw new IOException("Connection closed while reading data.");
        totalRead += read;
    }

    return data;
}`),
  spacer(),

  h("קטע 3: HMAC Password hashing (PasswordHasher)", 2),
  he("**הסבר:** יצירת hash עם salt אקראי. שימוש ב-HMACSHA512 שמייצר key אקראי אוטומטית."),
  code(`public static void CreatePasswordHash(string password, out byte[] hash, out byte[] salt)
{
    using var hmac = new HMACSHA512();
    salt = hmac.Key;  // 128 בייט אקראיים
    hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));  // 64 בייט
}

public static bool VerifyPassword(string password, byte[] storedHash, byte[] storedSalt)
{
    using var hmac = new HMACSHA512(storedSalt);
    var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    return computedHash.SequenceEqual(storedHash);
}`),
  spacer(),

  h("קטע 4: Reentrancy guard ב-SendTimer_Tick", 2),
  he("**הסבר:** מונע שני ticks יחפפו אם השליחה הקודמת עוד לא הסתיימה."),
  code(`private async void SendTimer_Tick(object? sender, EventArgs e)
{
    if (_isSending) return;  // guard
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
        _isSending = false;  // תמיד משחרר
    }
}`),
  spacer(),

  h("קטע 5: WMI איסוף נתוני CPU (DataCollector)", 2),
  he("**הסבר:** שאילתת WMI נוסח SQL לקבלת מידע על המעבד."),
  code(`try
{
    using var searcher = new ManagementObjectSearcher("select * from Win32_Processor");
    foreach (ManagementObject obj in searcher.Get())
    {
        data.CpuCores = Convert.ToInt32(obj["NumberOfCores"]);
        data.LogicalProcessors = Convert.ToInt32(obj["NumberOfLogicalProcessors"]);
        data.Cpu = obj["Name"]?.ToString();
    }
}
catch { /* WMI not available — leave defaults */ }`),
  spacer(),

  h("קטע 6: UPSERT עם הצפנה (Database.InsertComputer)", 2),
  he("**הסבר:** SQL של MySQL ל-INSERT-or-UPDATE עם הצפנת 7 שדות לפני ההכנסה."),
  code(`string query = @"
INSERT INTO computers (
    client_id, machine_name, motherboard, cpu, gpu, ...
) VALUES (
    @clientId, @machineName, @motherboard, @cpu, @gpu, ...
)
ON DUPLICATE KEY UPDATE
    machine_name = VALUES(machine_name),
    motherboard = VALUES(motherboard),
    cpu = VALUES(cpu),
    gpu = VALUES(gpu), ...";

using var conn = GetConnection();
using var cmd = new MySqlCommand(query, conn);
cmd.Parameters.AddWithValue("@clientId", data.ClientId);
cmd.Parameters.AddWithValue("@machineName", _crypto.Encrypt(data.MachineName));  // הצפנה!
cmd.Parameters.AddWithValue("@motherboard", _crypto.Encrypt(data.Motherboard));
cmd.Parameters.AddWithValue("@cpu", _crypto.Encrypt(data.Cpu));
cmd.Parameters.AddWithValue("@gpu", _crypto.Encrypt(data.Gpu));
// ... שאר הפרמטרים
cmd.ExecuteNonQuery();`),
  spacer(),

  h("קטע 7: בדיקת ספים + cooldown (Database)", 2),
  he("**הסבר:** השוואת הנתונים עם הספים השמורים והפעלת התראה אם חורגים, עם cooldown של 5 דקות."),
  code(`private void SendEmailAlerts(HardwareData data, List<string> alerts)
{
    // בדיקת cooldown
    if (lastAlertTime.ContainsKey(data.ClientId))
    {
        var timeSince = DateTime.Now - lastAlertTime[data.ClientId];
        if (timeSince.TotalMinutes < 5)
        {
            _log.Info("Alert cooldown active");
            return;
        }
    }

    // טעינת רשימת נמענים
    List<string> alertEmails = data.AlertEmails ?? new List<string>();
    if (alertEmails.Count == 0)
    {
        using var conn = GetConnection();
        string query = "SELECT email FROM alert_emails WHERE client_id = @clientId";
        using var cmd = new MySqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@clientId", data.ClientId);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
            alertEmails.Add(reader.GetString("email"));
    }
    if (alertEmails.Count == 0) return;

    // עדכון cooldown לפני שליחה
    lastAlertTime[data.ClientId] = DateTime.Now;

    // בניית ושליחת המייל
    string subject = $"TRAXONET: {data.MachineName}";
    string body = string.Join(" | ", alerts);
    foreach (var email in alertEmails)
        SendEmail(email, subject, body);
}`),
  spacer(),

  h("קטע 8: SignalR forwarding ב-TcpServerService", 2),
  he("**הסבר:** הצמדת LogService לSignalR — כל לוג חדש משודר אוטומטית לדפדפנים מחוברים."),
  code(`public TcpServerService(Database db, LogService logService, IHubContext<LogHub> hubContext)
{
    _db = db;
    _log = logService;
    _hubContext = hubContext;
    _crypto = new CryptoHelper();

    // הצמדת LogService → SignalR
    _log.OnNewLog += async (entry) =>
    {
        try
        {
            await _hubContext.Clients.All.SendAsync("ReceiveLog", new
            {
                timestamp = entry.Timestamp.ToString("HH:mm:ss"),
                message = entry.Message,
                level = entry.Level
            });
        }
        catch { /* silent — לוג יישמר גם בלי broadcast */ }
    };
}`),
  spacer(),

  h("קטע 9: EncryptionConverter (EF Core transparent encryption)", 2),
  he("**הסבר:** מצרף הצפנה לשדה ב-EF Core — כל קריאה/כתיבה עובדת אוטומטית."),
  code(`public class EncryptionConverter : ValueConverter<string, string>
{
    private static byte[] _aesKey;
    private static readonly byte[] _staticIV = new byte[16];  // zeros

    public EncryptionConverter(IConfiguration config)
        : base(v => Encrypt(v), v => Decrypt(v))
    {
        if (_aesKey == null)
        {
            var rsaPriv = config["EncryptionSettings:RsaPrivateKey"];
            var aesEnc = config["EncryptionSettings:EncryptedAesKey"];

            using var rsa = RSA.Create(2048);
            rsa.ImportPkcs8PrivateKey(Convert.FromBase64String(rsaPriv), out _);
            _aesKey = rsa.Decrypt(Convert.FromBase64String(aesEnc), RSAEncryptionPadding.OaepSHA256);
        }
    }

    private static string Encrypt(string plain) { /* AES-CBC + Base64 */ }
    private static string Decrypt(string base64) { /* try/catch for backward compat */ }
}`),
  spacer(),

  h("קטע 10: 3-source authorization (DashboardController)", 2),
  he("**הסבר:** איחוד של 3 מקורות הרשאה לראיית מחשבים."),
  code(`var userEmail = User.FindFirst(ClaimTypes.Email)?.Value?.ToLower()?.Trim();
var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
int.TryParse(userIdStr, out int userId);

// מקור 1: emails table
var emailAuthorizedIds = _db.AuthorizedEmails
    .Where(e => e.Email.ToLower() == userEmail)
    .Select(e => e.ClientId).ToList();

// מקור 2: permissions table
var permissionAuthorizedIds = _db.ComputerPermissions
    .Where(p => p.UserId == userId)
    .Select(p => p.ClientId).ToList();

// מקור 3: owner
var ownedIds = _db.Computers
    .Where(c => c.OwnerUserId == userId)
    .Select(c => c.ClientId).ToList();

// איחוד עם distinct
var authorizedClientIds = emailAuthorizedIds
    .Union(permissionAuthorizedIds)
    .Union(ownedIds)
    .Distinct().ToList();`),
  pageBreak()
);

// 3.3 Part C: Test results
push(
  h("3.3 חלק ג' — מסמך בדיקות", 1),
  he("פרק זה מציג את כל הבדיקות שבוצעו במערכת — אלה שתוכננו בפרק האפיון + בדיקות נוספות שעלו במהלך הפיתוח."),
  spacer(),
  h("3.3.1 בדיקות מתוכננות (מפרק 1.8.3)", 2),

  h("בדיקה 1: הרשמה תקינה", 3),
  he("**מטרת הבדיקה:** וידוא שמשתמש חדש יכול להירשם."),
  he("**מה בוצע בפועל:** נרשמתי עם FullName='Test User', Email='test1@example.com', Password='Pass123'."),
  he("**תוצאה:** הופיעה הודעה ירוקה \"Account created!\". ב-DB טבלת users התווסף שורה חדשה עם hash+salt."),
  he("**בעיות שהתגלו:** אין."),
  spacer(),

  h("בדיקה 2: התחברות תקינה", 3),
  he("**מטרת הבדיקה:** וידוא שמשתמש קיים נכנס בהצלחה."),
  he("**מה בוצע:** התחברתי עם credentials של המשתמש שיצרתי בבדיקה 1."),
  he("**תוצאה:** ה-LoginForm נסגר ו-MainForm נפתח. בתוך 10 שניות הופיעו נתוני המחשב."),
  he("**בעיות:** בפעם הראשונה לא הופיעו נתונים. הסתבר שהיה צריך 1 שנייה ל-PerformanceCounter."),
  spacer(),

  h("בדיקה 3: סיסמה שגויה", 3),
  he("**מטרת הבדיקה:** וידוא טיפול בקלט שגוי."),
  he("**מה בוצע:** ניסיתי להתחבר עם אימייל קיים אבל סיסמה 'wrong'."),
  he("**תוצאה:** הופיעה הודעה אדומה \"Invalid email or password\". לא נכנסתי."),
  he("**בעיות:** אין."),
  spacer(),

  h("בדיקה 4: Owner Lock", 3),
  he("**מטרת הבדיקה:** מנגנון מונע משתמש שני באותו מחשב."),
  he("**מה בוצע:** התחברתי עם user1 → logout → ניסיתי להיכנס עם user2."),
  he("**תוצאה:** הופיעה הודעה \"This PC is locked to another account\"."),
  he("**בעיות:** היה צורך לוודא שה-OwnerId נשמר נכון ב-Registry. בדקתי עם regedit — נשמר ב-HKCU\\SOFTWARE\\Traxonet\\OwnerId."),
  spacer(),

  h("בדיקה 5: איסוף נתוני חומרה", 3),
  he("**מטרת הבדיקה:** השוואת נתונים מול Task Manager."),
  he("**מה בוצע:** פתחתי Task Manager וה-Client במקביל."),
  he("**תוצאה:** CPU usage תאם (±2%), RAM total תאם בדיוק (32GB), drives תאמו לShell של Windows."),
  he("**בעיות:** טמפרטורת CPU הראתה -1 (לא זמין במחשב). הוספתי הסבר."),
  spacer(),

  h("בדיקה 6: שליחה לשרת", 3),
  he("**מטרת:** וידוא שהנתונים מגיעים לDB."),
  he("**מה בוצע:** הפעלתי TCP Server, פתחתי Admin UI, הפעלתי Client."),
  he("**תוצאה:** בלוג השרת הופיע \"[Encrypted] Request: hardware_data\". במשך 30 שניות הופיעו 3 שליחות. ב-DB טבלת computers הופיעה רשומה."),
  he("**בעיות:** הפעם הראשונה — קיבלתי שגיאת decrypt בשרת. הסתבר שהיו מפתחות שונים בappsettings.json של שני הפרויקטים. תוקן."),
  spacer(),

  h("בדיקה 7: הצגת Dashboard", 3),
  he("**מטרת:** הצגת מחשבים בDashboard."),
  he("**מה בוצע:** התחברתי ב-Web App עם אותם credentials של ה-Client. ניווט ל-Dashboard."),
  he("**תוצאה:** המחשב הופיע ב-sidebar. הגרפים הציגו נתונים אחרונים."),
  he("**בעיות:** התחילו לא להופיע נתונים. הסתבר שצריך לעבור ב-Welcome (Session[\"PassedWelcome\"]). תוקן בקוד."),
  spacer(),

  h("בדיקה 8: עדכון אוטומטי (polling)", 3),
  he("**מטרת:** וידוא ש-setInterval עובד."),
  he("**מה בוצע:** טענתי את ה-CPU עם YouTube + רינדור 3D. עקבתי אחר ה-Dashboard."),
  he("**תוצאה:** תוך 5-10 שניות הגרף של CPU usage קפץ מ-15% ל-80%."),
  he("**בעיות:** אין."),
  spacer(),

  h("בדיקה 9: התראת אימייל", 3),
  he("**מטרת:** בדיקת מנגנון ההתראות."),
  he("**מה בוצע:** הגדרתי ב-Dashboard MaxCpuUsage=10%. הוספתי 'test@example.com' ל-Alert Emails. טענתי את ה-CPU."),
  he("**תוצאה:** קיבלתי במייל הודעה עם נושא \"TRAXONET: USER-PC\" וגוף \"CPU Usage: 87% > 10%\"."),
  he("**בעיות:** SMTP עם Gmail דרש App Password (לא הסיסמה הרגילה). הסבירו לי בתיעוד של Google."),
  spacer(),

  h("בדיקה 10: Cooldown", 3),
  he("**מטרת:** וידוא שלא נשלחים יותר מדי אימיילים."),
  he("**מה בוצע:** השארתי את ה-CPU עמוס למשך 10 דקות."),
  he("**תוצאה:** קיבלתי 2 אימיילים (אחד ב-t=0, השני ב-t=5min). לא יותר. בלוג השרת הופיע \"Alert cooldown active\"."),
  he("**בעיות:** אין."),
  spacer(),

  h("בדיקה 11: שינוי interval", 3),
  he("**מטרת:** עדכון interval בלקוח דרך Dashboard."),
  he("**מה בוצע:** שיניתי ב-Dashboard ל-30s, המתנתי 30 שניות, עקבתי אחר ה-status bar בלקוח."),
  he("**תוצאה:** הסטטוס מתחדש כל 30s (לא 10)."),
  he("**בעיות:** אין."),
  spacer(),

  h("בדיקה 12: ניתוק שרת", 3),
  he("**מטרת:** עמידות לשגיאות רשת."),
  he("**מה בוצע:** סגרתי את ה-TCP Server, חיכיתי 10 שניות, הפעלתי שוב."),
  he("**תוצאה:** הסטטוס בלקוח הראה \"Send failed: ...\" אבל ה-App לא קרס. כשהשרת חזר, חזרו ל\"Data sent\"."),
  he("**בעיות:** אין."),
  pageBreak()
);

push(
  h("3.3.2 בדיקות נוספות (שעלו במהלך הפיתוח)", 2),

  h("בדיקה 13: ניהול אימיילים מורשים", 3),
  he("**מטרת:** הוספה/הסרה של אימיילים."),
  he("**מה בוצע:** ב-MainForm הוספתי 'user2@example.com'. ב-Dashboard של user2 בדקתי שהמחשב מופיע."),
  he("**תוצאה:** המחשב הופיע ב-user2 Dashboard."),
  he("**בעיות:** אין."),
  spacer(),

  h("בדיקה 14: הסרת admin email — אסורה", 3),
  he("**מטרת:** וידוא שלא ניתן להסיר admin email."),
  he("**מה בוצע:** ניסיתי ב-MainForm להסיר 'traxonetisrael@gmail.com'."),
  he("**תוצאה:** כפתור ה-✕ לא מופיע ליד admin email."),
  he("**בעיות:** אין."),
  spacer(),

  h("בדיקה 15: SignalR logs ב-Admin UI", 3),
  he("**מטרת:** וידוא שלוגים מופיעים בזמן אמת."),
  he("**מה בוצע:** פתחתי Admin UI, הפעלתי Client חדש."),
  he("**תוצאה:** בתוך שניה הופיעו לוגים \"[Encrypted] Request: hardware_data\" ו-\"Login: user@example.com\"."),
  he("**בעיות:** הפעם הראשונה — SignalR לא התחבר. הסתבר שצריך להוסיף signalr.js ב-_Layout. תוקן."),
  spacer(),

  h("בדיקה 16: Reset password (admin)", 3),
  he("**מטרת:** אדמין יכול לאפס סיסמת משתמש."),
  he("**מה בוצע:** ב-Admin UI, בחרתי משתמש → Reset Password → הגדרתי 'NewPass456'."),
  he("**תוצאה:** המשתמש יכול להיכנס עם הסיסמה החדשה."),
  he("**בעיות:** אין."),
  spacer(),

  h("בדיקה 17: מחיקת מחשב (cascade)", 3),
  he("**מטרת:** מחיקת מחשב מ-Admin UI מנקה את כל הטבלאות הקשורות."),
  he("**מה בוצע:** ב-Admin UI, בחרתי computer → Delete. בדקתי ב-MySQL Workbench."),
  he("**תוצאה:** רשומות ב-drives, emails, alert_emails, thresholds — כולן נמחקו. רק users נשארה."),
  he("**בעיות:** אין."),
  spacer(),

  h("בדיקה 18: עומס — 5 לקוחות במקביל", 3),
  he("**מטרת:** וידוא ביצועים תחת עומס."),
  he("**מה בוצע:** הפעלתי 5 instances של הLקוח (מ-5 ClientId-ים שונים) במקביל."),
  he("**תוצאה:** השרת קיבל את כל הנתונים. ב-Dashboard הופיעו 5 מחשבים."),
  he("**בעיות:** אין. ה-Task per client pattern עבד יפה."),
  spacer(),

  h("בדיקה 19: BIDI rendering ב-Word", 3),
  he("**מטרת:** וידוא שספר הפרויקט נראה תקין בעברית."),
  he("**מה בוצע:** הוצאתי docx → פתחתי ב-Word → בדקתי TOC ו-body."),
  he("**תוצאה:** התחלתי עם רענדור הפוך (BIDI לא נכון). תיקנתי ע\"י הוספת בrightToLeft=true ב-styles + LRM/FSI marks סביב מקטעים באנגלית."),
  he("**בעיות:** עדיין יש קצת ערבוב במחרוזות מעורבות. זה תהליך BIDI סטנדרטי של Unicode."),
  spacer(),

  h("3.3.3 סיכום בדיקות", 2),
  he("**סה\"כ בדיקות שבוצעו: 19** (12 מתוכננות + 7 נוספות)."),
  he("**הצליחו:** 19/19."),
  he("**בעיות שהתגלו ותוקנו:** 6 (RSA padding mismatch, encryption keys mismatch, Welcome flow, SMTP App Password, SignalR script missing, BIDI rendering)."),
  he("**כיסוי:** כל היכולות העיקריות שתוארו בפרק 1.9 נבדקו."),
  pageBreak()
);
