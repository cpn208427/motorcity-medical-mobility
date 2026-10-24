# Motorcity Medical Mobility

Build a sleek, accessible, modern web app named "MedTransit-AI" designed for healthcare patients and care coordinators in Metro Detroit to schedule reliable transportation to Henry Ford Health medical appointments.

### Theme & Styling
- Clean, modern healthcare UI using Tailwind CSS with deep navy blue (#0F172A), healthcare teal (#0EA5E9), white, and soft light blue backgrounds.
- High accessibility standards: large readable fonts, high contrast buttons, and senior-friendly clear UI elements.

### Key Page Layout & Components

1. Header & Navigation:
   - Logo: "MedTransit-AI" with a subtle pulse/heartbeat or vehicle icon.
   - Subtitle: "Smart Transit & Ride Coordination for Henry Ford Health Patients".
   - Top right status pill: "Connected to DDOT & SMART Real-Time Feeds" (with a green live indicator).

2. Main Dashboard (2-Column Grid on Desktop, Stacked on Mobile):

   LEFT COLUMN - "Smart Transit Planner & AI Assistant":
   - Patient Info Input Card: 
     * Patient Name & Phone Number.
     * Departure Location (Preset quick buttons: "Current Location", "Detroit - Midtown", "Warren", "Dearborn").
     * Destination Hospital (Dropdown featuring: "Henry Ford Hospital - Main Campus (2799 W Grand Blvd)", "Henry Ford West Bloomfield", "Henry Ford Health Center - Brownstown", "Detroit Medical Center").
     * Appointment Date & Time.
   - Interactive AI Chat Agent Widget ("MedTransit Assistant"):
     * Pre-populated welcome message: "Hello! I'm your MedTransit Assistant. Where and when is your upcoming appointment? I'll analyze DDOT, SMART, Medicaid transit, and volunteer shuttles to guarantee you arrive on time."
     * Suggested quick prompt pills: "I have a 10 AM cardiology appointment", "I need wheelchair accessible transit", "Remind me via SMS 2 hours before".
     * Interactive chat input field where patients can speak or type in natural language.

   RIGHT COLUMN - "Live Route & Coordination Output":
   - Interactive Map Canvas (use Leaflet or Mapbox placeholder styled cleanly) showing origin, destination, and highlighted bus/ride route across Metro Detroit.
   - Dynamic Route Recommendation Cards (populated upon clicking "Calculate Best Transit Route"):
     * Option A: "DDOT Route 16 + SMART Fast" (Public Transit) -> Displays estimated travel time, number of transfers, cost ($2.00), and on-time reliability score (88%). Includes step-by-step route itinerary.
     * Option B: "HFH Community Volunteer Shuttle" (Free Healthcare Shuttle) -> Displays pickup window, wheel-chair accessibility tag, and "Reserve Seat" button.
     * Option C: "Medicaid Non-Emergency Medical Transport (NEMT) Rider" -> Direct eligibility check preview with one-click dispatch request.
   - One-Click Actions:
     * "Send SMS Reminder & Itinerary to Patient" button with a popup toast notification confirmation.
     * "Alert Care Coordinator of Transit Plan" button.

3. Bottom Statistics & Impact Bar:
   - 3 Stat counters: "89% Reduction in Transit-Related No-Shows", "12,400+ Detroit Rides Coordinated", "Average Savings: $42 per Appointment".

### Interactive Features & Logic
- Add dummy state so clicking "Calculate Best Transit Route" or submitting the chat instantly generates realistic Metro Detroit transit itineraries with visual success badges.
- Provide a slide-over modal when "Send SMS Itinerary" is clicked showing a preview of the text message sent to the patient's phone.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://motorcity-medical-mobility.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ea93d224-ce92-4f73-bc24-82da92396bff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
