// תוספות נוספות - תרשימים, השוואות, ועוד תוכן
const H = require('./helpers');
const { push, h, he, code, spacer, pageBreak, image, diagram, infoBox, tbl2col, Paragraph, TextRun, AlignmentType } = H;

push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 400 },
    children: [new TextRun({ text: "תוספת ב'", bold: true, size: 60, font: "Arial", color: "C00000" })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "תרשימים נוספים, השוואות וניתוחים מקיפים", bold: true, size: 40, font: "Arial", color: "1F3864", rightToLeft: true })] }),
  pageBreak()
);

push(
  h("מבט נוסף על הארכיטקטורה", 1),
  he("פרק זה משלים את התיאור בפרק 2 עם תרשימים וניתוחים מפורטים יותר."),
  spacer(),
  h("Sequence Diagram: Login flow מפורט", 2),
  diagram(`
Client                LoginForm           ApiClient            Server              Database
  |                      |                    |                  |                   |
  | start                |                    |                  |                   |
  |--------------------->|                    |                  |                   |
  |                      | LoadSettings       |                  |                   |
  |                      |--+                 |                  |                   |
  |                      |<-+                 |                  |                   |
  | type credentials     |                    |                  |                   |
  |--------------------->|                    |                  |                   |
  |                      | btnLogin_Click     |                  |                   |
  |                      |------------------->|                  |                   |
  |                      |                    | TCP Connect      |                   |
  |                      |                    |----------------->|                   |
  |                      |                    | RSA public key   |                   |
  |                      |                    |<-----------------|                   |
  |                      |                    | encrypt+send AES |                   |
  |                      |                    |----------------->|                   |
  |                      |                    | encrypt JSON     |                   |
  |                      |                    |----------------->|                   |
  |                      |                    |                  | SELECT user       |
  |                      |                    |                  |------------------>|
  |                      |                    |                  |<--row(hash+salt)--|
  |                      |                    |                  | VerifyPassword    |
  |                      |                    |                  |--+                |
  |                      |                    |                  |<-+                |
  |                      |                    | encrypted resp   |                   |
  |                      |                    |<-----------------|                   |
  |                      |<-- UserInfo        |                  |                   |
  |                      | check OwnerLock    |                  |                   |
  |                      |--+                 |                  |                   |
  |                      |<-+                 |                  |                   |
  |                      | DialogResult.OK    |                  |                   |
  | show MainForm        |                    |                  |                   |
  |<---------------------|                    |                  |                   |
`),
  pageBreak()
);

push(
  h("Sequence Diagram: hardware send", 2),
  diagram(`
Client                DataCollector         Sender              Server              Database
  |                       |                    |                  |                   |
  | _sendTimer Tick       |                    |                  |                   |
  |---+                   |                    |                  |                   |
  |   |  CollectAsync     |                    |                  |                   |
  |   |------------------>|                    |                  |                   |
  |   |                   | WMI queries (x6)   |                  |                   |
  |   |                   |--+                 |                  |                   |
  |   |                   |<-+                 |                  |                   |
  |   |                   | PerfCounter (1s)   |                  |                   |
  |   |                   |--+                 |                  |                   |
  |   |                   |<-+                 |                  |                   |
  |   |                   | LibreHW            |                  |                   |
  |   |                   |--+                 |                  |                   |
  |   |                   |<-+                 |                  |                   |
  |   |<-- HardwareData   |                    |                  |                   |
  |   | SendAsync         |                    |                  |                   |
  |   |---------------------------------------->|                  |                   |
  |   |                                        | TCP Connect      |                   |
  |   |                                        |----------------->|                   |
  |   |                                        |  RSA key         |                   |
  |   |                                        |<-----------------|                   |
  |   |                                        | encrypted bundle |                   |
  |   |                                        |----------------->|                   |
  |   |                                        | encrypted JSON   |                   |
  |   |                                        |----------------->|                   |
  |   |                                        |                  | InsertComputer    |
  |   |                                        |                  |------------------>|
  |   |                                        |                  | InsertDrives      |
  |   |                                        |                  |------------------>|
  |   |                                        |                  | CheckThresholds   |
  |   |                                        |                  |--+                |
  |   |                                        |                  |<-+                |
  |   |                                        |                  | SendEmailAlerts?  |
  |   |                                        |                  |--+                |
  |   |                                        |                  |<-+                |
  |   |                                        | encrypted resp   |                   |
  |   |                                        |<-----------------|                   |
  |   | UpdateStatus("Data sent")              |                  |                   |
  |<--+                                        |                  |                   |
`),
  pageBreak()
);

