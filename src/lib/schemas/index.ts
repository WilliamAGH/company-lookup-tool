/**
 * Central export file for all schema definitions
 *
 * This file serves as the single entry point for importing schema
 * throughout the application, following the DRY principle.
 *
 * @module
 * @link ./base/id.schema.ts - Base ID validation schema
 * @link ./base/datetime.schema.ts - Date and time validation schema
 * @link ./base/common.schema.ts - Common validation patterns
 */

/**
 * Schema Index
 *
 * This file re-exports all schema for convenient imports throughout the application.
 * Follow the schema-first DRY pattern:
 * 1. Define Zod schema as the single source of truth
 * 2. Derive TypeScript types using z.infer<typeof schema>
 * 3. Use these schema for validation and type safety
 *
 * @link ./base/id.schema.ts - Base ID validation schema
 * @link ./base/datetime.schema.ts - Date and time validation schema
 * @link ./base/common.schema.ts - Common validation patterns
 */

// Base schema
export * from './base/id.schema';
export * from './base/datetime.schema';
export * from './base/common.schema';

// Research domain schema
export * from './research/entity.schema';
export * from './research/detail.schema';
export * from './research/detail_enums.schema';
export * from './research/relationship.schema';
export * from './research/type_ref.schema';
export * from './research/entity_type_join.schema';
export * from './research/text.schema';
export * from './research/unique_id.schema';
export * from './research/url.schema';

// Alternative: Import everything from research index
// export * from './research';

// External API schema
export * from './external/openai.schema';
// TODO: Fix this schema file
// export * from './external/stripe.schema';
