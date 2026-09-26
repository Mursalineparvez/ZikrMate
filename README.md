# 🌙 ZikrMate

### **A Modern Islamic Companion for Zikir, Quran, Hadith, Salat, Dua & Daily Aamal**

> **Remember. Reflect. Pray. Track. Grow.**

**ZikrMate** is a modern Islamic companion platform designed to bring essential daily worship and Islamic resources together in one calm, intelligent, and beautifully structured digital experience.

Rather than functioning as only a Tasbeeh counter, ZikrMate combines **Zikir, Quran, Kitab Library, Hadith, Salat Times, Dua, and Aamal Tracking** within a unified application architecture.

The application is designed around a simple philosophy:

> **One peaceful space for everyday remembrance, learning, worship, and reflection.**

---

## ✨ The Idea Behind ZikrMate

Modern users often depend on multiple applications for different Islamic activities—one for prayer times, another for Quran, another for Zikir, and another for Islamic books.

**ZikrMate brings these experiences together.**

```text
                         🌙 ZIKRMATE
                              │
              ┌───────────────┼───────────────┐
              │               │               │
           Worship          Learning        Tracking
              │               │               │
        ┌─────┼─────┐    ┌────┼────┐      ┌───┼────┐
        │     │     │    │    │    │      │   │    │
      Zikir  Salat  Dua Quran Hadith Kitab Aamal History
```

The result is a single ecosystem where users can **remember, read, learn, pray, and track** without leaving the application.

---

# 🕌 Core Experience

ZikrMate is organized around seven primary experiences:

| Section              | Purpose                             |
| -------------------- | ----------------------------------- |
| 📿 **Zikir**         | Digital Zikir & Tasbeeh counting    |
| 📖 **Quran**         | Quran reading and reflection        |
| 📚 **Kitab Library** | Islamic books and reading resources |
| 📜 **Hadith**        | Hadith collections and references   |
| 🕌 **Salat Time**    | Daily prayer schedule               |
| 🤲 **Dua**           | Daily and situational Duas          |
| 📋 **Aamal Tracker** | Daily worship and activity tracking |

---

# 📿 Zikir — The Heart of ZikrMate

The Zikir system is designed as an **independent multi-counter engine**, rather than a single shared counter.

Every Zikir maintains its own state.

```text
┌──────────────────────────────────────┐
│           سُبْحَانَ اللَّهِ          │
│                                      │
│              সুবহানাল্লাহ             │
│                                      │
│               37 / 100               │
│                                      │
│          ███████░░░░░ 37%            │
│                                      │
│              ＋ COUNT                 │
│                Reset                 │
└──────────────────────────────────────┘
```

A user can maintain:

```text
SubhanAllah        37 / 100
Alhamdulillah      50 / 100
Allahu Akbar       75 / 100
Darood Sharif      25 / 100
Astaghfirullah     40 / 100
```

Each counter remains completely independent.

---

# 🌅 Morning & 🌇 Evening Zikir

ZikrMate organizes Zikir into meaningful daily categories.

### সকালের যিকির

The default morning collection contains six Zikir:

```text
سُبْحَانَ اللَّهِ
সুবহানাল্লাহ

الْحَمْدُ لِلَّهِ
আলহামদুলিল্লাহ

لَا إِلٰهَ إِلَّا اللَّهُ
লা ইলাহা ইল্লাল্লাহ

اللَّهُ أَكْبَرُ
আল্লাহু আকবার

صَلَّى اللَّهُ عَلَى مُحَمَّدٍ وَسَلَّمَ
দরুদ শরীফ

أَسْتَغْفِرُ اللَّهَ
ইস্তিগফার
```

Default target:

**600 total repetitions**

### সন্ধ্যার যিকির

The evening collection includes configurable targets.

For example:

```text
لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ

33 / 33
```

or:

```text
33 / 100
```

The target system is configurable instead of being permanently locked to one value.

---

# 🔵 Central Intelligence — Total Counter

One of ZikrMate's key UX concepts is the **central total counter**.

Instead of storing a separate total that can become inconsistent, the application derives the total from individual Zikir states.

```text
              Individual Counters
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Zikir A       Zikir B      Zikir C
          │            │            │
          └────────────┼────────────┘
                       ↓
                 SUM / Aggregator
                       ↓
                ┌─────────────┐
                │     263     │
                │ TOTAL ZIKIR │
                └─────────────┘
```

Example:

```text
Morning
230 / 600

Evening
33 / 133

────────────────

Overall
263 / 733
```

Everything is calculated dynamically from actual user data.

