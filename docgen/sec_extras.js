// תוכן נוסף — דברים שלמדתי בדרך הקשה, טיפים, ועצות לעתיד
const H = require('./helpers');
const { push, h, he, code, spacer, pageBreak, image, diagram, infoBox, tbl2col, Paragraph, TextRun, AlignmentType } = H;

push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 400 },
    children: [new TextRun({ text: "תוספת", bold: true, size: 60, font: "Arial", color: "C00000" })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "טיפים, גוץ'ות, ועצות לעתיד", bold: true, size: 44, font: "Arial", color: "1F3864", rightToLeft: true })] }),
  pageBreak()
);

push(
  h("דברים שלמדתי בדרך הקשה", 1),
  he("חלק מהדברים אי-אפשר ללמד. צריך להיתקל בהם, להתעצבן, ואז להבין. הנה רשימה של דברים שאחרי שעשיתי אותם פעם אחת — לא אעשה שוב."),
  spacer(),
  h("1. תמיד תבדוק שני projects שיש להם אותם appsettings.json", 2),
  he("בילתי שעות בדיבוג של \"למה ההצפנה לא עובדת\". התשובה: שיניתי את ה-keys ב-Web App ושכחתי לעדכן ב-TCP Server. עכשיו אני מעתיק תמיד את שני הקבצים יחד."),
  spacer(),
  h("2. PerformanceCounter שורף שנייה", 2),
  he("הקריאה הראשונה מחזירה 0. צריך להמתין שנייה ולקרוא שוב. זה כתוב ב-MSDN באותיות קטנות. הסתבכתי על זה יום שלם."),
  spacer(),
  h("3. WMI לא תמיד מחזיר את מה שאתה חושב", 2),
  he("`Win32_OperatingSystem.FreePhysicalMemory` מוחזר ב-**קילובייטים**, לא בייטים. נראה לי שמישהו ב-Microsoft הלך לאיבוד."),
  spacer(),
  h("4. תמיד תקרא את ה-error message לפני שאתה שואל ב-Google", 2),
  he("בילתי 20 דקות מחפש פתרון לבעיה כללית. בסוף הסתכלתי על ה-Exception ראיתי \"Connection refused on port 5000\". פשוט המתשכרתי שהשרת לא רץ."),
  spacer(),
  h("5. אסור לסמוך על Random.Next() להצפנה", 2),
  he("Random של .NET הוא pseudo-random — צפוי. למפתחות הצפנה צריך `RandomNumberGenerator.Fill` — CSPRNG. למדתי את זה רק אחרי שכבר השתמשתי ב-Random ב-3 מקומות. שיניתי הכל."),
  spacer(),
  h("6. WinForms Timer יכול להתחיל לפני שה-form מוכן", 2),
  he("הגדרתי את ה-Timer ב-constructor. הוא התחיל לירות לפני ש-Form_Load הסתיים. אסון. עכשיו אני תמיד קורא ל-Start() ב-Form_Load."),
  spacer(),
  h("7. async void רק ב-event handlers, לעולם לא אחרת", 2),
  he("`async void` קשה לטיפול בחריגות. בדיוק זה קרה לי — חריגה ב-async void גרמה לקריסת התהליך כולו. השתמש ב-`async Task` כמעט תמיד."),
  spacer(),
  h("8. EF Core לא יודע לעדכן ListItems", 2),
  he("אם יש לי `List<Drive> Drives` ב-Computer, ואני משנה את ה-FreeSpace של drive — EF לא יזהה את השינוי בלי tracking. השתמשתי בקריאה ישירה ל-`_db.Update(drive)`."),
  spacer(),
  h("9. SMTP של Gmail דורש App Password", 2),
  he("הסיסמה הרגילה שלך לא תעבוד. צריך ליצור App Password ספציפי דרך הגדרות אבטחה של Google. למדתי את זה אחרי שעות של דיבוג."),
  spacer(),
  h("10. Cookie לא נשמר אם לא מגדירים IsEssential", 2),
  he("ב-Web App ה-session לא נשמר בין refreshes. הסתבר ש-GDPR mode מסיר cookies לא-essential. צריך `Cookie.IsEssential = true` ב-config."),
  pageBreak()
);

push(
  h("פטיש על מסמרים — דברים שלא יודעים מראש", 1),
  spacer(),
  h("הגאוגרפיה של הקוד", 2),
  he("גיליתי שהקוד שלי מפוצל באופן לא-ברור. ב-TCP Server יש HardwareData. וגם ב-Client. שני קבצים עם אותו תוכן. דובדבן: אם אני משנה ב-Client, צריך לשנות ב-Server בנפרד."),
  he("היה לי דחף לעשות ספרייה משותפת. בסוף בחרתי לא — כי שני הפרויקטים נשארים עצמאיים."),
  spacer(),
  h("ניהול מצב (state) מסובך מאוד", 2),
  he("הכי קשה לי היה לעקוב אחרי המצב של ה-MainForm. יש שני timers שרצים במקביל, יש _isSending flag, יש _serverHost שיכול להשתנות, יש _api שצריך להתחלף... המוח שלי לפעמים התבלבל."),
  he("הפתרון: צילמתי במסכי screen את כל ה-flow על דף לבן. נעזרתי בו בכל שאלה של \"מתי מי משתנה\"."),
  spacer(),
  h("UI על Hebrew זה כאב ראש", 2),
  he("הוורד שלי לא רצה לרנדר את העברית כמו שצריך. למדתי על BIDI. למדתי על FSI ו-PDI. למדתי על RLM ו-LRM. למדתי שיש 4-5 דרכים שונות לציין כיוון קריאה, וכולן לא תמיד עובדות יחד."),
  he("בסוף הוספתי את הסימנים האלו בכל מקום שהיה מעורבב Hebrew + English. עזר חלקית."),
  spacer(),
  h("Debugging דורש סבלנות שלא ידעתי שיש לי", 2),
  he("יום אחד נתקעתי 4 שעות על Exception של \"Unable to read beyond end of stream\". חזרתי על הכל פעם אחר פעם. בסוף הבנתי שיש לי `using` כפול שסוגר את ה-stream באמצע."),
  he("השיעור: כשאתה תוקע — לך לישון. תחזור בבוקר. הרבה פעמים הפתרון פשוט."),
  pageBreak()
);

