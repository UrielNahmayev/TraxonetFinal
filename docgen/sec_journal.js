// יומן פיתוח אישי — הוספה לאחר חלק 5
const H = require('./helpers');
const { push, h, he, code, spacer, pageBreak, image, diagram, infoBox, tbl2col, Paragraph, TextRun, AlignmentType } = H;

push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 400 },
    children: [new TextRun({ text: "נספח מיוחד", bold: true, size: 60, font: "Arial", color: "C00000" })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "יומן הפיתוח שלי", bold: true, size: 48, font: "Arial", color: "1F3864", rightToLeft: true })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "רישומים אישיים מאורך השנה", size: 26, font: "Arial", italics: true, color: "595959", rightToLeft: true })] }),
  pageBreak()
);

push(
  h("יומן הפיתוח", 1),
  he("בכל פעם שעבדתי על הפרויקט, פתחתי קובץ Word ורשמתי מה עשיתי, מה עבד ומה לא. למטה — ליקוט מהרישומים. השמטתי דברים שכבר לא רלוונטיים, אבל זה נותן תמונה של איך התקדמתי."),
  spacer(),

  h("ספטמבר — התחלה", 2),
  he("**8 בספטמבר.** היום הראשון של השנה. המורה שאל מי כבר חשב על נושא לפרויקט. הצבעתי. אמרתי \"מערכת ניטור של מחשבים\". הוא שאל למה. עניתי שזה נראה לי מעניין. נתן לי אישור והלכתי הביתה לחשוב."),
  he("**12 בספטמבר.** ישבתי שעתיים מול דף ריק ושאלתי את עצמי: באמת מה אני עושה. ניסיתי לרשום \"דברים שהמערכת צריכה לעשות\". יצא לי 4 שורות: לאסוף נתונים, לשלוח לשרת, לשמור ב-DB, להציג ב-Dashboard. נראה פשוט. כן."),
  he("**16 בספטמבר.** חיפשתי \"how to read CPU usage C#\" בגוגל. הגעתי לדף של Microsoft על PerformanceCounter. ניסיתי. החזיר 0. ניסיתי שוב. 0. אחרי חצי שעה ראיתי שמישהו כתב \"call NextValue twice with delay\". זה עבד. רשמתי לעצמי שזה דבר חשוב."),
  he("**22 בספטמבר.** פתחתי Visual Studio. יצרתי solution חדש. הוספתי 3 projects. בניתי. עבד. רק זה. שמחתי כמו ילד קטן."),
  spacer(),

  h("אוקטובר — איסוף החומרה הולך", 2),
  he("**3 באוקטובר.** התחלתי לכתוב את `DataCollector`. WMI היה מוזר. שאילתות נוסח SQL אבל לא בדיוק. נתקעתי 20 דקות על למה השאילתה לא מחזירה כלום, ואז ראיתי שכתבתי `select * from Win32Processor` במקום `Win32_Processor` (חסר underscore)."),
  he("**11 באוקטובר.** קיבלתי עזרה מחבר בכיתה (ניר). הוא הראה לי איך לעבוד עם `using` ו-`ManagementObjectSearcher`. רשמתי בריבוע גדול \"לזכור: always use using עם משאבים\"."),
  he("**17 באוקטובר.** רציתי לקבל טמפרטורת CPU. השאילתה ל-MSAcpi_ThermalZoneTemperature החזירה שגיאה. ניסיתי 3 שעות. בסוף גיליתי שזה לא זמין במחשב הביתי שלי. עצוב. אבל חיפשתי וגיליתי LibreHardwareMonitor. הסתבר שהוא יכול לקרוא יותר טוב מ-WMI."),
  he("**23 באוקטובר.** עיצבתי את ה-MainForm. לקחתי השראה מ-Discord (ה-dark mode שלהם). אדום-שחור. נראה אגרסיבי. אהבתי."),
  he("**31 באוקטובר.** Halloween. במקום ללכת להתחפש, הוספתי גרף בזמן אמת. החבר'ה צחקו עלי. שווה את זה."),
  spacer(),

  tbl2col("נושא", "מה למדתי באוקטובר", [
    ["WMI", "תחביר מוזר. צריך underscore. תחזרי תחזרי תחזרי לתיעוד של Microsoft."],
    ["PerformanceCounter", "צריך 2 קריאות עם המתנה. הראשונה תמיד 0."],
    ["WinForms", "Anchor + Dock זה אחרי שעות של 'למה הכפתור קופץ'."],
    ["LibreHardwareMonitor", "צריך Computer.Open() + hw.Update() ואז Close()."],
  ]),
  pageBreak()
);

