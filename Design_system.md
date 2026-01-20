# Design System - Expense Manager Style

## 1. Visual Identity
**Style Name:** Soft Modern / Glassmorphism-lite
**Characteristics:** High border radius, soft shadows, vibrant accent colors against clean light backgrounds, pill-shaped buttons.

## 2. Color Palette

### Primary Actions & Highlights (Gold/Yellow)
- **Primary**: `oklch(0.78 0.15 75)` (Approx. Golden Yellow)
- **Primary Hover**: `oklch(0.72 0.15 75)`
- **Primary Foreground**: `oklch(0.2 0.05 75)` (Dark text on yellow)

### Secondary Accents (Quick Actions & Charts)
- **Red (Home/Expense)**: `oklch(0.65 0.22 25)`
- **Blue (Gas/Transport)**: `oklch(0.6 0.2 250)`
- **Purple (Travel/Card)**: `oklch(0.6 0.25 300)`
- **Green (Service/Income)**: `oklch(0.65 0.2 140)`
- **Orange**: `oklch(0.7 0.2 50)`
- **Pink**: `oklch(0.65 0.2 350)`

### Neutrals
- **Background**: `oklch(0.98 0 0)` (Off-white/Light Grey)
- **Surface (Cards/Sidebar)**: `oklch(1 0 0)` (Pure White)
- **Foreground (Text Main)**: `oklch(0.2 0 0)` (Dark Grey/Black)
- **Muted Foreground**: `oklch(0.55 0 0)` (Medium Grey)
- **Border**: `oklch(0.95 0 0)` (Very subtle)

## 3. Typography
**Font Family**: `Inter` (or `Geist Sans` if preferred by stack), `Poppins` for headings if available.
**Weights**:
- **Headings**: Semi-Bold (600) or Bold (700)
- **Body**: Regular (400) or Medium (500)

## 4. Components & Shape

### Border Radius
- **Cards**: `rounded-3xl` (approx 24px)
- **Buttons**: `rounded-full` (Pill shape)
- **Inputs**: `rounded-2xl` or `rounded-full`

### Shadows
- **Card Shadow**: `shadow-sm` or `shadow-md` (Soft, diffused)
    - `0 4px 20px -2px rgba(0, 0, 0, 0.05)`
- **Active Element Shadow**: `shadow-lg` (e.g., active card or floating action)

## 5. Layout Structure
- **Sidebar**: Fixed left, width approx 80-100px (Icon-based mostly) or 250px (Expanded). Image shows a narrow rail style or hybrid.
- **Main Content**: Padding `p-8`.
- **Dashboard Grid**: Masonry or Bento-box style grid.

## 6. Specific UI Elements (From Image)
- **"Current Balance" Card**: Yellow background with subtle abstract shapes/waves.
- **"ATM Card"**: Vibrant gradient (Purple to Cyan/Green).
- **Quick Action Buttons**: Square/Rounded icons with colored circle backgrounds + Label below.