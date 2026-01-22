// features/templates/packs.js

export const TEMPLATE_PACKS = [
  {
    id: "fitness",
    name: "Fitness Pack",
    description: "Build momentum with movement and recovery habits.",
    habits: [
      { title: "Workout" },
      { title: "Stretch" },
      { title: "Drink Water" },
      { title: "Walk 30 minutes" },
    ],
    goals: [
      { title: "Complete 100 workouts", type: "count", target: 100 },
      { title: "Run 100 miles", type: "count", target: 100 },
      { title: "Do a 5K", type: "boolean" },
    ],
  },
  {
    id: "mindfulness",
    name: "Mindfulness Pack",
    description: "Reset daily with calm, focus, and reflection.",
    habits: [
      { title: "Meditate" },
      { title: "Journal" },
      { title: "Read 10 pages" },
      { title: "No screens after 9pm" },
    ],
    goals: [
      { title: "Meditate 100 sessions", type: "count", target: 100 },
      { title: "Read 20 books", type: "count", target: 20 },
      { title: "30-day streak", type: "boolean" },
    ],
  },
  {
    id: "finance",
    name: "Finance Pack",
    description: "Steady wins for saving and mindful spending.",
    habits: [
      { title: "Track expenses" },
      { title: "No impulse buys" },
      { title: "Cook at home" },
      { title: "Review budget" },
    ],
    goals: [
      { title: "Save $1000", type: "count", target: 1000 },
      { title: "Pay off a debt", type: "boolean" },
    ],
  },
];