push(
  h("נובמבר — שרת ה-TCP", 2),
  he("**5 בנובמבר.** התחלתי את שרת ה-TCP. לא הבנתי מה זה BackgroundService. ראיתי דוגמה ב-Microsoft Docs והעתקתי. עבד. רק לאחר חודש הבנתי מה זה עושה באמת."),
  he("**9 בנובמבר.** TcpListener על פורט 5000. הצלחתי להתחבר מהלקוח. שלחתי \"hello\". הגיע. רעדתי קצת. זה לא כל יום שתשתי TCP מאפס שלי עובד."),
  he("**14 בנובמבר.** הוספתי הצפנה. RSA + AES. השרת מצפין על PKCS1, הלקוח מצפין על OAEP. לא עובד. שבוע. שבוע שלם. אמא שלי שאלה אם אני בסדר כי לא יצאתי מהחדר. הסתבר שצריך התאמה בין הצדדים. החלטתי על OAEP-SHA256 בשניהם."),
  he("**21 בנובמבר.** length-prefixed framing. הסתבר ש-TCP זה stream ולא message. הסתכלתי על RFC 1700. למדתי על endianness. השתמשתי ב-`BitConverter.IsLittleEndian` ו-`Array.Reverse`. עבד."),
  he("**28 בנובמבר.** ה-server מקבל את ה-payload, מפענח, ומדפיס JSON תקין. רגע של ניצחון. צילמתי את המסך ושלחתי לחברים. הם לא הבינו את התלהבותי."),
  spacer(),

  diagram(`
       ההתפתחות במשך נובמבר
  +-------------------------------------------+
  | סוף אוקטובר: TCP \"hello world\"          |
  +-------------------+-----------------------+
                      |
                      v
  +-------------------+-----------------------+
  | אמצע נובמבר: RSA encrypt (לא עובד)       |
  +-------------------+-----------------------+
                      |
                      v
  +-------------------+-----------------------+
  | סוף נובמבר: handshake מלא עובד            |
  +-------------------------------------------+`),
  pageBreak()
);

