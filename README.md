# 晨暮日记 MoodNotes

[English Version](#english-version)

![Workflow](https://img.shields.io/github/workflow/status/PStarH/MoodNotes/CI)
![License](https://img.shields.io/github/license/PStarH/MoodNotes)
![Star](https://img.shields.io/github/stars/PStarH/MoodNotes?style=social)

晨暮日记是一个跨平台的日记应用程序，基于Vue.js和Electron构建。它提供用户一个无缝和直观的界面，记录他们的日常想法、情绪和活动。晨暮日记包含多媒体支持、天气集成和日历视图等功能，旨在增强写作体验。

## 📖 内容表

- [功能 (Features)](#功能-features)
- [技术栈 (Tech Stack)](#技术栈-tech-stack)
- [架构 (Architecture)](#架构-architecture)
- [安装 (Installation)](#安装-installation)
- [使用 (Usage)](#使用-usage)
- [未来计划 (Future Plans)](#未来计划-future-plans)
- [项目结构 (Project Structure)](#项目结构-project-structure)
- [贡献 (Contributing)](#贡献-contributing)
- [许可证 (License)](#许可证-license)
- [联系方式 (Contact)](#联系方式-contact)

## ✨ 功能

- **日记 - 每日总结:**
  - 文字编辑器页面
  - 导出为 PDF/MD/HTML
  - 包含天气/情绪
  - 待办事项清单 - 我今天做了...吗?
  - 图片、视频、音频 
  - 舒适区条目

- **日记 - 灵感记录 (Diary - Spark):** 便于放在主页
  - 照片、视频 (Photo, video)
  - 文字 (Text)

- **去年今日:** 我去年今天做了什么

- **日历 :**
  - 显示当天的日记及表情符号表示情绪
  - 待办事项清单
  - 每日名言

- **跨平台:** 基于Electron构建，支持桌面和移动设备。

- **隐私功能:** 密码保护和私人模式以保持条目安全。

## 🛠 技术栈

### 前端

- **Vue.js 3:** 用于构建用户界面的JavaScript框架。
- **Vuex:** Vue.js的状态管理模式+库。
- **Tailwind CSS:** 实用优先的CSS框架。
- **Axios:** 用于API请求的HTTP客户端。

### 其他

- **Electron:** 用于构建跨平台桌面应用程序的框架。
- **SQLite:** 用于本地存储日记条目和用户数据的轻量级SQL数据库。

## 🏗 架构

晨暮日记遵循客户端-服务器架构，前端与本地SQLite数据库进行通信。该应用程序旨在有效处理日记条目、多媒体附件和用户设置，为用户提供直观的界面来记录日常生活。

## 🚀 安装

1. **直接下载**

   用户可以直接从[发布页面](https://github.com/PStarH/MoodNotes/releases)下载安装包。

## 🎯 使用

1. **访问应用程序**

   打开应用程序，它将提供用户友好的界面供您交互。

2. **创建日记条目**

   - 导航到**每日总结**页面。
   - 填写文字编辑器，附加图像/视频，并选择情绪和天气。
   - 保存条目。

3. **利用灵感记录**

   - 使用主页上的**灵感**功能进行快速记录。
   - 以照片、视频和文本的各种格式捕捉您的想法。

4. **查看过去条目**

   - 访问**去年今日**功能，回顾过去的活动。

5. **日历概览**

   - 在**日历**页面查看条目，包括情绪表情和每日名言。

## 🚀 未来计划

晨暮日记不断发展，以增强用户体验和功能。即将推出的功能包括：

- **用户身份验证:**
  - 允许用户创建帐户并跨设备管理他们的日记条目。

- **高级媒体支持:**
  - 实现音频录制和标签功能，以便更好地组织。

- **搜索功能:**
  - 允许用户通过关键字和日期搜索过去的条目。

- **数据分析:**
  - 根据用户条目提供洞察，例如情绪趋势分析。

- **多语言支持:**
  - 允许用户选择不同语言以更好地实现无障碍访问。

## 📂 项目结构

晨暮日记/

```
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── DaySummary.vue
│   │   │   ├── Spark.vue
│   │   │   └── Calendar.vue
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── components/
│   ├── public/
│   ├── package.json
├── README.md
└── LICENSE
```
- **backend/**: 包含所有后端相关代码，包括数据库模型和API。
- **frontend/**: 包含Vue.js前端应用程序。
- **requirements.txt**: 列出Python依赖项。
- **package.json**: 列出前端依赖项。

## 🤝 贡献 (Contributing)

欢迎贡献！请遵循以下步骤：

1. **分叉仓库 (Fork the Repository)**

2. **创建功能分支 (Create a Feature Branch)**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **提交更改 (Commit Your Changes)**

   ```bash
   git commit -m "添加一些功能"
   ```

4. **推送到分支 (Push to the Branch)**

   ```bash
   git push origin feature/YourFeature
   ```

5. **打开拉取请求 (Open a Pull Request)**

## 📜 许可证 (License)

该项目根据 [自定义许可证](LICENSE) 许可。您可以根据许可证条款使用、修改和分发此软件。

---

❤️ 由 [PStarH](https://github.com/PStarH) 制作

---

# English Version

[M中文版本](#中文版本)

# MoodNotes

![Workflow](https://img.shields.io/github/workflow/status/PStarH/MoodNotes/CI)
![License](https://img.shields.io/github/license/PStarH/MoodNotes)
![Star](https://img.shields.io/github/stars/PStarH/MoodNotes?style=social)

MoodNotes is a cross-platform diary application built with Vue.js and Electron. It provides users with a seamless and intuitive interface to record their daily thoughts, emotions, and activities. MoodNotes includes features such as multimedia support, weather integration, and calendar views, aiming to enhance the writing experience.

## 📖 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Future Plans](#future-plans)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## ✨ Features

- **Diary - Daily Summary:**
  - Text editor page
  - Export as PDF/MD/HTML
  - Includes weather/emotions
  - To-do list - Did I do... today?
  - Images, videos, audio 
  - Comfort zone entries
  - **Diary - Spark:** Easily placed on the homepage
  - Photos, videos
  - Text

- **On This Day Last Year:** What did I do on this day last year?

- **Calendar:**
  - Displays daily entries with emoji indicating emotions
  - To-do list
  - Daily quotes

- **Cross-Platform:** Built with Electron, supporting desktop and mobile devices.

- **Privacy Features:** Password protection and private mode to keep entries secure.

## 🛠 Tech Stack

### Frontend

- **Vue.js 3:** JavaScript framework for building user interfaces.
- **Vuex:** State management pattern + library for Vue.js.
- **Tailwind CSS:** Utility-first CSS framework.
- **Axios:** HTTP client for API requests.

### Others

- **Electron:** Framework for building cross-platform desktop applications.
- **SQLite:** Lightweight SQL database for local storage of diary entries and user data.

## 🏗 Architecture

MoodNotes follows a client-server architecture, communicating the frontend with the local SQLite database. The application is designed to efficiently handle diary entries, multimedia attachments, and user settings to provide an intuitive interface for recording daily life.

## 🚀 Installation

1. **Direct Download**

   Users can directly download the installation package from the [Releases Page](https://github.com/PStarH/MoodNotes/releases).

## 🎯 Usage

1. **Access the Application**

   Open the application, which will provide a user-friendly interface for interaction.

2. **Create Diary Entries**

   - Navigate to the **Daily Summary** page.
   - Fill in the text editor, attach images/videos, and select emotions and weather.
   - Save the entry.

3. **Utilize Spark**

   - Use the **Spark** feature on the homepage for quick entries.
   - Capture your thoughts in various formats like photos, videos, and text.

4. **View Past Entries**

   - Access the **On This Day Last Year** feature to review past activities.

5. **Calendar Overview**

   - View entries on the **Calendar** page, including emotion emojis and daily quotes.

## 🚀 Future Plans

MoodNotes is continuously evolving to enhance user experience and functionality. Upcoming features include:

- **User Authentication:**
  - Allow users to create accounts and manage their diary entries across devices.

- **Advanced Media Support:**
  - Implement audio recording and tagging functionality for better organization.

- **Search Functionality:**
  - Allow users to search past entries by keywords and dates.

- **Data Analytics:**
  - Provide insights based on user entries, such as emotion trend analysis.

- **Multilingual Support:**
  - Allow users to select different languages for better accessibility.

## 📂 Project Structure

MoodNotes/
```
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── DaySummary.vue
│   │   │   ├── Spark.vue
│   │   │   └── Calendar.vue
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── components/
│   ├── public/
│   ├── package.json
├── README.md
└── LICENSE
```


- **backend/**: Contains all backend-related code, including database models and APIs.
- **frontend/**: Contains the Vue.js frontend application.
- **requirements.txt**: Lists Python dependencies.
- **package.json**: Lists frontend dependencies.

## 🤝 Contributing

Welcome to contribute! Please follow these steps:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add some feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

## 📜 License

This project is licensed under the [Custom License](LICENSE). You may use, modify, and distribute this software under the terms of the license.

---

❤️ Made by [PStarH](https://github.com/PStarH)

---