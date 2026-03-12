const request = require('supertest');
const app = require('./server');

describe('API Integration Tests', () => {
  let adminToken;
  let createdTaskId;
  let createdUserToken;
  let createdUserId;

  test('GET /health retourne 200', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('POST /api/auth/login connecte admin avec les bons identifiants', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('admin@test.com');

    adminToken = res.body.token;
  });

  test('POST /api/auth/login refuse un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'wrong-password'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Identifiants invalides');
  });

  test('GET /api/tasks sans token retourne 401', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', "Token d'accès requis");
  });

  test('GET /api/tasks avec token retourne la liste des tâches', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/tasks/1 retourne la tâche exemple', async () => {
    const res = await request(app)
      .get('/api/tasks/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', '1');
    expect(res.body).toHaveProperty('title');
  });

  test('GET /api/tasks/:id retourne 404 si la tâche n’existe pas', async () => {
    const res = await request(app)
      .get('/api/tasks/999999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Tâche non trouvée');
  });

  test('POST /api/tasks crée une nouvelle tâche', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Faire les tests d’intégration',
        description: 'Valider les endpoints du backend',
        priority: 'high'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Faire les tests d’intégration');
    expect(res.body.description).toBe('Valider les endpoints du backend');
    expect(res.body.priority).toBe('high');
    expect(res.body.status).toBe('todo');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');

    createdTaskId = res.body.id;
  });

  test('POST /api/tasks sans titre retourne 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Tâche invalide sans titre'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Le titre est requis');
  });

  test('PUT /api/tasks/:id modifie une tâche existante', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'done',
        priority: 'low',
        description: 'Tâche terminée'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdTaskId);
    expect(res.body.status).toBe('done');
    expect(res.body.priority).toBe('low');
    expect(res.body.description).toBe('Tâche terminée');
    expect(res.body).toHaveProperty('updatedAt');
  });

  test('PUT /api/tasks/:id retourne 404 si la tâche n’existe pas', async () => {
    const res = await request(app)
      .put('/api/tasks/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'done'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Tâche non trouvée');
  });

  test('GET /api/users retourne la liste des utilisateurs sans mot de passe', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).not.toHaveProperty('password');
  });

  test('POST /api/auth/register crée un nouvel utilisateur', async () => {
    const uniqueEmail = `user${Date.now()}@test.com`;

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Test User'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(uniqueEmail);
    expect(res.body.user.name).toBe('Test User');

    createdUserToken = res.body.token;
    createdUserId = res.body.user.id;
  });

  test('POST /api/auth/register refuse un utilisateur déjà existant', async () => {
    const email = `duplicate${Date.now()}@test.com`;

    await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Duplicate User'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Duplicate User'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Utilisateur déjà existant');
  });

  test('POST /api/tasks peut assigner une tâche à un utilisateur précis', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Tâche assignée',
        description: 'Assignation à un utilisateur créé',
        priority: 'medium',
        assignedTo: createdUserId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.assignedTo).toBe(createdUserId);
  });

  test('DELETE /api/tasks/:id supprime une tâche', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });

  test('DELETE /api/tasks/:id retourne 404 si la tâche est déjà supprimée', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Tâche non trouvée');
  });

  test('GET /api/tasks/:id après suppression retourne 404', async () => {
    const res = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Tâche non trouvée');
  });

  test('Route inconnue retourne 404', async () => {
    const res = await request(app).get('/api/route-inexistante');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Route non trouvée');
  });

  test('GET /api/tasks avec token invalide retourne 403', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer token_invalide');

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('error', 'Token invalide');
  });
});