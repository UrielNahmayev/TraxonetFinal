// Section 2: מבנה / ארכיטקטורה
const H = require('./helpers');
const { push, h, he, code, spacer, pageBreak, image, diagram, flowBox, flowRow, statCard, infoBox, tbl2col, Paragraph, TextRun, AlignmentType } = H;

push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 400 },
    children: [new TextRun({ text: "פרק 2", bold: true, size: 80, font: "Arial", color: "C00000" })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "מבנה / ארכיטקטורה", bold: true, size: 60, font: "Arial", color: "1F3864", rightToLeft: true })] }),
  pageBreak()
);

// 2.1 ארכיטקטורה
push(
  h("2.1 ארכיטקטורת המערכת", 1),
  he("פרק זה מתאר את הארכיטקטורה הכוללת של המערכת — מבנה הרכיבים, החיבורים ביניהם, וההחלטות שעמדו מאחורי הבחירות."),
  spacer(),
  h("2.1.1 תיאור הרכיבים", 2),
  he("המערכת בנויה משלושה רכיבי תוכנה עצמאיים, ובסיס נתונים מרכזי:"),
  spacer(),
  he("**רכיב 1: Traxonet.Client**"),
  he("**•** סוג: Windows Forms desktop application."),
  he("**•** מותקן על: כל מחשב Windows שמנוטר."),
  he("**•** משימה: איסוף נתוני חומרה ושליחה לשרת ה-TCP."),
  he("**•** רץ ברקע באופן רציף."),
  spacer(),
  he("**רכיב 2: TraxonetServerTCP**"),
  he("**•** סוג: ASP.NET Core 8 application עם BackgroundService."),
  he("**•** רץ על: שרת מרכזי בארגון (יכול להיות מחשב Windows יחיד)."),
  he("**•** משימה: קליטת נתונים מ-Clients, שמירה ב-DB, התראות, Admin UI."),
  he("**•** פורטים: 5000 (TCP) + 5034/7150 (HTTP/HTTPS למשק ניהול)."),
  spacer(),
  he("**רכיב 3: Traxonet (Web App)**"),
  he("**•** סוג: ASP.NET Core 8 MVC."),
  he("**•** רץ על: השרת המרכזי (יכול להיות באותו מחשב כמו TraxonetServerTCP, או נפרד)."),
  he("**•** משימה: Dashboard למשתמשים, ניהול הרשאות וספים."),
  he("**•** פורטים: 5034/7034 (HTTP/HTTPS)."),
  spacer(),
  he("**רכיב 4: בסיס נתונים MySQL**"),
  he("**•** גרסה: MySQL 8.0+."),
  he("**•** רץ על: שרת מרכזי או מחשב נפרד."),
  he("**•** משימה: אחסון של 7 טבלאות (users, computers, drives, emails, alert_emails, thresholds, computer_permissions)."),
  spacer(),
  h("2.1.2 קשרי גומלין בין הרכיבים", 2),
  he("**Client ↔ TCP Server:** תקשורת TCP מוצפנת בפורט 5000. הלקוח יוזם כל connection."),
  he("**TCP Server ↔ DB:** ADO.NET עם MySql.Data. קריאות raw SQL."),
  he("**Web App ↔ DB:** EF Core עם Pomelo provider. LINQ → SQL."),
  he("**Admin Browser ↔ TCP Server:** SignalR WebSocket לעדכון לוגים בזמן אמת + REST API לניהול."),
  he("**User Browser ↔ Web App:** HTTPS עם cookie auth + REST API + setInterval polling."),
  spacer(),
  h("2.1.3 תרשים הארכיטקטורה", 2),
  he("התרשים הבא מתאר את הרכיבים העיקריים של המערכת ואת אופן התקשורת ביניהם. כל קופסה מייצגת רכיב נפרד, והחיצים מתארים את כיוון זרימת המידע."),
  spacer(),
  flowRow([
    { role: 'client', title: 'Traxonet.Client', text: 'אפליקציית WinForms שרצה במחשב הלקוח. אוספת נתוני חומרה ושולחת לשרת.' },
    { role: 'server', title: 'TraxonetServerTCP', text: 'שרת TCP + Admin UI. מקבל נתונים, שומר ב-DB, שולח התראות.' },
    { role: 'web',    title: 'Traxonet Web App', text: 'Dashboard לאדמינים ולמשתמשים. מציג את הנתונים בדפדפן.' },
  ]),
  spacer(),
  he("**הרכיב המרכזי המחבר ביניהם הוא מסד הנתונים** — שני השרתים ניגשים אליו במקביל. הלקוח מתקשר רק עם TCP Server, ולא ישירות עם ה-Web App."),
  spacer(),
  flowBox([
    { role: 'client', title: 'Traxonet.Client', text: 'איסוף WMI + PerformanceCounter + LibreHardwareMonitor כל X שניות' },
    { role: 'server', title: 'TraxonetServerTCP (TCP port 5000)', text: 'RSA+AES handshake → פענוח → ניתוב הודעה → שמירה ב-DB' },
    { role: 'db',     title: 'MySQL Database', text: '7 טבלאות (users, computers, drives, emails, alert_emails, thresholds, computer_permissions)' },
    { role: 'web',    title: 'Traxonet Web App (HTTPS 7034)', text: 'EF Core → קריאה מ-DB → רינדור Razor → JavaScript polling כל 5 שניות' },
    { role: 'user',   title: 'דפדפן המשתמש', text: 'מציג Dashboard, גרפים, ניהול ספים והרשאות' },
  ]),
  spacer(),
  he("**מבנה:** התקשורת מתואמת באופן הדוק. הלקוח שולח ל-TCP Server שמתעדכן ב-DB, וה-Web App מציג מאותו DB. כל רכיב מתמקד באחריות אחת ברורה, מה שמקל על תחזוקה ועל פיתוח מקבילי של תכונות."),
  pageBreak()
);

