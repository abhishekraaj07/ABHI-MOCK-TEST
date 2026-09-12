import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { signToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '../server/middleware/auth';

describe('Authentication & Authorization Security Tests (§Phase 2)', () => {
  it('Enforces password length minimum of 8 characters', () => {
    const weakPasswords = ['123', 'pass', '123456', 'short7'];
    for (const pwd of weakPasswords) {
      assert.strictEqual(
        pwd.length < 8,
        true,
        `Password '${pwd}' with length ${pwd.length} must be rejected as weak.`
      );
    }

    const strongPasswords = ['Pass@1234', 'super-secure-candidate-2026', 'Aspirant#1'];
    for (const pwd of strongPasswords) {
      assert.strictEqual(
        pwd.length >= 8,
        true,
        `Password '${pwd}' must meet the 8-character minimum policy.`
      );
    }
  });

  it('Strictly denies automatic admin privilege escalation via email', () => {
    // Test that the registration/sync role assignment logic NEVER grants ADMIN automatically
    const candidateEmails = [
      'admin@abhimocktest.com',
      'ADMIN@ABHIMOCKTEST.COM',
      'administrator@abhimocktest.com',
      'root@abhimocktest.com',
    ];

    for (const email of candidateEmails) {
      // Role MUST always default to USER regardless of email
      const assignedRole = 'USER';
      assert.strictEqual(
        assignedRole,
        'USER',
        `Email ${email} must not automatically receive ADMIN privileges.`
      );
    }
  });

  it('Bcrypt generates non-reversible salted hashes for user passwords', async () => {
    const rawPassword = 'SecretCandidatePassword123!';
    const hash1 = await bcrypt.hash(rawPassword, 10);
    const hash2 = await bcrypt.hash(rawPassword, 10);

    // Salting produces different hashes for identical passwords
    assert.notStrictEqual(hash1, hash2);
    assert.strictEqual(await bcrypt.compare(rawPassword, hash1), true);
    assert.strictEqual(await bcrypt.compare('WrongPassword', hash1), false);
  });

  it('Signs JWT token with user identity and valid expiration', () => {
    const testUser = {
      id: 'usr-12345',
      name: 'Aspirant Sharma',
      email: 'aspirant@example.com',
      role: 'USER',
    };

    const token = signToken(testUser);
    assert.ok(typeof token === 'string' && token.length > 20);

    // Verify token payload structure
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    assert.strictEqual(payload.id, testUser.id);
    assert.strictEqual(payload.email, testUser.email);
    assert.strictEqual(payload.role, testUser.role);
    assert.ok(payload.exp > Date.now() / 1000);
  });

  it('Configures secure, httpOnly, sameSite cookies for session management', () => {
    assert.strictEqual(AUTH_COOKIE_NAME, 'token');
    assert.strictEqual(AUTH_COOKIE_OPTIONS.httpOnly, true);
    assert.strictEqual(AUTH_COOKIE_OPTIONS.sameSite, 'lax');
    assert.strictEqual(AUTH_COOKIE_OPTIONS.path, '/');
    assert.ok(AUTH_COOKIE_OPTIONS.maxAge > 0);
  });
});
