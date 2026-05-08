# Evaluator App (Tauri) - Design Specification

## Overview
The Evaluator App is a desktop-based management dashboard for internal staff, providing tools for overseeing scholarship records, reviewing submissions, and broadcasting announcements. The application prioritizes functional density, offline robustness, and a modern, professional aesthetic.

## Typography
*   **Font Family:** Inter (Sans-serif)
*   **Scale:**
    *   **Titles/Headers:** Weight 800 (Extra Bold)
    *   **Subheaders/Labels:** Weight 600 (Semi-Bold)
    *   **Body Text:** Weight 400 (Regular)
*   **System Usage:** Strict adherence to Inter-only typography to ensure a cohesive, enterprise-grade feel.

## Iconography
*   **Icon Set:** Lucide React
*   **Aesthetic:** Consistent, vector-based, clean, and modern.
*   **Usage:** Used for all navigation, actions, and status indicators. Emojis are strictly prohibited to maintain professional decorum.

## Color Palette
*   **Primary Green:** `#1A8C3C` (Primary Action, Active status)
*   **Primary Dark Green:** `#0F5C27` (Sidebar, Hover states)
*   **Page Background:** `#F0F2F0` (Surface)
*   **Border/Divider:** `#E0E6E0`
*   **Text Primary:** `#1A1A1A`
*   **Text Secondary:** `#4A5568`
*   **Success:** `#1A8C3C` (Success alerts, Verified status)
*   **Danger:** `#E53935` (Danger alerts, Rejection/Deletion)

## Component Design Principles
*   **Layout:** Sidebar-based navigation (`#0F5C27`) with a generous main content area (`#F0F2F0`).
*   **Cards:** White (`#FFFFFF`) backgrounds, rounded corners (`2xl`), border-based separation (`#E0E6E0`), and subtle shadow support (`shadow-sm` or `shadow-md`).
*   **Interactivity:** Hover states with subtle opacity/color changes. Modals use backdrop blurs for visual depth.

## Offline/Sync Strategy
*   **Read-Only Offline:** The application acts as a view-only interface for data previously fetched and cached.
*   **Cache Service:** Utilizes `CacheService` for local data persistence.
*   **Sync Logic:** Background synchronization via `syncService.ts` ensures parity with the backend once network connectivity is restored.