// 2.2 טכנולוגיות
push(
  h("2.2 תיאור הטכנולוגיות", 1),
  h("שפות תכנות", 2),
  he("**C# 12** — שפה ראשית. נבחרה בגלל תמיכה ב-async/await, type safety חזק, ואקוסיסטם עשיר ב-NuGet."),
  he("**JavaScript ES2020** — לצד ה-Dashboard בדפדפן."),
  he("**HTML5 + CSS3** — לבניית ה-UI של ה-Web App."),
  he("**Razor (.cshtml)** — server-side template engine של ASP.NET."),
  he("**SQL (MySQL dialect)** — לשאילתות raw ב-TCP Server."),
  spacer(),
  h("ממשק אדם-מחשב (MMI)", 2),
  he("**Windows Forms** ב-Client — UI נטיב של Windows."),
  he("**Web UI** ב-Dashboard ו-Admin — דפדפן."),
  he("**Real-time updates** דרך setInterval (Dashboard) ו-SignalR (Admin)."),
  spacer(),
  h("תקשורת", 2),
  he("**TCP גולמי** — בין Client לשרת. פרוטוקול יישומי משלי עם framing ו-encryption."),
  he("**HTTP/HTTPS** — לכל הUI Web."),
  he("**WebSocket** — דרך SignalR לעדכוני real-time."),
  he("**SMTP** — לשליחת התראות (Gmail STARTTLS על פורט 587)."),
  spacer(),
  h("תחומי עניין", 2),
  he("**Networking:** TCP socket programming, framing, encryption."),
  he("**Cryptography:** RSA-2048, AES-256-CBC, HMAC-SHA512."),
  he("**OS APIs:** WMI, Registry, PerformanceCounter."),
  he("**Databases:** Schema design, UPSERT, encryption at rest."),
  he("**Web technologies:** ASP.NET Core, EF Core, SignalR, Razor."),
  he("**Frontend:** HTML5, CSS3 (Grid/Flexbox), JavaScript (fetch, Chart.js)."),
  pageBreak()
);

