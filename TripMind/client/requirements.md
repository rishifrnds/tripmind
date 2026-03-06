## Packages
framer-motion | Smooth animations and page transitions
date-fns | Formatting dates for the itinerary
canvas-confetti | Celebration effect when an itinerary is generated
@types/canvas-confetti | Types for canvas-confetti

## Notes
- Using provided useAuth hook for Replit Auth
- Routing uses wouter
- Multi-step trip generation (POST /generate -> POST /trips -> POST /days -> POST /activities) is handled in the frontend hook useGenerateTrip
