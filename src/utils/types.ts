export interface PRMetadata {
    owner: string;
    repo: string;
    pull_number: number;
    title: string;
    description: string;
  }
  
export interface File {
    path: string;
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

export interface PRComment {
    body: string;
    path: string;
    position: number;
    in_reply_to?: number;
    comment_id?: number;
}