const dataManager = require('../services/dataManager');

const seedData = {
    students: [
        { id: "CSE2024001", token: "TOKEN_ALPHA_123", used: false, name: "Alice Johnson" },
        { id: "CSE2024002", token: "TOKEN_BETA_456", used: false, name: "Bob Smith" },
        { id: "CSE2024003", token: "TOKEN_GAMMA_789", used: false, name: "Charlie Brown" },
        { id: "CSE2024004", token: "TOKEN_DELTA_101", used: false, name: "David Lee" },
        { id: "CSE2024005", token: "TOKEN_EPSILON_202", used: false, name: "Eve White" },
        { id: "CSE2024006", token: "TOKEN_ZETA_303", used: false, name: "Frank Black" },
        { id: "CSE2024007", token: "TOKEN_ETA_404", used: false, name: "Grace Green" },
        { id: "CSE2024008", token: "TOKEN_THETA_505", used: false, name: "Hank Hill" },
        { id: "CSE2024009", token: "TOKEN_IOTA_606", used: false, name: "Ivy Blue" },
        { id: "CSE2024010", token: "TOKEN_KAPPA_707", used: false, name: "Jack Red" },
        { id: "IT2024011", token: "TOKEN_IT_001", used: false, name: "Arjun Kumar" },
        { id: "IT2024012", token: "TOKEN_IT_002", used: false, name: "Meera Nair" },
        { id: "IT2024013", token: "TOKEN_IT_003", used: false, name: "Rohan Patel" },
        { id: "IT2024014", token: "TOKEN_IT_004", used: false, name: "Sneha Iyer" },
        { id: "IT2024015", token: "TOKEN_IT_005", used: false, name: "Vikram Singh" },
        { id: "IT2024016", token: "TOKEN_IT_006", used: false, name: "Ananya Das" },
        { id: "IT2024017", token: "TOKEN_IT_007", used: false, name: "Karthik Rao" },
        { id: "IT2024018", token: "TOKEN_IT_008", used: false, name: "Devadharshini.C" },
        { id: "IT2024019", token: "TOKEN_IT_009", used: false, name: "Jison" },
        { id: "IT2024020", token: "TOKEN_IT_010", used: false, name: "Neha Gupta" }
    ],
    candidates: [
        {
            id: 1,
            name: "Ivanvo",
            symbol: "whistle",
            symbolChar: "🏁",
            moto: "Discipline. Progress. Transparency.",
            department: "CSE",
            year: "3rd Year",
            votes: 0
        },
        {
            id: 2,
            name: "Kabilashini",
            symbol: "plant",
            symbolChar: "🌱",
            moto: "Green campus, smart future.",
            department: "ECE",
            year: "3rd Year",
            votes: 0
        },
        {
            id: 3,
            name: "Joseph Aran",
            symbol: "gear",
            symbolChar: "⚙️",
            moto: "Innovation for every student.",
            department: "MECH",
            year: "4th Year",
            votes: 0
        }
    ],
    votes: []
};

console.log("Resetting Database for Student Election Demo...");
if (dataManager.writeDB(seedData)) {
    console.log("Database reset successful!");
    console.log("Valid Tokens for Demo:");
    seedData.students.forEach(s => {
        console.log(`- ${s.name} (${s.id}): ${s.token}`);
    });
} else {
    console.error("Failed to reset database.");
}
