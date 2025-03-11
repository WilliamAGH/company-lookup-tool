/**
 * SERVER-SIDE AWS SDK TYPE DECLARATIONS
 *
 * This file provides TypeScript type declarations for AWS SDK modules used in server-side code.
 * The .server.d.ts extension explicitly marks these as server-only types, which helps prevent
 * client-side code from accessing server-only APIs and keeps them out of client bundles.
 *
 * Related to:
 * @link src/lib/utils/imagesS3.server.ts - Server-side S3 utilities
 * @link src/hooks.server.ts - Server initialization
 */

declare module '@aws-sdk/client-s3' {
	export interface S3ClientConfig {
		endpoint?: string;
		region?: string;
		credentials?: {
			accessKeyId: string;
			secretAccessKey: string;
		};
		forcePathStyle?: boolean;
	}

	export class S3Client {
		constructor(config: S3ClientConfig);
		send(command: any): Promise<any>;
	}

	export interface GetObjectCommandInput {
		Bucket: string;
		Key: string;
	}

	export class GetObjectCommand {
		constructor(input: GetObjectCommandInput);
	}
}

declare module '@aws-sdk/s3-request-presigner' {
	export function getSignedUrl(
		client: any,
		command: any,
		options?: { expiresIn?: number }
	): Promise<string>;
}
