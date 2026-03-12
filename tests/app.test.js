const axios = require('axios');
const BASE = 'http://localhost:3001/api';

let token = '';

describe('App - Tests Unitaires', () => {

  // ── Fonctions utilitaires ──
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPriority = (priority) => {
    return ['low', 'medium', 'high'].includes(priority);
  };

  const isValidStatus = (status) => {
    return ['todo', 'in-progress', 'done'].includes(status);
  };

  const formatTask = (task) => {
    if (!task.title) throw new Error('Title is required');
    return {
      ...task,
      title: task.title.trim(),
      status: task.status || 'todo',
      priority: task.priority || 'medium'
    };
  };

  // ── Tests validation email ──
  describe('isValidEmail()', () => {
    test('accepte un email valide', () => {
      expect(isValidEmail('admin@test.com')).toBe(true);
    });

    test('refuse un email sans @', () => {
      expect(isValidEmail('admintest.com')).toBe(false);
    });

    test('refuse un email vide', () => {
      expect(isValidEmail('')).toBe(false);
    });

    test('refuse un email sans domaine', () => {
      expect(isValidEmail('admin@')).toBe(false);
    });
  });

  // ── Tests validation priorité ──
  describe('isValidPriority()', () => {
    test('accepte low', () => {
      expect(isValidPriority('low')).toBe(true);
    });

    test('accepte medium', () => {
      expect(isValidPriority('medium')).toBe(true);
    });

    test('accepte high', () => {
      expect(isValidPriority('high')).toBe(true);
    });

    test('refuse une priorité invalide', () => {
      expect(isValidPriority('urgent')).toBe(false);
    });
  });

  // ── Tests validation statut ──
  describe('isValidStatus()', () => {
    test('accepte todo', () => {
      expect(isValidStatus('todo')).toBe(true);
    });

    test('accepte in-progress', () => {
      expect(isValidStatus('in-progress')).toBe(true);
    });

    test('accepte done', () => {
      expect(isValidStatus('done')).toBe(true);
    });

    test('refuse un statut invalide', () => {
      expect(isValidStatus('pending')).toBe(false);
    });
  });

  // ── Tests formatTask ──
  describe('formatTask()', () => {
    test('formate une tâche correctement', () => {
      const task = formatTask({ title: '  Ma tâche  ', priority: 'high' });
      expect(task.title).toBe('Ma tâche');
      expect(task.status).toBe('todo');
    });

    test('applique les valeurs par défaut', () => {
      const task = formatTask({ title: 'Test' });
      expect(task.priority).toBe('medium');
      expect(task.status).toBe('todo');
    });

    test('lève une erreur si titre vide', () => {
      expect(() => formatTask({ title: '' })).toThrow('Title is required');
    });
  });

  // ── Tests API Login ──
  describe('Login API', () => {
    test('connexion réussie avec bons identifiants', async () => {
      const res = await axios.post(`${BASE}/auth/login`, {
        email: 'admin@test.com',
        password: 'password'
      }, { timeout: 5000 });
      expect(res.status).toBe(200);
      expect(res.data.token).toBeDefined();
      expect(res.data.user.email).toBe('admin@test.com');
      token = res.data.token;
    });

    test('échec connexion avec mauvais mot de passe', async () => {
      try {
        await axios.post(`${BASE}/auth/login`, {
          email: 'admin@test.com',
          password: 'wrongpassword'
        }, { timeout: 5000 });
      } catch (err) {
        expect(err.response.status).toBe(400);
      }
    });
  });
});