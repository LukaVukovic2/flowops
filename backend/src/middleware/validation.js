/**
 * Validation Middleware
 * Request validation using express-validator
 */

import { validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 * Returns Croatian error messages
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors with Croatian messages
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: translateValidationError(err)
    }));
    
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Nevažeći unos podataka',
        details: formattedErrors
      }
    });
  }
  
  next();
}

/**
 * Translate validation error messages to Croatian
 */
function translateValidationError(err) {
  const croatianMessages = {
    'Invalid value': 'Nevažeća vrijednost',
    'Invalid email': 'Nevažeća email adresa',
    'Email is required': 'Email adresa je obavezna',
    'Password is required': 'Lozinka je obavezna',
    'Password must be at least 8 characters': 'Lozinka mora imati najmanje 8 znakova',
    'Title is required': 'Naslov je obavezan',
    'Description is required': 'Opis je obavezan',
    'Content is required': 'Sadržaj je obavezan',
    'must be': 'mora biti',
    'is required': 'je obavezno',
    'must be a valid': 'mora biti važeći'
  };
  
  let message = err.msg || 'Nevažeća vrijednost';
  
  // Try to find Croatian translation
  for (const [english, croatian] of Object.entries(croatianMessages)) {
    if (message.includes(english)) {
      message = message.replace(english, croatian);
    }
  }
  
  return message;
}

export default validate;
