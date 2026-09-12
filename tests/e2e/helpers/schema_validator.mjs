/**
 * Authoritative Schema Validator implementing the Zod frontmatter contract
 * specified in PROJECT.md § Interface Contracts and survey_report.md § 2.2.
 */

import {
  CATEGORIES,
  RISK_LEVELS,
  SAAS_TARGETS,
  GITHUB_USERNAME_REGEX,
  ISO_DATE_REGEX,
} from './fixtures.mjs';

export function validateHackFrontmatter(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { success: false, errors: ['Frontmatter must be an object'] };
  }

  // title: string, min 3, max 120
  if (typeof data.title !== 'string') {
    errors.push('title must be a string');
  } else if (data.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  } else if (data.title.length > 120) {
    errors.push('Title cannot exceed 120 characters');
  }

  // description: string, min 10, max 280
  if (typeof data.description !== 'string') {
    errors.push('description must be a string');
  } else if (data.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  } else if (data.description.length > 280) {
    errors.push('Description cannot exceed 280 characters');
  }

  // replaces_saas: string, min 2
  if (typeof data.replaces_saas !== 'string') {
    errors.push('replaces_saas must be a string');
  } else if (data.replaces_saas.length < 2) {
    errors.push('replaces_saas must specify the target service (min 2 chars)');
  }

  // saas_target: enum
  if (!SAAS_TARGETS.includes(data.saas_target)) {
    errors.push(`saas_target must be one of: ${SAAS_TARGETS.join(', ')}`);
  }

  // estimated_monthly_savings: integer, positive (> 0)
  if (typeof data.estimated_monthly_savings !== 'number' || Number.isNaN(data.estimated_monthly_savings)) {
    errors.push('estimated_monthly_savings must be a valid number');
  } else if (!Number.isInteger(data.estimated_monthly_savings)) {
    errors.push('estimated_monthly_savings must be an integer');
  } else if (data.estimated_monthly_savings <= 0) {
    errors.push('Savings must be a positive integer');
  }

  // category: enum
  if (!CATEGORIES.includes(data.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }

  // risk_level: enum
  if (!RISK_LEVELS.includes(data.risk_level)) {
    errors.push(`risk_level must be one of: ${RISK_LEVELS.join(', ')}`);
  }

  // primitives_abused: array of strings, min 1
  if (!Array.isArray(data.primitives_abused)) {
    errors.push('primitives_abused must be an array of strings');
  } else if (data.primitives_abused.length === 0) {
    errors.push('At least one abused primitive must be listed');
  } else {
    for (const prim of data.primitives_abused) {
      if (typeof prim !== 'string' || prim.trim().length === 0) {
        errors.push('Each primitive in primitives_abused must be a non-empty string');
      }
    }
  }

  // author_github: string, valid handle
  if (typeof data.author_github !== 'string') {
    errors.push('author_github must be a string');
  } else if (!GITHUB_USERNAME_REGEX.test(data.author_github)) {
    errors.push('Invalid GitHub username format');
  }

  // date_added: ISO date string YYYY-MM-DD
  if (typeof data.date_added !== 'string') {
    errors.push('date_added must be a string');
  } else if (!ISO_DATE_REGEX.test(data.date_added)) {
    errors.push('date_added must be formatted as YYYY-MM-DD');
  } else {
    // Validate actual calendar date
    const [y, m, d] = data.date_added.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    if (
      dateObj.getUTCFullYear() !== y ||
      dateObj.getUTCMonth() !== m - 1 ||
      dateObj.getUTCDate() !== d
    ) {
      errors.push('date_added must be a valid calendar date');
    }
  }

  // warning_banner: optional string
  if (data.warning_banner !== undefined && typeof data.warning_banner !== 'string') {
    errors.push('warning_banner must be a string if specified');
  }

  // is_deprecated: optional boolean
  if (data.is_deprecated !== undefined && typeof data.is_deprecated !== 'boolean') {
    errors.push('is_deprecated must be a boolean if specified');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      ...data,
      is_deprecated: data.is_deprecated ?? false,
    },
  };
}
