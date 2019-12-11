declare module 'node-id3' {
  export interface Tags {
    title?: string;
    artist?: string;
    image?: {
      mime?: string | null;
      type?: {
        id?: number;
        name?: 'front cover' | 'back cover';
      };
      description?: string;
      imageBuffer: Buffer;
    };

    [key: string]: any;
  }

  export type StaticNodeID3 = {
    write: (tags: Tags, file: (Buffer | string)) => boolean;
  }

  const NodeID3: StaticNodeID3
  export default NodeID3
}
