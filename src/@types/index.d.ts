export interface VideoInformations {
  title: string;
  url: string;
  thumbnail: {
    url: string | null;
    width: number;
    height: number;
  };
  artist: string | undefined;
}