// 2.3 זרימת מידע
push(
  h("2.3 זרימת מידע במערכת", 1),
  he("פרק זה מתאר את הזרימות המרכזיות עם תרשימים."),
  spacer(),
  h("זרימה 1: שליחת נתוני חומרה (Client → DB)", 2),
  he("הזרימה הזו מתבצעת בכל פעם שה-Timer של הלקוח יורה — בברירת מחדל כל 10 שניות. היא כוללת שליחה מוצפנת של נתוני החומרה לשרת ושמירתם במסד הנתונים, כולל בדיקת ספים והפעלת התראות במידת הצורך."),
  spacer(),
  flowBox([
    { role: 'client',  title: '1. Client Timer Tick',         text: 'ה-SendTimer יורה Tick על UI thread. אם הקודם עדיין רץ, מדלגים (reentrancy guard).' },
    { role: 'client',  title: '2. DataCollector.CollectAsync', text: 'איסוף נתוני חומרה דרך WMI, PerformanceCounter ו-LibreHardwareMonitor. אורך כ-1.5 שניות.' },
    { role: 'client',  title: '3. TCP Connect',                text: 'TcpClient.ConnectAsync לפורט 5000 של השרת. handshake בסיסי של TCP.' },
    { role: 'process', title: '4. RSA + AES Handshake',        text: 'קבלת RSA public key מהשרת, יצירת AES key+IV אקראיים, הצפנה ב-RSA ושליחה.' },
    { role: 'process', title: '5. שליחת JSON מוצפן',           text: 'סריאליזציה של HardwareData ל-JSON, הצפנה ב-AES-CBC ושליחה length-prefixed.' },
    { role: 'server',  title: '6. Server: פענוח + ניתוב',       text: 'RSA Decrypt → AES Decrypt → JObject.Parse → ניתוב לפי שדה type.' },
    { role: 'db',      title: '7. UPSERT computers + drives',  text: 'INSERT עם ON DUPLICATE KEY UPDATE. 7 שדות עוברים הצפנה לפני ההכנסה.' },
    { role: 'process', title: '8. בדיקת ספים',                 text: 'CheckThresholdsAndNotify משווה ערכים מול הספים השמורים. אם חורגים — מעבר לשליחת מייל.' },
    { role: 'server',  title: '9. SMTP (אופציונלי)',           text: 'אם cooldown לא אקטיבי — שליחת אימייל לכל הנמענים ברשימת alert_emails.' },
    { role: 'client',  title: '10. סגירת חיבור',                text: 'השרת מצפין response, שולח, ה-TCP connection נסגר. מחכים לטיק הבא.' },
  ]),
  spacer(),
  h("זרימה 2: התחברות + פתיחת Dashboard", 2),
  he("המשתמש מתחיל את התהליך מהדפדפן, מתחבר עם שם משתמש וסיסמה, ומגיע ל-Dashboard. הזרימה כוללת אימות מול ה-DB, יצירת קוקי מאומת, ולבסוף טעינת הנתונים של המחשבים שהמשתמש מורשה לראות."),
  spacer(),
  flowBox([
    { role: 'user',    title: '1. גישה ל-/Account/Login',         text: 'המשתמש פותח דפדפן בכתובת ה-Web App, ASP.NET מנתב ל-AccountController.Login.' },
    { role: 'web',     title: '2. רינדור Login.cshtml',           text: 'View מוחזר עם form של אימייל וסיסמה + tab Register. עיצוב עם CSS gradient ו-animations.' },
    { role: 'user',    title: '3. Submit credentials',             text: 'המשתמש ממלא ולוחץ Login. הדפדפן שולח POST עם form data.' },
    { role: 'process', title: '4. Verify password',                text: 'EF Core SingleOrDefaultAsync על Users.Email. PasswordHasher.VerifyPassword עם hash+salt שמורים.' },
    { role: 'web',     title: '5. SignIn + Cookie',                text: 'יצירת ClaimsPrincipal עם NameIdentifier+Name+Email. SignInAsync מצפין ושולח Set-Cookie.' },
    { role: 'web',     title: '6. Welcome page',                   text: 'Redirect ל-/Home/Welcome. המשתמש רואה Particle background ו-2 actions.' },
    { role: 'process', title: '7. GoToDashboard',                  text: 'לחיצה על Open Dashboard מציבה Session["PassedWelcome"]="true" ומפנה ל-Dashboard.' },
    { role: 'db',      title: '8. GetAuthorizedDevices (3 queries)',text: '3 שאילתות EF לאיחוד: AuthorizedEmails לפי email, ComputerPermissions לפי UserId, Computers בעלות.' },
    { role: 'web',     title: '9. Render Index.cshtml',            text: 'DashboardViewModel עם רשימת המחשבים. Razor מרנדר sidebar + cards + Chart.js placeholders.' },
    { role: 'user',    title: '10. setInterval(5000)',             text: 'מ-DOMContentLoaded, JavaScript מתחיל polling כל 5 שניות לעדכון הנתונים.' },
  ]),
  spacer(),
  h("זרימה 3: התראה SMTP", 2),
  he("התראת אימייל היא חלק מהזרימה של שליחת נתוני חומרה — היא מתרחשת אחרי השמירה ב-DB. הזרימה כוללת בדיקת חריגה מספים, בדיקת cooldown של 5 דקות, ורק אז שליחה בפועל לכל הנמענים."),
  spacer(),
  flowBox([
    { role: 'client',  title: '1. Client sends hardware data',     text: 'Timer Tick → DataCollector → Sender. ההצפנה והשליחה כמו בזרימה 1.' },
    { role: 'server',  title: '2. HandleHardwareData',             text: 'TcpServerService מקבל הודעה עם type=hardware_data ומעביר ל-ProcessHardwareData.' },
    { role: 'db',      title: '3. InsertComputer + InsertDrives',  text: 'UPSERT לטבלת computers (עם הצפנת 7 שדות) ו-UPSERT לטבלת drives לכל כונן.' },
    { role: 'process', title: '4. CheckThresholdsAndNotify',       text: 'טעינת thresholds מ-DB. השוואת CPU temp, CPU usage, RAM usage, free space מול הספים.' },
    { role: 'process', title: '5. Build alerts list',              text: 'לכל סף שחורג נוסף string לרשימה. אם הרשימה ריקה — חוזרים מיד בלי שליחה.' },
    { role: 'process', title: '6. Check cooldown',                 text: 'בדיקה ב-static Dictionary בזיכרון. אם פחות מ-5 דקות מההתראה הקודמת — דילוג ולוג INFO.' },
    { role: 'db',      title: '7. Load recipients',                text: 'SELECT email FROM alert_emails WHERE client_id = X. אם אין נמענים — חוזרים.' },
    { role: 'process', title: '8. Update cooldown',                text: 'lastAlertTime[ClientId] = DateTime.Now. נעשה לפני השליחה — מונע flood גם אם השליחה נכשלת.' },
    { role: 'server',  title: '9. SMTP loop',                      text: 'לכל אימייל ברשימה: יצירת MailMessage, SmtpClient.Send דרך Gmail עם STARTTLS על פורט 587.' },
    { role: 'user',    title: '10. Recipient receives email',       text: 'הנמען מקבל אימייל עם subject "TRAXONET: <machine name>" וגוף עם פירוט החריגות.' },
  ]),
  pageBreak()
);

