const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const COOKIE_NAME = "access_token";
const TOKEN_TTL_SECONDS = 100000;

function createApp({ jwtSecret, demoEmail, demoPassword, secureCookies }) {
  const app = express();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies,
    path: "/",
  };

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.post("/sign", (req, res) => {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email !== demoEmail ||
      password !== demoPassword
    ) {
      return res.status(401).json({ message: "Usuário ou senha incorreta" });
    }

    const data = {
      nome: "Cleiton Vasconcelos",
      email,
      role: ["sysAdmin"],
    };
    const token = jwt.sign({ data }, jwtSecret, { expiresIn: TOKEN_TTL_SECONDS });

    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: TOKEN_TTL_SECONDS * 1000 });
    return res.json({ nome: data.nome, email: data.email });
  });

  app.get("/me", (req, res) => {
    const token = req.cookies[COOKIE_NAME];

    if (!token) return res.status(401).json({ message: "Não autenticado" });

    try {
      const { data } = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
      return res.json({ nome: data.nome, email: data.email });
    } catch {
      return res.status(401).json({ message: "Sessão inválida ou expirada" });
    }
  });

  app.post("/logout", (_req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    return res.status(204).end();
  });

  return app;
}

module.exports = { createApp, COOKIE_NAME };
