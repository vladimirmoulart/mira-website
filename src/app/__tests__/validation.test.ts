import { validateRegistration } from '../utils/validation'

describe('validateRegistration', () => {
  test('valide avec email et mot de passe corrects', () => {
    const errors = validateRegistration('test@example.com', 'Test1234')
    expect(errors).toHaveLength(0)
  })

  test('email invalide', () => {
    const errors = validateRegistration('test@', 'Test1234')
    expect(errors).toContain('Adresse email invalide')
  })

  test('mot de passe trop court', () => {
    const errors = validateRegistration('test@example.com', 'Tes1')
    expect(errors).toContain('Mot de passe trop court (min. 8 caractères)')
  })

  test('mot de passe sans majuscule', () => {
    const errors = validateRegistration('test@example.com', 'test1234')
    expect(errors).toContain('Mot de passe sans majuscule')
  })

  test('mot de passe sans chiffre', () => {
    const errors = validateRegistration('test@example.com', 'Testtest')
    expect(errors).toContain('Mot de passe sans chiffre')
  })

  test('email et mot de passe tous invalides', () => {
    const errors = validateRegistration('not-an-email', 'short')
    expect(errors).toContain('Adresse email invalide')
    expect(errors).toContain('Mot de passe trop court (min. 8 caractères)')
    expect(errors).toContain('Mot de passe sans majuscule')
    expect(errors).toContain('Mot de passe sans chiffre')
  })
})