// 2.4 אלגוריתמים מרכזיים
push(
  h("2.4 אלגוריתמים מרכזיים", 1),
  h("אלגוריתם 1: Hybrid Encryption (RSA + AES)", 2),
  h("ניסוח הבעיה האלגוריתמית", 3),
  he("**הבעיה:** איך מצפינים תקשורת בין שני צדדים שלא חולקים מפתח סודי מראש?"),
  he("**אילוצים:**"),
  he("**•** אסור להעביר מפתח סודי בגלוי."),
  he("**•** הצפנה סימטרית (AES) מהירה אך דורשת מפתח משותף."),
  he("**•** הצפנה אסימטרית (RSA) פותרת את החילוף אבל איטית להצפנת כמות גדולה של מידע."),
  spacer(),
  h("ניתוח אלגוריתמים קיימים", 3),
  he("**1. TLS/SSL** — הסטנדרט בתעשייה. פתרון מלא אבל דורש certificates ו-CA."),
  he("**2. SSH** — דומה ל-TLS אבל ל-shell remote access."),
  he("**3. Custom hybrid encryption** — בניית handshake יישומי משלך."),
  spacer(),
  h("הפתרון הנבחר ונימוקו", 3),
  he("**בחירה: Custom hybrid (RSA + AES).**"),
  he("**נימוק:** TLS היה פתרון מהיר אבל לא ייחודי — לא הייתי לומד כלום. בניית handshake בעצמי נתנה לי הבנה עמוקה של RSA, AES, padding, IV management. הפתרון:"),
  he("**1.** השרת מחזיק זוג RSA-2048 ושולח את ה-public key ללקוח."),
  he("**2.** הלקוח מייצר AES-256 key + IV אקראיים (32+16 = 48 בייט)."),
  he("**3.** הלקוח מצפין את ה-bundle ב-RSA-OAEP-SHA256 ושולח."),
  he("**4.** השרת מפענח עם ה-RSA private key → מקבל את ה-AES key+IV."),
  he("**5.** משם והלאה כל התקשורת ב-AES-256-CBC (מהיר ועובד לכל גודל)."),
  spacer(),
  h("מקורות רלוונטיים", 3),
  he("**•** RFC 8017 — PKCS #1 v2.2 (RSA OAEP padding spec)."),
  he("**•** FIPS 197 — Advanced Encryption Standard."),
  he("**•** Microsoft docs: System.Security.Cryptography namespace."),
  he("**•** OWASP Cryptographic Storage Cheat Sheet."),
  spacer(),
  h("אלגוריתם 2: Length-Prefixed Framing", 2),
  h("ניסוח הבעיה", 3),
  he("**הבעיה:** TCP הוא stream-oriented, לא message-oriented. כשכותבים 100 בייט ואחר-כך 200, הצד השני יכול לקבל ב-קריאה אחת \"300\", או 50+150+100 ב-3 קריאות. אין מושג של גבולות הודעה."),
  spacer(),
  h("פתרון אלגוריתמי", 3),
  he("לפני כל הודעה — 4 בייט שמייצגים את אורכה ב-network byte order (big-endian). הצד השני קורא קודם 4 בייט, מפענח את האורך, ואז קורא בדיוק `length` בייט."),
  spacer(),
  h("פסאודו-קוד של ReadLengthPrefixedAsync", 3),
  code(`async function ReadLengthPrefixedAsync(stream):
  // Read 4-byte length prefix
  lengthBytes = read(stream, 4)
  if BitConverter.IsLittleEndian:
      reverse(lengthBytes)
  length = BitConverter.ToInt32(lengthBytes)

  // Sanity check
  if length <= 0 or length > 10MB:
      throw IOException("Invalid length")

  // Read exact number of bytes
  data = new byte[length]
  totalRead = 0
  while totalRead < length:
      read = stream.ReadAsync(data, totalRead, length - totalRead)
      if read == 0: throw IOException("Connection closed")
      totalRead += read

  return data`),
  spacer(),
  h("אלגוריתם 3: HMAC Password Hashing", 2),
  h("ניסוח הבעיה", 3),
  he("**הבעיה:** איך שומרים סיסמאות ב-DB בצורה שלא חושפת אותן אם ה-DB דלף?"),
  spacer(),
  h("אלגוריתמים קיימים", 3),
  he("**1. Plain text** — סיסמה כפי שהיא. **נדחה לחלוטין.**"),
  he("**2. MD5/SHA-1** — hash פשוט. **נדחה** — מהיר מדי, לא עמיד לrainbow tables."),
  he("**3. HMAC-SHA512 + random salt** — נבחר."),
  he("**4. PBKDF2/bcrypt/Argon2** — האלטרנטיבות המומלצות יותר. נבחנו אך לא נבחרו."),
  spacer(),
  h("הפתרון הנבחר ונימוקו", 3),
  he("**HMAC-SHA512** — נבחר כי:"),
  he("**•** מובנה ב-.NET (`System.Security.Cryptography.HMACSHA512`)."),
  he("**•** הופך כל סיסמה לייחודית הודות ל-salt אקראי 128 בייט."),
  he("**•** Hash output 64 בייט — קשה לresolve."),
  spacer(),
  he("**חיסרון מודע:** מהיר יותר מ-bcrypt/Argon2, ולכן פחות עמיד ל-brute force אם ה-DB דולף. בשלב הבא של הפרויקט אעבור ל-Argon2."),
  spacer(),
  h("פסאודו-קוד", 3),
  code(`function CreatePasswordHash(password):
  hmac = new HMACSHA512()  // generates random Key (128 bytes)
  salt = hmac.Key
  hash = hmac.ComputeHash(UTF8.GetBytes(password))  // 64 bytes
  store (hash, salt) in DB

function VerifyPassword(password, storedHash, storedSalt):
  hmac = new HMACSHA512(storedSalt)
  computedHash = hmac.ComputeHash(UTF8.GetBytes(password))
  return computedHash equals storedHash`),
  pageBreak()
);

