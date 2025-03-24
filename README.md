# BlogWave

A full-stack blog platform with authentication, commenting, and analytics features built with React, Express, and TypeScript.

## Features

- **User Authentication**: Secure login and registration with bcrypt password hashing
- **Blog Post Management**: Create, edit, publish, and delete blog posts
- **Rich Text Editing**: Format your content with a built-in rich text editor
- **Categories & Tags**: Organize posts with categories and tags
- **Comments System**: Engage with readers through moderated comments
- **Analytics**: Track views, unique visitors, and other metrics
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui, Wouter
- **Backend**: Node.js, Express, Drizzle ORM
- **Database**: PostgreSQL (compatible with SQLite in development)
- **Authentication**: Passport.js with local strategy

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blogwave.git
   cd blogwave
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5000` to see the application.

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared types and schemas
- `/drizzle` - Database migration and schema files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Replit](https://replit.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)