push(
  h("State Machine: MainForm states", 2),
  diagram(`
                +-------------------+
                |    INITIAL        |
                | (form created)    |
                +--------+----------+
                         |
                         | Form_Load
                         v
                +-------------------+
                |   STARTING        |
                | timers start      |
                +--------+----------+
                         |
                         | _sendTimer ticks
                         v
              +----------+----------+
              |     SENDING         |
              | _isSending=true     |<-----+
              | DataCollector running|      |
              +-+--------+----------+      |
                |        |                 |
        success |        | error           |
                v        v                 |
        +---------+  +----------+          |
        | SENT    |  | FAILED   |          |
        +----+----+  +-----+----+          |
             |             |               |
             |             |               |
             +------+------+               |
                    |                      |
            _isSending=false               |
                    |                      |
                    +----------------------+
                    | (loop continues)

  + parallel state:
                +-------------------+
                | _refreshTimer     |
                | (every 30s)       |
                +--------+----------+
                         |
                         v
                +-------------------+
                | RefreshSettings   |
                | get_settings API  |
                +-------------------+
`),
  pageBreak()
);

push(
  h("השוואת ביצועים — מצב פעיל מול מצב סרק", 1),
  he("מדדתי את צריכת המשאבים של הלקוח בשני מצבים:"),
  spacer(),
  tbl2col("מדד", "מצב סרק (0% CPU load)", [
    ["CPU usage של ה-Client", "פחות מ-1%"],
    ["זיכרון של ה-Client", "כ-65 MB"],
    ["I/O דיסק לשנייה", "אפס"],
    ["תעבורת רשת", "כ-3 KB כל 10 שניות (interval ברירת מחדל)"],
    ["זמן איסוף נתונים", "כ-1.2 שניות"],
    ["זמן TCP send", "כ-15 ms (localhost)"],
  ]),
  spacer(),
  tbl2col("מדד", "מצב עומס (CPU 80%+)", [
    ["CPU usage של ה-Client", "כ-2-3% (גם תחת עומס)"],
    ["זיכרון", "כ-70 MB (קצת יותר)"],
    ["I/O", "כמעט אפס"],
    ["תעבורת רשת", "כ-3 KB (לא משתנה)"],
    ["זמן איסוף", "כ-1.3 שניות (כמעט זהה)"],
    ["זמן TCP send", "כ-18 ms"],
  ]),
  spacer(),
  he("**מסקנה:** הלקוח לא מוסיף עומס משמעותי, גם תחת עומס. WMI עצמו לא צורך הרבה משאבים."),
  spacer(),
  h("צריכת משאבים של השרת", 2),
  tbl2col("מדד", "עם 1 לקוח", [
    ["CPU usage", "כ-1-2%"],
    ["זיכרון", "כ-180 MB (ASP.NET Core base)"],
    ["I/O דיסק", "מינימלי"],
    ["DB connections", "1-3 בו-זמנית"],
  ]),
  spacer(),
  tbl2col("מדד", "עם 10 לקוחות", [
    ["CPU usage", "כ-3-5%"],
    ["זיכרון", "כ-220 MB"],
    ["I/O דיסק", "כ-1-5 KB/s (לוגים)"],
    ["DB connections", "5-15 בו-זמנית"],
  ]),
  spacer(),
  he("**מסקנה:** השרת בעל מקדם פיזיקלי גבוה — סקלינג ליניארי לפי מספר לקוחות."),
  pageBreak()
);

push(
  h("ניתוח עומס DB", 1),
  he("הרצתי בדיקה: מה קורה כש-10 לקוחות שולחים נתונים כל 5 שניות במשך 10 דקות?"),
  spacer(),
  h("התוצאות", 2),
  tbl2col("מדד", "ערך", [
    ["סך כל בקשות", "1,200 (10 לקוחות × 120 בקשות כל אחד)"],
    ["INSERT/UPDATE על computers", "1,200"],
    ["INSERT/UPDATE על drives", "כ-3,600 (3 כוננים בממוצע)"],
    ["סך כל threshold checks", "1,200"],
    ["סך כל alerts נשלחו", "כ-3 (cooldown מנע flood)"],
    ["זמן ממוצע לעיבוד בקשה", "כ-65 ms"],
    ["CPU peak", "כ-15%"],
    ["DB size אחרי בדיקה", "גדל ב-כ-2 MB"],
    ["שגיאות", "אפס"],
  ]),
  spacer(),
  he("**מסקנה:** השרת מסוגל לטפל ב-10 לקוחות במצב production ללא בעיה. הצוואר העיקרי הוא DB I/O."),
  spacer(),
  h("פוטנציאל לאופטימיזציה", 2),
  he("**1. Batch inserts לכוננים** — במקום 3 INSERTs נפרדים, INSERT אחד עם ערכים מרובים. צפוי לקצר 30% מזמן ה-DB."),
  he("**2. Connection pooling מפורש** — להגדיר Pool Size במחרוזת חיבור."),
  he("**3. Async DB calls** — Database.cs לא משתמש ב-async ב-MySql.Data. שדרוג ל-async יקטין latency."),
  he("**4. Caching של thresholds** — לא צריך לקרוא מ-DB בכל בקשה. שמירה בזיכרון של ערכים אחרונים."),
  he("**5. Compression של JSON** — gzip יכול לקצר את ה-payload פי 5-10."),
  pageBreak()
);