// 2.5 סביבת פיתוח
push(
  h("2.5 סביבת הפיתוח", 1),
  h("כלי פיתוח דרושים", 2),
  he("**Visual Studio 2022 Community Edition (חינמי)** — IDE עיקרי. תומך ב-.NET 8, Windows Forms designer, ו-debugging."),
  he("**.NET 8 SDK** — חובה לבנייה והרצה."),
  he("**MySQL Server 8.0+** — אחסון נתונים."),
  he("**MySQL Workbench** — לעריכת DB דרך GUI."),
  he("**Git** — version control."),
  he("**Node.js + npm** (אופציונלי) — להפעלת build tools."),
  spacer(),
  h("סביבה וכלים נדרשים לבדיקות", 2),
  he("**Postman** — בדיקת REST endpoints ידנית."),
  he("**MySQL Workbench** — בדיקת תוכן DB אחרי כל פעולה."),
  he("**Browser DevTools (Chrome/Edge)** — בדיקת JS, network calls."),
  he("**Task Manager** — השוואת נתוני חומרה."),
  he("**Outlook / Gmail web** — בדיקת שליחת אימיילים."),
  spacer(),
  h("סביבת הרצה (Runtime)", 2),
  he("**מינימום:** Windows 10, 4GB RAM, .NET 8 runtime."),
  he("**מומלץ:** Windows 11, 8GB RAM, SSD."),
  he("**שרת:** Windows Server 2019+ (לא חובה — גם Windows 10/11 מספיק)."),
  pageBreak()
);

// 2.6 פרוטוקול תקשורת
push(
  h("2.6 פרוטוקול תקשורת", 1),
  he("פרק זה מתאר את פרוטוקול ה-TCP בין הלקוח לשרת — מבנה ההודעות וההודעות הזורמות."),
  spacer(),
  h("2.6.1 מבנה כל הודעה בפרוטוקול", 2),
  he("כל הודעה ב-TCP בנויה משתי שכבות:"),
  spacer(),
  h("שכבה 1: Framing", 3),
  diagram(`
+----------+------------------------+
| Length   |       Payload          |
| (4 bytes)|       (N bytes)        |
| big-end  |                        |
+----------+------------------------+`),
  he("**Length (4 בייט):** אורך ה-payload, ב-network byte order (big-endian)."),
  he("**Payload (N בייט):** התוכן עצמו (בינארי, יכול להיות מוצפן)."),
  spacer(),
  h("שכבה 2: Encryption", 3),
  he("בתחילת כל חיבור — handshake של 3 שלבים:"),
  diagram(`
Client                     Server
   |                          |
   |--- TCP Connect:5000 ---->|
   |                          |
   |<-- [RSA Public Key] -----| (Server first!)
   |     (~294 bytes SPKI)    |
   |                          |
   |-- [RSA(AES key+IV)] ---->| (48 bytes encrypted → 256 bytes)
   |                          |
   |-- [AES(JSON request)] -->| (JSON encrypted with AES-CBC)
   |                          |
   |<-- [AES(JSON response)] -| (Server response, same AES key)
   |                          |
   |--- TCP Close ----------->|`),
  spacer(),
  h("2.6.2 פירוט ההודעות הזורמות", 2),
  he("כל ההודעות עוברות **לאחר** ה-handshake ומוצפנות ב-AES."),
  spacer(),
  h("הודעה 1: hardware_data (ברירת מחדל)", 3),
  he("**נשלחת מ:** Traxonet.Client (Sender.SendAsync)"),
  he("**נשלחת אל:** TraxonetServerTCP"),
  he("**מבנה השדות (JSON):**"),
  code(`{
  "type": "hardware_data",
  "machineName": "string",
  "motherboard": "string",
  "cpu": "string",
  "gpu": "string",
  "cpuCores": int,
  "logicalProcessors": int,
  "cpuTemp": float,
  "cpuUsage": float,
  "gpuDriver": "string",
  "totalRam": long,
  "freeRam": long,
  "ramUsage": float,
  "ip": "string",
  "mac": "string",
  "clientId": "GUID",
  "drives": [{"driveName":"C:", "totalSize":long, "freeSpace":long}],
  "authorizedEmails": ["string"],
  "alertEmails": ["string"],
  "thresholds": {"maxCpuTemp":float?, ...},
  "ownerUserId": int?,
  "ownerEmail": "string"
}`),
  he("**תגובה:** `{\"success\": true}`."),
  spacer(),
  h("הודעה 2: login", 3),
  he("**נשלחת מ:** Traxonet.Client (ApiClient.LoginAsync)"),
  he("**מבנה הבקשה:**"),
  code(`{ "type": "login", "email": "string", "password": "string" }`),
  he("**מבנה תגובה (הצלחה):**"),
  code(`{ "success": true, "id": int, "fullName": "string", "email": "string" }`),
  he("**מבנה תגובה (כישלון):**"),
  code(`{ "success": false, "error": "Invalid email or password." }`),
  spacer(),
  h("הודעה 3: register", 3),
  he("**מבנה הבקשה:**"),
  code(`{ "type": "register", "fullName": "string", "email": "string", "password": "string" }`),
  he("**תגובה (הצלחה):**"),
  code(`{ "success": true, "id": int, "fullName": "string", "email": "string" }`),
  he("**תגובה (כישלון):**"),
  code(`{ "success": false, "error": "Email already exists." }`),
  spacer(),
  h("הודעה 4: get_emails", 3),
  he("**בקשה:** `{ \"type\": \"get_emails\", \"clientId\": \"GUID\" }`"),
  he("**תגובה:** `{ \"success\": true, \"emails\": [\"email1\", \"email2\", ...] }`"),
  spacer(),
  h("הודעה 5: add_email", 3),
  he("**בקשה:** `{ \"type\": \"add_email\", \"clientId\": \"GUID\", \"email\": \"string\" }`"),
  he("**תגובה:** `{ \"success\": true }`"),
  spacer(),
  h("הודעה 6: remove_email", 3),
  he("**בקשה:** `{ \"type\": \"remove_email\", \"clientId\": \"GUID\", \"email\": \"string\" }`"),
  he("**תגובה:** `{ \"success\": true }` (לא מאפשר הסרת admin email)."),
  spacer(),
  h("הודעה 7: get_settings", 3),
  he("**בקשה:** `{ \"type\": \"get_settings\", \"clientId\": \"GUID\" }`"),
  he("**תגובה:** `{ \"success\": true, \"sendIntervalSeconds\": int, \"serverAddress\": \"string\" }`"),
  pageBreak()
);

