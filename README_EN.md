# Urban Transit Platform
[中文](README.md) | [English](README_EN.md)

(Currently) a train ticket information crawling tool built with Python (backend) and TypeScript + React (frontend), designed to collect and display CR train and ticket-related information.  
The project aims to provide **minute-level accurate public transit commuting solutions** for the Greater Bay Area.

## 📌 Project Overview

Train Crawler Tool (former name) is a full-stack application with the following core functionalities:

- Crawling train and ticket information from CR-related data sources  
- Processing, parsing, and structuring ticket data on the backend  
- Providing a web-based frontend interface for data visualization and interaction  

## 📝 Future Plans

- Implement optimal transfer path planning within Greater Bay Area cities based on **Dijkstra’s algorithm + transfer penalties**  
- Access railway/intercity ticketing systems via **real-time crawlers** to explore cross-city commuting strategies  
- Combine overall time penalties with **user-defined strategies** (e.g., specified stations, fewer transfers preferred, lower cost preferred, etc.) to generate comprehensive Greater Bay Area transit solutions  
- Utilize an **AI Agent** to output natural-language transfer plans, leveraging LLMs for user strategy analysis and tool invocation  

## 🧱 Tech Stack

### Backend

- Python  
- C++  
- HTTP request handling  
- Data parsing and preprocessing  

### Frontend

- TypeScript  
- React  
- Component-based UI design  
- API-driven data rendering  