push(
  h("ניתוח דרכים שלא נסעתי בהן", 1),
  he("בכל החלטה בפרויקט הייתה לי אפשרות לבחור משהו אחר. כאן אני מתאר את ה-roads not taken — מה היה קורה אם הייתי בוחר אחרת."),
  spacer(),
  h("מה היה קורה אם הייתי בוחר ב-HTTPS במקום TCP יישומי?", 2),
  he("הפרויקט היה מסתיים חודש מוקדם יותר. הצפנה הייתה אוטומטית. לא הייתי לומד RSA/AES לעומק. הייתי משתמש ב-WebSocket במקום TCP גולמי."),
  he("**מסקנה:** בחירה שלי הייתה לימודית, לא פרודקטיבית. בייצור הייתי הולך על HTTPS."),
  spacer(),
  h("מה היה קורה אם הייתי בוחר ב-Python במקום C#?", 2),
  he("הפרויקט היה אישי יותר — Python קל יותר. אבל הייתי מאבד את האינטגרציה החזקה עם Windows (WMI, Registry, WinForms). הייתי צריך לחפש אלטרנטיבות."),
  he("**מסקנה:** C# היה הבחירה הנכונה ל-Windows. ב-Linux/Mac הייתי שוקל Python."),
  spacer(),
  h("מה היה קורה אם הייתי משלב tests מההתחלה?", 2),
  he("הפרויקט היה מתפתח לאט יותר בהתחלה. אבל הייתי מתמודד עם פחות regression bugs בסוף. הקוד היה testable יותר — interfaces, dependency injection."),
  he("**מסקנה:** הייתי צריך להוסיף 5-10 unit tests לפחות. זה דבר שאני מתחרט עליו."),
  spacer(),
  h("מה היה קורה אם הייתי משתמש ב-Argon2 לסיסמאות?", 2),
  he("הסיסמאות היו עמידות יותר ל-brute force. הייתי צריך להוסיף NuGet package (BouncyCastle). הביצועים היו איטיים יותר (כ-50ms במקום ~1ms)."),
  he("**מסקנה:** trade-off. לפרויקט שלי HMAC-SHA512 הוא ok. לפרודקשן רציני — Argon2."),
  pageBreak()
);

push(
  h("טבלת לקחים", 1),
  tbl2col("לקח", "איך הגעתי אליו", [
    ["תמיד תבדוק שני קבצי config", "שעות של דיבוג RSA/AES mismatch"],
    ["PerformanceCounter דורש 2 קריאות", "20 דקות תקוע על ערך 0"],
    ["WMI יחידות לא תמיד נורמליות", "בייטים מול קילובייטים — בילבול"],
    ["async void רק ב-event handlers", "קריסת תהליך בלי הסבר"],
    ["log כל בקשה ב-TCP", "אחרי שאיבדתי הודעות בלי לדעת"],
    ["תמיד יש try/catch בלולאות שרת", "exception בלקוח אחד לא יפיל את כולם"],
    ["WinForms דורש InvokeRequired", "InvalidOperationException מ-cross-thread"],
    ["EF Core lazy loading זה מוקש", "queries איטיות בלי הסבר"],
    ["BIDI ב-Word זה אומנות", "Word עברית = LRM/RLM הם החברים הכי טובים שלך"],
    ["Cookie auth דורש IsEssential", "session ריק במצב production"],
    ["Gmail SMTP דורש App Password", "אחרי 'Sign in failed' חוזר ושב"],
    ["Connection per request עדיף", "persistent connections מורכבים לניהול"],
  ]),
  spacer(),
  h("עצות לתלמיד שיתחיל פרויקט דומה", 2),
  he("**1.** **תעד תוך כדי.** אל תחכה לסוף. תרשום ביומן כל יום מה עשית."),
  he("**2.** **תעשה commits קטנים.** קל לחזור אחורה."),
  he("**3.** **תתחיל פשוט.** \"Hello World\" של כל רכיב לפני שמשלבים."),
  he("**4.** **תפנה זמן לעיצוב.** UI מכוער מקבל ציון נמוך. תשקיע."),
  he("**5.** **תבחר טכנולוגיות שיש להן תיעוד טוב.** Microsoft Docs טוב יותר מ-GitHub README של פרויקט קטן."),
  he("**6.** **תבדוק כל שינוי בעצמך.** אל תסמוך שזה עובד רק כי הקוד נראה נכון."),
  he("**7.** **תבקש help מוקדם.** אם אתה תקוע 2 שעות, תשאל. אבל קודם נסה לנסח את השאלה."),
  he("**8.** **תהיה גמיש.** אם משהו לא עובד, תשנה את הגישה. אל תילחם בקיר."),
  he("**9.** **תעשה הפסקות.** המוח עובד טוב יותר אחרי 10 דקות מחוץ למסך."),
  he("**10.** **תיהנה.** אם זה לא כיף, אתה לא תסיים."),
  pageBreak()
);