---

# 📊 Daily Progress

The Zikir dashboard provides an overview of the user's daily activity.

```text
                    আজকের অগ্রগতি

                         36%

          ─────────────────────────
          Morning       230 / 600
          Evening        33 / 133
          ─────────────────────────
          Overall       263 / 733
```

The progress engine calculates:

```text
Morning Progress
= Morning Count / Morning Target

Evening Progress
= Evening Count / Evening Target

Overall Progress
= Total Count / Total Target
```

No hard-coded percentage is required.

---

# 🧠 Product Architecture

ZikrMate is designed using a **modular architecture** so that each Islamic feature can evolve independently without breaking the rest of the application.

```text
                         ZIKRMATE
                            │
                    Application Shell
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
       Navigation        UI System        State Layer
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                     Feature Modules
                            │
      ┌─────────┬─────────┬─┴───────┬────────┬────────┐
      ↓         ↓         ↓         ↓        ↓        ↓
    Zikir     Quran     Hadith    Kitab    Salat    Dua
      │                                             │
      └──────────────────┬──────────────────────────┘
                         ↓
                    Aamal Tracker
                         │
                         ↓
                  Storage / Data
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
         Local Data              APIs/Data
```

This architecture allows new features to be added without rewriting the entire application.

---

# 🧩 Feature-Based Architecture

Instead of building the application as one large component, ZikrMate can follow a feature-oriented structure.

```text
src/
│
├── app/
│   ├── router
│   ├── layout
│   └── providers
│
├── features/
│   │
│   ├── zikir/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── quran/
│   ├── hadith/
│   ├── kitab/
│   ├── salat/
│   ├── dua/
│   └── aamal/
│
├── shared/
│   ├── components/
│   ├── typography/
│   ├── icons/
│   ├── theme/
│   └── utilities/
│
├── services/
│   ├── storage/
│   ├── api/
│   └── notifications/
│
└── assets/
```

This makes the project easier to maintain and extend.

---

# 🔄 Zikir Data Flow

The Zikir system follows a predictable data flow:

```text
             User taps counter
                    │
                    ↓
             Counter Handler
                    │
                    ↓
             Update Zikir State
                    │
            ┌───────┴───────┐
            ↓               ↓
        Save Data       Recalculate
            │               │
            │               ↓
            │          Daily Progress
            │               │
            │               ↓
            │         Overall Total
            │
            ↓
       Persistent Storage
```

This makes the counter behavior predictable and easy to test.

---

# 💾 Persistence Architecture

ZikrMate is designed around **persistent user data**.

The application can preserve:

```text
Zikir Counts
Zikir Targets
Daily Progress
Zikir History
Bookmarks
Reading Progress
Aamal Progress
Theme
Language
Settings
```

If the existing project already has a database or storage layer, the new Zikir system should integrate with that system instead of introducing an unnecessary second storage mechanism.

---

# 📅 Daily Data Model

A daily Zikir record can conceptually look like:

```json
{
  "date": "2026-09-26",
  "morning": {
    "morning-subhanallah": 37,
    "morning-alhamdulillah": 50
  },
  "evening": {
    "evening-la-hawla": 33
  }
}
```

This allows historical statistics to be built without mixing one day's progress with another.

---

# 🗂️ Structured Zikir Data

Zikir content is kept separate from UI components.

Example:

```javascript
{
  id: "morning-subhanallah",
  category: "morning",
  arabic: "سُبْحَانَ اللَّهِ",
  bengali: "সুবহানাল্লাহ",
  targetOptions: [100],
  defaultTarget: 100
}
```

Variable target:

```javascript
{
  id: "evening-la-hawla",
  category: "evening",
  arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
  bengali: "লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ",
  targetOptions: [33, 100],
  defaultTarget: 33
}
```

This makes adding new Zikir simple.

---

# 📖 Quran Experience

The Quran section is designed as a focused reading environment.

Potential capabilities include:

* Surah navigation
* Arabic Quran
* Translation
* Ayah navigation
* Search
* Bookmarks
* Favorites
* Last-read position
* Reading progress

Arabic content is displayed using proper **RTL rendering**.

---

# 📚 Kitab Library

The Kitab Library transforms ZikrMate into a broader Islamic knowledge platform.

Users can browse:

```text
📚 Aqeedah
📚 Fiqh
📚 Tafsir
📚 Hadith
📚 Seerah
📚 Islamic History
📚 Dua & Zikir
```

The library can support digital books and PDF resources where licensing permits.

---

# 📜 Hadith

