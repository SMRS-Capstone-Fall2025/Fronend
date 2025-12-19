

export interface CopyleaksLoginRequest {
  readonly email: string;
  readonly key: string;
}

export interface CopyleaksLoginResponse {
  readonly access_token: string;
  readonly ".issued": string;
  readonly ".expires": string;
}

export interface CopyleaksScanRequest {
  readonly base64?: string;
  readonly filename?: string;
  readonly url?: string;
  readonly properties?: {
    readonly webhooks?: {
      readonly status?: string;
      readonly newResult?: string;
    };
    readonly sandbox?: boolean;
    readonly includeHtml?: boolean;
    readonly pdf?: {
      readonly create?: boolean;
    };
    readonly exclude?: {
      readonly citations?: boolean;
      readonly references?: boolean;
      readonly quotes?: boolean;
      readonly tableOfContents?: boolean;
      readonly titles?: boolean;
    };
  };
}

export interface CopyleaksScanResponse {
  readonly scanId: string;
  readonly status: "success" | "error";
  readonly message?: string;
}

export interface CopyleaksResult {
  readonly status: {
    readonly code: number;
    readonly message: string;
  };
  readonly statistics?: {
    readonly identical: number;
    readonly minorChanges: number;
    readonly relatedMeaning: number;
    readonly total: number;
  };
  readonly results?: CopyleaksResultItem[];
  readonly internet?: CopyleaksInternetResult[];
  readonly database?: CopyleaksDatabaseResult[];
  readonly ai?: {
    readonly summary: {
      readonly ai: number;
      readonly human: number;
    };
  };
}

export interface CopyleaksResultItem {
  readonly url: string;
  readonly title: string;
  readonly introduction: string;
  readonly matchedWords: number;
  readonly identicalWords: number;
  readonly minorChangesWords: number;
  readonly relatedMeaningWords: number;
  readonly totalWords: number;
  readonly similarity: number;
  readonly comparisonReport?: string;
}

export interface CopyleaksInternetResult {
  readonly url: string;
  readonly title: string;
  readonly introduction: string;
  readonly matchedWords: number;
  readonly identicalWords: number;
  readonly similarity: number;
}

export interface CopyleaksDatabaseResult {
  readonly id: string;
  readonly title: string;
  readonly introduction: string;
  readonly matchedWords: number;
  readonly identicalWords: number;
  readonly similarity: number;
}

export interface PlagiarismCheckRequest {
  readonly reportId: number;
  readonly reportFilePath?: string;
  readonly fileBase64?: string;
  readonly fileName?: string;
  readonly scanId?: string;
}

export interface PlagiarismCheckResult {
  readonly reportId: number;
  readonly scanId: string;
  readonly status: "processing" | "completed" | "failed";
  readonly overallSimilarity: number;
  readonly identical: number;
  readonly minorChanges: number;
  readonly relatedMeaning: number;
  readonly sources: PlagiarismSource[];
  readonly aiScore?: number;
  readonly checkedAt: string;
  readonly completedAt?: string;
  readonly error?: string;
}

export interface PlagiarismSource {
  readonly url: string;
  readonly title: string;
  readonly similarity: number;
  readonly matchedWords: number;
  readonly identicalWords: number;
  readonly introduction: string;
  readonly comparisonReport?: string;
  readonly type: "internet" | "database";
}
