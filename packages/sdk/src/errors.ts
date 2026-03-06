export class GiselleSdkError extends Error {
	name = "GiselleSdkError";
}

export class ConfigurationError extends GiselleSdkError {
	name = "ConfigurationError";
}

export class ApiError extends GiselleSdkError {
	name = "ApiError";

	constructor(
		message: string,
		public readonly status: number,
		public readonly responseText: string,
	) {
		super(message);
	}
}

export class UnsupportedFeatureError extends GiselleSdkError {
	name = "UnsupportedFeatureError";
}

export class NotImplementedError extends GiselleSdkError {
	name = "NotImplementedError";
}

const schemaValidationErrorBrand = Symbol.for(
	"@giselles-ai/sdk/SchemaValidationError",
);

export class SchemaValidationError extends GiselleSdkError {
	name = "SchemaValidationError";
	readonly [schemaValidationErrorBrand] = true;

	static [Symbol.hasInstance](instance: unknown): boolean {
		return (
			typeof instance === "object" &&
			instance !== null &&
			schemaValidationErrorBrand in instance
		);
	}
}

export class TimeoutError extends GiselleSdkError {
	name = "TimeoutError";
}
