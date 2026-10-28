const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createApp, COOKIE_NAME } = require("../app");

const credentials = { email: "teste@teste.com", password: "123" };
let server;
let baseUrl;

before(async () => {
  const app = createApp({
    jwtSecret: "test-secret",
    demoEmail: credentials.email,
    demoPassword: credentials.password,
    secureCookies: false,
  });
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

const post = (path, body, headers = {}) =>
  fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: body && JSON.stringify(body),
  });

test("login com credenciais válidas define o cookie httpOnly e não devolve o token no corpo", async () => {
  const res = await post("/sign", credentials);
  const cookie = res.headers.get("set-cookie");

  assert.equal(res.status, 200);
  assert.match(cookie, new RegExp(`^${COOKIE_NAME}=`));
  assert.match(cookie, /HttpOnly/i);
  assert.deepEqual(Object.keys(await res.json()).sort(), ["email", "nome"]);
});

test("login com credenciais inválidas responde 401", async () => {
  const res = await post("/sign", { ...credentials, password: "errada" });

  assert.equal(res.status, 401);
  assert.equal((await res.json()).message, "Usuário ou senha incorreta");
});

test("login sem corpo ou com tipos inválidos responde 401", async () => {
  assert.equal((await post("/sign")).status, 401);
  assert.equal((await post("/sign", { email: ["a"], password: {} })).status, 401);
});

test("/me retorna o usuário com cookie válido", async () => {
  const login = await post("/sign", credentials);
  const cookie = login.headers.get("set-cookie").split(";")[0];

  const res = await fetch(`${baseUrl}/me`, { headers: { Cookie: cookie } });

  assert.equal(res.status, 200);
  assert.equal((await res.json()).email, credentials.email);
});

test("/me responde 401 sem cookie ou com cookie inválido", async () => {
  assert.equal((await fetch(`${baseUrl}/me`)).status, 401);

  const res = await fetch(`${baseUrl}/me`, { headers: { Cookie: `${COOKIE_NAME}=invalido` } });
  assert.equal(res.status, 401);
});

test("logout limpa o cookie", async () => {
  const res = await post("/logout");

  assert.equal(res.status, 204);
  assert.match(res.headers.get("set-cookie"), new RegExp(`^${COOKIE_NAME}=;`));
});