push(
  h("דצמבר — DB ו-Authentication", 2),
  he("**3 בדצמבר.** התקנתי MySQL. ה-installer של Oracle נורא — שעה לבחור גרסה. אבל הותקן. יצרתי טבלת users עם 5 שדות."),
  he("**8 בדצמבר.** PasswordHasher. השתמשתי ב-HMAC-SHA512. אחר-כך קראתי OWASP cheatsheet והבנתי שעדיף Argon2. שיניתי? לא. הקוד עבד. אמרתי לעצמי \"לפעם הבאה\". (לפעם הבאה לא הגיע.)"),
  he("**14 בדצמבר.** EF Core. למדתי על DbContext. הוספתי `_db.Users.Add(user)` ו-`SaveChanges`. עבד. הבנתי שזה ORM בכלל. עד אז חשבתי שזה רק \"ספרייה לDB\"."),
  he("**17 בדצמבר.** Cookie Authentication. הלכתי לפי tutorial של Microsoft. SlidingExpiration, Claims, SignInAsync. למדתי מילה חדשה: \"Principal\"."),
  he("**24 בדצמבר.** ערב חג. כתבתי את LoginForm. תקעתי על placeholder pattern (אין placeholder ב-WinForms TextBox). פתרון: שמירת טקסט ב-Tag. גאוני. (מצא את זה ב-Stack Overflow.)"),
  he("**31 בדצמבר.** סיכום שנה. עם השנה החדשה אני מקווה לסיים את ה-Web App."),
  spacer(),

  h("ינואר — הIntegration", 2),
  he("**2 בינואר.** התחלתי Web App. ASP.NET Core MVC. קודם תוכן עיצובי, אחר-כך לוגיקה. עיצוב — אדום וכהה. שוב. אני כנראה אובססיבי."),
  he("**9 בינואר.** הוספתי Dashboard view. רציתי גרפים. ניסיתי D3.js — מסובך מדי. עברתי ל-Chart.js. הרבה יותר פשוט."),
  he("**13 בינואר.** הצלחתי לחבר את הלקוח לשרת ולהציג נתונים ב-Dashboard. רעדתי. צילמתי. שלחתי למורה. הוא ענה \"יופי, תמשיך\". זה היה כל מה שצריך."),
  he("**18 בינואר.** משבר קצר. ניסיתי לעדכן interval דינמית. לא הצליח. נשבר לי הלב. ויתרתי לערב. חזרתי בלילה. הבנתי שצריך לקרוא לערך מ-API במקום מ-`appsettings`."),
  he("**26 בינואר.** SignalR. למדתי מ-YouTube — סרטון של IAmTimCorey. בהיר ויסודי. הוספתי LogHub. עבד מהקריאה הראשונה. נדיר."),
  pageBreak()
);

push(
  h("פברואר — חדשנות + עיצוב", 2),
  he("**4 בפברואר.** Admin UI. עיצבתי dashboard עם 2 panels — לוגים בצד שמאל, ניהול DB בימין. רקע כהה. נראה כמו DevTools של Chrome. אהבתי."),
  he("**11 בפברואר.** הוספתי modals של Reset Password ו-Confirm Delete. למדתי שאסור לסמוך על ה-user — תמיד לבקש אישור."),
  he("**19 בפברואר.** עיצבתי את ה-Welcome page. רציתי משהו \"וואו\". הוספתי particle background — 30 חלקיקים שצפים. כתבתי את הקוד תוך כדי צפייה בסרטון של Kevin Powell. למדתי על `@keyframes` ו-`infinite animation`."),
  he("**25 בפברואר.** באמצע הלילה. נזכרתי שאני לא בודק BIDI ב-Word כשאני יוצר ספר פרויקט. החלטתי לדחות לזה."),
  spacer(),

  h("מרץ — Bug Fixing Marathon", 2),
  he("**2 במרץ.** באג: בכל restart של השרת, ההתראות חזרו מההתחלה. הסיבה: `lastAlertTime` הוא `static Dictionary` — לא נשמר. תיעדתי. החלטתי לא לטפל בזה (out of scope לסיום השנה)."),
  he("**7 במרץ.** Owner Lock. הוספתי את המנגנון אחרי שראיתי שאחותי יכולה להיכנס לחשבון שלי באותו מחשב. תוך 30 דקות הוספתי."),
  he("**12 במרץ.** הבעיה הגדולה: ה-Client אצלי עבד מצוין. ביקשתי מחבר (יעל) לנסות במחשב שלו. נכשל. שעות של debugging. הסתבר שהוא הריץ את ה-Client אבל ה-Server רץ אצלי. הוא לא הגדיר את ה-ServerAddress. תיקנתי ב-LoginForm — הוספתי שדה ל-ServerAddress."),
  he("**21 במרץ.** EncryptionConverter. למדתי שלמרות ש-EF Core מציע HasConversion, צריך לעשות הכל static כי ה-converter נוצר פעם בכל DbContext. למדתי לעבוד עם static fields ולפעם הראשונה הבנתי למה אנשים מזהירים מהם."),
  he("**28 במרץ.** הוספתי 3 מקורות הרשאה: email, permission, owner. בהתחלה היה רק email. הוספתי owner לאפשר ל-Client אוטומטית להיות בעלים. אחר-כך permissions למקרים מיוחדים."),
  pageBreak()
);