// 2.7 מסכי המערכת
push(
  h("2.7 תיאור מסכי המערכת", 1),
  he("פרק זה מציג את המסכים העיקריים של המערכת — תפקיד כל אחד, המידע שמוצג, והפעולות שניתן לבצע."),
  spacer(),
  h("2.7.1 מסך התחברות לקוח (Client Login)", 2),
  he("**תפקיד:** קליטת credentials של המשתמש או יצירת חשבון חדש."),
  he("**מידע מוצג:** לוגו TRAXONET, שני tabs (Login/Register), שדות אימייל וסיסמה, שדה Server Address."),
  he("**פעולות אפשריות:**"),
  he("**•** מילוי אימייל וסיסמה ולחיצה Login."),
  he("**•** מעבר ל-Register tab ויצירת חשבון."),
  he("**•** שינוי כתובת השרת (default: 127.0.0.1)."),
  image("client_login.png.png", "מסך ההתחברות של הלקוח", 480, 360),
  spacer(),
  h("2.7.2 מסך הרשמה לקוח (Client Register)", 2),
  he("**תפקיד:** יצירת חשבון חדש במערכת."),
  he("**מידע מוצג:** שדות FullName, Email, Password, Confirm Password."),
  he("**פעולות אפשריות:**"),
  he("**•** מילוי השדות ולחיצה Register."),
  he("**•** אחרי הצלחה: מעבר אוטומטי ל-Login tab עם האימייל כבר ממולא."),
  image("client_register.png.png", "מסך ההרשמה של הלקוח", 480, 360),
  spacer(),
  h("2.7.3 מסך ראשי לקוח (Client Monitor)", 2),
  he("**תפקיד:** מציג את פרטי המחשב הנוכחי + ניהול אימיילים מורשים."),
  he("**מידע מוצג:** Machine name, CPU, RAM, GPU, IP, MAC, רשימת drives, רשימת authorized emails."),
  he("**פעולות אפשריות:**"),
  he("**•** הוספת אימייל מורשה."),
  he("**•** הסרת אימייל (חוץ מ-admin)."),
  he("**•** Logout."),
  image("client_monitor.png.png", "המסך הראשי של הלקוח עם פרטי המחשב", 520, 380),
  spacer(),
  h("2.7.4 מסך התחברות Web App", 2),
  he("**תפקיד:** התחברות והרשמה ל-Dashboard בדפדפן."),
  he("**מידע מוצג:** עיצוב כהה עם לוגו, שני tabs."),
  he("**פעולות אפשריות:** דומה למסך הלקוח."),
  image("web_login.png.png", "מסך ההתחברות של ה-Web App", 520, 380),
  spacer(),
  h("2.7.5 Dashboard / Admin UI", 2),
  he("**תפקיד:** מציג נתוני מחשבים עם גרפים חיים + ניהול ספים."),
  he("**מידע מוצג:** Sidebar עם מחשבים, info cards, hardware cards, 3 charts (RAM, CPU, Temp), drives, settings."),
  he("**פעולות אפשריות:** הגדרת ספים, ניהול alert emails, שינוי interval, הסרת גישה."),
  image("server_dashboard.png.png", "Dashboard וממשק ניהול של ה-TCP Server", 580, 400),
  pageBreak()
);

// 2.7.6 תרשים מסכים
push(
  h("2.7.6 תרשים זרימת מסכים (Screen Flow Diagram)", 2),
  diagram(`
                       +-----------+
                       |   START   |
                       +-----+-----+
                             |
              +--------------+--------------+
              |                             |
              v                             v
    +------------------+         +-----------------+
    | Client App Start |         | Browser Visit   |
    +--------+---------+         +--------+--------+
             |                            |
             v                            v
    +------------------+         +-----------------+
    | LoginForm        |         | /Account/Login  |
    |  - Login tab     |         |  - Login/Reg.   |
    |  - Register tab  |         +--------+--------+
    +--------+---------+                  |
             |                            v
             v                   +-----------------+
    +------------------+         | Welcome.cshtml  |
    | MainForm         |         |  - Download     |
    | (Hardware view + |         |  - Open Dash    |
    |  Auth emails)    |         +--------+--------+
    +--------+---------+                  |
             |                            v
       Logout|                   +-----------------+
             v                   | Dashboard       |
    [Loop back to LoginForm]     |  - Sidebar      |
                                 |  - Charts       |
                                 |  - Settings     |
                                 +-----------------+
`),
  pageBreak()
);

