import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, requireAdmin, AuthRequest } from '../server/middleware/auth';

describe('Guest Mode Authentication & Access Control Tests', () => {
  it('Signs JWT token with isGuest flag preserved', () => {
    const guestUser = {
      id: 'guest-123e4567-e89b-12d3-a456-426614174000',
      name: 'Guest Aspirant',
      email: 'guest_12345678@guest.abhimocktest.com',
      role: 'USER',
      isGuest: true,
    };

    const token = signToken(guestUser);
    assert.ok(typeof token === 'string' && token.length > 20);

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    assert.strictEqual(payload.id, guestUser.id);
    assert.strictEqual(payload.name, guestUser.name);
    assert.strictEqual(payload.email, guestUser.email);
    assert.strictEqual(payload.role, 'USER');
    assert.strictEqual(payload.isGuest, true);
  });

  it('Strictly denies admin access to guests even if role claim is tampered', () => {
    // Simulated request from a guest user
    const req = {
      user: {
        id: 'guest-999',
        name: 'Malicious Guest',
        email: 'guest_attack@guest.abhimocktest.com',
        role: 'ADMIN', // Tampered role attempt
        isGuest: true,  // Still flagged as guest
      },
    } as unknown as AuthRequest;

    let statusCode = 200;
    let responseBody: { error?: { code?: string } } | null = null;
    let nextCalled = false;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (body: { error?: { code?: string } }) => {
            responseBody = body;
          },
        };
      },
    } as unknown as import('express').Response;

    const next = () => {
      nextCalled = true;
    };

    requireAdmin(req, res, next);

    assert.strictEqual(nextCalled, false, 'requireAdmin must NOT call next() for guest users.');
    assert.strictEqual(statusCode, 403, 'requireAdmin must return HTTP 403 Forbidden.');
    assert.strictEqual(responseBody?.error?.code, 'FORBIDDEN');
  });

  it('Allows normal verified non-guest ADMIN access through requireAdmin', () => {
    const req = {
      user: {
        id: 'admin-1',
        name: 'System Administrator',
        email: 'admin@abhimocktest.com',
        role: 'ADMIN',
        isGuest: false,
      },
    } as unknown as AuthRequest;

    let nextCalled = false;
    const res = {} as unknown as import('express').Response;
    const next = () => {
      nextCalled = true;
    };

    requireAdmin(req, res, next);
    assert.strictEqual(nextCalled, true, 'requireAdmin must allow verified administrator.');
  });

  it('Validates guest email formatting and transient properties', () => {
    const guestId = 'a1b2c3d4';
    const guestEmail = `guest_${guestId}@guest.abhimocktest.com`;
    assert.match(guestEmail, /^guest_[a-z0-9]+@guest\.abhimocktest\.com$/);
  });
});
