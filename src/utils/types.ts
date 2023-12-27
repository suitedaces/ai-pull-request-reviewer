export interface PRMetadata {
    owner: string;
    repo: string;
    pull_number: number;
    title: string;
    description: string;
    comments?: PRCommentEvent[];
}

export interface GithubUser {
    login: string;
    id: number;
}
  
export interface File {
    to: string;
    chunks: Chunk[];
}

export interface Chunk {
    content: string;
    changes: Change[];
}

export interface Change {
    ln?: number;
    ln2?: number;
    content: string;
}

export interface PRCommentRequest {
    body: string;
    path: string;
    position: number;
}

export interface PRCommentEvent {
    body: string;
    user?: GithubUser;
    id: number;
}