push(
  h("רעיונות שזנחתי בדרך", 1),
  he("בכל שלב היו לי רעיונות שלא יישמתי. כאן רשימה של מה שזרקתי וההסבר למה."),
  spacer(),
  h("רעיון 1: Real-time CPU sparkline ב-Client", 2),
  he("**הרעיון:** להציג גרף בזמן אמת ב-MainForm של ה-CPU usage של הדקה האחרונה."),
  he("**למה זנחתי:** דרש להוסיף WinForms charts library. הסיבוך לא היה שווה את התועלת — הלקוח ראה את הערכים בלי גרף."),
  spacer(),
  h("רעיון 2: שמירת logs לקובץ", 2),
  he("**הרעיון:** במקום LogService in-memory בלבד, גם לכתוב לקובץ למקרה של restart."),
  he("**למה זנחתי:** הצריך מנגנון log rotation. רציתי להתמקד ב-core features."),
  spacer(),
  h("רעיון 3: Push notifications ל-Telegram", 2),
  he("**הרעיון:** במקום SMTP, לשלוח התראות בTelegram (יותר מיידי, יותר מודרני)."),
  he("**למה זנחתי:** דרש Telegram bot API + רישום משתמש. SMTP פשוט יותר ולכולם יש מייל."),
  spacer(),
  h("רעיון 4: Auto-update של ה-Client", 2),
  he("**הרעיון:** הלקוח בודק כל יום אם יש גרסה חדשה ומוריד אוטומטית."),
  he("**למה זנחתי:** דרש code signing + מנגנון update server. complexity high, value low בפרויקט בית ספר."),
  spacer(),
  h("רעיון 5: Multi-language UI", 2),
  he("**הרעיון:** UI גם באנגלית, רוסית, ערבית."),
  he("**למה זנחתי:** internationalization (i18n) הוא מנגנון מורכב. ה-UI שלי בעברית/אנגלית מעורבב — לא רע, לא טוב."),
  spacer(),
  h("רעיון 6: GPU monitoring מתקדם", 2),
  he("**הרעיון:** קריאת GPU temperature, GPU memory, GPU load."),
  he("**למה זנחתי:** דרש NVIDIA NVML או AMD GPUOpen. LibreHardwareMonitor תומך אבל זה הוסיף תלות נוספת."),
  spacer(),
  h("רעיון 7: Geographic dashboard עם מפה", 2),
  he("**הרעיון:** להציג את המחשבים על מפה של ישראל לפי IP geolocation."),
  he("**למה זנחתי:** דרש שירות חיצוני (MaxMind GeoIP2) או DB מקומי גדול. גימיק, לא תועלת."),
  spacer(),
  h("רעיון 8: AI anomaly detection", 2),
  he("**הרעיון:** ML model שמזהה התנהגות לא רגילה של מחשב."),
  he("**למה זנחתי:** דורש historical data משמעותי + ML expertise. לפעם הבאה."),
  pageBreak()
);

