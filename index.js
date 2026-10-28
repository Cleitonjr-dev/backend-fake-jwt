const crypto = require("node:crypto");
const { createApp } = require("./app");

const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    console.error("JWT_SECRET é obrigatório em produção.");
    process.exit(1);
  }
  // Em desenvolvimento, um segredo aleatório por execução (as sessões não sobrevivem a um restart).
  jwtSecret = crypto.randomBytes(32).toString("hex");
}

const app = createApp({
  jwtSecret,
  demoEmail: process.env.DEMO_EMAIL || "teste@teste.com",
  demoPassword: process.env.DEMO_PASSWORD || "123",
  secureCookies: isProduction,
});

app.listen(port, () => {
  console.log(`Link => http://localhost:${port}`);
});