The Hadith module provides an organized reading and discovery experience.

Potential functionality:

```text
Collections
Categories
Search
Arabic
Translation
References
Bookmarks
Favorites
Sharing
```

References should remain clearly associated with each Hadith.

---

# 🕌 Salat Time

The Salat module provides a daily prayer dashboard.

```text
Fajr
Sunrise
Dhuhr
Asr
Maghrib
Isha
```

The experience can include:

* Current prayer
* Next prayer
* Countdown
* Daily schedule
* Hijri date
* Location
* Calculation method
* Notifications

---

# 🤲 Dua

ZikrMate organizes Duas into practical categories.

```text
Morning
Evening
Travel
Food
Protection
Forgiveness
Before Sleep
After Waking
Daily Life
```

Each entry can contain:

```text
Arabic
Bengali
Transliteration
Translation
Reference
```

---

# 📋 Aamal Tracker

The Aamal Tracker provides a lightweight daily activity system.

```text
        TODAY'S AAMAL

✓ Fajr
✓ Quran
✓ Zikir
✓ Morning Adhkar
✓ Hadith
○ Charity
○ Personal Aamal
```

Users can see their daily completion and build longer-term statistics.

---

# 🎨 Design System

ZikrMate follows a **calm Islamic modernism** design direction.

### Visual principles

* Minimal
* Elegant
* Peaceful
* Accessible
* Spacious
* Responsive
* Content-focused

### UI language

The interface combines:

**Arabic + Bengali + English**

without allowing one language to visually interfere with another.

Arabic receives larger typography and proper RTL treatment.

Bengali uses Unicode-compatible typography.

---

# 🌐 Internationalization

The application is designed for multilingual expansion.

```text
English
বাংলা
العربية
```

The architecture should allow additional languages without rewriting UI components.

Translation strings should remain separate from application logic.

---

# 📱 Responsive Architecture

ZikrMate uses a responsive-first philosophy.

```text
             ZIKRMATE
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
     Mobile    Tablet    Desktop
       │         │         │
       ↓         ↓         ↓
    Compact   Adaptive   Expanded
     Cards      Grid       Grid
```

### Mobile

Large touch controls and single-column content.

### Tablet

Adaptive two-column layouts.

### Desktop

Expanded grids and wider reading environments.

---

# 🌙 Theme System

ZikrMate supports a unified theme system.

```text
             Theme Provider
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
     ☀️ Light             🌙 Dark
        │                   │
        └─────────┬─────────┘
                  ↓
          All Feature Modules
```

Theme changes should affect the entire application consistently.

---

# 📲 PWA Architecture

ZikrMate can operate as a Progressive Web App.

```text
Browser
   │
   ↓
Service Worker
   │
   ├── Cache
   ├── Offline Support
   └── App Shell
          │
          ↓
       ZikrMate
```

This provides an app-like experience while retaining the flexibility of a web application.

---

# 🤖 Android Architecture

The responsive web/PWA experience can be packaged for Android.

```text
             ZikrMate Web
                  │
                  ↓
                 PWA
                  │
                  ↓
          Android Wrapper
                  │
                  ↓
           Android Studio
             /        \
            ↓          ↓
          APK         AAB
```

The goal is to avoid maintaining two completely separate applications.

---

# 🔐 Data Integrity

ZikrMate prioritizes safe handling of user-generated data.

When extending the existing application:

* Existing data must remain intact.
* Existing authentication must remain intact.
* Existing navigation must remain intact.
* Existing features must remain functional.
* Existing storage should be reused.
* Unrelated pages should not be modified unnecessarily.

The Zikir feature should be integrated rather than replacing the existing application.

---

# 🧪 Quality & Testing

Important Zikr test cases include:

```text
✓ Individual counter increments correctly
✓ Counters remain independent
✓ Target changes correctly
✓ 33/100 target selection works
✓ Reset affects only selected Zikir
✓ Total updates immediately
✓ Progress updates immediately
✓ Data survives page refresh
✓ Data survives app restart
✓ New day creates correct daily state
✓ History remains intact
✓ Arabic RTL works correctly
✓ Bengali renders correctly
✓ Mobile layout works
✓ Tablet layout works
✓ Desktop layout works
```

---

# 🚀 Extensibility

ZikrMate is designed so future features can be introduced without restructuring the entire application.

Possible future modules:

```text
🧭 Qibla
📅 Hijri Calendar
🔔 Prayer Notifications
🎧 Quran Audio
🎙️ Hadith Audio
☁️ Cloud Sync
👤 User Accounts
📊 Advanced Analytics
🏆 Personal Goals
🔎 Islamic Search
```

