# Train Crawler Tool
[中文](README.md) | [English](README_EN.md)


一个基于 Python（后端） 和 TypeScript + React（前端） 的火车票信息爬取工具，用于获取并展示 CR 的列车与车票相关信息。

## 📌 项目概述

Train Crawler Tool 是一个全栈应用，主要功能包括：

- 从 CR 相关数据源中爬取列车与车票信息

- 在后端对车票数据进行处理、解析与结构化

- 提供基于 Web 的前端界面，用于数据展示与交互

该项目在架构上明确区分了 **数据采集(Python)与用户交互(React)** 两部分，便于后续的功能扩展、数据分析或与其他系统集成。

## 🧱 技术栈
### 后端（Backend）

- Python

- HTTP 请求处理

- 数据解析与预处理

- 可选的任务调度 / 自动化支持

### 前端（Frontend）

- TypeScript

- React

- 基于组件的 UI 设计

- 基于 API 的数据渲染