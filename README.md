# Expense Manager 💰

A modern, multi-tenant expense tracking application built with the Pareto Principle (80/20 rule) in mind - focusing on the vital few features that deliver the most value.

![Design System](./App%20Style%20Expense%20manager.png)

## 🌟 Core Features (The "Vital Few")

### 1. Financial Pulse Dashboard
- **Total Balance Card** - Real-time view of your financial health with glassmorphism design
- **Cash Flow Visualization** - Interactive bar charts showing income vs expenses
- **Spending Breakdown** - Donut chart displaying category-wise distribution
- **Net Worth Tracking** - Comprehensive financial overview

### 2. Smart Quick Add
- **AI-Ready Input** - Natural language transaction entry (e.g., "Dinner 50k with Juan")
- **Manual Mode** - Comprehensive form with all transaction details
- **Recurring Transactions** - Support for weekly, monthly, and yearly recurrence
- **Partner Split** - Automatic calculation for shared expenses

### 3. Partner Settlements
- **Real-time Debt Tracking** - See who owes whom instantly
- **Project-based Splits** - Equity percentage calculations
- **Visual Settlement Cards** - Clear, actionable debt summaries

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router)
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: TailwindCSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Charts**: Recharts
- **State**: React Hooks
- **Forms**: React Hook Form + Zod

### Multi-Tenant Design
Built with Row-Level Security (RLS) for complete tenant isolation:
- Each user gets their own workspace (tenant)
- Projects can have multiple partners with equity percentages
- All data is automatically scoped to the user's tenant

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/LeonardoArango/expense-manager.git
cd expense-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Initialize the database**
Run the SQL schema in Supabase:
```bash
# Execute the contents of 01_initial_schema.sql in your Supabase SQL editor
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # Main application pages
│   │   ├── accounts/       # Account management
│   │   ├── partners/       # Partner management
│   │   ├── projects/       # Project tracking
│   │   ├── transactions/   # Transaction history
│   │   └── settings/       # App settings
│   └── debug/              # Debug utilities
├── components/
│   ├── auth/               # Login forms
│   ├── dashboard/          # FinancialOverview
│   ├── finance/            # Account & category management
│   ├── partners/           # DebtSummary, partner dialogs
│   ├── projects/           # Project components
│   ├── transactions/       # QuickAddTransaction, lists
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Reusable utilities
└── lib/
    ├── supabase/          # Supabase clients
    ├── data/              # Default data
    └── utils.ts           # Utility functions
```

## 🎨 Design System

The app follows a **Soft Modern / Glassmorphism-lite** aesthetic:

- **Primary Color**: Golden Yellow (`oklch(0.78 0.15 75)`)
- **Accents**: Multi-colored category system
- **Shape**: High border radius, pill buttons
- **Typography**: Inter/Geist Sans
- **Components**: Glass-morphic cards with soft shadows

See [Design_system.md](./Design_system.md) for complete specifications.

## 🗄️ Database Schema

### Core Tables
- `tenants` - Workspace isolation
- `profiles` - User profiles linked to auth
- `projects` - Investment or expense projects
- `partners` - People you share expenses with
- `project_partners` - Junction table with equity percentages
- `accounts` - Bank accounts, wallets, credit cards
- `categories` - Income/expense categories with DIAN tax codes
- `transactions` - All financial movements
- `recurring_transactions` - Templates for recurring entries

All tables have RLS policies for tenant isolation.

## 🔐 Security

- **Row-Level Security (RLS)** on all tables
- **Tenant Isolation** via `get_auth_tenant_id()` function
- **Secure Auth** with Supabase Auth
- **Server-side validation** for all mutations

## 🛠️ Development

### Key Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding Components
```bash
npx shadcn-ui@latest add [component]
```

## 📊 Features Roadmap

**Implemented ✅**
- [x] Financial Dashboard
- [x] Quick Add with AI-ready interface
- [x] Partner Settlements
- [x] Multi-tenant architecture
- [x] Transaction management
- [x] Recurring transactions
- [x] Category management
- [x] Account tracking

**Planned 🔜**
- [ ] AI-powered natural language parsing
- [ ] Mobile responsive optimization
- [ ] Bulk import from CSV/Excel
- [ ] Budget alerts and notifications
- [ ] P&L reports per project
- [ ] Tax classification (DIAN Colombia)
- [ ] Loan amortization tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Leonardo Arango**
- GitHub: [@LeonardoArango](https://github.com/LeonardoArango)

---

Built with ❤️ using the 80/20 principle - focusing on features that matter most.