The modular architecture makes these additions possible without coupling them tightly to the Zikir system.

---

# 🛠️ Technology

The exact technology stack should follow the existing ZikrMate project, but the application is suitable for modern technologies such as:

* **React**
* **TypeScript**
* **JavaScript**
* **HTML5**
* **CSS3**
* **IndexedDB**
* **LocalStorage**
* **PWA**
* **Service Workers**
* **REST APIs**
* **Android Studio**
* **APK / AAB**

The guiding principle is:

> **Extend the existing architecture before introducing a new architecture.**

---

# 📂 High-Level Project Architecture

```text
ZIKRMATE
│
├── Application Shell
│   ├── Header
│   ├── Navigation
│   ├── Theme
│   └── Language
│
├── Worship
│   ├── Zikir
│   ├── Salat
│   ├── Dua
│   └── Aamal
│
├── Knowledge
│   ├── Quran
│   ├── Hadith
│   └── Kitab Library
│
├── Shared Services
│   ├── Storage
│   ├── API
│   ├── Notifications
│   └── Date / Time
│
└── Platform
    ├── Web
    ├── PWA
    └── Android
```

---

# 🎯 Product Vision

ZikrMate is not intended to be just another counter application.

It is designed as a **digital Islamic companion** where technology stays in the background and the user's worship, learning, and reflection remain at the center.

The application brings together:

**Zikir → Remember**

**Quran → Read**

**Hadith → Learn**

**Salat → Pray**

**Dua → Ask**

**Aamal → Track**

**Kitab → Explore**

---

# 🌙 The ZikrMate Philosophy

> ### **Less distraction. More remembrance.**

The interface is intentionally calm.

The application should never feel like a complicated productivity dashboard.

Instead, it should feel like a peaceful digital space that users can return to every day.

---

# 📌 Project Highlights

```text
🌙 Modern Islamic UI
📿 Multi-Zikir Counter
🔵 Central Total Counter
🌅 Morning Zikir
🌇 Evening Zikir
📊 Daily Progress
📅 Zikir History
📖 Quran
📚 Kitab Library
📜 Hadith
🕌 Salat Time
🤲 Dua
📋 Aamal Tracker
🌐 Bengali + Arabic + English
↔️ Proper RTL Support
💾 Persistent Data
📱 Responsive Design
💻 Desktop Support
📲 PWA
🤖 Android Ready
```

---

# 🏗️ Engineering Principles

ZikrMate follows several core engineering principles:

### 1. Modular

Each major feature should remain independently maintainable.

### 2. Reusable

Common UI and logic should be shared rather than duplicated.

### 3. Data-driven

Content such as Zikir should come from structured data.

### 4. Persistent

Important user progress should survive application restarts.

### 5. Responsive

The same experience should adapt across devices.

### 6. Accessible

Large controls, readable typography, keyboard accessibility, and clear states should be prioritized.

### 7. Extensible

Future Islamic features should be possible without rebuilding the application.

---

# 🤝 Contributing

Contributions are welcome.

You can contribute through:

* Bug fixes
* UI improvements
* Accessibility improvements
* New features
* Translation
* Testing
* Documentation
* Performance improvements

Before submitting major changes, maintain compatibility with the existing application architecture.

---

# ⭐ Support

If ZikrMate is useful to you, consider giving the repository a ⭐ on GitHub.

Suggestions, feedback, issues, and contributions are welcome.

---

# 📜 License

Choose an appropriate open-source license based on the project's intended distribution and the licensing of included Islamic content and datasets.

---

# 🌙 ZikrMate

### **Islamic Companion & Daily Worship Platform**

**Zikir • Quran • Kitab • Hadith • Salat • Dua • Aamal**

> **Remember. Reflect. Pray. Track. Grow.**

---

## GitHub About

**Description:**

> 🌙 ZikrMate — A modern Islamic Companion & Daily Worship platform featuring Zikir, Quran, Kitab Library, Hadith, Salat Times, Dua, Aamal Tracking, daily progress, history, multilingual Arabic/Bengali support, responsive PWA design, and Android compatibility.

**Topics:**

```text
zikrmate
islamic-app
islamic-companion
islamic
zikr
dhikr
tasbeeh
quran
hadith
dua
salat
prayer-times
aamal
kitab
islamic-books
bengali
arabic
rtl
pwa
android
react
typescript
```

**Tagline:**

> 🌙 **ZikrMate — A peaceful digital companion for remembrance, worship, learning, and daily Aamal.**