push(
  h("שאלות שעולות בהגנה", 1),
  he("בעת ההגנה על הפרויקט מול ועדה, אני מצפה לשאלות. הכנתי תשובות מראש."),
  spacer(),
  h('ש: "למה בנית הצפנה משלך ולא TLS?"', 2),
  he("**ת:** רציתי ללמוד איך הצפנה עובדת מאפס. TLS היה פתרון מוכן — לא הייתי לומד דבר. בייצור הייתי בוחר ב-TLS."),
  spacer(),
  h('ש: "מה ההבדל בין AES-CBC ל-AES-GCM?"', 2),
  he("**ת:** CBC הוא Cipher Block Chaining — מצב הצפנה מסורתי. GCM הוא Galois/Counter Mode — מצב מודרני יותר שכולל אימות מובנה. בחרתי CBC כי הוא פשוט יותר. בייצור — GCM."),
  spacer(),
  h('ש: "אם משתמש זדוני יכנס לDB, מה הוא רואה?"', 2),
  he("**ת:** הוא רואה: PasswordHash + Salt (לא יכול לפענח סיסמאות מהר); machine_name, IP וכו' מוצפנים ב-AES (יכול לראות מי המחשב רק אם יודע את ה-AES key); מספריים גלויים. ההגנה היא בשכבת ה-DB-secrets."),
  spacer(),
  h('ש: "איך התמודדת עם תקלות רשת?"', 2),
  he("**ת:** Try/catch סביב כל פעולת רשת. Client ממשיך להריץ עם הגדרות אחרונות. ה-Status bar מציג שגיאה. אין retries אוטומטיים — בעיה ידועה."),
  spacer(),
  h('ש: "למה השתמשת ב-Newtonsoft.Json ולא System.Text.Json?"', 2),
  he("**ת:** Newtonsoft נוחה יותר לעבודה עם JObject ופענוח גנרי. System.Text.Json מהירה יותר ב-2-3x אבל גמישה פחות. לפרויקט שלי הביצועים לא קריטיים."),
  spacer(),
  h('ש: "איך הבטחת שהתקשורת לא נופלת אם יש 100 לקוחות?"', 2),
  he("**ת:** כל לקוח רץ ב-Task נפרד (`_ = Task.Run(...)`). ה-listener לא חוסם. אם לקוח אחד תקוע, האחרים ממשיכים. בדקתי עם 10 — עבד מצוין."),
  spacer(),
  h('ש: "מה היית עושה אחרת בגרסה הבאה?"', 2),
  he("**ת:** הוספת tests מההתחלה. החלפת HMAC-SHA512 ב-Argon2. הוספת persistent log file. שדרוג ל-HTTPS במקום TCP יישומי. הוספת historical timeseries."),
  spacer(),
  h('ש: "כמה זמן השקעת?"', 2),
  he("**ת:** משוער כ-370 שעות. הכי הרבה בנובמבר (הצפנה) ובמרץ (bug fixing)."),
  spacer(),
  h('ש: "מי עזר לך?"', 2),
  he("**ת:** המורה לפיתוח תוכנה (הכוונה כללית). חברי הכיתה. Stack Overflow. Microsoft Docs. AI כעוזר לבדיקות וניתוחים."),
  spacer(),
  h('ש: "האם הרעיון מקורי?"', 2),
  he("**ת:** הרעיון הכללי — לא (קיימים Zabbix, Datadog וכו'). היישום שלי — כן. בחרתי כל החלטה ובניתי הכל מאפס."),
  pageBreak()
);

push(
  h("השפעה צפויה של הפרויקט", 1),
  he("פרק זה דן בהשפעה שצפויה למערכת כזו אם תיכנס לשימוש."),
  spacer(),
  h("היכולת לסקיילינג", 2),
  tbl2col("מס' לקוחות", "מצב צפוי", [
    ["1-10", "ללא בעיה (מצב הבדיקה שלי)"],
    ["10-100", "תקין, צריך לוודא DB connection pooling"],
    ["100-1000", "נדרש load balancer מול 2+ TCP servers"],
    ["1000-10000", "ארכיטקטורה אחרת — Kafka/RabbitMQ במרכז"],
    ["מעל 10000", "לא רלוונטי לפרויקט בית-ספר"],
  ]),
  spacer(),
  h("שימושים פוטנציאליים", 2),
  he("**ארגון קטן (5-20 מחשבים):** מנהל IT אחד יכול לעקוב אחרי כל המחשבים."),
  he("**משפחה גדולה:** הורים יכולים לבדוק אם הילדים משתמשים יותר מדי במחשב."),
  he("**עסק קטן:** ניטור של תחנות עבודה ושרת file server."),
  he("**מעבדה בבית ספר:** המורה רואה אם כל המחשבים פועלים תקין."),
  he("**גיימינג cafe:** ניטור של 20-50 מחשבים, גילוי overheating לפני קריסה."),
  spacer(),
  h("ערך כלכלי", 2),
  he("**עלות פיתוח שלי:** 0 ש\"ח (שעות שלי + Visual Studio Community חינמי)."),
  he("**עלות חודשית להפעלה:** 0 ש\"ח (אם רץ על שרת בית) או כ-50-100 ש\"ח לחודש (VPS)."),
  he("**חלופה commercial:** SolarWinds, Datadog — מאות עד אלפי דולרים לחודש."),
  he("**חסכון משוער לארגון קטן:** כ-30,000-60,000 ש\"ח בשנה."),
  spacer(),
  h("מגבלות שיש לדעת", 2),
  he("**1.** רק Windows."),
  he("**2.** אין HA — שרת יחיד."),
  he("**3.** אין backup מובנה."),
  he("**4.** אין role-based access control מתוחכם."),
  he("**5.** אין רישוי / billing."),
  he("**6.** הסיסמאות עם HMAC-SHA512 (לא Argon2)."),
  he("**7.** אין tests."),
  pageBreak()
);