push(
  h("אפריל — Polish", 2),
  he("**4 באפריל.** Charts. עברתי על Chart.js docs. הוספתי 3 גרפים: RAM doughnut, Temperature bar, CPU gauge. למדתי על `circumference: 180` שהופך doughnut ל-gauge."),
  he("**11 באפריל.** הוספתי auto-refresh עם `setInterval(fetchDeviceData, 5000)`. למדתי שצריך לעדכן רק את הטקסט של ה-elements, לא ליצור מחדש כל פעם."),
  he("**18 באפריל.** הוספתי Settings UI ב-Dashboard. inputs לספים, כפתורים ל-interval, רשימת alert emails."),
  he("**25 באפריל.** הוספתי ולידציה ל-email (\"@\" check). יודע שזה מינימליסטי. בעולם האמיתי הייתי משתמש ב-regex של RFC 5322."),
  spacer(),

  h("מאי — בדיקות + תיעוד", 2),
  he("**3 במאי.** התחלתי לכתוב את ספר הפרויקט. פתחתי Word. הקלדתי כותרת. סגרתי Word. ויתרתי לאותו ערב."),
  he("**10 במאי.** ניסיון 2. הפעם החלטתי לכתוב סקריפט שמייצר Word אוטומטית. השתמשתי ב-docx-js (npm). 3 ימים על helpers. 2 ימים על תוכן."),
  he("**16 במאי.** הוספתי 47 פרקים מפורטים. הספר היה 130KB."),
  he("**22 במאי.** המורה אמר שזה לא לפי ההנחיות הרשמיות של משרד החינוך. שלח לי PDF עם 6 פרקים מוגדרים: מבוא, מבנה, מימוש, מדריך, רפלקציה, ביבליוגרפיה."),
  he("**25 במאי.** שכתבתי את כל המבנה. עברתי מ-47 פרקים ל-7 פרקים גדולים. הרבה יותר טוב."),
  he("**29 במאי.** הוספתי תמונות מסך. צילמתי 5 מסכים — Login Client, Register Client, Monitor, Web Login, Dashboard."),
  spacer(),

  h("יוני — סיום", 2),
  he("**1 ביוני.** ספר הפרויקט הראשון מוכן. 845KB. נראה טוב. אני מקווה."),
  he("**5 ביוני.** עברתי על הספר. גיליתי בעיות BIDI ב-Word. למדתי על Unicode FSI/PDI marks. תיקנתי."),
  he("**9 ביוני.** מסירת הפרויקט מתקרבת. בודק שוב את הקוד. בודק את הספר. עוד תיקונים."),
  pageBreak()
);