// 2.8 מבני נתונים
push(
  h("2.8 מבני הנתונים — DB Schema", 1),
  he("ה-DB נקרא `traxonet_db` ורץ על MySQL 8. מכיל 7 טבלאות."),
  spacer(),
  h("טבלה 1: users", 2),
  he("**שם הטבלה:** users"),
  he("**מפתח ראשי:** Id (INT, AUTO_INCREMENT)"),
  he("**שדות:**"),
  tbl2col("שם השדה", "טיפוס + הסבר + דוגמה", [
    ["Id", "INT, auto-increment. דוגמה: 1, 2, 3..."],
    ["FullName", "VARCHAR(255). דוגמה: 'אוריאל נחמייב'"],
    ["Email", "VARCHAR(255) UNIQUE. דוגמה: 'user@example.com'"],
    ["PasswordHash", "VARBINARY(64). HMAC-SHA512 hash. דוגמה: bytes[64]"],
    ["PasswordSalt", "VARBINARY(128). Random salt. דוגמה: bytes[128]"],
    ["CreatedAt", "DATETIME(6). דוגמה: '2026-06-09 11:30:00.000000'"],
  ]),
  spacer(),
  h("טבלה 2: computers", 2),
  he("**מפתח ראשי:** client_id (string GUID, 36 תווים)"),
  he("**שדות:**"),
  tbl2col("שם השדה", "טיפוס + הסבר + דוגמה", [
    ["client_id", "VARCHAR(255), PK. דוגמה: 'a1b2c3d4-...'"],
    ["machine_name", "VARCHAR(512), ENCRYPTED. דוגמה: 'USER-PC'"],
    ["motherboard", "VARCHAR(512), ENCRYPTED. דוגמה: 'ASUS PRIME'"],
    ["cpu", "VARCHAR(512), ENCRYPTED. דוגמה: 'Intel Core i7-12700K'"],
    ["gpu", "VARCHAR(512), ENCRYPTED. דוגמה: 'NVIDIA RTX 3060'"],
    ["cpu_cores", "INT. דוגמה: 8"],
    ["logical_processors", "INT. דוגמה: 16"],
    ["cpu_temp", "FLOAT. דוגמה: 45.5"],
    ["cpu_usage", "FLOAT. דוגמה: 23.7"],
    ["gpu_driver", "VARCHAR(512), ENCRYPTED. דוגמה: '531.61'"],
    ["total_ram", "BIGINT (bytes). דוגמה: 34359738368"],
    ["free_ram", "BIGINT (bytes). דוגמה: 16106127360"],
    ["ram_usage", "FLOAT. דוגמה: 53.1"],
    ["ip_address", "VARCHAR(255), ENCRYPTED. דוגמה: '192.168.1.100'"],
    ["mac_address", "VARCHAR(255), ENCRYPTED. דוגמה: 'AA:BB:...'"],
    ["time_sent", "DATETIME. דוגמה: '2026-06-09 12:00:00'"],
    ["owner_user_id", "INT, NULL. FK ל-users.Id. דוגמה: 1"],
  ]),
  spacer(),
  h("טבלה 3: drives", 2),
  he("**מפתח ראשי:** id (auto-increment), UNIQUE INDEX על (client_id, drive_name)"),
  tbl2col("שם השדה", "טיפוס + דוגמה", [
    ["id", "INT, auto-increment. דוגמה: 1"],
    ["client_id", "VARCHAR(255). דוגמה: 'a1b2c3...'"],
    ["drive_name", "VARCHAR(255). דוגמה: 'C:'"],
    ["total_size", "BIGINT bytes. דוגמה: 500107862016"],
    ["free_space", "BIGINT bytes. דוגמה: 234567890123"],
  ]),
  spacer(),
  h("טבלה 4: emails (Authorized Emails)", 2),
  he("**PK מורכב:** (client_id, email)"),
  tbl2col("שם השדה", "טיפוס + דוגמה", [
    ["client_id", "VARCHAR(255). דוגמה: 'a1b2c3...'"],
    ["email", "VARCHAR(255). דוגמה: 'user@example.com'"],
  ]),
  spacer(),
  h("טבלה 5: alert_emails", 2),
  he("**PK מורכב:** (client_id, email). זהה במבנה ל-emails אבל סמנטית שונה."),
  spacer(),
  h("טבלה 6: thresholds", 2),
  he("**PK:** client_id"),
  tbl2col("שם השדה", "טיפוס + דוגמה", [
    ["client_id", "VARCHAR(255), PK"],
    ["max_cpu_temp", "FLOAT, NULL. דוגמה: 85.0"],
    ["max_cpu_usage", "FLOAT, NULL. דוגמה: 90.0"],
    ["max_ram_usage", "FLOAT, NULL. דוגמה: 90.0"],
    ["min_free_space", "BIGINT bytes, NULL. דוגמה: 21474836480 (=20GB)"],
    ["send_interval_seconds", "INT DEFAULT 10. דוגמה: 30"],
    ["server_address", "VARCHAR(255) DEFAULT '127.0.0.1'. דוגמה: '192.168.1.50'"],
  ]),
  spacer(),
  h("טבלה 7: computer_permissions", 2),
  he("**PK:** id (auto-increment), UNIQUE INDEX על (client_id, user_id)"),
  tbl2col("שם השדה", "טיפוס + דוגמה", [
    ["id", "INT, auto-increment"],
    ["client_id", "VARCHAR(255)"],
    ["user_id", "INT (FK ל-users.Id)"],
    ["granted_by_user_id", "INT"],
    ["granted_at", "DATETIME(6) DEFAULT UTC_NOW"],
  ]),
  pageBreak()
);

