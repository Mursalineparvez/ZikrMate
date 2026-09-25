# 🌙 ZikrMate — Digital Zikir & Tasbeeh Counter

**ZikrMate** is a beautiful, modern, responsive, and easy-to-use digital Zikir/Tasbeeh counter designed to help users organize and track their daily Zikir.

ZikrMate provides **separate counters for every Zikir**, automatic saving of counting progress, customizable targets, a real-time **central total counter**, responsive support for mobile and laptop devices, and offline-friendly functionality.

The core concept of ZikrMate is simple:

> **Every Zikir has its own independent counter, while the central counter displays the total count of all Zikir combined.**

---

## ✨ Features

### 🔢 Independent Zikir Counters

Each Zikir has its own completely independent counter.

For example:

```text
SubhanAllah        33
Alhamdulillah      50
Allahu Akbar      100
La ilaha illallah  25
```

If the user increases **SubhanAllah**, only the SubhanAllah counter changes.

The other Zikir counters remain unchanged.

This makes ZikrMate suitable for users who want to track several different Zikir at the same time.

---

### 🔵 Central Total Counter

ZikrMate includes a large and clearly visible **central total counter**.

The total is calculated from all individual Zikir counters.

For example:

```text
SubhanAllah        = 33
Alhamdulillah      = 50
Allahu Akbar       = 100
La ilaha illallah  = 25
--------------------------------
Total              = 208
```

The central counter displays:

# 208

Whenever any individual Zikir counter changes, the central total updates automatically.

The central counter is calculated from the individual counters rather than maintained as a separate manual count, helping keep the total accurate.

---

## 💾 Automatic Saving

ZikrMate automatically saves counting progress.

Users do not need to manually save their counters after every session.

For example, if the user closes the application after reaching:

```text
SubhanAllah       33
Alhamdulillah     50
Allahu Akbar     100
```

the same values can be restored when the application is opened again.

This helps prevent accidental loss of daily Zikir progress.

---

## 🎯 Individual Targets

Users can set a different target for every Zikir.

Example:

```text
SubhanAllah

Current: 33
Target: 100
Progress: 33%
```

Another Zikir could have a completely different target:

```text
Darood Sharif

Current: 25
Target: 50
Progress: 50%
```

This allows users to create their own personalized Zikir routine.

---

## ➕ Add Zikir

Users can add their own Zikir to ZikrMate.

A new Zikir can include:

* Zikir name
* Target count
* Current count

Example:

```text
Name:
Astaghfirullah

Target:
100

Current:
0
```

This makes the application flexible instead of restricting users to a fixed list of Zikir.

---

## ✏️ Edit Zikir

Existing Zikir can be edited whenever required.

Users can change information such as:

* Zikir name
* Target count
* Other available settings

This makes it easy to maintain a personalized Zikir collection.

---

## 🗑️ Delete Zikir

Users can remove Zikir they no longer need.

A confirmation step can be displayed before deletion to help prevent accidental removal.

Deleting a Zikir also removes its count from the central total.

---

## 🔄 Reset Counter

ZikrMate supports individual counter reset.

For example:

```text
SubhanAllah → 75
```

can be reset to:

```text
SubhanAllah → 0
```

without affecting:

```text
Alhamdulillah → 50
Allahu Akbar → 100
```

---

## ♻️ Reset All Counters

Users can optionally reset all Zikir counters together.

Because this action can remove saved progress, ZikrMate should ask for confirmation before resetting all counters.

After confirmation:

```text
SubhanAllah       0
Alhamdulillah     0
Allahu Akbar      0
Darood Sharif     0
```

The central total also becomes:

```text
TOTAL: 0
```

---

# 📱 Mobile Friendly

ZikrMate is designed to work comfortably on smartphones.

The mobile interface focuses on:

* Large counter numbers
* Large touch-friendly buttons
* Easy one-handed interaction
* Simple navigation
* Responsive cards
* Clear visual feedback
* Comfortable spacing

The application can be used on different screen sizes without requiring a separate mobile version.

---

# 💻 Laptop & Desktop Friendly

ZikrMate also supports larger screens.

On laptops and desktops, Zikir cards can automatically arrange themselves into a responsive grid.

Example:

```text
┌────────────────────────────────────────────┐
│                  ZIKRMATE                  │
│                                            │
│                    208                     │
│                 TOTAL ZIKIR                │
│                                            │
│  ┌────────────┐       ┌────────────┐       │
│  │ SubhanAllah│       │Alhamdulillah│      │
│  │     33     │       │     50     │       │
│  │     +      │       │     +      │       │
│  └────────────┘       └────────────┘       │
│                                            │
│  ┌────────────┐       ┌────────────┐       │
│  │Allahu Akbar│       │Darood      │       │
│  │    100     │       │     25     │       │
│  │     +      │       │     +      │       │
│  └────────────┘       └────────────┘       │
└────────────────────────────────────────────┘
```

The layout automatically adapts to the available screen size.

---

# 🌐 Offline-Friendly

ZikrMate is designed with an offline-first approach.

Counting should continue to work even when an internet connection is unavailable.

Local storage technology can be used to save:

* Zikir names
* Individual counts
* Target counts
* User preferences
* Application settings

This makes ZikrMate suitable for everyday use regardless of internet availability.

---

# 📲 Progressive Web App

ZikrMate can be developed as a **Progressive Web App (PWA)**.

A supported browser can allow users to install the application on their device.

A PWA can provide:

* App-like experience
* Offline functionality
* Fast loading
* Installable application
* Responsive interface
* Home-screen access

---

# 🤖 Android APK

ZikrMate can also be packaged as an Android application.

A possible development process is:

```text
ZikrMate Web Application
          ↓
       PWA Build
          ↓
   Android Packaging
          ↓
     Android Studio
          ↓
       APK / AAB
```

This allows the same core application to be used on Android phones.

---

# 🎨 Beautiful User Interface

ZikrMate is designed around a clean and peaceful interface.

The UI focuses on:

* Minimal distractions
* Clear typography
* Large counters
* Simple controls
* Comfortable spacing
* Responsive layouts
* Accessible buttons
* Islamic-inspired visual design

The goal is to keep the interface visually attractive without making the counting experience complicated.

---

# 🌙 Dark & Light Themes

ZikrMate can support both light and dark themes.

### ☀️ Light Mode

A bright and clean interface suitable for daytime use.

### 🌙 Dark Mode

A comfortable darker interface suitable for nighttime use.

Users can optionally select their preferred theme from Settings.

---

# 📳 Vibration Feedback

For mobile devices, ZikrMate can optionally provide vibration feedback when the user increments a counter.

Users can enable or disable vibration from Settings.

Example:

```text
Settings

Vibration
[ ON ]

Sound
[ OFF ]
```

---

# 🔊 Optional Counting Sound

ZikrMate can optionally provide a subtle sound when counting.

The sound feature can be disabled when users prefer a silent experience.

---

# ⚙️ Settings

The Settings section can provide controls for:

* Light/Dark theme
* Vibration
* Sound
* Reset all counters
* Clear saved data
* Application information

Settings should remain simple and easy to understand.

---

# 🧮 Smart Counter System

The counter system is designed around independent Zikir data.

Example:

```text
Zikir A = 10
Zikir B = 25
Zikir C = 50
```

Total:

```text
10 + 25 + 50 = 85
```

If Zikir A is increased:

```text
Zikir A = 11
```

the application automatically calculates:

```text
11 + 25 + 50 = 86
```

Therefore:

```text
Zikir A → 11
Zikir B → 25
Zikir C → 50
Total   → 86
```

Only the selected Zikir counter changes.

---

# 💡 Example Daily Usage

A user could create the following Zikir list:

```text
┌────────────────────────────────┐
│ SubhanAllah                    │
│ 33 / 100                       │
│                                │
│             [ + ]              │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Alhamdulillah                  │
│ 50 / 100                       │
│                                │
│             [ + ]              │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Allahu Akbar                   │
│ 100 / 100                      │
│                                │
│             [ + ]              │
└────────────────────────────────┘
```

The central counter would display:

```text
183
TOTAL ZIKIR
```

This provides both individual progress and an overall total.

---

# 🗃️ Data Structure

A Zikir entry can be represented using a structure similar to:

```json
{
  "id": "unique-id",
  "name": "SubhanAllah",
  "count": 33,
  "target": 100,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Multiple Zikir entries can be stored together.

The total counter can then be calculated from the `count` value of every entry.

---

# 🔐 Data Safety & Integrity

ZikrMate should keep each Zikir counter independent.

For example:

```text
SubhanAllah       10
Alhamdulillah     25
Allahu Akbar      50
```

If the user increments Alhamdulillah:

```text
SubhanAllah       10
Alhamdulillah     26
Allahu Akbar      50
```

The new total becomes:

```text
10 + 26 + 50 = 86
```

This prevents counters from accidentally sharing or overwriting each other's values.

---

# 🛠️ Technology

ZikrMate can be built using modern web technologies such as:

* HTML5
* CSS3
* JavaScript / TypeScript
* Responsive Web Design
* Local Storage
* IndexedDB
* Progressive Web App
* Service Worker
* Android packaging
* Android Studio

A modern frontend framework can also be used if required.

---

# 📂 Suggested Project Structure

```text
ZikrMate/
│
├── src/
│   ├── components/
│   │   ├── CenterCounter/
│   │   ├── ZikirCard/
│   │   ├── AddZikir/
│   │   ├── EditZikir/
│   │   └── Settings/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   └── Settings/
│   │
│   ├── data/
│   │   └── storage/
│   │
│   ├── utils/
│   │   ├── counter/
│   │   └── calculations/
│   │
│   └── styles/
│
├── public/
│   ├── icons/
│   ├── manifest.json
│   └── service-worker.js
│
├── README.md
├── package.json
└── LICENSE
```

---

# 🚀 Future Features

ZikrMate can be expanded in the future with additional features such as:

* 📅 Daily Zikir tracking
* 📊 Daily statistics
* 📈 Progress charts
* 🗓️ Weekly and monthly history
* 🔔 Optional Zikir reminders
* ☁️ Cloud backup
* 🔄 Multi-device synchronization
* 🌍 Multiple language support
* 🇧🇩 Bengali language support
* 🇸🇦 Arabic Zikir text
* 📖 Zikir information and references
* 📤 Export Zikir data
* 📥 Import saved data
* 🏆 Personal milestones
* 🔐 Optional user accounts
* 📱 Google Play Store distribution

These features can be introduced gradually while keeping the core counter system simple.

---

# 🎯 Project Objectives

The main objectives of ZikrMate are:

1. Provide a simple digital alternative to a traditional Tasbeeh counter.
2. Allow users to maintain multiple independent Zikir counters.
3. Automatically save counting progress.
4. Provide a real-time combined Zikir total.
5. Support personalized Zikir targets.
6. Provide a responsive experience across phones, tablets, and laptops.
7. Support offline usage.
8. Provide a clean and peaceful user interface.
9. Make the application easy to use for daily Zikir.
10. Provide a foundation for future Zikir tracking and statistics features.

---

# 📌 Core Logic

The most important rule in ZikrMate is:

```text
Every Zikir = Independent Counter
```

and:

```text
Central Total = Sum of All Zikir Counters
```

For example:

```text
SubhanAllah       = 33
Alhamdulillah     = 50
Allahu Akbar      = 100
Darood Sharif     = 25

Central Total:
33 + 50 + 100 + 25

= 208
```

If one counter changes, the central total updates automatically.

---

# ❤️ Project Vision

ZikrMate aims to combine the simplicity of a traditional Tasbeeh with the convenience of modern technology.

The application is designed to be:

**Simple.
Beautiful.
Responsive.
Reliable.
Easy to use.
Available anywhere.**

Whether someone is using a smartphone during daily activities or a laptop at home, ZikrMate provides an organized way to maintain multiple Zikir counters and keep track of overall progress.

---

# 🌙 ZikrMate

### Your Digital Companion for Daily Zikir.

> **Count. Save. Remember. Repeat.**

---

## 📜 License

This project can be distributed under an appropriate open-source license such as the MIT License. The final license should be selected according to the project's intended usage and distribution.

---

## 🤝 Contributions

Contributions, suggestions, bug reports, and feature requests are welcome.

If you would like to improve ZikrMate:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Test the application.
5. Commit your changes.
6. Open a Pull Request.

---

## ⭐ Support the Project

If you find **ZikrMate** useful, consider giving the repository a ⭐ on GitHub.

Your support can help the project grow and encourage future improvements.

---

**ZikrMate — Your Digital Companion for Daily Zikir. 🌙**