push(
  h("טבלת באגים שתפסתי בדרך", 2),
  tbl2col("מה הבאג", "פתרון", [
    ["WMI מחזיר null לטמפרטורה", "fallback ל-LibreHardwareMonitor"],
    ["PerformanceCounter מחזיר 0", "2 calls עם Task.Delay(1000)"],
    ["RSA encrypt/decrypt לא תואמים", "התאמת padding OAEP-SHA256 בשני הצדדים"],
    ["TCP partial reads", "while loop ב-ReadLengthPrefixedAsync"],
    ["DB key mismatch בין שני projects", "סנכרון appsettings.json — כתבתי הערה"],
    ["Cookie לא נשמר", "SlidingExpiration + Cookie.IsEssential = true"],
    ["EF lazy loading קורס", "added Microsoft.EntityFrameworkCore.Proxies"],
    ["BIDI ב-Word", "FSI/PDI marks סביב English fragments"],
    ["TOC לא מתעדכן אוטו'", "F9 על ה-field"],
    ["WinForms timer fires while previous still running", "_isSending bool guard"],
    ["JSON property casing mismatch", "[JsonProperty(\"camelCase\")] על כל field"],
    ["Connection leak בTCP", "using var client = new TcpClient()"],
  ]),
  spacer(),

  h("טבלת זמן שהושקע", 2),
  tbl2col("חודש", "שעות בערך (משוערות)", [
    ["ספטמבר", "כ-15 שעות (התחלה איטית)"],
    ["אוקטובר", "כ-35 שעות (איסוף חומרה, MainForm)"],
    ["נובמבר", "כ-50 שעות (TCP + הצפנה — הקשה ביותר)"],
    ["דצמבר", "כ-40 שעות (DB + Auth)"],
    ["ינואר", "כ-45 שעות (Web App)"],
    ["פברואר", "כ-35 שעות (Admin UI + עיצוב)"],
    ["מרץ", "כ-50 שעות (bug fixing + features)"],
    ["אפריל", "כ-30 שעות (Charts + polish)"],
    ["מאי", "כ-45 שעות (בדיקות + ספר פרויקט)"],
    ["יוני", "כ-25 שעות (תיקונים + הגשה)"],
    ["**סה\"כ משוער:**", "**כ-370 שעות**"],
  ]),
  spacer(),

  h("דברים שלא הספקתי", 2),
  he("**1.** Unit tests. רציתי להוסיף בהתחלה. אחר-כך נסחפתי בפיתוח. בסוף לא נשאר זמן."),
  he("**2.** Argon2 לסיסמאות. נשארתי עם HMAC-SHA512 כי הוא \"עובד\"."),
  he("**3.** Mobile app. חשבתי על Xamarin/MAUI. ויתרתי כדי לסיים את הבסיס."),
  he("**4.** Historical data. הDB שומר רק מצב נוכחי. רציתי הוספת timeseries לאורך זמן."),
  he("**5.** Internationalization. ה-UI בעברית/אנגלית מעורבב. לא יישמתי תרגום מסודר."),
  he("**6.** CI/CD. רציתי GitHub Actions. ויתרתי."),
  he("**7.** Containerization (Docker). חשבתי על זה. לא הגעתי לזה."),
  pageBreak()
);

push(
  h("מחשבות אחרונות לפני הגשה", 2),
  he("הפרויקט הזה לימד אותי הרבה יותר ממה שציפיתי."),
  he("בהתחלה חשבתי שזה רק \"לכתוב קוד\". הסתבר שזה הרבה יותר — תכנון, debug, תיעוד, רפלקציה."),
  he("הכי קשה היה הסבלנות. כשאתה תוקע על באג 4 שעות וזה בסוף תיקון של תו אחד — לוקח כוח לא לוותר. במיוחד כשרואים שעות חולפות."),
  he("הכי מספק היה לראות הכל מתחבר. הרגע שהפעלתי את הלקוח ראיתי במייל את ההתראה הראשונה — קולגות לא הבינו למה הצחקתי לבד."),
  he("המצב יותר אישי: גם הפרויקט וגם החיים שלי לא חיכו אחד לשני. למידה למבחנים, סוף שמינית, ההרשמה לצבא — הכל קרה במקביל. למדתי לתת priorities."),
  he("אם הייתי מתחיל מחדש — הייתי כותב tests מההתחלה. הייתי לוקח שעה ביום לתיעוד תוך כדי. הייתי עושה commits יותר תכופים."),
  he("**הדבר הכי חשוב שלקחתי איתי — איך לתקוף בעיה מורכבת בצעדים קטנים. וזה שזה בסדר לוותר על משהו שלא הכרחי כדי לסיים את הבסיס.**"),
  pageBreak()
);