// 2.9 חולשות ואיומים
push(
  h("2.9 סקירת חולשות ואיומים", 1),
  he("פרק זה סוקר חולשות פוטנציאליות במערכת ואת ההגנות שיושמו."),
  spacer(),
  h("שכבת האפליקציה", 2),
  h("עבודה עם בסיס נתונים — SQL Injection", 3),
  he("**איום:** התקפת SQL Injection — תוקף שולח קלט עם תווי SQL שמוזרקים לשאילתה."),
  he("**הגנה במערכת:** **כל** השאילתות משתמשות ב-parameterized queries:"),
  code(`// כך עושים נכון:
string query = "SELECT * FROM users WHERE Email = @email";
cmd.Parameters.AddWithValue("@email", email);

// לא הייתי עושה:
string query = "SELECT * FROM users WHERE Email = '" + email + "'";`),
  he("בכל מקום בו יש שאילתה (ב-Database.cs ובDashboardController.cs) משתמשים ב-`@param` או `{0}` placeholders שהDB driver מעבד באופן בטוח."),
  spacer(),
  h("עבודה עם אתרי web — XSS", 3),
  he("**איום:** Cross-Site Scripting — תוקף מזריק JavaScript לדפדפן של משתמש אחר."),
  he("**הגנה:** Razor של ASP.NET עושה auto-HTML-encoding ל-`@variable`. תוכן שמגיע מ-DB ועובר דרך Razor נקודה רגילה (`@Model.Name`) — מקודד אוטומטית."),
  spacer(),
  h("תהליך login + אימות", 3),
  he("**איום:** brute force על credentials."),
  he("**הגנה:**"),
  he("**•** סיסמאות מאוחסנות עם HMAC-SHA512 + salt 128 בייט אקראי."),
  he("**•** Same error message לכישלון אימות (לא מבדיל בין user not found ל-wrong password) — מונע user enumeration."),
  spacer(),
  h("MITM — איזה סוג הצפנה", 3),
  he("**איום:** Man-in-the-Middle — תוקף מאזין לתעבורה."),
  he("**הגנה:**"),
  he("**•** **TCP** מוצפן ב-RSA+AES handshake. ה-RSA public key מתקבל מהשרת בכל חיבור."),
  he("**•** **HTTP** ב-Web App — HTTPS עם TLS אם נכון מוגדר (UseHttpsRedirection)."),
  he("**•** **SMTP** עם STARTTLS על פורט 587."),
  spacer(),
  h("DoS/DDoS", 3),
  he("**איום:** Denial of Service — הצפת השרת בבקשות."),
  he("**הגנה (חלקית):**"),
  he("**•** Length-prefixed framing עם cap של 10MB מונע hodge הודעות ענק."),
  he("**•** stream.ReadTimeout = 15s מונע leaked connections."),
  he("**•** Each client gets its own Task — אם אחד תקוע, השאר ממשיכים."),
  he("**•** **חסר:** rate limiting (לא יושם)."),
  spacer(),
  h("Hash — העלאת קבצים", 3),
  he("**איום:** העלאת קבצים זדוניים."),
  he("**הגנה:** המערכת **לא** מאפשרת העלאת קבצים בכלל. רק הורדת `TraxonetClient.zip` (read-only)."),
  spacer(),
  h("שכבת התעבורה", 2),
  h("פרוטוקול TCP, לחיצת יד משולשת", 3),
  he("**מהות:** TCP three-way handshake הוא חלק מהפרוטוקול הסטנדרטי — SYN, SYN-ACK, ACK."),
  he("**במערכת:** ה-OS מטפל בו. הקוד שלי מתחיל לאחר שהחיבור הוקם."),
  spacer(),
  h("הצפנה", 3),
  he("**TCP:** RSA-2048 + AES-256-CBC (כפי שתואר ב-2.4)."),
  he("**HTTPS:** TLS (מנוהל על-ידי Kestrel)."),
  he("**DB fields:** AES-256-CBC עם IV של אפסים (deterministic, לאפשר חיפושים)."),
  spacer(),
  h("הפעלת המערכת", 3),
  he("**איום:** הרצת קוד עם הרשאות מוגזמות."),
  he("**הגנה:**"),
  he("**•** Client רץ עם הרשאות משתמש רגיל (לא אדמין)."),
  he("**•** קריאת WMI עובדת גם בלי אדמין."),
  he("**•** Registry HKCU (לא HKLM) — לא דורש אדמין."),
  spacer(),
  h("אילו חולשות קיימות וכיצד טופלו", 2),
  tbl2col("חולשה", "טיפול במערכת", [
    ["SQL Injection", "Parameterized queries בכל מקום ✓"],
    ["XSS", "Razor auto-encoding ✓"],
    ["CSRF", "POST על Logout, Cookie Auth — חלקי"],
    ["MITM (TCP)", "RSA+AES handshake ✓"],
    ["MITM (HTTP)", "HTTPS ✓"],
    ["Brute force login", "Same error message; חסר rate limiting"],
    ["DoS", "Length cap, timeouts; חסר rate limiting"],
    ["Plaintext passwords", "HMAC-SHA512 + salt ✓"],
    ["DB leak", "Field-level encryption (7 שדות) ✓"],
    ["Insider data exposure", "Admin UI מציג '*' לשדות רגישים ✓"],
  ]),
  pageBreak()
);
