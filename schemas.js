const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

// Joi extension for sanitizing HTML
const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML' : '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHTML(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', { value })
        return clean;
      }
    }
  }
})

// Extending Joi with our custom extension
const Joi = BaseJoi.extend(extension);

// Joi validation schema not same as mongo schemas
module.exports.chargesiteSchema = Joi.object({
  title: Joi.string().required().escapeHTML(),
  price: Joi.number().required().min(0),
  // image: Joi.string().required(),
  location: Joi.string().required().escapeHTML(),
  description: Joi.string().required().escapeHTML(),
  // Images to be deleted from edit form
  deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5),
  body: Joi.string().required().escapeHTML()
})