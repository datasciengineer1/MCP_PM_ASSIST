
# Multi-Agent Program Management MVP

A comprehensive project management system powered by multi-agent AI orchestration for intelligent project planning, risk assessment, and documentation generation.

## Features

- 🤖 **Multi-Agent Orchestration**: Intelligent agents for different aspects of project management
- 📊 **Project Dashboard**: Real-time project status, charts, and analytics
- 📋 **Requirements Management**: Track and manage project requirements
- ⚠️ **Risk Assessment**: AI-powered risk identification and mitigation
- 📄 **Document Generation**: Automated documentation using LLM APIs
- 📁 **File Processing**: Support for PDF, DOCX, TXT, CSV, XLSX files
- 🗄️ **Database Integration**: PostgreSQL with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Shadcn/ui, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **AI Integration**: Abacus.AI LLM API
- **Charts**: Recharts, React-Plotly.js

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Abacus.AI API key

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd pm_assistant_mvp/app
   ```

2. **Run the setup script** (recommended):
   ```bash
   chmod +x scripts/setup-local.sh
   ./scripts/setup-local.sh
   ```
   
   Or manually:
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Install dependencies  
   yarn install
   
   # Setup database
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

3. **Configure environment variables**:
   Edit `.env` file with your actual values:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/pm_assistant_mvp"
   ABACUSAI_API_KEY="your_abacus_ai_api_key_here"
   ```

4. **Start development server**:
   ```bash
   yarn dev
   ```

5. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `./scripts/setup-local.sh` | Complete local setup |
| `./scripts/setup-database.sh` | Database setup only |
| `npx prisma studio` | Open database browser |
| `npx prisma db push` | Push schema changes |
| `npx prisma db seed` | Seed database with sample data |

## Project Structure

```
pm_assistant_mvp/app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── agents/            # Agents management page
│   ├── projects/          # Projects management page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── agents/           # Agent-related components
│   ├── dashboard/        # Dashboard components
│   ├── projects/         # Project components
│   └── ui/               # Shadcn/ui components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema
├── scripts/              # Setup and utility scripts
└── README.md            # This file
```

## Database Schema

The system uses PostgreSQL with the following main entities:
- **Projects**: Core project information and metadata
- **Agents**: AI agents configuration and types
- **AgentExecution**: Track agent execution history
- **Requirements**: Project requirements and user stories
- **Tasks**: Project tasks and assignments
- **Risks**: Risk assessment and mitigation
- **Documents**: Generated documentation
- **FileUploads**: Uploaded file processing

## AI Integration

The system integrates with Abacus.AI for:
- Project analysis and planning
- Risk assessment
- Document generation
- File content extraction and analysis
- Requirements analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **ESLint conflicts**: The project uses ESLint 9.x with compatible TypeScript ESLint packages
2. **Database connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
3. **Missing API key**: Set your ABACUSAI_API_KEY in the .env file

### Database Issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate

# Push schema changes
npx prisma db push
```

### Clean Install
```bash
# Clean and reinstall everything
rm -rf node_modules .next
yarn install
```

## License

MIT License - see LICENSE file for details.
