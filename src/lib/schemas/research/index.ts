/**
 * Zod schema exports - Central export file
 *
 * This file serves as the central export point for all Zod schemas and their derived types.
 * It is the canonical source of truth for application data structures.
 *
 * IMPORTANT: Always import schema objects and types from this file rather than from individual schema files:
 *
 * ✅ For types: import type { CompanyEntity, ProductEntity } from '$lib/schemas/research';
 * ✅ For schemas: import { entitySchema, productTypeEnum } from '$lib/schemas/research';
 * ❌ import { type CompanyEntity } from '$lib/schemas/research/entity.schema';
 *
 * @link src/lib/server/db/interface.ts - Database interfaces derived from these schemas
 * @link src/lib/server/db/queries/ - Query builders using these schemas
 */

// Entity schemas and types
export {
	// Schemas
	baseEntitySchema,
	companyEntitySchema,
	productEntitySchema,
	entitySchema,
	// Enums
	entityTypeEnum,
	statusOperatingEnum,
	// Constants
	entityTypes,
	statusOperating,
	// Types
	type BaseEntity,
	type CompanyEntity,
	type ProductEntity,
	type Entity,
	type EntityType,
	type StatusOperating
} from './entity.schema';

// Detail enums and types
export {
	// Enums
	dataConfidenceEnum,
	sourceTypeEnum,
	typeResearchDetailEnum,
	extendedSourceTypeEnum,
	primarySourceTypeEnum,
	periodTypeEnum,
	metricTypeEnum,
	financialSourceTypeEnum,
	marketShareSourceTypeEnum,
	// Constants
	dataConfidence,
	sourceTypes,
	researchDetailTypes,
	extendedSourceTypes,
	allExtendedSourceTypes,
	primarySourceTypes,
	periodTypes,
	metricTypes,
	metricTypeToDetailMap,
	financialSourceTypes,
	marketShareSourceTypes,
	// Types
	type DataConfidence,
	type SourceType,
	type TypeResearchDetail,
	type ExtendedSourceType,
	type PrimarySourceType,
	type PeriodType,
	type MetricType
} from './detail_enums.schema';

// Entity detail schemas and types
export {
	// Schemas
	entityDetailSchema,
	estimatedRangeSchema,
	// Types
	type EntityDetail,
	type EstimatedRange
} from './detail.schema';

// Relationship schemas and types
export {
	// Schemas
	entityRelationshipSchema,
	// Enums
	relationshipTypeEnum,
	// Constants
	relationshipTypes,
	// Types
	type EntityRelationship,
	type RelationshipType
} from './relationship.schema';

// Type reference schemas and types
export {
	// Schemas
	typeReferenceSchema,
	// Enums
	productTypeEnum,
	// Constants
	productTypes,
	// Types
	type TypeReference,
	type ProductType
} from './type_ref.schema';

// Entity-type join schemas and types
export {
	// Schemas
	entityTypeJoinSchema,
	entityTypeJoinWithReferencesSchema,
	// Types
	type EntityTypeJoin,
	type EntityTypeJoinWithReferences
} from './entity_type_join.schema';

// Text schemas and types
export {
	// Schemas
	entityTextSchema,
	// Enums
	textTypeEnum,
	// Constants
	textTypes,
	// Types
	type EntityText,
	type TextType
} from './text.schema';

// Unique ID schemas and types
export {
	// Schemas
	entityIdentifierSchema,
	uniqueIdSchema,
	// Enums
	identifierTypeEnum,
	// Constants
	identifierTypes,
	// Types
	type EntityIdentifier,
	type IdentifierType,
	type UniqueId
} from './unique_id.schema';

// URL schemas and types
export {
	// Schemas
	entityUrlSchema,
	entityWebUrlSchema,
	// Enums
	urlTypeEnum,
	resObjectEnum,
	urlStatusEnum,
	// Constants
	urlTypes,
	resObjectTypes,
	urlStatuses,
	// Types
	type EntityUrl,
	type EntityWebUrl,
	type UrlType,
	type ResObjectType,
	type UrlStatus
} from './url.schema';

// Import types needed for the AnalysisData interface
import type { CompanyEntity, ProductEntity } from './entity.schema';

// Re-export the complete AnalysisData structure
export interface AnalysisData {
	// Main company entity
	entity: CompanyEntity & {
		// Products offered by this company
		products?: Array<
			ProductEntity & {
				// Competing products from other companies
				competitors?: Array<
					ProductEntity & {
						// Company field already included in ProductEntity
					}
				>;
			}
		>;
	};

	_meta?: {
		cost?: {
			totalTokens: number;
			costUSD: number;
		};
		validation?: string;
	};
}
