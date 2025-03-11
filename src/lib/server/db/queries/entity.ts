/**
 * Entity query builder for PostgreSQL
 *
 * This file provides type-safe queries for the res_entity table
 * using Zod schemas as the single source of truth for types.
 *
 * @link $lib/schemas/research/entity.schema.ts - Source of truth schema
 */

import { browser } from '$app/environment';
import { sql } from '../../../database/sql.server';
import type { Entity, CompanyEntity, ProductEntity } from '$lib/schemas/research';

// Entity table metadata
const entityTableInfo = {
	schema: 'research',
	tableName: 'res_entity'
};

if (browser) {
	throw new Error('Server-only module leaked to client!');
}

/**
 * Type-safe entity queries for the res_entity table
 * All queries are READ-ONLY as specified in project requirements
 */
export const entityQueries = {
	/**
	 * Get entity by ID
	 *
	 * @param id UUID of the entity
	 * @returns Entity or null if not found
	 */
	getById: async (id: string): Promise<Entity | null> => {
		const fullTableName = `${entityTableInfo.schema}.${entityTableInfo.tableName}`;

		const results = await sql`
		SELECT 
			id,
			name_legal AS "name_legal",
			name_brand AS "name_brand",
			date_year_established AS "date_year_established",
			file_logo_square AS "file_logo_square",
			file_logo_favicon_square AS "file_logo_favicon_square",
			status_featured AS "status_featured",
			status_hide_page AS "status_hide_page", 
			status_operating AS "status_operating",
			status_sitemap_show AS "status_sitemap_show",
			status_verified AS "status_verified",
			functional_currency AS "functional_currency",
			type_record AS "type_record",
			slug,
			source_id AS "source_id",
			updated_at AS "updated_at",
			created_at AS "created_at",
			updated_at_unified AS "updated_at_unified"
		FROM ${sql(fullTableName)}
		WHERE id = ${id}
	`;
		return (results[0] as Entity) || null;
	},

	/**
	 * Get entity by slug
	 *
	 * @param slug URL slug of the entity
	 * @returns Entity or null if not found
	 */
	getBySlug: async (slug: string): Promise<Entity | null> => {
		const results = await sql`
		SELECT 
			id,
			name_legal AS "name_legal",
			name_brand AS "name_brand",
			date_year_established AS "date_year_established",
			file_logo_square AS "file_logo_square",
			file_logo_favicon_square AS "file_logo_favicon_square",
			status_featured AS "status_featured",
			status_hide_page AS "status_hide_page", 
			status_operating AS "status_operating",
			status_sitemap_show AS "status_sitemap_show",
			status_verified AS "status_verified",
			functional_currency AS "functional_currency",
			type_record AS "type_record",
			slug,
			source_id AS "source_id",
			updated_at AS "updated_at",
			created_at AS "created_at",
			updated_at_unified AS "updated_at_unified"
		FROM research.res_entity
		WHERE slug = ${slug}
	`;
		return (results[0] as Entity) || null;
	},

	/**
	 * Get company entity by ID
	 *
	 * @param id UUID of the company
	 * @returns CompanyEntity or null if not found
	 */
	getCompanyById: async (id: string): Promise<CompanyEntity | null> => {
		const results = await sql`
		SELECT 
			id,
			name_legal AS "name_legal",
			name_brand AS "name_brand",
			date_year_established AS "date_year_established",
			file_logo_square AS "file_logo_square",
			file_logo_favicon_square AS "file_logo_favicon_square",
			status_featured AS "status_featured",
			status_hide_page AS "status_hide_page", 
			status_operating AS "status_operating",
			status_sitemap_show AS "status_sitemap_show",
			status_verified AS "status_verified",
			functional_currency AS "functional_currency",
			type_record AS "type_record",
			slug,
			source_id AS "source_id",
			updated_at AS "updated_at",
			created_at AS "created_at",
			updated_at_unified AS "updated_at_unified"
		FROM research.res_entity
		WHERE id = ${id}
		AND type_record = 'Company'
	`;
		return (results[0] as CompanyEntity) || null;
	},

	/**
	 * Get product entity by ID
	 *
	 * @param id UUID of the product
	 * @returns ProductEntity or null if not found
	 */
	getProductById: async (id: string): Promise<ProductEntity | null> => {
		const results = await sql`
		SELECT 
			id,
			name_legal AS "name_legal",
			name_brand AS "name_brand",
			date_year_established AS "date_year_established",
			file_logo_square AS "file_logo_square",
			file_logo_favicon_square AS "file_logo_favicon_square",
			status_featured AS "status_featured",
			status_hide_page AS "status_hide_page", 
			status_operating AS "status_operating",
			status_sitemap_show AS "status_sitemap_show",
			status_verified AS "status_verified",
			functional_currency AS "functional_currency",
			type_record AS "type_record",
			slug,
			source_id AS "source_id",
			updated_at AS "updated_at",
			created_at AS "created_at",
			updated_at_unified AS "updated_at_unified"
		FROM research.res_entity
		WHERE id = ${id}
		AND type_record = 'Product'
	`;
		return (results[0] as ProductEntity) || null;
	},

	/**
	 * List all entities with pagination
	 *
	 * @param limit Maximum number of results
	 * @param offset Pagination offset
	 * @returns Array of entities
	 */
	list: async (limit = 20, offset = 0): Promise<Entity[]> => {
		const results = await sql`
		SELECT 
			id,
			name_legal AS "name_legal",
			name_brand AS "name_brand",
			date_year_established AS "date_year_established",
			file_logo_square AS "file_logo_square",
			file_logo_favicon_square AS "file_logo_favicon_square",
			status_featured AS "status_featured",
			status_hide_page AS "status_hide_page", 
			status_operating AS "status_operating",
			status_sitemap_show AS "status_sitemap_show",
			status_verified AS "status_verified",
			functional_currency AS "functional_currency",
			type_record AS "type_record",
			slug,
			source_id AS "source_id",
			updated_at AS "updated_at",
			created_at AS "created_at",
			updated_at_unified AS "updated_at_unified"
		FROM research.res_entity
		ORDER BY name_brand ASC
		LIMIT ${limit} OFFSET ${offset}
	`;
		return results as Entity[];
	},

	/**
	 * List entities by type with pagination
	 *
	 * @param type Type of entities to list
	 * @param limit Maximum number of results
	 * @param offset Pagination offset
	 * @returns Array of entities
	 */
	listByType: async (type: string, limit = 20, offset = 0): Promise<Entity[]> => {
		const results = await sql`
			SELECT 
				id,
				name_legal AS "name_legal",
				name_brand AS "name_brand",
				date_year_established AS "date_year_established",
				file_logo_square AS "file_logo_square",
				file_logo_favicon_square AS "file_logo_favicon_square",
				status_featured AS "status_featured",
				status_hide_page AS "status_hide_page", 
				status_operating AS "status_operating",
				status_sitemap_show AS "status_sitemap_show",
				status_verified AS "status_verified",
				functional_currency AS "functional_currency",
				type_record AS "type_record",
				slug,
				source_id AS "source_id",
				updated_at AS "updated_at",
				created_at AS "created_at",
				updated_at_unified AS "updated_at_unified"
			FROM research.res_entity
			WHERE type_record = ${type}
			ORDER BY name_brand ASC
			LIMIT ${limit} OFFSET ${offset}
		`;
		return results as Entity[];
	},

	/**
	 * Search entities by name
	 *
	 * @param query Search query
	 * @param limit Maximum number of results
	 * @returns Array of matching entities
	 */
	search: async (query: string, limit = 10): Promise<Entity[]> => {
		const searchPattern = `%${query}%`;
		const results = await sql`
			SELECT 
				id,
				name_legal AS "name_legal",
				name_brand AS "name_brand",
				date_year_established AS "date_year_established",
				file_logo_square AS "file_logo_square",
				file_logo_favicon_square AS "file_logo_favicon_square",
				status_featured AS "status_featured",
				status_hide_page AS "status_hide_page", 
				status_operating AS "status_operating",
				status_sitemap_show AS "status_sitemap_show",
				status_verified AS "status_verified",
				functional_currency AS "functional_currency",
				type_record AS "type_record",
				slug,
				source_id AS "source_id",
				updated_at AS "updated_at",
				created_at AS "created_at",
				updated_at_unified AS "updated_at_unified"
			FROM research.res_entity
			WHERE name_brand ILIKE ${searchPattern}
			   OR name_legal ILIKE ${searchPattern}
			ORDER BY name_brand ASC
			LIMIT ${limit}
		`;
		return results as Entity[];
	}
};
