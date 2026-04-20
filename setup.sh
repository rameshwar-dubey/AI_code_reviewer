#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   AI CODE REVIEWER - QUICK START${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed!${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found: $(npm -v)${NC}"

# Setup backend
echo -e "\n${YELLOW}Setting up Backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${BLUE}Please edit backend/.env and add your API keys:${NC}"
    echo -e "${BLUE}  - OPENAI_API_KEY${NC}"
    echo -e "${BLUE}  - GITHUB_TOKEN (optional)${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

echo -e "${GREEN}✓ Backend setup complete!${NC}"

# Setup frontend
echo -e "\n${YELLOW}Setting up Frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

echo -e "${GREEN}✓ Frontend setup complete!${NC}"

# Done
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Edit ${BLUE}backend/.env${NC} with your API keys"
echo -e "  2. Open two terminal windows:"
echo -e ""
echo -e "  ${BLUE}Terminal 1 (Backend):${NC}"
echo -e "    cd backend"
echo -e "    npm run dev"
echo -e ""
echo -e "  ${BLUE}Terminal 2 (Frontend):${NC}"
echo -e "    cd frontend"
echo -e "    npm run dev"
echo -e ""
echo -e "  3. Open browser: ${GREEN}http://localhost:5173${NC}"

echo -e "\n${YELLOW}Documentation: See README.md for detailed instructions${NC}\n"
