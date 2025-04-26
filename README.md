# Location Tracker

A real-time location sharing application that allows users to track the location of others through a simple link sharing mechanism.

## Live Demo
[Location Tracker](https://location-tracker-tan-chi.vercel.app/)

## Features
- Send location tracking links via WhatsApp
- Real-time location updates
- User consent-based location sharing
- Interactive map display
- Mobile-friendly interface
- Secure location sharing

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Maps: Leaflet.js
- Deployment: Vercel

## Project Structure
```
location-tracker/
├── public/
│   ├── index.html      # Main landing page
│   ├── track.html      # Location sharing page
│   ├── view.html       # Location viewing page
│   └── script.js       # Client-side JavaScript
├── routes/
│   └── auth.js         # API routes
├── models/
│   └── User.js         # User model
├── server.js           # Express server
└── package.json        # Dependencies
```

## Functionality

### 1. Sending Tracking Link
- User enters a phone number on the home page
- System generates a unique tracking link
- Link is sent via WhatsApp to the specified number
- View button appears for the sender to monitor location

### 2. Location Sharing
- Receiver clicks the shared link
- Confirmation dialog appears asking for permission
- If accepted:
  - Map appears showing current location
  - Location updates in real-time
  - Stop sharing button available
- If declined:
  - Shows declined message

### 3. Location Viewing
- Sender can view the shared location
- Real-time updates every 5 seconds
- Shows latitude, longitude, and last updated time
- Notification when sharing is stopped
- Interactive map display

## Setup Instructions

1. Clone the repository:
```bash
git clone [repository-url]
cd location-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
BASE_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm start
```

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `BASE_URL`: Base URL for the application
- `VERCEL_URL`: Vercel deployment URL (automatically set)

## API Endpoints
- `POST /api/auth/send-link`: Generate and send tracking link
- `GET /api/auth/location/:trackingId`: Get current location
- `POST /api/auth/location/:trackingId`: Update location

## Security Features
- Rate limiting on API endpoints
- User consent for location sharing
- Secure MongoDB connection
- Input validation for phone numbers

## Deployment
The application is deployed on Vercel. To deploy:
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables
4. Deploy

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details. 