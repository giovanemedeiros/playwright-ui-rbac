const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Helper Function
function getNextUserNumber() {
  const filePath = path.resolve('counter.json');
  let currentNumber = 1;

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    currentNumber = JSON.parse(data).count || 1;
  }

  // Writes the next number (+1) to counter.json file
  fs.writeFileSync(filePath, JSON.stringify({ count: currentNumber + 1 }, null, 2));
  return currentNumber;
}

test.describe('Access Control and Permissions (RBAC) - Serverest', () => {

  // ---- [US01] [UI RBAC] Validar acesso concedido a rotas administrativas para perfil Administrador ----
  test('Should allow access to admin routes for Administrator profile successfully', async ({ page, request }) => {
    
    // Get incremental number and create user via API
    const userNumber = getNextUserNumber();
    const randomUser = `testqap4v${userNumber}`;
    const randomEmail = `testqap4v${userNumber}@email.com`;

    // Silent user registration via API as Administrator (Background)
    await request.post('https://serverest.dev/usuarios', {
      data: {
        nome: randomUser,
        email: randomEmail,
        password: 'testqa26',
        administrador: 'true'
      }
    });

    // Silent login via API (Background)
    const loginResponse = await request.post('https://serverest.dev/login', {
      data: {
        email: randomEmail,
        password: 'testqa26'
      }
    });

    const { authorization } = await loginResponse.json();

    // Inject token into browser's localStorage before loading page
    await page.addInitScript(({ token }) => {
      window.localStorage.setItem('serverest/userToken', token);
    }, authorization);  

    // Access Admin Product Registration page directly
    await page.goto('https://front.serverest.dev/admin/cadastrarprodutos');
    await expect(page).toHaveURL('https://front.serverest.dev/admin/cadastrarprodutos');
    await expect(page.getByRole('heading', { name: 'Cadastro de Produtos' })).toBeVisible();
  });

  // ---- [US02] [UI RBAC] Validar bloqueio e redirecionamento de usuário Comum ao tentar acessar rotas de Administrador ----
  test('Should block Standard user from accessing Admin routes and redirect to home', async ({ page, request }) => {

  });

  // ---- [US03] [UI RBAC] Validar restrição de acesso a tela de cadastro de usuarios para perfil Comum ----
  test('Should block Standard user from accessing Admin user registration route', async ({ page, request }) => {

  });

  // ---- [US04] [UI RBAC] Validar redirecionamento para Login ao tentar acessar rotas privadas sem autenticação ----
  test('Should redirect Unauthenticated (Guest) user to Login page when accessing private routes', async ({ page }) => {

  });

});