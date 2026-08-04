# FRONTEND ARCHITECTURE & DESIGN SYSTEM SPECIFICATION • 19 JHR BN NCC SBU COMPANY PORTAL

---

## 1. Overview & Technology Stack

The **19 JHR BN NCC • Sarala Birla University Company Portal** standardizes its frontend presentation layer on **shadcn/ui** source-code components, **Tailwind CSS v4**, **Framer Motion**, and **Lucide React**.

### Core Frontend Stack
- **Design System Foundation**: shadcn/ui + Tailwind CSS v4
- **Animation & Motion**: Motion / Framer Motion (`motion/react`)
- **Iconography**: Lucide React (`lucide-react`)
- **Form Handling & Validation**: React Hook Form + Zod
- **Data Fetching & State**: TanStack Query + Zustand
- **Data Visualization**: Recharts / Canvas Graphics Engine
- **Notifications & Toasts**: Sonner / Custom Toast System

---

## 2. Component Migration & Standard Mapping

| Legacy Component | Standardized Replacement | Description |
| :--- | :--- | :--- |
| **Custom Buttons** | `Button` | Accessible, variant-driven button system (primary, outline, ghost, gold) |
| **Custom Inputs** | `Input` + `Form` | Accessible input controls with Zod schema validation |
| **Custom Cards** | `Card` | Frosted glassmorphic card containers with border highlights |
| **Custom Modals** | `Dialog` | Accessible backdrop-blur dialog modals for AI Assistant & Status Tracking |
| **Custom Sidebar** | `Sidebar` | Collapsible responsive navigation sidebar for Officer & Cadet dashboards |
| **Custom Navbar** | `NavigationMenu` | Translucent glass navigation bar with segmented capsule pills |
| **Custom Tables** | `Table` + `DataTable` | Filterable, paginated data grid for cadet rosters & enrollment records |
| **Custom Toasts** | `Sonner` | High-priority notification toasts for real-time WebSocket alerts |
| **Custom Dropdowns** | `DropdownMenu` | Portals dropdown menu with Cadet & Officer access pathways |
| **Custom Loaders** | `Skeleton` + `Progress` | Pulse loading skeletons for data fetching states |
| **Custom Tabs** | `Tabs` | Segmented tab switcher for Cadet & Officer portal modes |

---

## 3. Production SaaS UX Capabilities

- **Modern Glassmorphism**: Subtle frosted glass blur (`backdrop-blur-3xl`), specular highlights, and gold ring accents.
- **Command Palette (`⌘K`)**: Quick jump command search bar for fast navigation across activities, ranks, and portal tools.
- **Accessible Forms**: Full ARIA support, keyboard navigation, and instant error validation.
- **Responsive Layouts**: Mobile-first responsive grid adaptation across desktop, tablet, and mobile displays.
- **Real-Time WebSocket Sync**: Live presence status, cadet enrollment broadcasts, and notice updates.

---

## 4. Authorship

- **Author & Architect**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
- **Repository Owner**: **Ravi Ranjan Singh**
