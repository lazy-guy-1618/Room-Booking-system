# Room Booking System

A seamless and modern web application to check room availability and make bookings. Built with a Node.js/Express backend (TypeScript) and a premium Vanilla HTML/CSS/JS frontend using glassmorphism design principles.

## Features

- **Real-time Availability check**: Quickly find available rooms for any given time slot.
- **Instant Booking**: Simple modal interface to lock in your reservation.
- **Modern UI**: Aesthetics-first approach with a responsive, animated glassmorphic design.
- **In-memory Storage**: Lightweight backend perfect for demonstrative purposes and quick setups.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lazy-guy-1618/Room-Booking-system.git
   cd Room-Booking-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to use the application.

## API Endpoints

- `GET /api/availability?startTime=YYYY-MM-DDTHH:mm&endTime=YYYY-MM-DDTHH:mm`
  - Returns a list of rooms available in the specified time slot.
- `POST /api/book`
  - Accepts a JSON payload (`roomId`, `startTime`, `endTime`, `clientName`) to book a room.
- `GET /api/rooms`
  - Returns all rooms configured in the system.

## License
ISC
