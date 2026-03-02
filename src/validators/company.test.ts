import { describe, it, expect } from 'vitest';
import {
  companyIdQuerySchema,
  createCompanyBodySchema,
  updateCompanyBodySchema,
} from './company';

describe('companyIdQuerySchema', () => {
  it('accepts positive integer id', () => {
    expect(companyIdQuerySchema.parse({ id: '1' })).toEqual({ id: 1 });
    expect(companyIdQuerySchema.parse({ id: 42 })).toEqual({ id: 42 });
  });

  it('rejects missing id', () => {
    expect(companyIdQuerySchema.safeParse({})).toMatchObject({ success: false });
  });

  it('rejects zero or negative', () => {
    expect(companyIdQuerySchema.safeParse({ id: 0 })).toMatchObject({ success: false });
    expect(companyIdQuerySchema.safeParse({ id: -1 })).toMatchObject({ success: false });
  });
});

describe('createCompanyBodySchema', () => {
  it('accepts required name and email', () => {
    const result = createCompanyBodySchema.parse({
      name: 'Acme',
      email: 'acme@example.com',
    });
    expect(result.name).toBe('Acme');
    expect(result.email).toBe('acme@example.com');
  });

  it('accepts optional fields', () => {
    const result = createCompanyBodySchema.parse({
      name: 'Acme',
      email: 'acme@example.com',
      phone: '+123',
      timezone: 'UTC',
    });
    expect(result.phone).toBe('+123');
    expect(result.timezone).toBe('UTC');
  });

  it('rejects missing name', () => {
    expect(
      createCompanyBodySchema.safeParse({ email: 'a@b.com' })
    ).toMatchObject({ success: false });
  });

  it('rejects invalid email', () => {
    expect(
      createCompanyBodySchema.safeParse({ name: 'A', email: 'not-an-email' })
    ).toMatchObject({ success: false });
  });
});

describe('updateCompanyBodySchema', () => {
  it('accepts empty object (partial update)', () => {
    expect(updateCompanyBodySchema.parse({})).toEqual({});
  });

  it('accepts optional fields', () => {
    const result = updateCompanyBodySchema.parse({
      name: 'New Name',
      email: 'new@example.com',
    });
    expect(result.name).toBe('New Name');
    expect(result.email).toBe('new@example.com');
  });

  it('accepts null for nullable fields', () => {
    const result = updateCompanyBodySchema.parse({ phone: null, address: null });
    expect(result.phone).toBeNull();
    expect(result.address).toBeNull();
  });
});
