# backend-fake-jwt

API de demonstração de autenticação para o front [auth-front---angular](https://github.com/Cleitonjr-dev/auth-front---angular).
Usuário único e fixo, sem banco de dados. A sessão é um JWT guardado em cookie `httpOnly`, que o JavaScript do navegador não consegue ler.

## Tecnologias

Node.js, Express 5, `jsonwebtoken` e `cookie-parser`.

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm install
npm start   # http://localhost:3000
npm test
```

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `NODE_ENV` | — | Com `production`, o cookie ganha o atributo `Secure` e `JWT_SECRET` passa a ser obrigatório |
| `JWT_SECRET` | aleatório por execução (só fora de produção) | Segredo usado para assinar o JWT |
| `DEMO_EMAIL` | `teste@teste.com` | E-mail do usuário de demonstração |
| `DEMO_PASSWORD` | `123` | Senha do usuário de demonstração |

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/sign` | Recebe `{ email, password }`, define o cookie `access_token` e responde `{ nome, email }`. Credenciais inválidas retornam `401`. |
| `GET` | `/me` | Retorna `{ nome, email }` da sessão atual ou `401` |
| `POST` | `/logout` | Remove o cookie (`204`) |
| `GET` | `/health` | Verificação de saúde |

## Deploy

O arquivo `render.yaml` descreve o serviço para o [Render](https://render.com) (o `JWT_SECRET` é gerado no deploy).
O front deve chamar a API pelo mesmo domínio do site, por meio de um proxy (veja o `netlify.toml` do front).
Assim o cookie é de primeira parte e não depende de CORS.

O passo a passo completo (publicar no Render, apontar o Netlify e testar o login real) está em
[docs/DEPLOY.md do front](https://github.com/Cleitonjr-dev/auth-front---angular/blob/main/docs/DEPLOY.md).
